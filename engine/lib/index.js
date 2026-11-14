// Public API of the engine. In video.js:  import { defineVideo, world, fx, orbit, ... } from 'acs';
import * as THREE from 'three';
import * as world from './world.js';
import * as fx from './fx.js';

export { THREE, world, fx };
export { defineVideo, createStage } from './stage.js';
export { Set3D } from './world.js';
export { cameraPath, orbit, ease, lerp, clamp01 } from './camera.js';
export { Character, createCharacter, INK, SKIN } from './character.js';
export { POSES, BASE_POSE, definePose, mirrorPose, resolvePose, poseNames, walk } from './poses.js';
export { EXPRESSIONS, MOUTHS, TALK_CYCLE, defineExpression, expressionNames, drawFace } from './faces.js';
export { buildTimeline, trackAt, windowAt, talkWindows, frameOf } from './timeline.js';
export { buildCards, captionAtFrame, cardStats, captionCss } from './captions.js';
export { mulberry32, hash, seedOf } from './rng.js';
export { solidify, addOutlines, createOutlineMaterial, computeOutlineNormals, setOutlineSeed } from './outline.js';
export { makeGradientMap, createToonMaterial, toonify, posterizeTexture } from './toon.js';
export { EdgeOutlinePass } from './edge-pass.js';
