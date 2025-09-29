/**
 * Example script showing how to set up HeyGen TTS integration
 * This file demonstrates the complete setup process
 */

import { ttsService, defaultTTSConfig } from '../services/ttsService';
import { useAudioStory } from '../hooks/useAudioStory';

// Example 1: Basic Setup
export const setupBasicTTS = () => {
  // Configure the TTS service with your API key
  ttsService.updateConfig({
    apiKey: 'your-heygen-api-key-here',
    voiceId: 'persian_female_01',
    language: 'fa',
    speed: 1.0,
    volume: 80,
    autoPlay: true,
    autoProgress: true
  });

  console.log('TTS service configured successfully');
};

// Example 2: Convert and Play Story Text
export const playStoryExample = async () => {
  const storyText = `
    جنابخان وارد رستورانی قدیمی و تاریک می‌شود که بوی گوشت سوخته و عطر عرق مردانه در فضا پیچیده است.
    در گوشه‌ای از رستوران، صدای چینی‌های شکسته و نوشیدنی‌های تقطیر شده به گوش می‌رسد.
  `;

  try {
    // Convert text to speech
    const result = await ttsService.convertToSpeech(storyText);
    
    if (result.success && result.audioUrl) {
      // Play the audio
      await ttsService.playAudio(
        result.audioUrl,
        () => {
          console.log('Story audio completed!');
          // Game automatically progresses here
        },
        (error) => {
          console.error('Audio playback error:', error);
          // Fallback to text-only mode
        }
      );
    } else {
      console.error('TTS conversion failed:', result.error);
    }
  } catch (error) {
    console.error('TTS setup error:', error);
  }
};

// Example 3: Using the React Hook
export const useTTSInComponent = () => {
  const storyText = "Your story text here...";
  
  const {
    isPlaying,
    isLoading,
    error,
    play,
    pause,
    stop,
    setVolume,
    toggleEnabled
  } = useAudioStory(
    storyText,
    () => {
      console.log('Story completed, auto-progressing...');
    },
    (error) => {
      console.error('Audio error:', error);
    }
  );

  // Return the controls for use in your component
  return {
    isPlaying,
    isLoading,
    error,
    play,
    pause,
    stop,
    setVolume,
    toggleEnabled
  };
};

// Example 4: Error Handling and Fallback
export const robustTTSExample = async () => {
  const storyText = "This is a test story for TTS conversion.";
  
  try {
    // Attempt TTS conversion
    const ttsResult = await ttsService.convertToSpeech(storyText);
    
    if (ttsResult.success && ttsResult.audioUrl) {
      // Success: Play audio with auto-progression
      await ttsService.playAudio(
        ttsResult.audioUrl,
        () => {
          console.log('Audio completed, progressing to next stage');
          // Your auto-progression logic here
        },
        (error) => {
          console.warn('Audio failed, continuing with text-only:', error);
          // Fallback: Continue without audio
          // Your auto-progression logic here
        }
      );
    } else {
      // TTS conversion failed, continue with text-only
      console.warn('TTS conversion failed, using text-only mode:', ttsResult.error);
      // Your auto-progression logic here
    }
  } catch (error) {
    // Critical error, fallback to text-only mode
    console.error('Critical TTS error, falling back to text-only:', error);
    // Your auto-progression logic here
  }
};

// Example 5: Configuration Management
export const manageTTSConfiguration = () => {
  // Load saved configuration
  const savedConfig = localStorage.getItem('dnd-tts-config');
  const config = savedConfig ? JSON.parse(savedConfig) : defaultTTSConfig;
  
  // Apply configuration
  ttsService.updateConfig(config);
  
  // Save configuration updates
  const updateConfig = (newSettings: any) => {
    const updatedConfig = { ...config, ...newSettings };
    localStorage.setItem('dnd-tts-config', JSON.stringify(updatedConfig));
    ttsService.updateConfig(updatedConfig);
  };
  
  return { config, updateConfig };
};

// Example 6: Game Integration Pattern
export const gameIntegrationExample = (roomCode: string, genre: string) => {
  // This is how you would integrate TTS into your existing game
  const {
    messages,
    gameState,
    currentStage,
    audioStory
  } = useGameSocket(roomCode, genre as any);
  
  // The audioStory object provides all the controls needed
  // It automatically handles:
  // - Converting current stage description to speech
  // - Playing audio when stage changes
  // - Auto-progressing after audio completes
  // - Error handling and fallback
  
  return {
    messages,
    gameState,
    currentStage,
    audioControls: audioStory
  };
};

// Example 7: Testing TTS Configuration
export const testTTSConfiguration = async () => {
  const testText = "This is a test of the text-to-speech system.";
  
  console.log('Testing TTS configuration...');
  
  // Test API connectivity
  const result = await ttsService.convertToSpeech(testText);
  
  if (result.success) {
    console.log('✅ TTS configuration is working correctly');
    console.log('Audio URL:', result.audioUrl);
    console.log('Duration:', result.duration, 'seconds');
    
    // Test audio playback
    if (result.audioUrl) {
      await ttsService.playAudio(
        result.audioUrl,
        () => console.log('✅ Audio playback test successful'),
        (error) => console.error('❌ Audio playback test failed:', error)
      );
    }
  } else {
    console.error('❌ TTS configuration failed:', result.error);
    console.log('Please check your API key and network connection');
  }
};

// Export all examples for easy testing
export const TTSExamples = {
  setupBasicTTS,
  playStoryExample,
  useTTSInComponent,
  robustTTSExample,
  manageTTSConfiguration,
  gameIntegrationExample,
  testTTSConfiguration
};

// Quick setup function for development
export const quickSetup = () => {
  console.log('Setting up TTS for development...');
  
  // Use default configuration
  ttsService.updateConfig(defaultTTSConfig);
  
  console.log('TTS service ready! Remember to set your API key in the settings.');
  console.log('Run testTTSConfiguration() to verify your setup.');
};
