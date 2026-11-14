import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
// @ts-ignore
import { captionAt } from '../../shared/scene.js';

export const Caption: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = captionAt(frame / fps);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute', left: 0, right: 0, top: '74%', transform: 'translateY(-50%)', textAlign: 'center',
          font: '900 68px "Arial Black", "Helvetica Neue", Arial, sans-serif', color: '#fff',
          WebkitTextStroke: '14px #15101c', paintOrder: 'stroke fill',
        }}
      >
        {c.words.map((w: string, i: number) => (
          <span
            key={i}
            style={{
              display: 'inline-block', margin: '0 8px', color: i === c.active ? '#ffd23f' : '#fff',
              transform: i === c.active ? `scale(${1 + 0.25 * Math.max(0, 1 - c.pop * 4)})` : undefined,
            }}
          >
            {w}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
