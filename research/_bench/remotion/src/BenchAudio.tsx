import React from 'react';
import { Sequence, interpolate, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { BenchPlain } from './BenchPlain';

export const BenchAudio: React.FC = () => {
  const { fps } = useVideoConfig();
  const sec = (s: number) => Math.round(s * fps);
  return (
    <>
      <BenchPlain />
      {/* music bed, ducked under the voiceover: volume is a function of frame */}
      <Audio
        src={staticFile('music.wav')}
        volume={(f) =>
          0.8 *
          interpolate(f, [0, sec(0.4), sec(0.6), sec(3.2), sec(3.6)], [1, 1, 0.25, 0.25, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        }
      />
      <Sequence from={sec(0.6)} layout="none">
        <Audio src={staticFile('vo.wav')} />
      </Sequence>
      <Sequence from={sec(3.8)} layout="none">
        <Audio src={staticFile('sfx.wav')} volume={0.9} />
      </Sequence>
    </>
  );
};
