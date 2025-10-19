import { useState, useEffect, useRef, useCallback } from 'react';
import { useAudioStory } from './useAudioStory';

export interface SmartAudioState {
  isPlaying: boolean;
  isLoading: boolean;
  currentAudioType: 'voice' | 'tts' | null;
  currentVoiceFile: string | null;
  duration: number;
  currentTime: number;
  volume: number;
  error: string | null;
  isEnabled: boolean;
}

export interface SmartAudioControls {
  play: () => void;
  pause: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  skip: () => void;
  toggleEnabled: () => void;
  switchToTTS: () => void;
  switchToVoice: () => void;
}

export interface UseSmartAudioReturn extends SmartAudioState, SmartAudioControls {}

/**
 * Voice file mapping for different story stages and genres
 */
const voiceFileMapping: Record<string, Record<number, string>> = {
  fantasy: {
    1: '/voices/A cold wind.wav', // For "A cold wind blows through the iron gates..."
    2: '/voices/Suddenly, purple.wav', // For "Suddenly, purple smoke swirls in the air..."
  },
  // Add more mappings for other genres and stages
  jenabkhan: {},
  historical: {},
  mystery: {},
  horror: {},
  comedy: {},
  scifi: {}
};

/**
 * Smart Audio Hook that combines voice files and TTS
 * Automatically chooses between voice files and TTS based on availability
 */
export const useSmartAudio = (
  storyText: string,
  genre: string = 'fantasy',
  stage: number = 1,
  onAudioComplete?: () => void,
  onError?: (error: string) => void
): UseSmartAudioReturn => {
  const [state, setState] = useState<SmartAudioState>({
    isPlaying: false,
    isLoading: false,
    currentAudioType: null,
    currentVoiceFile: null,
    duration: 0,
    currentTime: 0,
    volume: 80,
    error: null,
    isEnabled: true
  });

  const [preferredMode, setPreferredMode] = useState<'voice' | 'tts' | 'auto'>('auto');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasProcessedRef = useRef<string>('');

  // TTS hook for fallback
  const ttsAudio = useAudioStory(
    storyText,
    () => {
      setState(prev => ({
        ...prev,
        isPlaying: false,
        currentTime: 0
      }));
      if (onAudioComplete) onAudioComplete();
    },
    (error) => {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error,
        isPlaying: false
      }));
      if (onError) onError(error);
    }
  );

  // Get voice file path for current story
  const getVoiceFilePath = useCallback((currentGenre: string, currentStage: number): string | null => {
    const genreMapping = voiceFileMapping[currentGenre];
    if (!genreMapping) return null;
    
    return genreMapping[currentStage] || null;
  }, []);

  // Process story text when it changes
  useEffect(() => {
    if (storyText && storyText !== hasProcessedRef.current && state.isEnabled) {
      hasProcessedRef.current = storyText;
      processSmartAudio(storyText, genre, stage);
    }
  }, [storyText, genre, stage, state.isEnabled, preferredMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      ttsAudio.stop();
    };
  }, []);

  const processSmartAudio = useCallback(async (text: string, currentGenre: string, currentStage: number) => {
    if (!text.trim()) return;

    const voiceFilePath = getVoiceFilePath(currentGenre, currentStage);
    
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    // Decide which audio source to use
    const shouldUseVoice = preferredMode === 'voice' || (preferredMode === 'auto' && voiceFilePath);
    const shouldUseTTS = preferredMode === 'tts' || (preferredMode === 'auto' && !voiceFilePath);

    if (shouldUseVoice && voiceFilePath) {
      // Use voice file
      await playVoiceFile(voiceFilePath);
    } else if (shouldUseTTS) {
      // Use TTS
      await playTTS();
    } else {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'No audio source available'
      }));
    }
  }, [getVoiceFilePath, preferredMode, onAudioComplete, onError]);

  const playVoiceFile = async (voiceFilePath: string): Promise<void> => {
    try {
      // Create new audio element
      const audio = new Audio(voiceFilePath);
      audioRef.current = audio;

      // Set volume
      audio.volume = state.volume / 100;

      // Add event listeners
      audio.addEventListener('loadedmetadata', () => {
        setState(prev => ({
          ...prev,
          duration: audio.duration,
          isLoading: false,
          currentAudioType: 'voice',
          currentVoiceFile: voiceFilePath
        }));
      });

      audio.addEventListener('timeupdate', () => {
        setState(prev => ({
          ...prev,
          currentTime: audio.currentTime,
          isPlaying: !audio.paused
        }));
      });

      audio.addEventListener('ended', () => {
        setState(prev => ({
          ...prev,
          isPlaying: false,
          currentTime: 0
        }));
        
        if (onAudioComplete) {
          onAudioComplete();
        }
      });

      audio.addEventListener('error', () => {
        const errorMessage = `Failed to load voice file: ${voiceFilePath}`;
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
          isPlaying: false
        }));
        
        // Fallback to TTS if voice file fails
        if (preferredMode === 'auto') {
          playTTS();
        } else if (onError) {
          onError(errorMessage);
        }
      });

      // Start playing
      await audio.play();
      setState(prev => ({
        ...prev,
        isPlaying: true,
        isLoading: false,
        currentAudioType: 'voice',
        currentVoiceFile: voiceFilePath
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        isPlaying: false
      }));
      
      // Fallback to TTS if voice file fails
      if (preferredMode === 'auto') {
        playTTS();
      } else if (onError) {
        onError(errorMessage);
      }
    }
  };

  const playTTS = async (): Promise<void> => {
    setState(prev => ({
      ...prev,
      currentAudioType: 'tts',
      currentVoiceFile: null,
      isPlaying: ttsAudio.isPlaying,
      isLoading: ttsAudio.isLoading,
      error: ttsAudio.error
    }));

    // Use the existing TTS system
    if (ttsAudio.isEnabled) {
      ttsAudio.play();
    }
  };

  const play = useCallback(() => {
    if (state.currentAudioType === 'voice' && audioRef.current && state.currentVoiceFile && state.isEnabled) {
      audioRef.current.play();
      setState(prev => ({ ...prev, isPlaying: true }));
    } else if (state.currentAudioType === 'tts') {
      ttsAudio.play();
      setState(prev => ({ ...prev, isPlaying: ttsAudio.isPlaying }));
    }
  }, [state.currentAudioType, state.currentVoiceFile, state.isEnabled, ttsAudio]);

  const pause = useCallback(() => {
    if (state.currentAudioType === 'voice' && audioRef.current) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    } else if (state.currentAudioType === 'tts') {
      ttsAudio.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, [state.currentAudioType, ttsAudio]);

  const stop = useCallback(() => {
    if (state.currentAudioType === 'voice' && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    ttsAudio.stop();
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentTime: 0
    }));
  }, [state.currentAudioType, ttsAudio]);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(100, volume));
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume / 100;
    }
    ttsAudio.setVolume(clampedVolume);
    setState(prev => ({ ...prev, volume: clampedVolume }));
  }, [ttsAudio]);

  const skip = useCallback(() => {
    stop();
    if (onAudioComplete) {
      onAudioComplete();
    }
  }, [stop, onAudioComplete]);

  const toggleEnabled = useCallback(() => {
    setState(prev => {
      const newEnabled = !prev.isEnabled;
      if (!newEnabled) {
        stop();
      }
      return { ...prev, isEnabled: newEnabled };
    });
  }, [stop]);

  const switchToTTS = useCallback(() => {
    setPreferredMode('tts');
    if (storyText) {
      processSmartAudio(storyText, genre, stage);
    }
  }, [storyText, genre, stage, processSmartAudio]);

  const switchToVoice = useCallback(() => {
    setPreferredMode('voice');
    if (storyText) {
      processSmartAudio(storyText, genre, stage);
    }
  }, [storyText, genre, stage, processSmartAudio]);

  return {
    ...state,
    play,
    pause,
    stop,
    setVolume,
    skip,
    toggleEnabled,
    switchToTTS,
    switchToVoice
  };
};

