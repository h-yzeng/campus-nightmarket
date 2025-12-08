/**
 * Jest Setup File
 * Mocks and configurations that run before tests
 */

import '@testing-library/jest-dom';

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

// Polyfill TextEncoder/Decoder for react-router in Node test env
import { TextEncoder, TextDecoder } from 'util';
// @ts-expect-error global assignment for test environment
global.TextEncoder = TextEncoder;
// @ts-expect-error global assignment for test environment
global.TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder;
