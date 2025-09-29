import { useState, useEffect, useRef, useCallback } from 'react';

export interface VoicePlaybackState {
  isPlaying: boolean;
  isLoading: boolean;
  currentVoiceFile: string | null;
  duration: number;
  currentTime: number;
  volume: number;
  error: string | null;
  isEnabled: boolean;
}

export interface VoicePlaybackControls {
  play: () => void;
  pause: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  skip: () => void;
  toggleEnabled: () => void;
}

export interface UseVoicePlaybackReturn extends VoicePlaybackState, VoicePlaybackControls {}

/**
 * Voice file mapping for different story stages and genres
 */
const voiceFileMapping: Record<string, Record<number, string>> = {
  fantasy: {
    1: '/voices/A cold wind.wav', // For "A cold wind blows through the iron gates..."
    2: '/voices/Suddenly, purple.wav', // For "Suddenly, purple smoke swirls in the air..."
    // You can add more voice files for other stages here:
    // 3: '/voices/dragon-encounter.wav',
    // 4: '/voices/dragon-queen.wav',
    // 5: '/voices/final-battle.wav',
  },
  // Add more mappings for other genres and stages
  jenabkhan: {
    // Add voice files for Persian fantasy stages here
  },
  historical: {
    // Add voice files for historical stages here
  },
  mystery: {
    // Add voice files for mystery stages here
  },
  horror: {
    // Add voice files for horror stages here
  },
  comedy: {
    // Add voice files for comedy stages here
  },
  scifi: {
    // Add voice files for sci-fi stages here
  }
};

/**
 * Custom hook for managing voice file playback with TTS fallback
 * First tries to play voice files, then falls back to TTS if no voice file exists
 */
export const useVoicePlayback = (
  storyText: string,
  genre: string = 'fantasy',
  stage: number = 1,
  onVoiceComplete?: () => void,
  onError?: (error: string) => void
): UseVoicePlaybackReturn => {
  const [state, setState] = useState<VoicePlaybackState>({
    isPlaying: false,
    isLoading: false,
    currentVoiceFile: null,
    duration: 0,
    currentTime: 0,
    volume: 80,
    error: null,
    isEnabled: true
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasProcessedRef = useRef<string>('');

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
      processVoicePlayback(storyText, genre, stage);
    }
  }, [storyText, genre, stage, state.isEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const processVoicePlayback = useCallback(async (text: string, currentGenre: string, currentStage: number) => {
    if (!text.trim()) return;

    const voiceFilePath = getVoiceFilePath(currentGenre, currentStage);
    if (!voiceFilePath) {
      console.log(`No voice file found for ${currentGenre} stage ${currentStage}`);
      return;
    }

    setState(prev => ({
      ...prev,
      currentVoiceFile: voiceFilePath,
      isLoading: true,
      error: null
    }));

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
          isLoading: false
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
        
        if (onVoiceComplete) {
          onVoiceComplete();
        }
      });

      audio.addEventListener('error', (e) => {
        const errorMessage = `Failed to load voice file: ${voiceFilePath}`;
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
          isPlaying: false
        }));
        
        if (onError) {
          onError(errorMessage);
        }
      });

      // Start playing
      await audio.play();
      setState(prev => ({
        ...prev,
        isPlaying: true,
        isLoading: false
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        isPlaying: false
      }));
      
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [getVoiceFilePath, state.volume, onVoiceComplete, onError]);

  const play = useCallback(() => {
    if (audioRef.current && state.currentVoiceFile && state.isEnabled) {
      audioRef.current.play();
      setState(prev => ({ ...prev, isPlaying: true }));
    }
  }, [state.currentVoiceFile, state.isEnabled]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setState(prev => ({
        ...prev,
        isPlaying: false,
        currentTime: 0
      }));
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(100, volume));
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume / 100;
    }
    setState(prev => ({ ...prev, volume: clampedVolume }));
  }, []);

  const skip = useCallback(() => {
    stop();
    if (onVoiceComplete) {
      onVoiceComplete();
    }
  }, [stop, onVoiceComplete]);

  const toggleEnabled = useCallback(() => {
    setState(prev => {
      const newEnabled = !prev.isEnabled;
      if (!newEnabled) {
        stop();
      }
      return { ...prev, isEnabled: newEnabled };
    });
  }, [stop]);

  return {
    ...state,
    play,
    pause,
    stop,
    setVolume,
    skip,
    toggleEnabled
  };
};
