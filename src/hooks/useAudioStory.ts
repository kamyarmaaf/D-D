import { useState, useEffect, useRef, useCallback } from 'react';
import { ttsService, TTSConfig, defaultTTSConfig } from '../services/ttsService';
import { useLanguage } from './useLanguage';

export interface AudioStoryState {
  isPlaying: boolean;
  isLoading: boolean;
  currentText: string;
  duration: number;
  currentTime: number;
  volume: number;
  error: string | null;
  isEnabled: boolean;
}

export interface AudioStoryControls {
  play: () => void;
  pause: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  skip: () => void;
  toggleEnabled: () => void;
  updateConfig: (config: Partial<TTSConfig>) => void;
}

export interface UseAudioStoryReturn extends AudioStoryState, AudioStoryControls {}

/**
 * Custom hook for managing audio story narration with automatic progression
 */
export const useAudioStory = (
  storyText: string,
  onStoryComplete?: () => void,
  onError?: (error: string) => void
): UseAudioStoryReturn => {
  const [state, setState] = useState<AudioStoryState>({
    isPlaying: false,
    isLoading: false,
    currentText: '',
    duration: 0,
    currentTime: 0,
    volume: 80,
    error: null,
    isEnabled: true
  });

  const { language } = useLanguage();
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasProcessedRef = useRef<string>('');

  // Update TTS configuration based on current language
  useEffect(() => {
    const config: Partial<TTSConfig> = {
      language: language === 'fa' ? 'fa' : 'en',
      voiceId: 'e2744777fa994deaa2aac7fa3e054acc' // Use provided choice ID
    };
    ttsService.updateConfig(config);
  }, [language]);

  // Process story text when it changes
  useEffect(() => {
    if (storyText && storyText !== hasProcessedRef.current && state.isEnabled) {
      hasProcessedRef.current = storyText;
      processStoryText(storyText);
    }
  }, [storyText, state.isEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      ttsService.stopAudio();
    };
  }, []);

  const processStoryText = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setState(prev => ({
      ...prev,
      currentText: text,
      isLoading: true,
      error: null
    }));

    try {
      await ttsService.speakStoryText(
        text,
        () => {
          // On completion
          setState(prev => ({
            ...prev,
            isPlaying: false,
            isLoading: false,
            currentTime: 0
          }));
          
          if (onStoryComplete) {
            onStoryComplete();
          }
        },
        (error) => {
          // On error
          setState(prev => ({
            ...prev,
            isPlaying: false,
            isLoading: false,
            error: error
          }));
          
          if (onError) {
            onError(error);
          }
        }
      );

      // Start progress tracking
      startProgressTracking();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [onStoryComplete, onError]);

  const startProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      const duration = ttsService.getDuration();
      const currentTime = ttsService.getCurrentTime();
      const isPlaying = ttsService.getIsPlaying();

      setState(prev => ({
        ...prev,
        isPlaying,
        duration,
        currentTime
      }));

      // Clear interval when audio ends
      if (!isPlaying && currentTime > 0) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      }
    }, 100);
  }, []);

  const play = useCallback(() => {
    if (state.currentText && state.isEnabled) {
      ttsService.resumeAudio();
      startProgressTracking();
    }
  }, [state.currentText, state.isEnabled, startProgressTracking]);

  const pause = useCallback(() => {
    ttsService.pauseAudio();
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const stop = useCallback(() => {
    ttsService.stopAudio();
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentTime: 0
    }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(100, volume));
    ttsService.setVolume(clampedVolume);
    setState(prev => ({ ...prev, volume: clampedVolume }));
  }, []);

  const skip = useCallback(() => {
    stop();
    if (onStoryComplete) {
      onStoryComplete();
    }
  }, [stop, onStoryComplete]);

  const toggleEnabled = useCallback(() => {
    setState(prev => {
      const newEnabled = !prev.isEnabled;
      if (!newEnabled) {
        stop();
      }
      return { ...prev, isEnabled: newEnabled };
    });
  }, [stop]);

  const updateConfig = useCallback((config: Partial<TTSConfig>) => {
    ttsService.updateConfig(config);
  }, []);

  return {
    ...state,
    play,
    pause,
    stop,
    setVolume,
    skip,
    toggleEnabled,
    updateConfig
  };
};

/**
 * Hook for managing TTS configuration and settings
 */
export const useTTSSettings = () => {
  const [config, setConfig] = useState<TTSConfig>(() => {
    const saved = localStorage.getItem('dnd-tts-config');
    return saved ? { ...defaultTTSConfig, ...JSON.parse(saved) } : defaultTTSConfig;
  });

  const updateConfig = useCallback((newConfig: Partial<TTSConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    localStorage.setItem('dnd-tts-config', JSON.stringify(updatedConfig));
    ttsService.updateConfig(updatedConfig);
  }, [config]);

  const resetConfig = useCallback(() => {
    setConfig(defaultTTSConfig);
    localStorage.setItem('dnd-tts-config', JSON.stringify(defaultTTSConfig));
    ttsService.updateConfig(defaultTTSConfig);
  }, []);

  return {
    config,
    updateConfig,
    resetConfig
  };
};
