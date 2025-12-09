/**
 * Rate Limiter Tests
 * Tests for the client-side rate limiting functionality
 */
import { rateLimiter, RATE_LIMITS } from '../../src/utils/rateLimiter';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock logger to prevent console output during tests
jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('RateLimiter', () => {
  beforeEach(() => {
    localStorageMock.clear();
    rateLimiter.clearAll();
  });

  describe('checkLimit', () => {
    it('should allow requests within the limit', () => {
      const config = {
        maxAttempts: 5,
        windowMs: 60000, // 1 minute
      };

      const result1 = rateLimiter.checkLimit('test_operation', config);
      expect(result1.allowed).toBe(true);

      const result2 = rateLimiter.checkLimit('test_operation', config);
      expect(result2.allowed).toBe(true);
    });

    it('should block requests after exceeding the limit', () => {
      const config = {
        maxAttempts: 3,
        windowMs: 60000,
        blockDurationMs: 30000,
      };

      // Make 3 attempts (at limit)
      rateLimiter.checkLimit('test_block', config);
      rateLimiter.checkLimit('test_block', config);
      rateLimiter.checkLimit('test_block', config);

      // 4th attempt should be blocked
      const result = rateLimiter.checkLimit('test_block', config);
      expect(result.allowed).toBe(false);
      expect(result.retryAfterMs).toBeDefined();
      expect(result.message).toContain('Too many attempts');
    });

    it('should return retry time when blocked', () => {
      const config = {
        maxAttempts: 2,
        windowMs: 60000,
        blockDurationMs: 30000, // 30 seconds
      };

      // Exceed limit
      rateLimiter.checkLimit('test_retry', config);
      rateLimiter.checkLimit('test_retry', config);

      const result = rateLimiter.checkLimit('test_retry', config);
      expect(result.allowed).toBe(false);
      expect(result.retryAfterMs).toBeLessThanOrEqual(30000);
    });

    it('should handle progressive blocking', () => {
      const config = {
        maxAttempts: 3,
        windowMs: 60000,
        progressiveBlocking: {
          4: 5 * 60 * 1000, // 5 minutes after 4th attempt
          5: 10 * 60 * 1000, // 10 minutes after 5th attempt
          6: 30 * 60 * 1000, // 30 minutes after 6th attempt
        },
      };

      // Make 3 attempts
      rateLimiter.checkLimit('test_progressive', config);
      rateLimiter.checkLimit('test_progressive', config);
      rateLimiter.checkLimit('test_progressive', config);

      // 4th attempt should trigger progressive blocking
      const result = rateLimiter.checkLimit('test_progressive', config);
      expect(result.allowed).toBe(false);
      // Should be blocked for 5 minutes (300000ms)
      expect(result.retryAfterMs).toBeLessThanOrEqual(5 * 60 * 1000);
    });

    it('should use default block duration when no progressiveBlocking configured', () => {
      const config = {
        maxAttempts: 2,
        windowMs: 60000,
        blockDurationMs: 15000, // 15 seconds
      };

      rateLimiter.checkLimit('test_default_block', config);
      rateLimiter.checkLimit('test_default_block', config);

      const result = rateLimiter.checkLimit('test_default_block', config);
      expect(result.allowed).toBe(false);
      expect(result.retryAfterMs).toBeLessThanOrEqual(15000);
    });

    it('should use windowMs as fallback block duration', () => {
      const config = {
        maxAttempts: 2,
        windowMs: 30000, // 30 seconds
        // No blockDurationMs specified
      };

      rateLimiter.checkLimit('test_window_fallback', config);
      rateLimiter.checkLimit('test_window_fallback', config);

      const result = rateLimiter.checkLimit('test_window_fallback', config);
      expect(result.allowed).toBe(false);
      expect(result.retryAfterMs).toBeLessThanOrEqual(30000);
    });

    it('should track different operations separately', () => {
      const config = {
        maxAttempts: 2,
        windowMs: 60000,
      };

      // Operation A at limit
      rateLimiter.checkLimit('operation_a', config);
      rateLimiter.checkLimit('operation_a', config);

      // Operation B should still be allowed
      const resultB = rateLimiter.checkLimit('operation_b', config);
      expect(resultB.allowed).toBe(true);

      // Operation A should be blocked
      const resultA = rateLimiter.checkLimit('operation_a', config);
      expect(resultA.allowed).toBe(false);
    });

    it('should continue blocking until block duration expires', () => {
      const config = {
        maxAttempts: 2,
        windowMs: 60000,
        blockDurationMs: 30000,
      };

      // Exceed limit
      rateLimiter.checkLimit('test_continue_block', config);
      rateLimiter.checkLimit('test_continue_block', config);
      rateLimiter.checkLimit('test_continue_block', config);

      // Should still be blocked
      const result = rateLimiter.checkLimit('test_continue_block', config);
      expect(result.allowed).toBe(false);
      expect(result.message).toContain('minute');
    });
  });

  describe('reset', () => {
    it('should reset rate limit for a specific key', () => {
      const config = {
        maxAttempts: 2,
        windowMs: 60000,
      };

      // Exceed limit
      rateLimiter.checkLimit('test_reset', config);
      rateLimiter.checkLimit('test_reset', config);
      rateLimiter.checkLimit('test_reset', config);

      // Reset the key
      rateLimiter.reset('test_reset');

      // Should be allowed again
      const result = rateLimiter.checkLimit('test_reset', config);
      expect(result.allowed).toBe(true);
    });

    it('should not affect other keys when resetting', () => {
      const config = {
        maxAttempts: 2,
        windowMs: 60000,
      };

      // Both operations at limit
      rateLimiter.checkLimit('key_a', config);
      rateLimiter.checkLimit('key_a', config);
      rateLimiter.checkLimit('key_b', config);
      rateLimiter.checkLimit('key_b', config);

      // Reset only key_a
      rateLimiter.reset('key_a');

      // key_a should be allowed
      const resultA = rateLimiter.checkLimit('key_a', config);
      expect(resultA.allowed).toBe(true);

      // key_b should still be blocked
      const resultB = rateLimiter.checkLimit('key_b', config);
      expect(resultB.allowed).toBe(false);
    });
  });

  describe('clearAll', () => {
    it('should clear all rate limit data', () => {
      const config = {
        maxAttempts: 2,
        windowMs: 60000,
      };

      // Multiple operations at limit
      rateLimiter.checkLimit('clear_test_1', config);
      rateLimiter.checkLimit('clear_test_1', config);
      rateLimiter.checkLimit('clear_test_2', config);
      rateLimiter.checkLimit('clear_test_2', config);

      // Clear all
      rateLimiter.clearAll();

      // All should be allowed again
      const result1 = rateLimiter.checkLimit('clear_test_1', config);
      const result2 = rateLimiter.checkLimit('clear_test_2', config);
      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
    });
  });

  describe('RATE_LIMITS configuration', () => {
    it('should have ORDER_CREATION config', () => {
      expect(RATE_LIMITS.ORDER_CREATION).toBeDefined();
      expect(RATE_LIMITS.ORDER_CREATION.maxAttempts).toBe(5);
      expect(RATE_LIMITS.ORDER_CREATION.windowMs).toBe(60 * 60 * 1000);
    });

    it('should have PASSWORD_RESET config', () => {
      expect(RATE_LIMITS.PASSWORD_RESET).toBeDefined();
      expect(RATE_LIMITS.PASSWORD_RESET.maxAttempts).toBe(3);
    });

    it('should have LISTING_CREATION config', () => {
      expect(RATE_LIMITS.LISTING_CREATION).toBeDefined();
      expect(RATE_LIMITS.LISTING_CREATION.maxAttempts).toBe(10);
    });

    it('should have SIGNUP config', () => {
      expect(RATE_LIMITS.SIGNUP).toBeDefined();
      expect(RATE_LIMITS.SIGNUP.maxAttempts).toBe(10);
    });

    it('should have LOGIN_FAILED config with progressive blocking', () => {
      expect(RATE_LIMITS.LOGIN_FAILED).toBeDefined();
      expect(RATE_LIMITS.LOGIN_FAILED.progressiveBlocking).toBeDefined();
      expect(RATE_LIMITS.LOGIN_FAILED.progressiveBlocking[6]).toBe(5 * 60 * 1000);
      expect(RATE_LIMITS.LOGIN_FAILED.progressiveBlocking[9]).toBe(30 * 60 * 1000);
    });
  });
});
