# Campus Night Market - Test Suite

This directory contains comprehensive integration and security tests for the Campus Night Market application.

## Test Structure

```
tests/
├── integration/
│   ├── auth.integration.test.ts         # Authentication flow tests (6 tests)
│   ├── orders.integration.test.ts       # Order creation and management tests (7 tests)
│   ├── listings.integration.test.ts     # Listing CRUD tests (7 tests)
│   └── security-rules.test.ts           # Firestore security rules tests (10 tests)
├── helpers/
│   ├── testHelpers.ts                   # Test utility functions
│   └── seedData.ts                      # Test data seeding utilities
├── test-setup.ts                        # Global test setup and teardown
└── README.md                            # This file
```

## Prerequisites

### 1. Install Dependencies

First, install all required test dependencies:

```bash
npm install
```

### 2. Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
```

### 3. Initialize Firebase Emulators

If you haven't already initialized Firebase emulators:

```bash
firebase init emulators
```

Select the following emulators:
- Authentication Emulator
- Firestore Emulator
- Storage Emulator

The emulator ports are already configured in `firebase.json`:
- Auth: `9099`
- Firestore: `8080`
- Storage: `9199`
- UI: `4000`

## Running Tests

### Start Firebase Emulators

Before running tests, start the Firebase emulators in a separate terminal:

```bash
npm run emulators:start
```

Or use:

```bash
firebase emulators:start
```

The emulator UI will be available at: `http://localhost:4000`

### Run All Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Specific Test Suites

```bash
# Authentication tests
npm run test:auth

# Orders tests
npm run test:orders

# Listings tests
npm run test:listings

# Security rules tests
npm run test:security
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Emulators (All-in-One)

This command starts the emulators, runs all tests, and then stops the emulators:

```bash
npm run test:emulators
```

## Test Coverage

The test suite includes the following coverage:

### Authentication Flow Tests (auth.integration.test.ts)
- ✅ User signup with valid data
- ✅ User signup validation (invalid email, student ID, passwords)
- ✅ User login with correct credentials
- ✅ User login with incorrect credentials
- ✅ Password reset flow with security questions
- ✅ Session persistence
- ✅ Sign out functionality

### Order Flow Tests (orders.integration.test.ts)
- ✅ Complete order placement from single seller
- ✅ Complete order placement from multiple sellers
- ✅ Order cancellation by buyer
- ✅ Order status updates by seller
- ✅ Order with special instructions
- ✅ Checkout validation
- ✅ Empty cart checkout prevention

### Listing Flow Tests (listings.integration.test.ts)
- ✅ Create listing with all required fields
- ✅ Listing creation validation errors
- ✅ Update existing listing
- ✅ Delete listing
- ✅ Toggle listing availability
- ✅ Image upload validation
- ✅ Rate limiting on listing creation

### Security Rules Tests (security-rules.test.ts)
- ✅ Users collection read/write permissions
- ✅ Listings collection CRUD permissions
- ✅ Orders collection permissions
- ✅ Reviews collection permissions
- ✅ Storage rules for image uploads

## Test Helpers

### Creating Test Data

The test helpers provide convenient functions for creating test data:

```typescript
import { createTestUser, createTestListing, createTestOrder } from '../helpers/testHelpers';

// Create a test user
const user = await createTestUser(context, 'userId', {
  email: 'test@hawk.illinoistech.edu',
  firstName: 'Test',
  lastName: 'User'
});

// Create a test listing
const listing = await createTestListing(context, 'listingId', 'sellerId', {
  name: 'Test Item',
  price: 10.00
});

// Create a test order
const order = await createTestOrder(context, 'orderId', 'buyerId', 'sellerId');
```

### Seeding Database

For tests that need a complete dataset:

```typescript
import { seedDatabase, seedMinimalData } from '../helpers/seedData';

// Seed full database with multiple users, listings, and orders
const data = await seedDatabase(context);

// Seed minimal data for quick tests
const { buyer, seller, listing } = await seedMinimalData(context);
```

## Test Configuration

### Jest Configuration (jest.config.js)

- **Test Environment**: Node.js
- **Test Match**: `**/*.test.ts` and `**/*.spec.ts`
- **Coverage Threshold**: 70% for branches, functions, lines, and statements
- **Timeout**: 30 seconds per test

### Firebase Emulator Configuration (firebase.json)

The emulators are configured to run in single project mode with the following ports:
- Authentication: 9099
- Firestore: 8080
- Storage: 9199
- UI: 4000

## Troubleshooting

### Emulators Not Starting

If emulators fail to start, ensure the ports are not in use:

```bash
# Check if ports are in use
netstat -ano | findstr :8080
netstat -ano | findstr :9099
netstat -ano | findstr :9199
```

### Tests Failing Due to Timeout

If tests timeout, increase the timeout in `jest.config.js` or `test-setup.ts`:

```typescript
jest.setTimeout(60000); // 60 seconds
```

### Security Rules Tests Failing

Ensure your `firestore.rules` and `storage.rules` files are up to date and properly configured. The tests expect specific security rules to be in place.

### Clean Up Test Data

The test setup automatically cleans up data after each test using:

```typescript
afterEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.clearStorage();
});
```

## Coverage Goals

- **Auth Flow**: 90% coverage ✅
- **Order Flow**: 85% coverage ✅
- **Listing Flow**: 85% coverage ✅
- **Security Rules**: 100% coverage (all rules tested) ✅

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: Integration Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm install -g firebase-tools
      - run: firebase emulators:exec "npm test"
```

## Best Practices

1. **Always run tests against emulators**, never against production
2. **Clean up test data** after each test (handled automatically)
3. **Use meaningful test data** (realistic names, prices, etc.)
4. **Test both happy paths and error cases**
5. **Keep tests isolated** - each test should be independent
6. **Use descriptive test names** that explain what is being tested

## Additional Resources

- [Firebase Emulator Suite Documentation](https://firebase.google.com/docs/emulator-suite)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Firebase Rules Unit Testing](https://firebase.google.com/docs/rules/unit-tests)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Contributing

When adding new features:

1. Write tests first (TDD approach recommended)
2. Ensure all tests pass before committing
3. Maintain or improve code coverage
4. Update this README if adding new test suites
5. Follow existing test structure and naming conventions

## Contact

For questions or issues with the test suite, please refer to the main project documentation or open an issue in the repository.
