# Audio Files forAI Contract Check

This directory contains the ambient sound files used in theAI Contract Check application.

## Required Files

Place the following audio files in this directory:

- `rain.mp3` - Gentle rainfall sounds
- `forest.mp3` - Birds and rustling leaves
- `ocean.mp3` - Calming ocean waves
- `soft-music.mp3` - Gentle ambient music
- `meditation-bells.mp3` - Meditation bells

## Audio File Requirements

Use the validation script to check your audio files:
```bash
pnpm run validate-audio
```

### Requirements

- Format: MP3
- Quality: High quality (192kbps or higher)
- Duration: 1-2 minutes (files will be looped)
- No abrupt transitions (should loop seamlessly)
- Clear of any copyright restrictions

## Icon Requirements

Place corresponding icon files in the `/icons` directory with the following sizes:
- 96x96px
- 128x128px
- 192x192px
- 256x256px

Example: `rain-96.png`, `rain-128.png`, etc.
