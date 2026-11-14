// Remotion hosting a PLAIN three.js scene (no React Three Fiber):
// build once, then re-draw synchronously whenever the frame changes.
import React, { useLayoutEffect, useRef } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
// @ts-ignore
import { createBenchScene } from '../../shared/scene.js';
import { Caption } from './Caption';

export const BenchPlain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const benchRef = useRef<any>(null);

  useLayoutEffect(() => {
    if (!benchRef.current) {
      // preserveDrawingBuffer: the screenshot happens after this task returns.
      benchRef.current = createBenchScene({ canvas: canvasRef.current!, width, height, preserveDrawingBuffer: true });
    }
    benchRef.current.renderAt(frame / fps);
  }, [frame, fps, width, height]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />
      <Caption />
    </AbsoluteFill>
  );
};
