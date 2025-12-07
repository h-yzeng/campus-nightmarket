/**
 * Jest Setup File
 * Mocks and configurations that run before tests
 */

// Mock the logger utility to avoid import.meta issues
jest.mock('../src/utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    general: jest.fn(),
  },
}));
