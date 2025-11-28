import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../../config/firebase';
import { logger } from '../../utils/logger';

const functions = getFunctions(app);

/**
 * Reset password with verification token
 * The token is obtained from verifying security questions
 */
export const resetPasswordWithVerification = async (
  email: string,
  newPassword: string,
  token: string
): Promise<void> => {
  try {
    const resetPassword = httpsCallable(functions, 'resetPasswordWithVerification');

    const result = await resetPassword({
      email,
      newPassword,
      token,
    });

    const data = result.data as { success: boolean; message: string };

    if (!data.success) {
      throw new Error(data.message || 'Failed to reset password');
    }
  } catch (error) {
    logger.error('Error calling resetPasswordWithVerification:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to reset password');
  }
};
