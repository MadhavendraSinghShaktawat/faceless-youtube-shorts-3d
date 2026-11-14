#!/bin/sh
# Voice / background separation used by stems.py, sfx.py, music.py (needs: pip install demucs soundfile).
# Run from reference/analysis/_tmp with the venv python:  sh ../../../tools/analysis/separate.sh
export TORCH_HOME=$PWD/torch
python -m demucs --two-stems vocals -n htdemucs -o demucs_out pink-prison.wav one-cart.wav mine-salting.wav
