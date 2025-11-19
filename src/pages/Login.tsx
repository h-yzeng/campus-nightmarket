import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface LoginProps {
  onLogin: (email: string, password: string) => boolean;
  onGoToSignup: () => void;
}

const Login = ({ onLogin, onGoToSignup }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = () => {
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    const success = onLogin(email, password);
    
    if (!success) {
      setError('Invalid email or password. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handlePasswordReset = () => {
    setError('');
    setResetSuccess(false);
    
    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }

    const isValidEmail = /^[^\s@]+@hawk\.illinoistech\.edu$/.test(resetEmail);
    if (!isValidEmail) {
      setError('Please use your @hawk.illinoistech.edu email');
      return;
    }

    // Simulate password reset email being sent
    setResetSuccess(true);
    setTimeout(() => {
      setShowForgotPassword(false);
      setResetSuccess(false);
      setResetEmail('');
    }, 3000);
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-[#CC0000]">
                <span className="text-4xl">🌙</span>
              </div>
              <h2 className="text-4xl font-bold mb-3 text-[#CC0000]">
                Reset Password
              </h2>
              <p className="text-lg text-gray-600">
                Enter your email to receive reset instructions
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8">
              {error && (
                <div className="flex gap-3 p-4 rounded-xl mb-6 bg-[#FFF5F5] border-2 border-[#FFDDDD]">
                  <AlertCircle size={20} className="text-[#CC0000] shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-900">{error}</p>
                </div>
              )}

              {resetSuccess && (
                <div className="flex gap-3 p-4 rounded-xl mb-6 bg-green-50 border-2 border-green-200">
                  <AlertCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Reset Email Sent!</p>
                    <p className="text-sm text-gray-700">
                      Check your email for instructions to reset your password.
                    </p>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-gray-900">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#76777B]" />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-[#D0D0D0] rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#000000] transition-all bg-[#FAFAFA]"
                    placeholder="youremail@hawk.illinoistech.edu"
                  />
                </div>
              </div>

              <button
                onClick={handlePasswordReset}
                disabled={resetSuccess}
                className={`w-full py-4 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-102 active:scale-98 mb-4 ${
                  resetSuccess ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#CC0000]'
                }`}
              >
                {resetSuccess ? 'Email Sent ✓' : 'Send Reset Link'}
              </button>

              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setError('');
                  setResetEmail('');
                }}
                className="w-full py-3 text-gray-700 text-base font-semibold rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-[#CC0000]">
              <span className="text-4xl">🌙</span>
            </div>
            <h2 className="text-4xl font-bold mb-3 text-[#CC0000]">
              Welcome Back!
            </h2>
            <p className="text-lg text-gray-600">
              Sign in to Night Market
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8">
            {error && (
              <div className="flex gap-3 p-4 rounded-xl mb-6 bg-[#FFF5F5] border-2 border-[#FFDDDD]">
                <AlertCircle size={20} className="text-[#CC0000] shrink-0 mt-0.5" />
                <p className="text-sm text-gray-900">{error}</p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-gray-900">
                Email Address
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#76777B]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#D0D0D0] rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#000000] transition-all bg-[#FAFAFA]"
                  placeholder="youremail@hawk.illinoistech.edu"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-gray-900">
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#76777B]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#D0D0D0] rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#000000] transition-all bg-[#FAFAFA]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="mb-6 text-right">
              <button
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-[#CC0000] font-semibold hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-4 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-102 active:scale-98 bg-[#CC0000]"
            >
              Sign In →
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={onGoToSignup}
                  className="text-[#CC0000] font-semibold hover:underline"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;