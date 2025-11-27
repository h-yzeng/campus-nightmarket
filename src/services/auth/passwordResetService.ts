import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../../config/firebase';
import { logger } from '../../utils/logger';

const functions = getFunctions(app);

export const resetPasswordWithVerification = async (
  email: string,
  newPassword: string,
  userId: string
): Promise<void> => {
  try {
    const resetPassword = httpsCallable(functions, 'resetPasswordWithVerification');

    const result = await resetPassword({
      email,
      newPassword,
      userId,
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
