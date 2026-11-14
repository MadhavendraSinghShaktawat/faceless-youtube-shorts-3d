// Cel shading helpers -- verified on three r187.
// Covers the other two things the video does besides the outline:
//   - MeshToonMaterial + a tiny N x 1 gradient map with NearestFilter
//   - "keep only the base colour map, then flatten it with a cartoon filter"
import * as THREE from 'three';

/**
 * N x 1 ramp texture. Equivalent to the repo's threeTone.jpg / fourTone.jpg /
 * fiveTone.jpg, but built in code. MeshToonMaterial samples only `.r` at
 * u = dot(N, L) * 0.5 + 0.5, so the left half of the ramp is the unlit side.
 * NearestFilter is the "really important line" from the video: with linear
 * filtering the bands blur back into a smooth gradient.
 * @param {number|number[]} steps  band count (3, 4, 5) or explicit 0..1 values, dark to light
 */
export function makeGradientMap(steps = 3) {
  const values = Array.isArray(steps)
    ? steps
    : Array.from({ length: steps }, (_, i) => (steps === 1 ? 1 : 0.35 + (0.65 * i) / (steps - 1)));
  const data = new Uint8Array(values.map((v) => Math.round(THREE.MathUtils.clamp(v, 0, 1) * 255)));
  const tex = new THREE.DataTexture(data, values.length, 1, THREE.RedFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

/** MeshToonMaterial with a stepped ramp. */
export function createToonMaterial({ color = 0xffffff, map = null, steps = 3, gradientMap, ...rest } = {}) {
  return new THREE.MeshToonMaterial({ color, map, gradientMap: gradientMap ?? makeGradientMap(steps), ...rest });
}

/**
 * Replace every PBR material under `root` with MeshToonMaterial, keeping only
 * colour, base colour map, emissive and transparency. This is the video's
 * Blender step ("get rid of every single map besides base color") done at load.
 */
export function toonify(root, { steps = 3, gradientMap = makeGradientMap(steps), posterize = 0 } = {}) {
  const cache = new Map();
  root.traverse((obj) => {
    if (!obj.isMesh || obj.userData.isOutline) return;
    const convert = (src) => {
      if (src.isMeshToonMaterial) return src;
      if (cache.has(src)) return cache.get(src);
      const map = src.map && posterize > 1 ? posterizeTexture(src.map, { levels: posterize }) : src.map ?? null;
      const mat = new THREE.MeshToonMaterial({
        name: src.name,
        color: src.color ? src.color.clone() : new THREE.Color(0xffffff),
        map,
        gradientMap,
        emissive: src.emissive ? src.emissive.clone() : new THREE.Color(0x000000),
        emissiveMap: src.emissiveMap ?? null,
        emissiveIntensity: src.emissiveIntensity ?? 1,
        transparent: src.transparent,
        opacity: src.opacity,
        alphaTest: src.alphaTest,
        side: src.side,
        vertexColors: src.vertexColors,
      });
      cache.set(src, mat);
      return mat;
    };
    obj.material = Array.isArray(obj.material) ? obj.material.map(convert) : convert(obj.material);
  });
  return root;
}

/**
 * Runtime stand-in for the video's offline texture step (Krita G'MIC "Cartoon"
 * or Photoshop "Cutout"): blur away fine detail, then quantise each channel to
 * a few levels so the texture reads as flat painted shapes. It is an
 * approximation of those filters, not a port. For hero assets, pre-process the
 * PNG offline instead and skip this.
 * Needs a DOM (canvas); call it in the page, after the texture image loaded.
 */
export function posterizeTexture(texture, { levels = 6, blur = 3, saturation = 1.15 } = {}) {
  const img = texture.image;
  const w = img.width, h = img.height;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.filter = `blur(${blur}px) saturate(${saturation})`;
  ctx.drawImage(img, 0, 0, w, h);
  ctx.filter = 'none';
  const id = ctx.getImageData(0, 0, w, h);
  const d = id.data;
  const q = 255 / (levels - 1);
  for (let i = 0; i < d.length; i += 4) {
    d[i] = Math.round(d[i] / q) * q;
    d[i + 1] = Math.round(d[i + 1] / q) * q;
    d[i + 2] = Math.round(d[i + 2] / q) * q;
  }
  ctx.putImageData(id, 0, 0);
  const out = new THREE.CanvasTexture(canvas);
  out.colorSpace = texture.colorSpace;
  out.flipY = texture.flipY;
  out.wrapS = texture.wrapS; out.wrapT = texture.wrapT;
  out.repeat.copy(texture.repeat); out.offset.copy(texture.offset);
  out.channel = texture.channel;
  return out;
}
