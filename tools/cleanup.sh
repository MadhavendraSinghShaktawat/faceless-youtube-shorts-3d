#!/bin/bash
# Delete everything temporary after a render; keep the deliverable.
#
#   tools/cleanup.sh [--deep] [--dry-run] [videos/<slug> ...]
#
# default   per-video temp (.build/, out/snaps/, renders/), that video's HyperFrames history
#           blobs in ~/.cache/hyperframes/history/<id>/, engine build artefacts, and temp dirs
#           the tools leave in $TMPDIR when a render is killed.
#           KEEPS  out/final.mp4, out/report.json, out/review/, video.js, words.json, story.json,
#                  assets/ (incl. downloaded assets), audio/.
# --deep    also engine/node_modules and what the engine downloaded: the HyperFrames Chrome,
#           whisper models, fonts and history in ~/.cache/hyperframes, and ~/.hyperframes/cache.
#           Restore with:  (cd engine && npm ci)   -- Chrome and the whisper model are fetched
#           again on the next render / transcription (needs the network).
# --dry-run list what would go, with sizes; delete nothing.
#
# With no video arguments every folder in videos/ is cleaned.
# It refuses to touch anything outside this repo and the specific cache dirs named above.
#
# What a render leaves behind was measured by diffing the filesystem before and after
# (2026-11-14, HyperFrames 0.9.41): nothing in $TMPDIR on a clean exit; <video>/.build
# (bundle, index.html, silent video, mix); ~/.cache/hyperframes/history/<id> (asset blobs,
# id stored in .build/.hyperframes/history-id); on first use ~/.cache/hyperframes/chrome
# (193 MB) and whisper/models/ggml-small.en.bin (488 MB).
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
HF_CACHE="$HOME/.cache/hyperframes"
HF_HOME_CACHE="$HOME/.hyperframes/cache"
TMP="$(cd "${TMPDIR:-/tmp}" 2>/dev/null && pwd -P || echo /tmp)"

DEEP=0; DRY=0; VIDEOS=()
for a in "$@"; do
  case "$a" in
    --deep) DEEP=1 ;;
    --dry-run) DRY=1 ;;
    -h|--help) sed -n '2,22p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
    -*) echo "unknown option: $a" >&2; exit 1 ;;
    *) VIDEOS+=("$a") ;;
  esac
done

[ -f "$REPO/engine/render.mjs" ] || { echo "refusing: $REPO does not look like the repo root (engine/render.mjs missing)" >&2; exit 1; }

TOTAL_KB=0; COUNT=0

# Is $1 (already resolved, no symlinks in the parent) a path we are allowed to delete?
allowed() {
  case "$1" in
    "$REPO"/videos/*/.build|"$REPO"/videos/*/out/snaps|"$REPO"/videos/*/renders|"$REPO"/videos/*/.hyperframes) return 0 ;;
    "$REPO"/engine/node_modules|"$REPO"/engine/.build|"$REPO"/engine/dist|"$REPO"/engine/.hyperframes|"$REPO"/engine/renders) return 0 ;;
    "$HF_CACHE"/history/*|"$HF_CACHE"/chrome|"$HF_CACHE"/whisper|"$HF_CACHE"/fonts|"$HF_CACHE"/history) return 0 ;;
    "$HF_HOME_CACHE") return 0 ;;
    "$TMP"/hyperframes-*|"$TMP"/hf-*|"$TMP"/media-use-*|"$TMP"/mu-audio-*|"$TMP"/puppeteer_dev_chrome_profile-*) return 0 ;;
  esac
  return 1
}

remove() {
  local p="$1"
  [ -e "$p" ] || [ -L "$p" ] || return 0
  if [ -L "$p" ]; then echo "  skip (symlink, not followed): $p"; return 0; fi
  local parent base real
  parent="$(cd "$(dirname "$p")" && pwd -P)"; base="$(basename "$p")"; real="$parent/$base"
  case "$real" in *"/.."*|*"/./"*) echo "  refuse (path not canonical): $real" >&2; return 0 ;; esac
  if ! allowed "$real"; then echo "  refuse (outside the allowed locations): $real" >&2; return 0; fi
  local kb; kb="$(du -sk "$real" 2>/dev/null | awk '{print $1}')"; kb="${kb:-0}"
  TOTAL_KB=$((TOTAL_KB + kb)); COUNT=$((COUNT + 1))
  printf '  %s %9s KB  %s\n' "$([ $DRY = 1 ] && echo 'would remove' || echo 'remove')" "$kb" "$real"
  [ $DRY = 1 ] || rm -rf -- "$real"
}

# ---- videos
if [ ${#VIDEOS[@]} -eq 0 ]; then
  for d in "$REPO"/videos/*/; do [ -d "$d" ] && VIDEOS+=("${d%/}"); done
fi
for v in ${VIDEOS[@]+"${VIDEOS[@]}"}; do
  [ -d "$v" ] || { echo "no such video folder: $v" >&2; exit 1; }
  V="$(cd "$v" && pwd -P)"
  case "$V" in "$REPO"/videos/*) ;; *) echo "refusing: $V is not inside $REPO/videos" >&2; exit 1 ;; esac
  [ "$(dirname "$V")" = "$REPO/videos" ] || { echo "refusing: $V is not a direct child of videos/" >&2; exit 1; }
  echo "video ${V#"$REPO"/}"
  idf="$V/.build/.hyperframes/history-id"
  if [ -f "$idf" ]; then
    id="$(tr -d '[:space:]' < "$idf")"
    if [[ "$id" =~ ^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$ ]]; then remove "$HF_CACHE/history/$id"; fi
  fi
  remove "$V/.build"; remove "$V/out/snaps"; remove "$V/renders"; remove "$V/.hyperframes"
done

# ---- engine build artefacts + tool temp dirs
echo "engine + temp"
for p in "$REPO/engine/.build" "$REPO/engine/dist" "$REPO/engine/.hyperframes" "$REPO/engine/renders"; do remove "$p"; done
shopt -s nullglob
for p in "$TMP"/hyperframes-* "$TMP"/hf-* "$TMP"/media-use-* "$TMP"/mu-audio-* "$TMP"/puppeteer_dev_chrome_profile-*; do remove "$p"; done
shopt -u nullglob

# ---- deep
if [ $DEEP = 1 ]; then
  echo "deep"
  remove "$REPO/engine/node_modules"
  for p in "$HF_CACHE/chrome" "$HF_CACHE/whisper" "$HF_CACHE/fonts" "$HF_CACHE/history" "$HF_HOME_CACHE"; do remove "$p"; done
fi

BYTES=$((TOTAL_KB * 1024))
MB="$(awk -v k="$TOTAL_KB" 'BEGIN{printf "%.1f", k/1024}')"
if [ $DRY = 1 ]; then echo "dry run: $COUNT item(s), $BYTES bytes ($MB MB) would be freed; nothing deleted"
else echo "freed $BYTES bytes ($MB MB) in $COUNT item(s)"; fi
[ $DEEP = 1 ] && [ $DRY = 0 ] && echo "restore with: (cd engine && npm ci)"
exit 0
