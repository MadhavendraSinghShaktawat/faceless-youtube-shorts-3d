#!/bin/sh
# Mix voiceover + ducked music + SFX onto a silent render. Video is stream-copied.
# usage: ./mux-audio.sh in.mp4 out.mp4
A=../shared/audio
ffmpeg -y -loglevel error -i "$1" -i $A/vo.wav -i $A/music.wav -i $A/sfx.wav -filter_complex "
[1:a]adelay=600:all=1[vo];
[2:a]volume='0.8*if(lt(t,0.4),1,if(lt(t,0.6),1-(t-0.4)/0.2*0.75,if(lt(t,3.2),0.25,if(lt(t,3.6),0.25+(t-3.2)/0.4*0.75,1))))':eval=frame,afade=t=out:st=4.7:d=0.3[mu];
[3:a]adelay=3800:all=1,volume=0.9[sfx];
[vo][mu][sfx]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.95[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -ar 48000 -t 5 -movflags +faststart "$2"
