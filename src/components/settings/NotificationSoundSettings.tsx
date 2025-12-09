import { Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import {
  areSoundsEnabled,
  toggleSounds,
  getVolume,
  setVolume,
  playNotificationSound,
} from '../../utils/notificationSounds';

/**
 * Settings component for notification sound preferences
 */
export default function NotificationSoundSettings() {
  const [enabled, setEnabled] = useState(areSoundsEnabled());
  const [volume, setVolumeState] = useState(getVolume());

  const handleToggle = () => {
    const newState = toggleSounds();
    setEnabled(newState);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setVolumeState(newVolume);
  };

  const handleTestSound = () => {
    void playNotificationSound('message');
  };

  return (
    <div className="rounded-xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-6">
      <div className="mb-4 flex items-center gap-3">
        {enabled ? (
          <Volume2 size={24} className="text-[#CC0000]" />
        ) : (
          <VolumeX size={24} className="text-[#76777B]" />
        )}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">Notification Sounds</h3>
          <p className="text-sm text-[#A0A0A0]">Play sounds when you receive order notifications</p>
        </div>
        <button
          onClick={handleToggle}
          className={`relative h-8 w-14 rounded-full transition-all ${
            enabled ? 'bg-[#CC0000]' : 'bg-[#3A3A3A]'
          }`}
          aria-label={enabled ? 'Disable notification sounds' : 'Enable notification sounds'}
        >
          <div
            className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${
              enabled ? 'left-7' : 'left-1'
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="space-y-4 border-t-2 border-[#3A3A3A] pt-4">
          {/* Volume Slider */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="volume-slider" className="text-sm font-semibold text-[#E0E0E0]">
                Volume
              </label>
              <span className="text-sm text-[#A0A0A0]">{Math.round(volume * 100)}%</span>
            </div>
            <input
              id="volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#3A3A3A] accent-[#CC0000] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#CC0000]"
            />
          </div>

          {/* Test Sound Button */}
          <button
            onClick={handleTestSound}
            className="w-full rounded-lg border-2 border-[#3A3A3A] bg-[#252525] px-4 py-2 text-sm font-semibold text-white transition-all hover:border-[#CC0000] hover:bg-[#2A2A2A]"
          >
            🔔 Test Sound
          </button>
        </div>
      )}
    </div>
  );
}
