# Voice Playback System

This document explains how to use and configure the voice playback system for the D&D Bolt game.

## Overview

The voice playback system allows you to play custom voice files when specific story text is displayed in the game. This creates an immersive audio experience alongside the existing Text-to-Speech (TTS) system.

## How It Works

1. **Voice File Mapping**: The system uses a mapping configuration that links specific game stages and genres to voice files.
2. **Automatic Playback**: When story text is displayed, the system automatically checks if there's a corresponding voice file and plays it.
3. **User Controls**: Players can enable/disable voice playback and control playback (play/pause/stop).

## Adding Voice Files

### 1. Place Voice Files
Put your voice files in the `public/voices/` directory:
```
public/
  voices/
    A cold wind.wav
    magical-wizard.wav
    dragon-encounter.wav
    etc.
```

### 2. Update Voice Mapping
Edit `src/hooks/useVoicePlayback.ts` and update the `voiceFileMapping` object:

```typescript
const voiceFileMapping: Record<string, Record<number, string>> = {
  fantasy: {
    1: '/voices/A cold wind.wav', // Stage 1: "A cold wind blows through..."
    2: '/voices/magical-wizard.wav', // Stage 2: Wizard encounter
    3: '/voices/dragon-encounter.wav', // Stage 3: Dragon encounter
    // Add more stages...
  },
  jenabkhan: {
    // Persian fantasy voice files
  },
  // Other genres...
};
```

### 3. Supported File Formats
- WAV (recommended for best quality)
- MP3
- OGG
- Any format supported by HTML5 Audio

## Usage

### For Players
1. **Enable Voice Playback**: Click the "Voice On/Off" button in the game interface
2. **Control Playback**: Use the play/pause button to control voice playback
3. **Volume Control**: Adjust system volume or browser volume as needed

### For Developers
The voice playback system is integrated into the `useGameSocket` hook and automatically works with the existing story system.

## Configuration Options

### Voice File Naming Convention
- Use descriptive names that match the story content
- Keep file names simple (avoid special characters)
- Use consistent naming: `stage-description.wav`

### File Organization
```
public/voices/
  fantasy/
    stage1-cold-wind.wav
    stage2-wizard.wav
  horror/
    stage1-haunted-house.wav
  etc.
```

## Integration with Existing Systems

- **TTS System**: Voice playback works alongside the existing TTS system
- **Auto-progress**: Voice playback respects the auto-progress setting
- **Error Handling**: Falls back gracefully if voice files are missing

## Troubleshooting

### Voice File Not Playing
1. Check file path in `voiceFileMapping`
2. Ensure file is in `public/voices/` directory
3. Check browser console for errors
4. Verify file format is supported

### Audio Issues
1. Check browser audio permissions
2. Ensure system volume is not muted
3. Try different audio formats if needed

## Example Implementation

For the fantasy genre stage 1 ("A cold wind blows through the iron gates..."):

1. Place voice file: `public/voices/A cold wind.wav`
2. Map in code: `fantasy: { 1: '/voices/A cold wind.wav' }`
3. Voice will automatically play when stage 1 story is displayed

## Future Enhancements

- Volume control slider in UI
- Voice file preloading for smoother playback
- Multiple voice options per stage
- Voice file streaming for large files
- Voice file compression and optimization
