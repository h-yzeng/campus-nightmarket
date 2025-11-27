import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../../types/firebase';
import type { SecurityQuestion } from '../../types/firebase';
import { logger } from '../../utils/logger';

export const SECURITY_QUESTIONS = [
  'What was the name of your first pet?',
  'What city were you born in?',
  'What is your mother\'s maiden name?',
  'What was the name of your elementary school?',
  'What is your favorite book?',
  'What was your childhood nickname?',
  'In what city did you meet your spouse/significant other?',
  'What is the name of your favorite childhood friend?',
  'What street did you live on in third grade?',
  'What is your favorite movie?',
];

const hashAnswer = async (answer: string): Promise<string> => {
  const normalized = answer.toLowerCase().trim();

  // Use Web Crypto API for secure hashing
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
};

export const saveSecurityQuestions = async (
  userId: string,
  questions: Array<{ question: string; answer: string }>
): Promise<void> => {
  try {
    const hashedQuestions: SecurityQuestion[] = await Promise.all(
      questions.map(async (q) => ({
        question: q.question,
        answer: await hashAnswer(q.answer),
      }))
    );

    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      securityQuestions: hashedQuestions,
      updatedAt: new Date(),
    });
  } catch (error) {
    logger.error('Error saving security questions:', error);
    throw new Error('Failed to save security questions');
  }
};

export const verifySecurityAnswers = async (
  email: string,
  answers: Array<{ question: string; answer: string }>
): Promise<{ verified: boolean; userId?: string }> => {
  try {
    const { getUserByEmail } = await import('./userService');
    const userProfile = await getUserByEmail(email);

    if (!userProfile || !userProfile.securityQuestions) {
      return { verified: false };
    }

    const verificationResults = await Promise.all(
      answers.map(async (providedAnswer) => {
        const storedQuestion = userProfile.securityQuestions?.find(
          sq => sq.question === providedAnswer.question
        );

        if (!storedQuestion) return false;

        const hashedProvidedAnswer = await hashAnswer(providedAnswer.answer);
        return hashedProvidedAnswer === storedQuestion.answer;
      })
    );

    const allCorrect = verificationResults.every(result => result === true);

    if (allCorrect) {
      return { verified: true, userId: userProfile.uid };
    }

    return { verified: false };
  } catch (error) {
    logger.error('Error verifying security answers:', error);
    throw new Error('Failed to verify security answers');
  }
};

export const getUserSecurityQuestions = async (
  email: string
): Promise<string[]> => {
  try {
    const { getUserByEmail } = await import('./userService');
    const userProfile = await getUserByEmail(email);

    if (!userProfile || !userProfile.securityQuestions) {
      return [];
    }

    return userProfile.securityQuestions.map(sq => sq.question);
  } catch (error) {
    logger.error('Error getting security questions:', error);
    throw new Error('Failed to get security questions');
  }
};
