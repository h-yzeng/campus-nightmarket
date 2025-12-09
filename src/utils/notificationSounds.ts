/**
 * Notification Sounds Utility
 * Plays audio notifications for various order events
 */

export type NotificationType =
  | 'order-placed'
  | 'order-confirmed'
  | 'order-ready'
  | 'order-completed'
  | 'message';

interface NotificationSoundConfig {
  enabled: boolean;
  volume: number; // 0.0 to 1.0
}

const SOUND_PATHS: Record<NotificationType, string> = {
  'order-placed': '/sounds/order-placed.mp3',
  'order-confirmed': '/sounds/order-confirmed.mp3',
  'order-ready': '/sounds/order-ready.mp3',
  'order-completed': '/sounds/order-completed.mp3',
  message: '/sounds/message.mp3',
};

const STORAGE_KEY = 'campus-nightmarket-notification-sounds';

/**
 * Get notification sound settings from localStorage
 */
function getSettings(): NotificationSoundConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load notification sound settings:', error);
  }

  // Default settings
  return {
    enabled: true,
    volume: 0.7,
  };
}

/**
 * Save notification sound settings to localStorage
 */
export function saveSettings(config: NotificationSoundConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save notification sound settings:', error);
  }
}

/**
 * Play a notification sound
 */
export async function playNotificationSound(type: NotificationType): Promise<void> {
  const settings = getSettings();

  if (!settings.enabled) {
    return;
  }

  try {
    const audio = new Audio(SOUND_PATHS[type]);
    audio.volume = settings.volume;

    // Play the sound
    await audio.play();
  } catch (error) {
    // Silently fail - user might have disabled autoplay or sound file not found
    console.debug(`Failed to play ${type} notification sound:`, error);
  }
}

/**
 * Check if notification sounds are enabled
 */
export function areSoundsEnabled(): boolean {
  return getSettings().enabled;
}

/**
 * Toggle notification sounds on/off
 */
export function toggleSounds(): boolean {
  const settings = getSettings();
  const newSettings = { ...settings, enabled: !settings.enabled };
  saveSettings(newSettings);
  return newSettings.enabled;
}

/**
 * Set notification volume
 */
export function setVolume(volume: number): void {
  const settings = getSettings();
  const clampedVolume = Math.max(0, Math.min(1, volume));
  saveSettings({ ...settings, volume: clampedVolume });
}

/**
 * Get current volume
 */
export function getVolume(): number {
  return getSettings().volume;
}

/**
 * Preload notification sounds for better performance
 * Call this on app initialization
 */
export function preloadSounds(): void {
  Object.values(SOUND_PATHS).forEach((path) => {
    const audio = new Audio(path);
    audio.preload = 'auto';
  });
}
