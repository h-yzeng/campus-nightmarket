import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirebaseApp } from '../../config/firebase';
import { logger } from '../../utils/logger';

export const SECURITY_QUESTIONS = [
  'What was the name of your first pet?',
  'What city were you born in?',
  "What is your mother's maiden name?",
  'What was the name of your elementary school?',
  'What is your favorite book?',
  'What was your childhood nickname?',
  'In what city did you meet your spouse/significant other?',
  'What is the name of your favorite childhood friend?',
  'What street did you live on in third grade?',
  'What is your favorite movie?',
];

const getFunctionsClient = () => getFunctions(getFirebaseApp());

/**
 * Save security questions (hashing happens server-side with bcrypt)
 */
export const saveSecurityQuestions = async (
  userId: string,
  questions: Array<{ question: string; answer: string }>
): Promise<void> => {
  try {
    const saveQuestions = httpsCallable(getFunctionsClient(), 'saveSecurityQuestions');

    const result = await saveQuestions({
      userId,
      questions,
    });

    const data = result.data as { success: boolean; message: string };

    if (!data.success) {
      throw new Error(data.message || 'Failed to save security questions');
    }
  } catch (error) {
    logger.error('Error saving security questions:', error);

    // Handle Firebase Functions errors specifically
    if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
      const fbError = error as { code: string; message: string };
      throw new Error(fbError.message || 'Failed to save security questions');
    }

    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to save security questions');
  }
};

/**
 * Verify security answers (verification happens server-side with rate limiting)
 * Returns a verification token that can be used to reset password
 */
export const verifySecurityAnswers = async (
  email: string,
  answers: Array<{ question: string; answer: string }>
): Promise<{ verified: boolean; userId?: string; token?: string }> => {
  try {
    const verifyAnswers = httpsCallable(getFunctionsClient(), 'verifySecurityAnswers');

    const result = await verifyAnswers({
      email,
      answers,
    });

    const data = result.data as {
      verified: boolean;
      userId?: string;
      token?: string;
      message: string;
    };

    if (!data.verified) {
      return { verified: false };
    }

    return {
      verified: true,
      userId: data.userId,
      token: data.token,
    };
  } catch (error) {
    logger.error('Error verifying security answers:', error);

    // Handle Firebase Functions errors specifically
    if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
      const fbError = error as { code: string; message: string };
      throw new Error(fbError.message || 'Failed to verify security answers');
    }

    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to verify security answers');
  }
};

/**
 * Get user's security questions (without answers)
 */
export const getUserSecurityQuestions = async (email: string): Promise<string[]> => {
  try {
    const getQuestions = httpsCallable(getFunctionsClient(), 'getUserSecurityQuestions');

    const result = await getQuestions({
      email,
    });

    const data = result.data as { questions: string[] };

    return data.questions || [];
  } catch (error) {
    logger.error('Error getting security questions:', error);

    // Handle Firebase Functions errors specifically
    if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
      const fbError = error as { code: string; message: string };
      throw new Error(fbError.message || 'Failed to get security questions');
    }

    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to get security questions');
  }
};
