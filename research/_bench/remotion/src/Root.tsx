import React from 'react';
import { Composition } from 'remotion';
import { BenchPlain } from './BenchPlain';
import { BenchR3F } from './BenchR3F';
import { BenchAudio } from './BenchAudio';
// @ts-ignore
import { WIDTH, HEIGHT, FPS, DURATION } from '../../shared/scene.js';

export const Root: React.FC = () => (
  <>
    <Composition id="BenchPlain" component={BenchPlain} width={WIDTH} height={HEIGHT} fps={FPS} durationInFrames={FPS * DURATION} />
    <Composition id="BenchR3F" component={BenchR3F} width={WIDTH} height={HEIGHT} fps={FPS} durationInFrames={FPS * DURATION} />
    <Composition id="BenchAudio" component={BenchAudio} width={WIDTH} height={HEIGHT} fps={FPS} durationInFrames={FPS * DURATION} />
  </>
);
