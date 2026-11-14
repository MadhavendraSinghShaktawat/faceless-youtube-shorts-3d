// Kit demo: 8 s, silent. Two sets, two characters, a hand prop, a fast push-in,
// a 6-frame dissolve with both cameras moving, one bloom flash, captions from
// the hand-written words.json next to this file.
//   node engine/render.mjs videos/_demo
import { defineVideo, Set3D, world, fx, orbit, walk, THREE } from 'acs';

const PINK = '#e926a1';

export default defineVideo({
  duration: 8,

  cast: {
    warden: {
      body: { color: '#f6f3ee', pattern: 'tie', accent: '#8a5326', accent2: '#e0a55a' },
      hair: { style: 'cap', color: '#6b4226' },
      expr: 'bored',
    },
    digger: {
      body: { color: '#3aa58c', pattern: 'buttons', accent: '#c23b2e' },
      hat: { style: 'beanie', color: '#e2ad3b', band: '#c9962c' },
      hair: { style: 'bowl', color: '#2a2024' },
      expr: 'happy',
    },
  },

  props: {
    // paint swatch card (hand prop): outlined, unlit
    swatch: () => {
      const tex = world.drawnTexture(256, 320, (g, w, h) => {
        g.fillStyle = '#fbf7f2'; g.fillRect(0, 0, w, h);
        g.fillStyle = '#f185b6'; g.fillRect(14, 14, w - 28, h - 96);
        g.fillStyle = '#3a2a30'; g.font = '700 46px Arial'; g.textAlign = 'center'; g.fillText('P-618', w / 2, h - 28);
      });
      const card = world.box({ size: [0.42, 0.52, 0.02], material: world.flat({ map: tex }) });
      card.position.set(0.02, 0.22, 0.03);
      const g = new THREE.Group(); g.add(card);
      return world.outlineProp(g, { width: 0.014 });
    },
  },

  sets: {
    // ---- interior: pink cell, barred window, light shaft, dust
    cell: () => {
      const set = new Set3D({
        background: '#b01c78',
        fog: { color: '#d8349a', density: 0.018 },
        grade: { vignette: 0.32, vignetteColor: '#7a0f4f', saturation: 1.04 },
        bloom: { strength: 0.6, radius: 0.5, threshold: 1.0 },
        charTint: '#fff3f8',
      });
      const bricks = world.brickTexture({ base: PINK, cols: 2, rows: 4, jitter: 0.025, line: 7 });
      set.add(world.room({
        w: 7, h: 4.4, d: 7,
        wall: { map: bricks, tile: 2.2 },
        floor: { map: world.paintedTexture({ base: '#e9b9d2', count: 260, seed: 5 }), tile: 3 },
        ceiling: { color: '#cd5389' },
        open: ['front'],
      }));
      const win = world.barredWindow({ w: 2.0, h: 1.15, bars: 5, cross: 1 });
      win.position.set(0.9, 3.05, -3.42);
      set.add(win);
      // a bunk against the left wall
      set.add(world.box({ size: [1.1, 0.16, 2.6], at: [-2.9, 0.62, -1.6], color: '#9a2f73' }));
      set.add(world.box({ size: [1.0, 0.14, 2.5], at: [-2.9, 0.77, -1.6], color: '#f3d7e6' }));
      for (const z of [-2.7, -0.5]) set.add(world.box({ size: [0.1, 0.6, 0.1], at: [-2.45, 0.3, z], color: '#7f255e' }));

      const dir = [-0.22, -0.6, 0.77];
      set.add(world.windowLight({ window: win, dir, color: '#fff2e6', intensity: 0.3 }));
      set.add(world.ambient({ sky: '#ffffff', ground: '#ffb3dc', intensity: 0.8 }));
      set.add(fx.lightShaft({ window: win, dir, length: 5.6, color: '#ffe9f4', opacity: 0.26, spread: 1.35 }));
      set.add(fx.dust({ center: [0.4, 1.7, -1.2], size: [2.6, 2.8, 4.2], count: 60, color: '#fff2f8', mote: 0.03 }));
      // FX on the wall behind the warden: cracks + chips, on the same frame as the flash
      set.add(fx.cracks({ at: [-1.15, 2.1, -3.47], size: 2.2, t0: 2.5, frames: 8, color: '#5d0a3c', seed: 12 }));
      set.add(fx.burst({ at: [-1.15, 2.1, -3.3], t0: 2.5, count: 46, speed: 3.2, gravity: 7, life: 0.9, color: '#ffd9ec', dir: [0, 0.3, 1], cone: 0.8, mote: 0.07 }));
      return set;
    },

    // ---- exterior: sky, hills, dirt path, instanced grass
    field: () => {
      const set = new Set3D({
        background: '#bfe0ff',
        fog: { color: '#cfe8ff', density: 0.012 },
        grade: { vignette: 0.1, edgeBlur: 5, saturation: 1.06 },
        bloom: { strength: 0.45, radius: 0.5, threshold: 1.0 },
        godrays: { sun: [-30, 34, -60], color: '#fff3cf', exposure: 0.2, radius: 4 },
      });
      set.add(world.sky({ top: '#3f86de', bottom: '#cfe6ff', clouds: 40 }));
      set.add(world.ground({ radius: 80, map: world.paintedTexture({ base: '#4fae3c', count: 500, seed: 8 }), tile: 6 }));
      set.add(world.hills({ count: 11, radius: 46, color: '#46b944', height: 7 }));
      // dirt path running toward the camera
      const path = world.quad({ size: [2.6, 60], at: [0, 0.012, -14], rot: [-Math.PI / 2, 0, 0], material: world.toon({ map: world.paintedTexture({ base: '#8a6a4a', count: 420, seed: 3, repeat: [1, 14] }) }) });
      path.receiveShadow = true;
      set.add(path);
      set.add(world.grass({ count: 42000, area: [26, 30], center: [0, -6], height: 0.46, where: (x) => Math.abs(x) > 1.35 }));
      set.add(world.sun({ from: [-9, 12, 7], to: [0, 0, 0], intensity: 0.5, area: 9 }));
      set.add(world.ambient({ sky: '#ffffff', ground: '#9fc8a0', intensity: 0.5 }));
      set.add(fx.dust({ center: [0, 1.4, 0], size: [8, 2.6, 8], count: 50, color: '#fffbe0', mote: 0.028, intensity: 1.1 }));
      return set;
    },
  },

  shots: [
    {
      id: 'cell',
      set: 'cell',
      start: 0,
      camera: [
        // opens wide, off-axis so a room corner shows, already creeping in
        orbit({ t: 0, target: [0.1, 1.45, -0.6], dist: 6.2, yaw: 24, pitch: 4, fov: 58, push: 0.045, arc: -2.2 }),
        // fast push-in to the swatch and the face: 12 frames, ease-out into the creep
        orbit({ t: 1.2, frames: 12, target: [-0.55, 1.6, -0.9], dist: 2.5, yaw: 10, pitch: -4, fov: 58, push: 0.03, arc: 1.6 }),
        // re-frame on the wall hit
        orbit({ t: 2.5, frames: 10, target: [-0.5, 1.5, -1.2], dist: 4.3, yaw: -14, pitch: 2, fov: 58, push: 0.04, arc: -2.4 }),
      ],
      actors: {
        warden: {
          at: [-0.5, 0, -1.0], face: 12, hold: { R: 'swatch' },
          track: [
            { t: 0, pose: 'holdLow', expr: 'bored' },
            { t: 0.5, pose: 'holdUp' },
            { t: 1.07, pose: ['holdUp', { headTilt: -6, headTurn: -14 }], expr: 'skeptical' },
            { t: 1.8, pose: ['holdUp', { headTurn: 0 }], expr: 'angry' },
            { t: 2.5, pose: ['shock', { armR: [72, 25, 172, 12] }], expr: 'surprised' },
            { t: 2.63, pose: ['holdUp', { lean: -4, headTurn: 30 }], expr: 'worried' },
            { t: 3.2, pose: ['holdLow', { headTurn: 30 }], expr: 'suspicious' },
            { t: 3.6, pose: 'walkA', face: 80 },
            { t: 3.77, pose: 'walkB', face: 80, at: [-0.2, 0, -1.0] },
            { t: 3.93, pose: 'walkA', face: 80, at: [0.1, 0, -1.0] },
            { t: 4.07, pose: 'walkB', face: 80, at: [0.4, 0, -1.0] },
          ],
          talk: [[0.1, 1.8], [2.55, 3.1]],
        },
      },
    },
    {
      id: 'field',
      set: 'field',
      start: 4.0,
      transition: { type: 'dissolve', frames: 6 },
      camera: [
        // low hero angle, arcing; moving from before its first visible frame
        orbit({ t: 4.0, target: [0.2, 1.25, 0], dist: 6.4, yaw: -22, pitch: -3, fov: 60, push: 0.05, arc: 3.2 }),
        orbit({ t: 6.3, frames: 14, target: [0.75, 1.55, 0.3], dist: 2.9, yaw: 16, pitch: -6, fov: 60, push: 0.035, arc: 2.0 }),
      ],
      dof: { focus: 'digger', aperture: 0.0009, maxblur: 0.004 },
      actors: {
        warden: {
          at: [-0.75, 0, -0.6], face: 20,
          track: [
            ...walk({ from: [-0.9, 0, -3.2], to: [-0.75, 0, -0.6], t0: 3.8, t1: 5.0, every: 5 }),
            { t: 5.0, pose: 'stand', expr: 'neutral', face: 20 },
            { t: 5.5, pose: ['stand', { headTurn: -28, headNod: -6 }], expr: 'surprised' },
            { t: 6.4, pose: ['hips', { headTurn: -30 }], expr: 'happy' },
            { t: 7.3, pose: ['crossed', { headTurn: -30 }], expr: 'smug' },
          ],
        },
        digger: {
          at: [0.85, 0, 0.3], face: -18,
          track: [
            { t: 3.8, pose: 'wave1', expr: 'happy' },
            { t: 4.4, pose: 'wave2' },
            { t: 4.57, pose: 'wave1' },
            { t: 4.73, pose: 'wave2' },
            { t: 4.9, pose: ['point', { headTurn: 10 }], expr: 'excited' },
            { t: 5.8, pose: 'shrug', expr: 'happy' },
            { t: 6.8, pose: 'cheer', expr: 'excited' },
            { t: 6.93, pose: 'armsUp' },
            { t: 7.4, pose: 'hips', expr: 'happy' },
          ],
          talk: [[4.9, 6.5], [6.8, 7.8]],
        },
      },
    },
  ],

  // full-frame flash on the wall hit: 4 frames, bloom spikes for the first 2
  fx: [fx.flash({ t: 2.5, frames: 4, strength: 0.55, bloom: 0.6, color: '#fff0fa' })],
});
