/**
 * Text-to-Speech Service using HeyGen API
 * Handles story text conversion to speech with automatic progression
 */

export interface TTSConfig {
  apiKey: string;
  voiceId: string;
  language: string;
  speed: number;
  volume: number;
  autoPlay: boolean;
  autoProgress: boolean;
}

export interface TTSResponse {
  success: boolean;
  audioUrl?: string;
  error?: string;
  duration?: number;
}

export class TTSService {
  private config: TTSConfig;
  private currentAudio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private onAudioEnd?: () => void;
  private onError?: (error: string) => void;

  constructor(config: TTSConfig) {
    this.config = config;
  }

  /**
   * Convert text to speech using HeyGen API
   */
  async convertToSpeech(text: string): Promise<TTSResponse> {
    try {
      // Clean and prepare text for TTS
      const cleanText = this.cleanText(text);
      
      if (!cleanText.trim()) {
        return {
          success: false,
          error: 'No text provided for speech conversion'
        };
      }

      // Make API request to HeyGen
      const response = await fetch('https://api.heygen.com/v1/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey
        },
        body: JSON.stringify({
          text: cleanText,
          voice_id: this.config.voiceId,
          language: this.config.language,
          speed: this.config.speed,
          volume: this.config.volume,
          format: 'mp3'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        audioUrl: result.audio_url,
        duration: result.duration
      };

    } catch (error) {
      console.error('TTS Conversion Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Play audio with automatic progression
   */
  async playAudio(audioUrl: string, onEnd?: () => void, onError?: (error: string) => void): Promise<void> {
    try {
      // Stop any currently playing audio
      this.stopAudio();

      this.onAudioEnd = onEnd;
      this.onError = onError;

      // Create new audio element
      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.volume = this.config.volume / 100;
      this.currentAudio.preload = 'auto';

      // Set up event listeners
      this.currentAudio.addEventListener('ended', this.handleAudioEnd.bind(this));
      this.currentAudio.addEventListener('error', this.handleAudioError.bind(this));
      this.currentAudio.addEventListener('canplaythrough', this.handleCanPlay.bind(this));

      // Start playback
      await this.currentAudio.play();
      this.isPlaying = true;

    } catch (error) {
      console.error('Audio Playback Error:', error);
      this.handleAudioError(error);
    }
  }

  /**
   * Stop current audio playback
   */
  stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio.removeEventListener('ended', this.handleAudioEnd);
      this.currentAudio.removeEventListener('error', this.handleAudioError);
      this.currentAudio.removeEventListener('canplaythrough', this.handleCanPlay);
      this.currentAudio = null;
    }
    this.isPlaying = false;
  }

  /**
   * Pause current audio playback
   */
  pauseAudio(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
    }
  }

  /**
   * Resume paused audio playback
   */
  resumeAudio(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play();
    }
  }

  /**
   * Check if audio is currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying && this.currentAudio !== null && !this.currentAudio.paused;
  }

  /**
   * Get current audio duration
   */
  getDuration(): number {
    return this.currentAudio?.duration || 0;
  }

  /**
   * Get current audio time
   */
  getCurrentTime(): number {
    return this.currentAudio?.currentTime || 0;
  }

  /**
   * Set audio volume
   */
  setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(100, volume));
    if (this.currentAudio) {
      this.currentAudio.volume = this.config.volume / 100;
    }
  }

  /**
   * Update TTS configuration
   */
  updateConfig(newConfig: Partial<TTSConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Clean text for better TTS output
   */
  private cleanText(text: string): string {
    return text
      .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u200C\u200D\s\w\.,!?;:'"()\-]/g, '') // Keep Persian, Arabic, and basic punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\n+/g, '. ') // Convert line breaks to pauses
      .trim();
  }

  /**
   * Handle audio end event
   */
  private handleAudioEnd(): void {
    this.isPlaying = false;
    if (this.onAudioEnd && this.config.autoProgress) {
      this.onAudioEnd();
    }
  }

  /**
   * Handle audio error
   */
  private handleAudioError(error: any): void {
    this.isPlaying = false;
    console.error('Audio Error:', error);
    if (this.onError) {
      this.onError('Audio playback failed. Please check your connection and try again.');
    }
  }

  /**
   * Handle when audio can play
   */
  private handleCanPlay(): void {
    console.log('Audio ready to play');
  }

  /**
   * Convert story text to speech and play automatically
   */
  async speakStoryText(text: string, onComplete?: () => void, onError?: (error: string) => void): Promise<void> {
    if (!this.config.autoPlay) {
      // If auto-play is disabled, just call the completion callback
      if (onComplete) {
        onComplete();
      }
      return;
    }

    const ttsResult = await this.convertToSpeech(text);
    
    if (ttsResult.success && ttsResult.audioUrl) {
      await this.playAudio(ttsResult.audioUrl, onComplete, onError);
    } else {
      console.warn('TTS failed, falling back to text-only mode:', ttsResult.error);
      if (onComplete) {
        onComplete();
      }
    }
  }
}

// Default configuration
export const defaultTTSConfig: TTSConfig = {
  apiKey: 'NWI1YTc0ZTFlYTBhNDdlZTgxNjFiMmYxMWRlNDRiOTItMTc1ODg3OTEzNQ==', // Provided API key
  voiceId: 'e2744777fa994deaa2aac7fa3e054acc', // Provided choice ID
  language: 'fa', // Persian language code
  speed: 1.0, // Normal speed
  volume: 80, // 80% volume
  autoPlay: true, // Auto-play audio
  autoProgress: true // Auto-progress to next stage
};

// Create singleton instance
export const ttsService = new TTSService(defaultTTSConfig);
