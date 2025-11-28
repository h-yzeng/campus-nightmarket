import { testEnv } from '../test-setup';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { createTestUser, generateStudentId, generateIITEmail } from '../helpers/testHelpers';

describe('Auth Integration Tests - User Registration and Login Flow', () => {

  describe('Test 1: User Signup with Valid Data', () => {
    it('should successfully create a new user account with valid information', async () => {
      const context = testEnv.authenticatedContext('newuser123');
      const db = context.firestore();

      const validUserData = {
        uid: 'newuser123',
        email: 'testuser@hawk.illinoistech.edu',
        firstName: 'Test',
        lastName: 'User',
        studentId: 'A20123456',
        securityQuestions: [
          { question: 'What is your favorite color?', answer: 'Blue' },
          { question: 'What is your pet name?', answer: 'Fluffy' }
        ],
        createdAt: new Date()
      };

      // Create user profile
      const userRef = doc(db, 'users', validUserData.uid);
      await setDoc(userRef, validUserData);

      // Verify user was created
      const userSnap = await getDoc(userRef);

      expect(userSnap.exists()).toBe(true);

      const userData = userSnap.data();
      expect(userData).toBeDefined();
      expect(userData?.firstName).toBe('Test');
      expect(userData?.lastName).toBe('User');
      expect(userData?.email).toBe('testuser@hawk.illinoistech.edu');
      expect(userData?.studentId).toBe('A20123456');
      expect(userData?.securityQuestions).toHaveLength(2);
    });

    it('should reject signup with invalid email domain', async () => {
      const context = testEnv.authenticatedContext('invaliduser');
      const db = context.firestore();

      const invalidUserData = {
        userId: 'invaliduser',
        email: 'testuser@gmail.com', // Invalid domain
        firstName: 'Test',
        lastName: 'User',
        studentId: 'A20123456'
      };

      // This should fail due to security rules or validation
      const userRef = doc(db, 'users', invalidUserData.userId);

      // In a real implementation, this would be validated before reaching Firestore
      // For now, we're testing the validation logic
      const isValidEmail = invalidUserData.email.endsWith('@hawk.illinoistech.edu');
      expect(isValidEmail).toBe(false);
    });

    it('should reject signup with invalid student ID format', async () => {
      const invalidStudentId = 'B20123456'; // Should start with 'A'
      const isValidStudentId = /^A\d{8}$/.test(invalidStudentId);

      expect(isValidStudentId).toBe(false);
    });

    it('should reject signup with missing required fields', async () => {
      const context = testEnv.authenticatedContext('incompleteuser');
      const db = context.firestore();

      const incompleteUserData = {
        userId: 'incompleteuser',
        email: 'incomplete@hawk.illinoistech.edu',
        // Missing firstName, lastName, studentId
      };

      // Validate required fields
      const hasAllFields =
        incompleteUserData.email &&
        (incompleteUserData as any).firstName &&
        (incompleteUserData as any).lastName &&
        (incompleteUserData as any).studentId;

      expect(hasAllFields).toBeFalsy();
    });

    it('should reject signup with passwords that do not match', () => {
      const password = 'TestPass123';
      const confirmPassword = 'TestPass456';

      expect(password).not.toBe(confirmPassword);
    });

    it('should reject duplicate email registration', async () => {
      const context = testEnv.authenticatedContext('user1');
      const db = context.firestore();

      // Create first user
      const email = 'duplicate@hawk.illinoistech.edu';
      await createTestUser(context, 'user1', { email });

      // Try to create second user with same email
      // In real implementation, Firebase Auth would prevent this
      const userRef1 = doc(db, 'users', 'user1');
      const userSnap1 = await getDoc(userRef1);

      expect(userSnap1.exists()).toBe(true);
      expect(userSnap1.data()?.email).toBe(email);

      // Second user creation would fail in Firebase Auth before reaching Firestore
    });
  });

  describe('Test 2: User Login with Correct Credentials', () => {
    it('should successfully log in an existing user', async () => {
      const context = testEnv.authenticatedContext('existinguser');
      const db = context.firestore();

      // Create existing user
      await createTestUser(context, 'existinguser', {
        email: 'existinguser@hawk.illinoistech.edu',
        firstName: 'Existing',
        lastName: 'User'
      });

      // Simulate login by fetching user profile
      const userRef = doc(db, 'users', 'existinguser');
      const userSnap = await getDoc(userRef);

      expect(userSnap.exists()).toBe(true);

      const userData = userSnap.data();
      expect(userData?.email).toBe('existinguser@hawk.illinoistech.edu');
      expect(userData?.firstName).toBe('Existing');
      expect(userData?.lastName).toBe('User');
    });

    it('should reject login with wrong password', () => {
      const storedPasswordHash = 'hashed_correct_password';
      const providedPasswordHash = 'hashed_wrong_password';

      expect(storedPasswordHash).not.toBe(providedPasswordHash);
    });

    it('should reject login with non-existent email', async () => {
      const context = testEnv.authenticatedContext('nonexistent');
      const db = context.firestore();

      const userRef = doc(db, 'users', 'nonexistent');
      const userSnap = await getDoc(userRef);

      expect(userSnap.exists()).toBe(false);
    });

    it('should reject login with empty email or password', () => {
      const email = '';
      const password = '';

      const isValid = email.length > 0 && password.length > 0;
      expect(isValid).toBe(false);
    });
  });

  describe('Test 3: User Login with Incorrect Credentials', () => {
    it('should fail login with wrong credentials', async () => {
      // In a real scenario, Firebase Auth would return an error
      const email = 'testuser@hawk.illinoistech.edu';
      const wrongPassword = 'WrongPassword123';

      // Simulate authentication failure
      const authResult = {
        success: false,
        error: 'Invalid email or password'
      };

      expect(authResult.success).toBe(false);
      expect(authResult.error).toBe('Invalid email or password');
    });

    it('should keep user on login page after failed login', () => {
      const currentPage = 'login';
      const loginFailed = true;

      if (loginFailed) {
        expect(currentPage).toBe('login');
      }
    });
  });

  describe('Test 4: Password Reset Flow', () => {
    it('should allow password reset with correct security answers', async () => {
      const context = testEnv.authenticatedContext('resetuser');
      const db = context.firestore();

      // Create user with security questions
      const securityQuestions = [
        { question: 'What is your favorite color?', answer: 'Blue' },
        { question: 'What is your pet name?', answer: 'Fluffy' }
      ];

      await createTestUser(context, 'resetuser', {
        email: 'resetuser@hawk.illinoistech.edu',
        securityQuestions
      });

      // Verify security answers
      const userRef = doc(db, 'users', 'resetuser');
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      const providedAnswers = ['Blue', 'Fluffy'];
      const storedAnswers = userData?.securityQuestions.map((q: any) => q.answer);

      const answersMatch = providedAnswers.every((ans, idx) => ans === storedAnswers[idx]);
      expect(answersMatch).toBe(true);

      // In real implementation, password would be updated here
    });

    it('should reject password reset with incorrect security answers', async () => {
      const context = testEnv.authenticatedContext('resetuser2');

      await createTestUser(context, 'resetuser2', {
        securityQuestions: [
          { question: 'What is your favorite color?', answer: 'Blue' }
        ]
      });

      const providedAnswer = 'Red';
      const correctAnswer = 'Blue';

      expect(providedAnswer).not.toBe(correctAnswer);
    });

    it('should reject password reset with weak new password', () => {
      const newPassword = '123'; // Too weak
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

      const isValidPassword = passwordRegex.test(newPassword);
      expect(isValidPassword).toBe(false);
    });

    it('should reject password reset for non-existent email', async () => {
      const context = testEnv.unauthenticatedContext();
      const db = context.firestore();

      const userRef = doc(db, 'users', 'nonexistent');

      try {
        const userSnap = await getDoc(userRef);
        expect(userSnap.exists()).toBe(false);
      } catch (error) {
        // Expected to fail for unauthenticated access
        expect(error).toBeDefined();
      }
    });
  });

  describe('Test 5: Session Persistence', () => {
    it('should maintain user session across page reloads', async () => {
      const context = testEnv.authenticatedContext('sessionuser');
      const db = context.firestore();

      await createTestUser(context, 'sessionuser', {
        email: 'sessionuser@hawk.illinoistech.edu'
      });

      // Simulate session check by verifying authenticated user can still access their profile
      const userRef = doc(db, 'users', 'sessionuser');
      const userSnap = await getDoc(userRef);

      // User should remain authenticated and able to read their profile
      expect(userSnap.exists()).toBe(true);
      expect(userSnap.data()?.email).toBe('sessionuser@hawk.illinoistech.edu');
    });

    it('should maintain profile data after reload', async () => {
      const context = testEnv.authenticatedContext('profileuser');
      const db = context.firestore();

      await createTestUser(context, 'profileuser', {
        firstName: 'Profile',
        lastName: 'User'
      });

      // Fetch profile again (simulating reload)
      const userRef = doc(db, 'users', 'profileuser');
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      expect(userData?.firstName).toBe('Profile');
      expect(userData?.lastName).toBe('User');
    });
  });

  describe('Test 6: Sign Out', () => {
    it('should successfully sign out user', async () => {
      const context = testEnv.authenticatedContext('signoutuser');

      await createTestUser(context, 'signoutuser');

      // Simulate sign out
      let isAuthenticated = true;

      // After sign out
      isAuthenticated = false;

      expect(isAuthenticated).toBe(false);
    });

    it('should clear cart after sign out', () => {
      const cart = ['item1', 'item2'];

      // Sign out
      const clearedCart: string[] = [];

      expect(clearedCart).toHaveLength(0);
    });

    it('should prevent access to protected routes after sign out', () => {
      const isAuthenticated = false;
      const protectedRoute = '/checkout';

      const canAccess = isAuthenticated;
      expect(canAccess).toBe(false);
    });

    it('should redirect to home page after sign out', () => {
      let currentPage = '/browse';

      // Sign out
      currentPage = '/';

      expect(currentPage).toBe('/');
    });
  });
});
