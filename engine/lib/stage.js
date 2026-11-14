// The stage: renderer, per-shot rendering, shot joins, grade, bloom, output.
// renderAt(t) is a pure function of t.
//
// Per frame:
//   for each shot visible at t (1, or 2 during a dissolve):
//     world clock  -> set.update(t), camera path (every frame, incl. sub-frame blur samples)
//     stepped clock-> actor states resolved at the FRAME (pose / expression / mouth swap in one frame)
//     render scene -> [god rays] -> [depth of field] -> grade + vignette -> accumulate * weight
//   mix -> bloom -> flash -> sRGB -> canvas
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { Character } from './character.js';
import { cameraPath } from './camera.js';
import { buildTimeline, frameOf, trackAt, windowAt } from './timeline.js';
import { GodRaysPass, flashAt } from './fx.js';
import { Set3D } from './world.js';
import { EXPRESSIONS } from './faces.js';
import { mulberry32, seedOf } from './rng.js';

const quadVert = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

// grade + vignette + weighted accumulate (additive), all in linear HDR
const gradeFrag = /* glsl */ `
uniform sampler2D tDiffuse; uniform vec2 uTexel; uniform float uWeight;
uniform vec3 uTint; uniform float uLift, uGain, uSat, uContrast, uVig, uEdgeBlur; uniform vec3 uVigColor;
varying vec2 vUv;
void main() {
  float d = length(vUv - 0.5) * 1.41421;                 // 0 centre, 1 corner
  vec3 c = texture2D(tDiffuse, vUv).rgb;
  if (uEdgeBlur > 0.0) {                                 // soft corners instead of (or with) a dark vignette
    float r = uEdgeBlur * smoothstep(0.45, 1.0, d);
    vec3 acc = c;
    for (int i = 0; i < 8; i++) { float a = float(i) * 0.7853982; acc += texture2D(tDiffuse, vUv + vec2(cos(a), sin(a)) * r * uTexel).rgb; }
    c = acc / 9.0;
  }
  c = c * uGain * uTint + uLift;
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(vec3(l), c, uSat);
  c = (c - 0.18) * uContrast + 0.18;
  c = max(c, 0.0);
  c = mix(c, c * uVigColor, smoothstep(0.38, 1.0, d) * uVig);
  gl_FragColor = vec4(c * uWeight, uWeight);
}`;

class MixInPass extends Pass {
  constructor() {
    super();
    this.uniforms = { tMix: { value: null } };
    this.quad = new FullScreenQuad(new THREE.ShaderMaterial({
      uniforms: this.uniforms, vertexShader: quadVert, depthTest: false, depthWrite: false, toneMapped: false,
      fragmentShader: `uniform sampler2D tMix; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(tMix, vUv).rgb, 1.0); }`,
    }));
  }
  render(renderer, writeBuffer) {
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer);
    this.quad.render(renderer);
  }
}

// Full-frame flash: an even lift added AFTER bloom (adding it before would push every
// white surface over the threshold and turn the flash into blobs).
class FlashPass extends Pass {
  constructor() {
    super();
    this.uniforms = { tDiffuse: { value: null }, uFlash: { value: new THREE.Color(0, 0, 0) } };
    this.quad = new FullScreenQuad(new THREE.ShaderMaterial({
      uniforms: this.uniforms, vertexShader: quadVert, depthTest: false, depthWrite: false, toneMapped: false,
      fragmentShader: `uniform sampler2D tDiffuse; uniform vec3 uFlash; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(tDiffuse, vUv).rgb + uFlash, 1.0); }`,
    }));
  }
  render(renderer, writeBuffer, readBuffer) {
    this.uniforms.tDiffuse.value = readBuffer.texture;
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer);
    this.quad.render(renderer);
  }
}

/**
 * @param {object} o
 * @param {HTMLCanvasElement} o.canvas
 * @param {object} o.video      the object returned by defineVideo() in video.js
 * @param {number} o.duration   seconds (resolved by render.mjs)
 * @param {number} [o.width=1080] [o.height=1920] [o.fps=30]
 * @returns {{ ready: Promise<void>, renderAt(t:number): void, renderer, timeline, sets, cast, props }}
 */
export function createStage({ canvas, video, duration, width = 1080, height = 1920, fps = 30 }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  // Palette-exact output: no tone mapping (white heads stay white). HDR values above 1 clip after bloom.
  renderer.toneMapping = video.toneMapping === 'neutral' ? THREE.NeutralToneMapping : THREE.NoToneMapping;

  const ctx = { THREE, width, height, fps, duration, rng: (name) => mulberry32(seedOf(String(name))) };

  // ---- build sets, cast, props (once)
  const sets = {};
  for (const [name, build] of Object.entries(video.sets ?? {})) {
    const s = typeof build === 'function' ? build(ctx) : build;
    if (!(s instanceof Set3D)) throw new Error(`sets.${name} must return a Set3D`);
    sets[name] = s;
  }
  const cast = {};
  for (const [name, def] of Object.entries(video.cast ?? {})) cast[name] = new Character({ name, ...def });
  const props = {};
  for (const [name, build] of Object.entries(video.props ?? {})) props[name] = typeof build === 'function' ? build(ctx) : build;

  // ---- shots
  const timeline = buildTimeline(video.shots, duration, fps);
  for (const s of timeline.shots) {
    if (!sets[s.set]) throw new Error(`shot "${s.id ?? s.index}": unknown set "${s.set}"`);
    if (!s.camera) throw new Error(`shot "${s.id ?? s.index}": camera is required`);
    s.path = Array.isArray(s.camera) ? cameraPath(s.camera, s.cameraDefaults) : s.camera;
    for (const [name, a] of Object.entries(s.actors ?? {})) {
      if (!cast[name]) throw new Error(`shot "${s.id ?? s.index}": unknown actor "${name}"`);
      a.track = [...(a.track ?? [])].sort((x, y) => (x.t ?? 0) - (y.t ?? 0));
    }
  }
  const flashes = (video.fx ?? []).filter((q) => q.type === 'flash');

  // ---- targets and passes
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.05, 600);
  const hdr = { type: THREE.HalfFloatType };
  const rtScene = new THREE.WebGLRenderTarget(width, height, { ...hdr, samples: 4 });
  const rtA = new THREE.WebGLRenderTarget(width, height, hdr);
  const rtB = new THREE.WebGLRenderTarget(width, height, hdr);
  const rtMix = new THREE.WebGLRenderTarget(width, height, hdr);

  const gU = {
    tDiffuse: { value: null }, uTexel: { value: new THREE.Vector2(1 / width, 1 / height) }, uWeight: { value: 1 },
    uTint: { value: new THREE.Color() }, uLift: { value: 0 }, uGain: { value: 1 }, uSat: { value: 1 }, uContrast: { value: 1 },
    uVig: { value: 0.2 }, uVigColor: { value: new THREE.Color() }, uEdgeBlur: { value: 0 },
  };
  const gradeQuad = new FullScreenQuad(new THREE.ShaderMaterial({
    uniforms: gU, vertexShader: quadVert, fragmentShader: gradeFrag, depthTest: false, depthWrite: false, toneMapped: false,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor,
  }));

  const godrays = new GodRaysPass(width, height);
  let bokeh = null;
  const mixIn = new MixInPass(); mixIn.uniforms.tMix.value = rtMix.texture;
  const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.6, 0.5, 1.0);
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(width, height, hdr));
  composer.setPixelRatio(1); composer.setSize(width, height);
  const flashPass = new FlashPass();
  composer.addPass(mixIn); composer.addPass(bloom); composer.addPass(flashPass); composer.addPass(new OutputPass());

  const hidden = [];
  const _focus = new THREE.Vector3();
  const flashState = { add: new THREE.Color(), bloom: 0 };

  function applyActors(shot, set, frame) {
    for (const [name, ch] of Object.entries(cast)) {
      const a = shot.actors?.[name];
      if (!a) { if (ch.root.parent) ch.root.removeFromParent(); continue; }
      const st = trackAt(a.track, frame, fps, { pose: 'stand', expr: ch.defaultExpr, at: a.at ?? [0, 0, 0], face: a.face ?? 0, scale: a.scale ?? 1, hold: a.hold ?? null, tint: a.tint ?? null, visible: true, mouth: null, rot: null, look: null });
      if (st.visible === false) { if (ch.root.parent) ch.root.removeFromParent(); continue; }
      if (ch.root.parent !== set.scene) set.scene.add(ch.root);
      const talk0 = windowAt(a.talk, frame, fps);
      if (talk0 >= 0) st.mouth = ch.talkMouth(frame, talk0);
      const eye = EXPRESSIONS[st.expr]?.eye;
      st.blink = eye !== 'closed' && eye !== 'happy' && eye !== 'x' && ch.blinkAt(frame);
      ch.setState(st);
      ch.setTint(st.tint ?? set.charTint);
      for (const hand of ['L', 'R', 'head']) {
        const pn = st.hold?.[hand];
        if (pn && !props[pn]) throw new Error(`shot "${shot.id}": actor "${name}" holds unknown prop "${pn}"`);
        ch.attach(hand, pn ? props[pn] : null);
      }
    }
    // free props placed by the shot (not held)
    const held = new Set();
    for (const [name, a] of Object.entries(shot.actors ?? {})) { const ch = cast[name]; for (const k of ['L', 'R', 'head']) if (ch._attached[k]) held.add(ch._attached[k]); }
    for (const [pn, obj] of Object.entries(props)) {
      if (held.has(obj)) continue;
      const place = shot.props?.[pn];
      if (!place) { if (obj.parent && !held.has(obj)) obj.removeFromParent(); continue; }
      if (obj.parent !== set.scene) set.scene.add(obj);
      const st = Array.isArray(place) ? trackAt(place, frame, fps, {}) : place;
      if (st.at) obj.position.set(...st.at);
      if (st.rot) obj.rotation.set(...st.rot.map((d) => (d * Math.PI) / 180));
      if (st.scale != null) obj.scale.setScalar(st.scale);
      obj.visible = st.visible !== false;
    }
  }

  function hide(scene, test) {
    hidden.length = 0;
    scene.traverse((o) => { if (o.visible && test(o)) { o.visible = false; hidden.push(o); } });
  }
  const unhide = () => { for (const o of hidden) o.visible = true; hidden.length = 0; };

  /** Render one shot at time tc (camera / world clock) and frame `frame` (stepped clock). Returns the HDR target. */
  function renderShot(shot, tc, frame) {
    const set = sets[shot.set];
    set.update(tc, frame);
    applyActors(shot, set, frame);
    const pose = shot.path.apply(camera, tc, fps);
    if (shot.update) shot.update({ t: tc, frame, local: tc - shot.start, set, cast, props, camera, THREE, shot });
    camera.updateMatrixWorld(true);
    for (const name of Object.keys(shot.actors ?? {})) if (cast[name].root.parent) cast[name].faceCamera(camera);

    renderer.setRenderTarget(rtScene);
    renderer.setClearColor(0x000000, 1);
    renderer.clear();
    renderer.render(set.scene, camera);
    let cur = rtScene;

    if (set.godrays) { godrays.renderRays(renderer, set.scene, camera, set.godrays, rtA, cur); cur = rtA; }

    const dof = shot.dof;
    if (dof) {
      if (!bokeh) { bokeh = new BokehPass(set.scene, camera, { focus: 3, aperture: 0.002, maxblur: 0.006 }); bokeh.setSize(width, height); }
      bokeh.scene = set.scene; bokeh.camera = camera;
      let focus = dof.focus ?? 3;
      if (typeof focus === 'string') focus = camera.position.distanceTo(cast[focus].headWorld(_focus));
      else if (Array.isArray(focus)) focus = camera.position.distanceTo(_focus.set(...focus));
      bokeh.uniforms.focus.value = focus;
      bokeh.uniforms.aperture.value = dof.aperture ?? 0.002;
      bokeh.uniforms.maxblur.value = dof.maxblur ?? 0.006;
      hide(set.scene, (o) => o.isPoints || o.isSprite || o.userData.noDepth);
      const out = cur === rtA ? rtB : rtA;
      bokeh.render(renderer, out, cur);
      unhide();
      cur = out;
    }
    return { target: cur, set, pose };
  }

  function accumulate(target, weight, grade) {
    gU.tDiffuse.value = target.texture; gU.uWeight.value = weight;
    gU.uTint.value.set(grade.tint); gU.uLift.value = grade.lift; gU.uGain.value = grade.gain; gU.uSat.value = grade.saturation; gU.uContrast.value = grade.contrast;
    gU.uVig.value = grade.vignette; gU.uVigColor.value.set(grade.vignetteColor); gU.uEdgeBlur.value = grade.edgeBlur;
    const ac = renderer.autoClear; renderer.autoClear = false;
    renderer.setRenderTarget(rtMix); gradeQuad.render(renderer);
    renderer.autoClear = ac;
  }

  function renderAt(t) {
    t = Math.max(0, Math.min(duration - 1e-6, t));
    const frame = frameOf(t, fps);
    const active = timeline.active(t);
    // motion blur: sub-frame accumulation while a camera move asks for it
    let samples = 1;
    for (const { shot } of active) { const b = shot.path.at(t, fps).blur; if (b > 1) samples = Math.max(samples, Math.round(b)); }
    const shutter = video.shutter ?? 0.6;

    renderer.setRenderTarget(rtMix); renderer.setClearColor(0x000000, 0); renderer.clear();
    let bStrength = 0, bRadius = 0, bThreshold = 0;
    for (let k = 0; k < samples; k++) {
      const tc = samples === 1 ? t : t + (((k + 0.5) / samples - 0.5) * shutter) / fps;
      for (const { shot, w } of active) {
        const { target, set } = renderShot(shot, tc, frame);
        accumulate(target, w / samples, { ...set.grade, ...(shot.grade ?? {}) });
        if (k === 0) { const b = { ...set.bloom, ...(shot.bloom ?? {}) }; bStrength += b.strength * w; bRadius += b.radius * w; bThreshold += b.threshold * w; }
      }
    }
    flashAt(flashes, frame, fps, flashState);
    flashPass.uniforms.uFlash.value.copy(flashState.add);
    bloom.strength = bStrength + flashState.bloom; bloom.radius = bRadius; bloom.threshold = bThreshold;
    composer.render(1 / fps);
  }

  const ready = (async () => {
    await Promise.all(Object.values(sets).flatMap((s) => s.loading));
    // warm up: compile every shot's shaders and upload textures before the first captured frame
    for (const s of timeline.shots) renderAt(s.start + 0.5 / fps);
    renderAt(0);
    const gl = renderer.getContext();
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4)); // force the GPU to finish
  })();

  return { ready, renderAt, renderer, timeline, sets, cast, props, camera };
}

/**
 * Identity helper for video.js: gives editors a single place for the schema
 * and validates the obvious mistakes early. See engine/README.md.
 */
export function defineVideo(v) {
  if (!v || typeof v !== 'object') throw new Error('defineVideo: expected an object');
  for (const k of ['sets', 'shots']) if (!v[k]) throw new Error(`defineVideo: "${k}" is required`);
  return v;
}
