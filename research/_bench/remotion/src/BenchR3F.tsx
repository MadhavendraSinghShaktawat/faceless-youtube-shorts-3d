// Remotion + @remotion/three (<ThreeCanvas>, React Three Fiber).
// The same imperative scene is mounted with <primitive>, and the
// EffectComposer takes over the render loop via useFrame(cb, 1).
import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useFrame, useThree } from '@react-three/fiber';
// @ts-ignore
import { createBenchScene } from '../../shared/scene.js';
import { Caption } from './Caption';

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const gl = useThree((s) => s.gl);
  const bench = useMemo(() => createBenchScene({ renderer: gl, width, height }), [gl, width, height]);
  // priority > 0 disables R3F's own renderer.render(); ThreeCanvas calls advance() once per frame.
  useFrame(() => {
    bench.renderAt(frame / fps);
  }, 1);
  return null;
};

export const BenchR3F: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <ThreeCanvas width={width} height={height} dpr={1} gl={{ antialias: false, preserveDrawingBuffer: true }} flat>
        <Scene />
      </ThreeCanvas>
      <Caption />
    </AbsoluteFill>
  );
};
