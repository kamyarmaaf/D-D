import React, { useState } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, SkipForward, Settings, Mic, MicOff } from 'lucide-react';
import { useAudioStory, useTTSSettings } from '../hooks/useAudioStory';
import { useLanguage } from '../hooks/useLanguage';

interface AudioControlsProps {
  storyText: string;
  onStoryComplete?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  storyText,
  onStoryComplete,
  onError,
  className = ''
}) => {
  const { t } = useLanguage();
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    isPlaying,
    isLoading,
    duration,
    currentTime,
    volume,
    error,
    isEnabled,
    play,
    pause,
    stop,
    setVolume,
    skip,
    toggleEnabled
  } = useAudioStory(storyText, onStoryComplete, onError);

  const { config, updateConfig } = useTTSSettings();

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateConfig({ speed: parseFloat(e.target.value) });
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateConfig({ voiceId: e.target.value });
  };

  if (!isEnabled) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <button
          onClick={toggleEnabled}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Mic className="h-5 w-5" />
          <span>{t('audio.enableNarration')}</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 ${className}`}>
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Main Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Play/Pause Button */}
          <button
            onClick={isPlaying ? pause : play}
            disabled={isLoading || !storyText.trim()}
            className="flex items-center justify-center w-12 h-12 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full transition-colors"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isPlaying ? (
              <Pause className="h-5 w-5 text-white" />
            ) : (
              <Play className="h-5 w-5 text-white ml-0.5" />
            )}
          </button>

          {/* Stop Button */}
          <button
            onClick={stop}
            disabled={!isPlaying && !isLoading}
            className="flex items-center justify-center w-10 h-10 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <Square className="h-4 w-4 text-white" />
          </button>

          {/* Skip Button */}
          <button
            onClick={skip}
            disabled={!isPlaying && !isLoading}
            className="flex items-center justify-center w-10 h-10 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <SkipForward className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Settings Toggle */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Settings className="h-4 w-4 text-white" />
          <span className="text-sm text-white">{t('audio.settings')}</span>
        </button>
      </div>

      {/* Progress Bar */}
      {(isPlaying || isLoading) && duration > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Volume Control */}
      <div className="flex items-center space-x-3 mb-4">
        <Volume2 className="h-5 w-5 text-gray-300" />
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-sm text-gray-300 w-12">{volume}%</span>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Voice Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('audio.voice')}
              </label>
              <select
                value={config.voiceId}
                onChange={handleVoiceChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="e2744777fa994deaa2aac7fa3e054acc">Persian Voice (Provided)</option>
                <option value="persian_female_01">Persian Female 1</option>
                <option value="persian_male_01">Persian Male 1</option>
                <option value="english_female_01">English Female 1</option>
                <option value="english_male_01">English Male 1</option>
              </select>
            </div>

            {/* Speed Control */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('audio.speed')}
              </label>
              <select
                value={config.speed}
                onChange={handleSpeedChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="0.5">0.5x (Slow)</option>
                <option value="0.75">0.75x</option>
                <option value="1.0">1.0x (Normal)</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x (Fast)</option>
              </select>
            </div>

            {/* Auto-play Toggle */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={config.autoPlay}
                  onChange={(e) => updateConfig({ autoPlay: e.target.checked })}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-300">{t('audio.autoPlay')}</span>
              </label>
            </div>

            {/* Auto-progress Toggle */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={config.autoProgress}
                  onChange={(e) => updateConfig({ autoProgress: e.target.checked })}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-300">{t('audio.autoProgress')}</span>
              </label>
            </div>
          </div>

          {/* Disable Narration */}
          <div className="mt-4 pt-4 border-t border-white/20">
            <button
              onClick={toggleEnabled}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <MicOff className="h-4 w-4" />
              <span>{t('audio.disableNarration')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
