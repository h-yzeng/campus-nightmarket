import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import {
  getUserSecurityQuestions,
  verifySecurityAnswers,
} from '../services/auth/securityService';

interface ForgotPasswordProps {
  onBack: () => void;
}

type Step = 'email' | 'security-questions' | 'success';

const ForgotPassword = ({ onBack }: ForgotPasswordProps) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [securityQuestions, setSecurityQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async () => {
    setError('');
    setLoading(true);

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    const isValidEmail = /^[^\s@]+@hawk\.illinoistech\.edu$/.test(email);
    if (!isValidEmail) {
      setError('Please use your IIT email (@hawk.illinoistech.edu)');
      setLoading(false);
      return;
    }

    try {
      const questions = await getUserSecurityQuestions(email);

      if (questions.length === 0) {
        setError('No security questions found for this email. Please contact support or use the email reset link option.');
        setLoading(false);
        return;
      }

      setSecurityQuestions(questions);
      setStep('security-questions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve security questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityQuestionsSubmit = async () => {
    setError('');
    setLoading(true);

    const unansweredQuestions = securityQuestions.filter(q => !answers[q] || answers[q].trim() === '');
    if (unansweredQuestions.length > 0) {
      setError('Please answer all security questions');
      setLoading(false);
      return;
    }

    try {
      const answersArray = securityQuestions.map(q => ({
        question: q,
        answer: answers[q],
      }));

      const result = await verifySecurityAnswers(email, answersArray);

      if (!result.verified) {
        setError('Security answers are incorrect. Please try again.');
        setLoading(false);
        return;
      }

      const { resetPassword } = await import('../services/auth/authService');
      await resetPassword(email);
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify security answers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B]">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-[#CC0000]">
              <span className="text-4xl">🔐</span>
            </div>
            <h2 className="text-4xl font-bold mb-3 text-[#CC0000]">
              {step === 'email' && 'Reset Password'}
              {step === 'security-questions' && 'Security Questions'}
              {step === 'success' && 'Check Your Email'}
            </h2>
            <p className="text-lg text-gray-400">
              {step === 'email' && 'Enter your email to get started'}
              {step === 'security-questions' && 'Answer your security questions'}
              {step === 'success' && 'Password reset email sent'}
            </p>
          </div>

          <div className="bg-[#1E1E1E] rounded-2xl shadow-xl border-2 border-[#3A3A3A] p-8">
            {error && (
              <div className="flex gap-3 p-4 rounded-xl mb-6 bg-red-950 border-2 border-red-800">
                <AlertCircle size={20} className="text-[#CC0000] shrink-0 mt-0.5" />
                <p className="text-sm text-white">{error}</p>
              </div>
            )}

            {step === 'email' && (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2 text-white">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#76777B]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-[#D0D0D0] rounded-xl text-base text-white focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#000000] transition-all bg-[#334150]"
                      placeholder="youremail@hawk.illinoistech.edu"
                      onKeyPress={(e) => e.key === 'Enter' && handleEmailSubmit()}
                    />
                  </div>
                </div>

                <button
                  onClick={handleEmailSubmit}
                  disabled={loading}
                  className={`w-full py-4 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-102 active:scale-98 mb-4 ${
                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#CC0000]'
                  }`}
                >
                  {loading ? 'Loading...' : 'Continue →'}
                </button>
              </>
            )}

            {step === 'security-questions' && (
              <>
                <div className="mb-6 space-y-4">
                  {securityQuestions.map((question, index) => (
                    <div key={index}>
                      <label className="block text-sm font-semibold mb-2 text-white">
                        {question}
                      </label>
                      <input
                        type="text"
                        value={answers[question] || ''}
                        onChange={(e) => setAnswers({ ...answers, [question]: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-[#D0D0D0] rounded-xl text-base text-white focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#000000] transition-all bg-[#334150]"
                        placeholder="Your answer"
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSecurityQuestionsSubmit}
                  disabled={loading}
                  className={`w-full py-4 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-102 active:scale-98 mb-4 ${
                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#CC0000]'
                  }`}
                >
                  {loading ? 'Verifying...' : 'Verify Answers →'}
                </button>
              </>
            )}

            {step === 'success' && (
              <>
                <div className="flex gap-3 p-4 rounded-xl mb-6 bg-green-950 border-2 border-green-800">
                  <CheckCircle size={20} className="text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">Reset Email Sent!</p>
                    <p className="text-sm text-gray-300">
                      Check your email ({email}) for a password reset link. The link will expire in 24 hours.
                    </p>
                  </div>
                </div>

                <button
                  onClick={onBack}
                  className="w-full py-4 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-102 active:scale-98 bg-[#CC0000]"
                >
                  Go to Sign In →
                </button>
              </>
            )}

            <button
              onClick={onBack}
              className="w-full py-3 text-gray-300 text-base font-semibold rounded-xl border-2 border-neutral-700 hover:bg-[#0A0A0B] transition-all flex items-center justify-center gap-2 mt-4"
            >
              <ArrowLeft size={20} />
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
