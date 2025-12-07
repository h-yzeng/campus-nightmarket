/**
 * Logger Mock for Tests
 * Prevents import.meta issues in Jest
 */

export const logger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  general: jest.fn(),
};
