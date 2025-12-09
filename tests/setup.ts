/**
 * Jest Setup File
 * Mocks and configurations that run before tests
 */

import '@testing-library/jest-dom';

// Mock import.meta.env for Vite compatibility
// @ts-expect-error global assignment for test environment
globalThis.import = { meta: { env: { DEV: true, PROD: false } } };

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

// Mock RouteErrorBoundary to avoid import.meta issues in tests
jest.mock('../src/components/common/RouteErrorBoundary', () => ({
  __esModule: true,
  default: ({ children }: { children: unknown }) => children,
}));

// Polyfill TextEncoder/Decoder for react-router in Node test env
import { TextEncoder, TextDecoder } from 'util';
// @ts-expect-error global assignment for test environment
global.TextEncoder = TextEncoder;
// @ts-expect-error global assignment for test environment
global.TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder;
