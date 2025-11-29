import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import ForgotPassword from './ForgotPassword';
import { rateLimiter, RATE_LIMITS } from '../utils/rateLimiter';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onGoToSignup: () => void;
}

const Login = ({ onLogin, onGoToSignup }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    // Check if rate limited
    const rateLimit = rateLimiter.checkLimit(`login_failed_${email}`, RATE_LIMITS.LOGIN_FAILED);
    if (!rateLimit.allowed) {
      setError(rateLimit.message || 'Too many failed login attempts. Please try again later.');
      setLoading(false);
      return;
    }

    try {
      const success = await onLogin(email, password);

      if (!success) {
        // Track failed login attempt for rate limiting
        rateLimiter.checkLimit(`login_failed_${email}`, RATE_LIMITS.LOGIN_FAILED);
        setError('Invalid email or password. Please try again.');
      } else {
        // Reset rate limit on successful login
        rateLimiter.reset(`login_failed_${email}`);
      }
    } catch (err) {
      // Track failed attempt
      rateLimiter.checkLimit(`login_failed_${email}`, RATE_LIMITS.LOGIN_FAILED);
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  if (showForgotPassword) {
    return <ForgotPassword onBack={() => setShowForgotPassword(false)} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0B]">
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#CC0000]">
              <span className="text-4xl">🌙</span>
            </div>
            <h2 className="mb-3 text-4xl font-bold text-[#CC0000]">Welcome Back!</h2>
            <p className="text-lg text-gray-400">Sign in to Night Market</p>
          </div>

          <div className="rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-8 shadow-xl">
            {error && (
              <div className="mb-6 flex gap-3 rounded-xl border-2 border-red-800 bg-red-950 p-4">
                <AlertCircle size={20} className="mt-0.5 shrink-0 text-[#CC0000]" />
                <p className="text-sm text-white">{error}</p>
              </div>
            )}

            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-white">Email Address</label>
              <div className="relative">
                <Mail
                  size={20}
                  className="absolute top-1/2 left-4 -translate-y-1/2 transform text-[#76777B]"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full rounded-xl border-2 border-[#3A3A3A] bg-[#2A2A2A] py-3 pr-4 pl-12 text-base text-white transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000] focus:outline-none"
                  placeholder="youremail@hawk.illinoistech.edu"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-white">Password</label>
              <div className="relative">
                <Lock
                  size={20}
                  className="absolute top-1/2 left-4 -translate-y-1/2 transform text-[#76777B]"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full rounded-xl border-2 border-[#3A3A3A] bg-[#2A2A2A] py-3 pr-12 pl-12 text-base text-white transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000] focus:outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onMouseDown={() => setShowPassword(true)}
                  onMouseUp={() => setShowPassword(false)}
                  onMouseLeave={() => setShowPassword(false)}
                  onTouchStart={() => setShowPassword(true)}
                  onTouchEnd={() => setShowPassword(false)}
                  className="absolute top-1/2 right-4 -translate-y-1/2 transform text-[#76777B] transition-colors hover:text-white"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="mb-6 text-right">
              <button
                onClick={() => setShowForgotPassword(true)}
                className="text-sm font-semibold text-[#CC0000] hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full transform rounded-xl py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-102 hover:shadow-xl active:scale-98 ${
                loading ? 'cursor-not-allowed bg-gray-400' : 'bg-[#CC0000]'
              }`}
            >
              {loading ? 'Signing In...' : 'Sign In →'}
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Don't have an account?{' '}
                <button
                  onClick={onGoToSignup}
                  className="font-semibold text-[#CC0000] hover:underline"
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
