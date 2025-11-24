import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../../types/firebase';
import type { SecurityQuestion } from '../../types/firebase';

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

const hashAnswer = (answer: string): string => {
  const normalized = answer.toLowerCase().trim();

  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
};

export const saveSecurityQuestions = async (
  userId: string,
  questions: Array<{ question: string; answer: string }>
): Promise<void> => {
  try {
    const hashedQuestions: SecurityQuestion[] = questions.map(q => ({
      question: q.question,
      answer: hashAnswer(q.answer),
    }));

    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      securityQuestions: hashedQuestions,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error saving security questions:', error);
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

    const allCorrect = answers.every(providedAnswer => {
      const storedQuestion = userProfile.securityQuestions?.find(
        sq => sq.question === providedAnswer.question
      );

      if (!storedQuestion) return false;

      const hashedProvidedAnswer = hashAnswer(providedAnswer.answer);
      return hashedProvidedAnswer === storedQuestion.answer;
    });

    if (allCorrect) {
      return { verified: true, userId: userProfile.uid };
    }

    return { verified: false };
  } catch (error) {
    console.error('Error verifying security answers:', error);
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
    console.error('Error getting security questions:', error);
    throw new Error('Failed to get security questions');
  }
};
