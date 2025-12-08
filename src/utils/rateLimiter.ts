/**
 * Client-side rate limiter to prevent abuse of critical operations
 * Uses localStorage to track request timestamps
 */

import { logger } from './logger';

interface RateLimitConfig {
  maxAttempts: number; // Maximum number of attempts
  windowMs: number; // Time window in milliseconds
  blockDurationMs?: number; // How long to block after exceeding limit
  progressiveBlocking?: {
    [attemptCount: number]: number; // Attempt count -> block duration in ms
  };
}

interface RateLimitEntry {
  attempts: number[];
  blockedUntil?: number;
}

const STORAGE_KEY = 'rate_limit_data';
const memoryStorage: Record<string, string> = {};

const getStorage = () => {
  if (typeof localStorage === 'undefined') {
    return {
      getItem: (key: string) => memoryStorage[key] ?? null,
      setItem: (key: string, value: string) => {
        memoryStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete memoryStorage[key];
      },
    } as const;
  }

  return localStorage;
};

class RateLimiter {
  private getData(): Record<string, RateLimitEntry> {
    const storage = getStorage();
    try {
      const data = storage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      logger.error('Error reading rate limit data:', error);
      return {};
    }
  }

  private setData(data: Record<string, RateLimitEntry>): void {
    const storage = getStorage();
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      logger.error('Error saving rate limit data:', error);
    }
  }

  /**
   * Check if an operation is allowed
   * @param key - Unique identifier for the operation (e.g., 'order_creation', 'password_reset')
   * @param config - Rate limit configuration
   * @returns Object with allowed status and time until next attempt
   */
  checkLimit(
    key: string,
    config: RateLimitConfig
  ): { allowed: boolean; retryAfterMs?: number; message?: string } {
    const now = Date.now();
    const data = this.getData();
    const entry = data[key] || { attempts: [] };

    // Check if currently blocked
    if (entry.blockedUntil && entry.blockedUntil > now) {
      const retryAfterMs = entry.blockedUntil - now;
      const retryAfterMinutes = Math.ceil(retryAfterMs / 60000);
      return {
        allowed: false,
        retryAfterMs,
        message: `Too many attempts. Please try again in ${retryAfterMinutes} minute(s).`,
      };
    }

    // Remove attempts outside the time window
    entry.attempts = entry.attempts.filter((timestamp) => now - timestamp < config.windowMs);

    // Check if limit exceeded
    if (entry.attempts.length >= config.maxAttempts) {
      // Calculate block duration based on progressive blocking if configured
      let blockDuration = config.blockDurationMs || config.windowMs;

      if (config.progressiveBlocking) {
        const attemptCount = entry.attempts.length;
        // Find the appropriate block duration based on attempt count
        const blockingLevels = Object.keys(config.progressiveBlocking)
          .map(Number)
          .sort((a, b) => b - a); // Sort descending

        for (const level of blockingLevels) {
          if (attemptCount >= level) {
            blockDuration = config.progressiveBlocking[level];
            break;
          }
        }
      }

      entry.blockedUntil = now + blockDuration;
      data[key] = entry;
      this.setData(data);

      const retryAfterMinutes = Math.ceil(blockDuration / 60000);
      logger.warn(`Rate limit exceeded for ${key}. Blocked for ${retryAfterMinutes} minutes.`);
      return {
        allowed: false,
        retryAfterMs: blockDuration,
        message: `Too many attempts. Please try again in ${retryAfterMinutes} minute(s).`,
      };
    }

    // Record this attempt
    entry.attempts.push(now);
    delete entry.blockedUntil; // Clear any previous block
    data[key] = entry;
    this.setData(data);

    return { allowed: true };
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string): void {
    const data = this.getData();
    delete data[key];
    this.setData(data);
  }

  /**
   * Clear all rate limit data
   */
  clearAll(): void {
    const storage = getStorage();

    try {
      storage.removeItem(STORAGE_KEY);
    } catch (error) {
      logger.error('Error clearing rate limit data:', error);
    }
  }
}

export const rateLimiter = new RateLimiter();

// Pre-configured rate limiters for common operations
export const RATE_LIMITS = {
  ORDER_CREATION: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 30 * 60 * 1000, // Block for 30 minutes
  },
  PASSWORD_RESET: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000, // Block for 1 hour
  },
  LISTING_CREATION: {
    maxAttempts: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 15 * 60 * 1000, // Block for 15 minutes
  },
  SIGNUP: {
    maxAttempts: 10,
    windowMs: 30 * 60 * 1000, // 30 minutes
    blockDurationMs: 30 * 60 * 1000, // Block for 30 minutes
  },
  /**
   * LOGIN_FAILED rate limiting configuration
   *
   * DEVELOPMENT (localhost): 10 attempts before blocking
   * PRODUCTION: 3 attempts before blocking
   *
   * How to adjust:
   * - maxAttempts: Number of failed login attempts before blocking starts
   * - windowMs: Time window to track attempts (in milliseconds)
   * - progressiveBlocking: Escalating block durations based on attempt count
   *   - Key: attempt number (4th, 5th, 6th, 7th+)
   *   - Value: block duration in milliseconds
   *
   * Examples:
   * - 5 * 60 * 1000 = 5 minutes
   * - 10 * 60 * 1000 = 10 minutes
   * - 60 * 60 * 1000 = 1 hour
   */
  LOGIN_FAILED: {
    // Allow more attempts in development for easier testing
    maxAttempts: typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 10 : 3,
    windowMs: 60 * 60 * 1000, // 1 hour window
    progressiveBlocking: {
      4: 5 * 60 * 1000, // Block for 5 minutes after 4th failed attempt
      5: 10 * 60 * 1000, // Block for 10 minutes after 5th failed attempt
      6: 15 * 60 * 1000, // Block for 15 minutes after 6th failed attempt
      7: 30 * 60 * 1000, // Block for 30 minutes after 7th+ failed attempts
    },
  },
} as const;
