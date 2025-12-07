/**
 * Authentication Service Tests
 *
 * Tests for core authentication functionality including:
 * - User signup
 * - User login
 * - Email verification
 * - Password reset
 * - Password change
 * - Error handling
 */

import {
  signUp,
  signIn,
  logOut,
  resetPassword,
  changePassword,
  resendVerificationEmail,
  isEmailVerified,
  reloadUser,
  getCurrentUser,
  type SignupData,
  type LoginData,
} from '../../src/services/auth/authService';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  reauthenticateWithCredential,
  type User,
} from 'firebase/auth';
import { auth } from '../../src/config/firebase';

// Mock Firebase modules
jest.mock('firebase/auth');
jest.mock('../../src/config/firebase', () => ({
  auth: {
    currentUser: null,
  },
}));

describe('Authentication Service', () => {
  const mockUser = {
    uid: 'test-uid-123',
    email: 'test@hawk.illinoistech.edu',
    emailVerified: false,
    reload: jest.fn().mockResolvedValue(undefined),
  } as unknown as User;

  const mockUserVerified = {
    ...mockUser,
    emailVerified: true,
  } as unknown as User;

  beforeEach(() => {
    jest.clearAllMocks();
    (auth as { currentUser: User | null }).currentUser = null;
  });

  describe('signUp', () => {
    const validSignupData: SignupData = {
      email: 'newuser@hawk.illinoistech.edu',
      password: 'SecureP@ssw0rd123',
      firstName: 'John',
      lastName: 'Doe',
      studentId: 'A12345678',
    };

    it('should successfully create a new user with valid IIT email', async () => {
      const mockUserCredential = {
        user: mockUser,
      };

      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUserCredential);
      (sendEmailVerification as jest.Mock).mockResolvedValue(undefined);

      const result = await signUp(validSignupData);

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        validSignupData.email,
        validSignupData.password
      );
      expect(sendEmailVerification).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should reject signup with non-IIT email', async () => {
      const invalidData = {
        ...validSignupData,
        email: 'user@gmail.com',
      };

      await expect(signUp(invalidData)).rejects.toThrow(
        'Please use your IIT student email (@hawk.illinoistech.edu)'
      );

      expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it('should handle email already in use error', async () => {
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/email-already-in-use',
        message: 'Email already in use',
      });

      await expect(signUp(validSignupData)).rejects.toThrow(
        'An account with this email already exists'
      );
    });

    it('should continue signup even if verification email fails', async () => {
      const mockUserCredential = {
        user: mockUser,
      };

      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUserCredential);
      (sendEmailVerification as jest.Mock).mockRejectedValue(new Error('Email service down'));

      const result = await signUp(validSignupData);

      expect(result).toEqual(mockUser);
    });

    it('should handle weak password error', async () => {
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/weak-password',
        message: 'Weak password',
      });

      await expect(signUp(validSignupData)).rejects.toThrow(
        'Password should be at least 6 characters'
      );
    });
  });

  describe('signIn', () => {
    const validLoginData: LoginData = {
      email: 'user@hawk.illinoistech.edu',
      password: 'SecureP@ssw0rd123',
    };

    it('should successfully sign in with valid credentials', async () => {
      const mockUserCredential = {
        user: mockUser,
      };

      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUserCredential);

      const result = await signIn(validLoginData);

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        validLoginData.email,
        validLoginData.password
      );
      expect(result).toEqual(mockUser);
    });

    it('should handle invalid credentials error', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/wrong-password',
        message: 'Wrong password',
      });

      await expect(signIn(validLoginData)).rejects.toThrow('Invalid email or password');
    });

    it('should handle user not found error', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/user-not-found',
        message: 'User not found',
      });

      await expect(signIn(validLoginData)).rejects.toThrow('Invalid email or password');
    });

    it('should handle too many requests error', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/too-many-requests',
        message: 'Too many requests',
      });

      await expect(signIn(validLoginData)).rejects.toThrow(
        'Too many failed attempts. Please try again later'
      );
    });

    it('should handle disabled account error', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/user-disabled',
        message: 'User disabled',
      });

      await expect(signIn(validLoginData)).rejects.toThrow('This account has been disabled');
    });
  });

  describe('logOut', () => {
    it('should successfully sign out user', async () => {
      (signOut as jest.Mock).mockResolvedValue(undefined);

      await logOut();

      expect(signOut).toHaveBeenCalledWith(auth);
    });

    it('should handle sign out errors', async () => {
      (signOut as jest.Mock).mockRejectedValue({
        code: 'auth/network-request-failed',
        message: 'Network error',
      });

      await expect(logOut()).rejects.toThrow();
    });
  });

  describe('resetPassword', () => {
    const email = 'user@hawk.illinoistech.edu';

    it('should send password reset email successfully', async () => {
      (sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);

      await resetPassword(email);

      expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, email);
    });

    it('should handle user not found error', async () => {
      (sendPasswordResetEmail as jest.Mock).mockRejectedValue({
        code: 'auth/user-not-found',
        message: 'User not found',
      });

      await expect(resetPassword(email)).rejects.toThrow('Invalid email or password');
    });

    it('should handle invalid email error', async () => {
      (sendPasswordResetEmail as jest.Mock).mockRejectedValue({
        code: 'auth/invalid-email',
        message: 'Invalid email',
      });

      await expect(resetPassword(email)).rejects.toThrow('Invalid email address');
    });
  });

  describe('changePassword', () => {
    const currentPassword = 'OldP@ssw0rd123';
    const newPassword = 'NewP@ssw0rd456';

    beforeEach(() => {
      (auth as { currentUser: User | null }).currentUser = mockUser;
    });

    it('should successfully change password', async () => {
      (reauthenticateWithCredential as jest.Mock).mockResolvedValue(undefined);
      (updatePassword as jest.Mock).mockResolvedValue(undefined);

      await changePassword(currentPassword, newPassword);

      expect(reauthenticateWithCredential).toHaveBeenCalled();
      expect(updatePassword).toHaveBeenCalledWith(mockUser, newPassword);
    });

    it('should throw error if no user is signed in', async () => {
      (auth as { currentUser: User | null }).currentUser = null;

      await expect(changePassword(currentPassword, newPassword)).rejects.toThrow(
        'No user is currently signed in'
      );

      expect(reauthenticateWithCredential).not.toHaveBeenCalled();
      expect(updatePassword).not.toHaveBeenCalled();
    });

    it('should handle wrong password during reauthentication', async () => {
      (reauthenticateWithCredential as jest.Mock).mockRejectedValue({
        code: 'auth/wrong-password',
        message: 'Wrong password',
      });

      await expect(changePassword(currentPassword, newPassword)).rejects.toThrow(
        'Invalid email or password'
      );

      expect(updatePassword).not.toHaveBeenCalled();
    });

    it('should handle requires recent login error', async () => {
      (reauthenticateWithCredential as jest.Mock).mockRejectedValue({
        code: 'auth/requires-recent-login',
        message: 'Requires recent login',
      });

      await expect(changePassword(currentPassword, newPassword)).rejects.toThrow(
        'Please sign in again to complete this action'
      );
    });
  });

  describe('Email Verification', () => {
    describe('resendVerificationEmail', () => {
      beforeEach(() => {
        (auth as { currentUser: User | null }).currentUser = mockUser;
      });

      it('should successfully resend verification email', async () => {
        (sendEmailVerification as jest.Mock).mockResolvedValue(undefined);

        await resendVerificationEmail();

        expect(sendEmailVerification).toHaveBeenCalled();
      });

      it('should throw error if no user is signed in', async () => {
        (auth as { currentUser: User | null }).currentUser = null;

        await expect(resendVerificationEmail()).rejects.toThrow('No user is currently signed in');

        expect(sendEmailVerification).not.toHaveBeenCalled();
      });

      it('should throw error if email is already verified', async () => {
        (auth as { currentUser: User | null }).currentUser = mockUserVerified;

        await expect(resendVerificationEmail()).rejects.toThrow('Email is already verified');

        expect(sendEmailVerification).not.toHaveBeenCalled();
      });
    });

    describe('isEmailVerified', () => {
      it('should return true if email is verified', () => {
        (auth as { currentUser: User | null }).currentUser = mockUserVerified;

        expect(isEmailVerified()).toBe(true);
      });

      it('should return false if email is not verified', () => {
        (auth as { currentUser: User | null }).currentUser = mockUser;

        expect(isEmailVerified()).toBe(false);
      });

      it('should return false if no user is signed in', () => {
        (auth as { currentUser: User | null }).currentUser = null;

        expect(isEmailVerified()).toBe(false);
      });
    });

    describe('reloadUser', () => {
      it('should successfully reload user data', async () => {
        (auth as { currentUser: User | null }).currentUser = mockUser;

        await reloadUser();

        expect(mockUser.reload).toHaveBeenCalled();
      });

      it('should throw error if no user is signed in', async () => {
        (auth as { currentUser: User | null }).currentUser = null;

        await expect(reloadUser()).rejects.toThrow('No user is currently signed in');
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when signed in', () => {
      (auth as { currentUser: User | null }).currentUser = mockUser;

      expect(getCurrentUser()).toEqual(mockUser);
    });

    it('should return null when no user is signed in', () => {
      (auth as { currentUser: User | null }).currentUser = null;

      expect(getCurrentUser()).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle generic Firebase errors', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/unknown-error',
        message: 'Some unknown error occurred',
      });

      await expect(
        signIn({ email: 'test@hawk.illinoistech.edu', password: 'test123' })
      ).rejects.toThrow('Some unknown error occurred');
    });

    it('should handle invalid email format error', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/invalid-email',
        message: 'Invalid email',
      });

      await expect(signIn({ email: 'invalid-email', password: 'test123' })).rejects.toThrow(
        'Invalid email address'
      );
    });

    it('should handle operation not allowed error', async () => {
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/operation-not-allowed',
        message: 'Operation not allowed',
      });

      await expect(
        signUp({
          email: 'test@hawk.illinoistech.edu',
          password: 'test123',
          firstName: 'Test',
          lastName: 'User',
          studentId: 'A12345678',
        })
      ).rejects.toThrow('Email/password accounts are not enabled');
    });
  });
});
