import React, { useState } from 'react';
import { Settings, Save, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useTTSSettings } from '../hooks/useAudioStory';
import { useLanguage } from '../hooks/useLanguage';

interface TTSConfigurationProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Configuration component for HeyGen API settings
 * Allows users to configure their API key and TTS preferences
 */
export const TTSConfiguration: React.FC<TTSConfigurationProps> = ({
  isOpen,
  onClose
}) => {
  const { t } = useLanguage();
  const { config, updateConfig, resetConfig } = useTTSSettings();
  
  const [localConfig, setLocalConfig] = useState(config);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'success' | 'error' | null>(null);

  // Handle API key validation
  const validateApiKey = async () => {
    if (!localConfig.apiKey.trim()) {
      setValidationResult('error');
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      // Test the API key with a simple request
      const response = await fetch('https://api.heygen.com/v1/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localConfig.apiKey}`,
          'X-API-Key': localConfig.apiKey
        },
        body: JSON.stringify({
          text: 'Test',
          voice_id: localConfig.voiceId,
          language: localConfig.language,
          speed: localConfig.speed,
          volume: localConfig.volume,
          format: 'mp3'
        })
      });

      if (response.ok) {
        setValidationResult('success');
      } else {
        setValidationResult('error');
      }
    } catch (error) {
      console.error('API validation error:', error);
      setValidationResult('error');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = () => {
    updateConfig(localConfig);
    onClose();
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">
              HeyGen TTS Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* API Key Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                HeyGen API Key *
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={localConfig.apiKey}
                  onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                  className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your HeyGen API key"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* API Key Validation */}
              <div className="mt-2 flex items-center space-x-3">
                <button
                  onClick={validateApiKey}
                  disabled={!localConfig.apiKey.trim() || isValidating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  {isValidating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Validating...</span>
                    </>
                  ) : (
                    <span>Validate API Key</span>
                  )}
                </button>
                
                {validationResult === 'success' && (
                  <div className="flex items-center space-x-2 text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm">API Key is valid</span>
                  </div>
                )}
                
                {validationResult === 'error' && (
                  <div className="flex items-center space-x-2 text-red-400">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">API Key is invalid</span>
                  </div>
                )}
              </div>
              
              <p className="mt-2 text-sm text-gray-400">
                Get your API key from{' '}
                <a 
                  href="https://app.heygen.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  HeyGen Dashboard
                </a>
              </p>
            </div>
          </div>

          {/* Voice Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('audio.voice')}
              </label>
              <select
                value={localConfig.voiceId}
                onChange={(e) => setLocalConfig({ ...localConfig, voiceId: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <optgroup label="Persian Voices">
                  <option value="persian_female_01">Persian Female 1</option>
                  <option value="persian_male_01">Persian Male 1</option>
                </optgroup>
                <optgroup label="English Voices">
                  <option value="english_female_01">English Female 1</option>
                  <option value="english_male_01">English Male 1</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Language
              </label>
              <select
                value={localConfig.language}
                onChange={(e) => setLocalConfig({ ...localConfig, language: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="fa">Persian (فارسی)</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          {/* Speed and Volume */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('audio.speed')}: {localConfig.speed}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.25"
                value={localConfig.speed}
                onChange={(e) => setLocalConfig({ ...localConfig, speed: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Volume: {localConfig.volume}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={localConfig.volume}
                onChange={(e) => setLocalConfig({ ...localConfig, volume: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Behavior Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Behavior Settings</h3>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={localConfig.autoPlay}
                  onChange={(e) => setLocalConfig({ ...localConfig, autoPlay: e.target.checked })}
                  className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                />
                <span className="text-gray-300">{t('audio.autoPlay')}</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={localConfig.autoProgress}
                  onChange={(e) => setLocalConfig({ ...localConfig, autoProgress: e.target.checked })}
                  className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                />
                <span className="text-gray-300">{t('audio.autoProgress')}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <button
            onClick={resetConfig}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Reset to Defaults
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
