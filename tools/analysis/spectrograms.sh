#!/bin/sh
# Renders spectrogram PNGs into reference/analysis/spectrograms/. Run from project root.
# <v>.mid.full / <v>.side.full : whole file, mid (L+R)/2 and side (L-R)/2 of the delivered mix
# <v>.bed.<a>-<b>s             : 22 s windows of the demucs "no_vocals" stem (music + SFX estimate), mono
# <v>.voice.0-22s              : first 22 s of the vocals stem
A=reference/analysis; T=$A/_tmp; O=$A/spectrograms; mkdir -p $O
for v in pink-prison one-cart mine-salting; do
  ffmpeg -v error -y -i $T/$v.wav -lavfi "pan=mono|c0=0.5*c0+0.5*c1,showspectrumpic=s=2000x700:legend=1:scale=log:fscale=log:drange=90:color=magma" $O/$v.mid.full.png
  ffmpeg -v error -y -i $T/$v.wav -lavfi "pan=mono|c0=0.5*c0-0.5*c1,showspectrumpic=s=2000x700:legend=1:scale=log:fscale=log:drange=90:color=magma" $O/$v.side.full.png
  for s in 0 22 44; do
    e=$((s+22))
    ffmpeg -v error -y -ss $s -t 22 -i $T/demucs_out/htdemucs/$v/no_vocals.wav -lavfi "pan=mono|c0=0.5*c0+0.5*c1,showspectrumpic=s=1900x640:legend=1:scale=log:fscale=log:drange=75:gain=4:color=magma" $O/$v.bed.$s-${e}s.png
  done
  ffmpeg -v error -y -t 22 -i $T/demucs_out/htdemucs/$v/vocals.wav -lavfi "pan=mono|c0=0.5*c0+0.5*c1,showspectrumpic=s=1900x640:legend=1:scale=log:fscale=log:drange=75:color=magma" $O/$v.voice.0-22s.png
done
