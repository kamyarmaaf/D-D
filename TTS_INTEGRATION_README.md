# HeyGen Text-to-Speech Integration

This integration adds automatic text-to-speech narration to your D&D adventure game using the HeyGen API. The system converts story text to speech, plays it automatically, and seamlessly progresses through the game without requiring manual button clicks.

## Features

- 🎙️ **Automatic Text-to-Speech**: Converts story text to natural-sounding speech
- 🔄 **Seamless Story Progression**: Automatically moves to the next stage after audio completes
- 🎛️ **Audio Controls**: Play, pause, stop, skip, and volume controls
- ⚙️ **Customizable Settings**: Voice selection, speed, volume, and behavior options
- 🌍 **Multi-language Support**: Persian and English voice options
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🛡️ **Error Handling**: Graceful fallback to text-only mode on errors

## Setup Instructions

### 1. Get HeyGen API Key

1. Visit [HeyGen Dashboard](https://app.heygen.com)
2. Sign up for an account or log in
3. Navigate to API settings
4. Generate an API key
5. Copy the API key for configuration

### 2. Configure the TTS Service

The TTS service is automatically initialized with default settings. You can configure it through the UI:

1. Open the game
2. Click on the "Settings" button in the audio controls
3. Enter your HeyGen API key
4. Configure voice, speed, volume, and behavior settings
5. Save the configuration

### 3. Usage in Your Game

#### Basic Integration

```tsx
import { useGameSocket } from '../hooks/useGameSocket';
import { AudioControls } from '../components/AudioControls';

function GamePage() {
  const { audioStory, currentStage, gameState } = useGameSocket(roomCode, genre);
  
  return (
    <div>
      {/* Your game content */}
      <div className="story-content">
        {currentStage?.description}
      </div>
      
      {/* Audio Controls */}
      <AudioControls
        storyText={currentStage?.description || ''}
        onStoryComplete={() => console.log('Story completed')}
        onError={(error) => console.error('Audio error:', error)}
      />
    </div>
  );
}
```

#### Advanced Integration with Custom Controls

```tsx
import { useAudioStory } from '../hooks/useAudioStory';

function CustomGameComponent() {
  const {
    isPlaying,
    isLoading,
    duration,
    currentTime,
    volume,
    error,
    play,
    pause,
    stop,
    setVolume,
    skip,
    toggleEnabled
  } = useAudioStory(storyText, onComplete, onError);

  return (
    <div>
      {/* Custom audio controls */}
      <button onClick={isPlaying ? pause : play}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <input
        type="range"
        min="0"
        max="100"
        value={volume}
        onChange={(e) => setVolume(parseInt(e.target.value))}
      />
    </div>
  );
}
```

## API Reference

### TTSService

Main service class for handling text-to-speech operations.

#### Methods

- `convertToSpeech(text: string)`: Convert text to speech using HeyGen API
- `playAudio(audioUrl: string, onEnd?, onError?)`: Play audio with callbacks
- `stopAudio()`: Stop current audio playback
- `pauseAudio()`: Pause current audio
- `resumeAudio()`: Resume paused audio
- `setVolume(volume: number)`: Set audio volume (0-100)
- `updateConfig(config: Partial<TTSConfig>)`: Update TTS configuration

### useAudioStory Hook

React hook for managing audio story narration.

#### Returns

- `isPlaying: boolean` - Whether audio is currently playing
- `isLoading: boolean` - Whether TTS conversion is in progress
- `currentText: string` - Current story text being narrated
- `duration: number` - Audio duration in seconds
- `currentTime: number` - Current playback time in seconds
- `volume: number` - Current volume (0-100)
- `error: string | null` - Any error message
- `isEnabled: boolean` - Whether audio narration is enabled
- `play()` - Start or resume audio playback
- `pause()` - Pause audio playback
- `stop()` - Stop audio playback
- `setVolume(volume: number)` - Set audio volume
- `skip()` - Skip current audio and trigger completion
- `toggleEnabled()` - Toggle audio narration on/off

### AudioControls Component

Pre-built audio control interface.

#### Props

- `storyText: string` - Text to be narrated
- `onStoryComplete?: () => void` - Callback when story completes
- `onError?: (error: string) => void` - Callback for errors
- `className?: string` - Additional CSS classes

### TTSConfiguration Component

Configuration interface for HeyGen API settings.

#### Props

- `isOpen: boolean` - Whether the configuration modal is open
- `onClose: () => void` - Callback when configuration is closed

## Configuration Options

### TTSConfig Interface

```typescript
interface TTSConfig {
  apiKey: string;           // HeyGen API key
  voiceId: string;          // Voice identifier
  language: string;         // Language code (fa, en)
  speed: number;           // Playback speed (0.5 - 2.0)
  volume: number;          // Volume (0 - 100)
  autoPlay: boolean;       // Auto-play audio when text changes
  autoProgress: boolean;   // Auto-progress game after audio
}
```

### Available Voices

- `persian_female_01` - Persian Female Voice 1
- `persian_male_01` - Persian Male Voice 1
- `english_female_01` - English Female Voice 1
- `english_male_01` - English Male Voice 1

## Error Handling

The system includes comprehensive error handling:

1. **API Errors**: Invalid API keys, network issues, rate limiting
2. **Audio Errors**: Playback failures, unsupported formats
3. **Fallback Mode**: Automatically switches to text-only mode on errors
4. **User Feedback**: Clear error messages and recovery options

## Performance Considerations

- **Caching**: Audio responses are cached to avoid re-converting identical text
- **Lazy Loading**: Audio is only generated when needed
- **Memory Management**: Automatic cleanup of audio resources
- **Bandwidth Optimization**: Compressed audio formats for faster loading

## Browser Compatibility

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Security Notes

- API keys are stored locally in browser storage
- No audio data is permanently stored
- All API communications use HTTPS
- User data is not sent to external services

## Troubleshooting

### Common Issues

1. **Audio not playing**
   - Check browser permissions for audio playback
   - Verify API key is valid
   - Check network connection

2. **Poor audio quality**
   - Try different voice options
   - Adjust speed and volume settings
   - Check text quality (avoid special characters)

3. **API rate limits**
   - HeyGen has rate limits on API usage
   - Consider implementing request queuing for high-volume usage

### Debug Mode

Enable debug logging by setting:
```javascript
localStorage.setItem('dnd-tts-debug', 'true');
```

## License

This TTS integration is part of the D&D Adventure game project and follows the same licensing terms.

## Support

For issues related to:
- **HeyGen API**: Contact HeyGen support
- **Integration Issues**: Check the game's issue tracker
- **Feature Requests**: Submit through the game's feature request system
