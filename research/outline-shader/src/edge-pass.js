// OPTIONAL, NOT FROM THE VIDEO. Screen-space ink lines from depth + normals
// (Roberts cross), as an EffectComposer pass. Verified on three r187.
//
// The inverted hull only draws a silhouette shell. It cannot draw interior
// creases (where two faces of the same mesh meet) or lines where one object
// sits in front of another part of itself. This pass adds those. Use it
// together with the hull, or instead of it for flat low-poly sets.
//
// Insert it right after RenderPass and before bloom / OutputPass.
import * as THREE from 'three';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';

const fragmentShader = /* glsl */ `
#include <packing>
uniform sampler2D tDiffuse;
uniform sampler2D tNormal;
uniform sampler2D tDepth;
uniform vec2 uTexel;
uniform float uNear;
uniform float uFar;
uniform float uThickness;
uniform float uDepthThreshold;
uniform float uNormalThreshold;
uniform vec3 uColor;
uniform float uStrength;
varying vec2 vUv;

float viewZ(vec2 uv) {
  return -perspectiveDepthToViewZ(texture2D(tDepth, uv).x, uNear, uFar); // positive metres
}
vec3 nrm(vec2 uv) { return texture2D(tNormal, uv).xyz * 2.0 - 1.0; }

void main() {
  vec2 o = uTexel * uThickness;
  vec2 uv0 = vUv + vec2(-o.x, -o.y);
  vec2 uv1 = vUv + vec2( o.x,  o.y);
  vec2 uv2 = vUv + vec2(-o.x,  o.y);
  vec2 uv3 = vUv + vec2( o.x, -o.y);

  // Roberts cross on linear depth, scaled by distance so far geometry does not go solid black
  float d0 = viewZ(uv0), d1 = viewZ(uv1), d2 = viewZ(uv2), d3 = viewZ(uv3);
  float dc = viewZ(vUv);
  float depthEdge = sqrt((d1 - d0) * (d1 - d0) + (d3 - d2) * (d3 - d2)) / max(dc, 1e-3);
  depthEdge = smoothstep(uDepthThreshold, uDepthThreshold * 2.0, depthEdge);

  // Roberts cross on view-space normals: catches creases with no depth step
  vec3 n0 = nrm(uv0), n1 = nrm(uv1), n2 = nrm(uv2), n3 = nrm(uv3);
  float normalEdge = sqrt(dot(n1 - n0, n1 - n0) + dot(n3 - n2, n3 - n2));
  normalEdge = smoothstep(uNormalThreshold, uNormalThreshold * 2.0, normalEdge);

  float edge = clamp(max(depthEdge, normalEdge), 0.0, 1.0) * uStrength;
  vec4 base = texture2D(tDiffuse, vUv);
  gl_FragColor = vec4(mix(base.rgb, uColor, edge), base.a);
}
`;

export class EdgeOutlinePass extends Pass {
  /**
   * @param {THREE.Scene} scene
   * @param {THREE.PerspectiveCamera} camera
   * @param {number} width  @param {number} height
   * @param {object} [o]
   * @param {number} [o.thickness=1.5]         sample offset in pixels (line is ~2x this)
   * @param {number} [o.depthThreshold=0.02]   relative depth step that counts as an edge
   * @param {number} [o.normalThreshold=0.45]  normal difference that counts as a crease
   */
  constructor(scene, camera, width, height, o = {}) {
    super();
    this.scene = scene;
    this.camera = camera;
    this.normalMaterial = new THREE.MeshNormalMaterial();
    this.normalTarget = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      depthTexture: new THREE.DepthTexture(width, height, THREE.UnsignedIntType),
    });
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        tNormal: { value: this.normalTarget.texture },
        tDepth: { value: this.normalTarget.depthTexture },
        uTexel: { value: new THREE.Vector2(1 / width, 1 / height) },
        uNear: { value: camera.near },
        uFar: { value: camera.far },
        uThickness: { value: o.thickness ?? 1.5 },
        uDepthThreshold: { value: o.depthThreshold ?? 0.02 },
        uNormalThreshold: { value: o.normalThreshold ?? 0.45 },
        uColor: { value: new THREE.Color(o.color ?? 0x000000) },
        uStrength: { value: o.strength ?? 1 },
      },
      vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
      fragmentShader,
      depthTest: false,
      depthWrite: false,
    });
    this.fsQuad = new FullScreenQuad(this.material);
    this._hidden = [];
    this._clear = new THREE.Color();
  }

  setSize(width, height) {
    this.normalTarget.setSize(width, height);
    this.material.uniforms.uTexel.value.set(1 / width, 1 / height);
  }

  render(renderer, writeBuffer, readBuffer) {
    // 1. normals + depth prepass. Hull shells and anything flagged noEdge are hidden.
    this._hidden.length = 0;
    this.scene.traverse((obj) => {
      if (obj.visible && (obj.userData.isOutline || obj.userData.noEdge || obj.isPoints || obj.isSprite || obj.isLine)) {
        obj.visible = false;
        this._hidden.push(obj);
      }
    });
    const prevOverride = this.scene.overrideMaterial;
    const prevBackground = this.scene.background;
    const prevTarget = renderer.getRenderTarget();
    const prevShadowAuto = renderer.shadowMap.autoUpdate;
    const prevClear = renderer.getClearColor(this._clear);
    const prevAlpha = renderer.getClearAlpha();
    this.scene.overrideMaterial = this.normalMaterial;
    this.scene.background = null;
    renderer.shadowMap.autoUpdate = false;
    renderer.setRenderTarget(this.normalTarget);
    renderer.setClearColor(0x8080ff, 1);
    renderer.clear();
    renderer.render(this.scene, this.camera);
    this.scene.overrideMaterial = prevOverride;
    this.scene.background = prevBackground;
    renderer.shadowMap.autoUpdate = prevShadowAuto;
    renderer.setClearColor(prevClear, prevAlpha);
    for (const obj of this._hidden) obj.visible = true;

    // 2. composite the lines over the colour buffer
    const u = this.material.uniforms;
    u.tDiffuse.value = readBuffer.texture;
    u.uNear.value = this.camera.near;
    u.uFar.value = this.camera.far;
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer);
    this.fsQuad.render(renderer);
    renderer.setRenderTarget(prevTarget);
  }

  dispose() {
    this.normalTarget.dispose();
    this.normalMaterial.dispose();
    this.material.dispose();
    this.fsQuad.dispose();
  }
}
