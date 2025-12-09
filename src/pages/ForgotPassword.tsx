import { Mail, AlertCircle, CheckCircle, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { getUserSecurityQuestions, verifySecurityAnswers } from '../services/auth/securityService';
import { resetPasswordWithVerification } from '../services/auth/passwordResetService';
import { rateLimiter, RATE_LIMITS } from '../utils/rateLimiter';

interface ForgotPasswordProps {
  onBack: () => void;
}

type Step = 'email' | 'security-questions' | 'new-password' | 'success';

const ForgotPassword = ({ onBack }: ForgotPasswordProps) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [securityQuestions, setSecurityQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        setError(
          'No security questions found for this account. This may be because you signed up before security questions were properly implemented. Please contact support at nightmarket@hawk.illinoistech.edu to reset your password, or create a new account.'
        );
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

    // Rate limiting check
    const rateLimit = rateLimiter.checkLimit(`password_reset_${email}`, RATE_LIMITS.PASSWORD_RESET);
    if (!rateLimit.allowed) {
      setError(rateLimit.message || 'Too many password reset attempts. Please try again later.');
      setLoading(false);
      return;
    }

    const unansweredQuestions = securityQuestions.filter(
      (q) => !answers[q] || answers[q].trim() === ''
    );
    if (unansweredQuestions.length > 0) {
      setError('Please answer all security questions');
      setLoading(false);
      return;
    }

    try {
      const answersArray = securityQuestions.map((q) => ({
        question: q,
        answer: answers[q],
      }));

      const result = await verifySecurityAnswers(email, answersArray);

      if (!result.verified || !result.token) {
        setError('Security answers are incorrect. Please try again.');
        setLoading(false);
        return;
      }

      // Store verification token and move to password reset step
      setVerificationToken(result.token);
      setStep('new-password');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify security answers');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setError('');
    setLoading(true);

    // Validate password (updated to 12 characters minimum)
    if (!newPassword || newPassword.length < 12) {
      setError('Password must be at least 12 characters long');
      setLoading(false);
      return;
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      setError('Password must contain uppercase, lowercase, number, and special character');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await resetPasswordWithVerification(email, newPassword, verificationToken);
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0B]">
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#CC0000]">
              <span className="text-4xl">🔐</span>
            </div>
            <h2 className="mb-3 text-4xl font-bold text-[#CC0000]">
              {step === 'email' && 'Reset Password'}
              {step === 'security-questions' && 'Security Questions'}
              {step === 'new-password' && 'Create New Password'}
              {step === 'success' && 'Success!'}
            </h2>
            <p className="text-lg text-gray-400">
              {step === 'email' && 'Enter your email to get started'}
              {step === 'security-questions' && 'Answer your security questions'}
              {step === 'new-password' && 'Enter your new password'}
              {step === 'success' && 'Password has been reset'}
            </p>
          </div>

          <div className="rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-8 shadow-xl">
            {error && (
              <div className="mb-6 flex gap-3 rounded-xl border-2 border-red-800 bg-red-950 p-4">
                <AlertCircle size={20} className="mt-0.5 shrink-0 text-[#CC0000]" />
                <p className="text-sm text-white">{error}</p>
              </div>
            )}

            {step === 'email' && (
              <>
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-semibold text-white">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={20}
                      className="absolute top-1/2 left-4 -translate-y-1/2 transform text-[#76777B]"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border-2 border-[#3A3A3A] bg-[#2A2A2A] py-3 pr-4 pl-12 text-base text-white transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000] focus:outline-none"
                      placeholder="youremail@hawk.illinoistech.edu"
                      onKeyPress={(e) => e.key === 'Enter' && handleEmailSubmit()}
                    />
                  </div>
                </div>

                <button
                  onClick={handleEmailSubmit}
                  disabled={loading}
                  className={`mb-4 w-full transform rounded-xl py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-102 hover:shadow-xl active:scale-98 ${
                    loading ? 'cursor-not-allowed bg-gray-400' : 'bg-[#CC0000]'
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
                      <label className="mb-2 block text-sm font-semibold text-white">
                        {question}
                      </label>
                      <input
                        type="text"
                        value={answers[question] || ''}
                        onChange={(e) => setAnswers({ ...answers, [question]: e.target.value })}
                        className="w-full rounded-xl border-2 border-[#3A3A3A] bg-[#2A2A2A] px-4 py-3 text-base text-white transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000] focus:outline-none"
                        placeholder="Your answer"
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSecurityQuestionsSubmit}
                  disabled={loading}
                  className={`mb-4 w-full transform rounded-xl py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-102 hover:shadow-xl active:scale-98 ${
                    loading ? 'cursor-not-allowed bg-gray-400' : 'bg-[#CC0000]'
                  }`}
                >
                  {loading ? 'Verifying...' : 'Verify Answers →'}
                </button>
              </>
            )}

            {step === 'new-password' && (
              <>
                <div className="mb-6 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock
                        size={20}
                        className="absolute top-1/2 left-4 -translate-y-1/2 transform text-[#76777B]"
                      />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-xl border-2 border-[#3A3A3A] bg-[#2A2A2A] py-3 pr-12 pl-12 text-base text-white transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000] focus:outline-none"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-1/2 right-4 -translate-y-1/2 transform text-[#76777B] transition-colors hover:text-white"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock
                        size={20}
                        className="absolute top-1/2 left-4 -translate-y-1/2 transform text-[#76777B]"
                      />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-xl border-2 border-[#3A3A3A] bg-[#2A2A2A] py-3 pr-12 pl-12 text-base text-white transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000] focus:outline-none"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute top-1/2 right-4 -translate-y-1/2 transform text-[#76777B] transition-colors hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-400">
                    Password must be at least 12 characters with uppercase, lowercase, number, and
                    special character
                  </div>
                </div>

                <button
                  onClick={handlePasswordReset}
                  disabled={loading}
                  className={`mb-4 w-full transform rounded-xl py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-102 hover:shadow-xl active:scale-98 ${
                    loading ? 'cursor-not-allowed bg-gray-400' : 'bg-[#CC0000]'
                  }`}
                >
                  {loading ? 'Resetting Password...' : 'Reset Password →'}
                </button>
              </>
            )}

            {step === 'success' && (
              <>
                <div className="mb-6 flex gap-3 rounded-xl border-2 border-green-800 bg-green-950 p-4">
                  <CheckCircle size={20} className="mt-0.5 shrink-0 text-green-400" />
                  <div>
                    <p className="mb-1 text-sm font-semibold text-white">
                      Password Reset Successful!
                    </p>
                    <p className="text-sm text-gray-300">
                      Your password has been successfully changed. You can now sign in with your new
                      password.
                    </p>
                  </div>
                </div>

                <button
                  onClick={onBack}
                  className="w-full transform rounded-xl bg-[#CC0000] py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-102 hover:shadow-xl active:scale-98"
                >
                  Go to Sign In →
                </button>
              </>
            )}

            <button
              onClick={onBack}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-neutral-700 py-3 text-base font-semibold text-gray-300 transition-all hover:bg-[#0A0A0B]"
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
