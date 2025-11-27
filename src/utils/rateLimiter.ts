/**
 * Client-side rate limiter to prevent abuse of critical operations
 * Uses localStorage to track request timestamps
 */

import { logger } from './logger';

interface RateLimitConfig {
  maxAttempts: number; // Maximum number of attempts
  windowMs: number; // Time window in milliseconds
  blockDurationMs?: number; // How long to block after exceeding limit
}

interface RateLimitEntry {
  attempts: number[];
  blockedUntil?: number;
}

const STORAGE_KEY = 'rate_limit_data';

class RateLimiter {
  private getData(): Record<string, RateLimitEntry> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      logger.error('Error reading rate limit data:', error);
      return {};
    }
  }

  private setData(data: Record<string, RateLimitEntry>): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
    entry.attempts = entry.attempts.filter(
      (timestamp) => now - timestamp < config.windowMs
    );

    // Check if limit exceeded
    if (entry.attempts.length >= config.maxAttempts) {
      const blockDuration = config.blockDurationMs || config.windowMs;
      entry.blockedUntil = now + blockDuration;
      data[key] = entry;
      this.setData(data);

      const retryAfterMinutes = Math.ceil(blockDuration / 60000);
      logger.warn(`Rate limit exceeded for ${key}`);
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
    localStorage.removeItem(STORAGE_KEY);
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
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000, // Block for 1 hour
  },
  LOGIN_FAILED: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // Block for 30 minutes
  },
} as const;
