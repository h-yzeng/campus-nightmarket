import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';

let testEnv: RulesTestEnvironment;

// Set up test environment before all tests
beforeAll(async () => {
  // Read security rules
  const firestoreRules = fs.readFileSync(
    path.resolve(__dirname, '../firestore.rules'),
    'utf8'
  );

  const storageRules = fs.readFileSync(
    path.resolve(__dirname, '../storage.rules'),
    'utf8'
  );

  // Initialize test environment with emulators
  testEnv = await initializeTestEnvironment({
    projectId: 'campus-nightmarket-test',
    firestore: {
      rules: firestoreRules,
      host: 'localhost',
      port: 8080
    },
    storage: {
      rules: storageRules,
      host: 'localhost',
      port: 9199
    }
  });
});

// Clean up after each test
afterEach(async () => {
  if (testEnv) {
    await testEnv.clearFirestore();
    await testEnv.clearStorage();
  }
});

// Clean up after all tests
afterAll(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

// Export test environment for use in tests
export { testEnv };

// Global test timeout
jest.setTimeout(30000);

// Suppress console errors during tests (optional)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
