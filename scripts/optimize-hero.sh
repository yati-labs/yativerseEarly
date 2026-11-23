#!/usr/bin/env bash
# Turns a raw hero clip into web-ready files in public/flow/.
#   scripts/optimize-hero.sh path/to/raw-video.mov [seconds]
# Needs ffmpeg (macOS: brew install ffmpeg). Output: hero-loop.mp4, hero-loop.webm, hero-poster.jpg
set -euo pipefail
IN="${1:?usage: optimize-hero.sh input-video [seconds, default 8]}"
SECS="${2:-8}"
OUT="${OUT_DIR:-public/flow}"
mkdir -p "$OUT"
# Square crop (the hero box is square), 720px, 24 fps, no audio, first N seconds.
VF="crop='min(iw,ih)':'min(iw,ih)',scale=720:720,fps=24"

# H.264 MP4: plays everywhere. faststart lets playback begin before the file finishes loading.
ffmpeg -y -loglevel error -i "$IN" -t "$SECS" -vf "$VF" -an \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -preset slow -crf 28 -movflags +faststart "$OUT/hero-loop.mp4"

# VP9 WebM: usually smaller on Chrome, Firefox and Edge.
ffmpeg -y -loglevel error -i "$IN" -t "$SECS" -vf "$VF" -an \
  -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 "$OUT/hero-loop.webm"

# Poster: first frame, shown while the video loads and for reduced-motion visitors.
ffmpeg -y -loglevel error -i "$IN" -vf "$VF" -frames:v 1 -q:v 4 "$OUT/hero-poster.jpg"

echo "Done. File sizes (aim for MP4 under ~1.5 MB):"
ls -lh "$OUT"/hero-loop.mp4 "$OUT"/hero-loop.webm "$OUT"/hero-poster.jpg | awk '{print "  " $5 "  " $9}'
