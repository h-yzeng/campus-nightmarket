import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import ForgotPassword from './ForgotPassword';

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

    try {
      const success = await onLogin(email, password);

      if (!success) {
        setError('Invalid email or password. Please try again.');
      }
    } catch (err) {
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
    <div className="min-h-screen flex flex-col bg-[#0A0A0B]">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-[#CC0000]">
              <span className="text-4xl">🌙</span>
            </div>
            <h2 className="text-4xl font-bold mb-3 text-[#CC0000]">
              Welcome Back!
            </h2>
            <p className="text-lg text-gray-400">
              Sign in to Night Market
            </p>
          </div>

          <div className="bg-[#1E1E1E] rounded-2xl shadow-xl border-2 border-[#3A3A3A] p-8">
            {error && (
              <div className="flex gap-3 p-4 rounded-xl mb-6 bg-red-950 border-2 border-red-800">
                <AlertCircle size={20} className="text-[#CC0000] shrink-0 mt-0.5" />
                <p className="text-sm text-white">{error}</p>
              </div>
            )}

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
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#D0D0D0] rounded-xl text-base text-white focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#000000] transition-all bg-[#334150]"
                  placeholder="youremail@hawk.illinoistech.edu"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-white">
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#76777B]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-12 py-3 border-2 border-[#D0D0D0] rounded-xl text-base text-white focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#000000] transition-all bg-[#334150]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onMouseDown={() => setShowPassword(true)}
                  onMouseUp={() => setShowPassword(false)}
                  onMouseLeave={() => setShowPassword(false)}
                  onTouchStart={() => setShowPassword(true)}
                  onTouchEnd={() => setShowPassword(false)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#76777B] hover:text-[#4C6177] transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
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
              disabled={loading}
              className={`w-full py-4 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-102 active:scale-98 ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#CC0000]'
              }`}
            >
              {loading ? 'Signing In...' : 'Sign In →'}
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
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