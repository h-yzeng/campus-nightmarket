import { Mail, RefreshCw, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores';

interface VerifyRequiredProps {
  onResend: () => Promise<void>;
  onReload: () => Promise<void>;
}

const VerifyRequired = ({ onResend, onReload }: VerifyRequiredProps) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [resending, setResending] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleResend = async () => {
    setResending(true);
    setMessage(null);
    try {
      await onResend();
      setMessage({ type: 'success', text: 'Verification email sent. Check your inbox.' });
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Failed to send email. Please try again.';
      setMessage({ type: 'error', text });
    } finally {
      setResending(false);
    }
  };

  const handleReload = async () => {
    setReloading(true);
    setMessage(null);
    try {
      await onReload();
      setMessage({ type: 'success', text: 'Checking verification status...' });
      setTimeout(() => setMessage(null), 1500);
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Failed to refresh status.';
      setMessage({ type: 'error', text });
    } finally {
      setReloading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0B] px-4 py-10">
      <div className="w-full max-w-xl space-y-5 rounded-2xl bg-white/95 p-8 shadow-2xl">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-1 text-amber-600" size={24} />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Email verification required</h1>
            <p className="mt-2 text-sm text-gray-700">
              Please verify your email{user?.email ? ` (${user.email})` : ''} to access the app.
              Open the verification email we sent, or resend a new one below.
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`rounded-lg border px-3 py-2 text-sm ${
              message.type === 'success'
                ? 'border-green-600 bg-[#0A2A0A] text-green-500'
                : 'border-red-600 bg-[#2A0A0A] text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="flex items-center gap-2 rounded-lg border-2 border-amber-600 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-60"
          >
            <Mail size={16} />
            {resending ? 'Sending…' : 'Resend verification email'}
          </button>

          <button
            type="button"
            onClick={handleReload}
            disabled={reloading}
            className="flex items-center gap-2 rounded-lg border-2 border-gray-800 bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-60"
          >
            <RefreshCw size={16} className={reloading ? 'animate-spin' : ''} />
            {reloading ? 'Checking…' : 'I verified my email'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="rounded-lg border-2 border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            Back to login
          </button>
        </div>

        <p className="text-xs text-gray-500">
          If you just clicked the link, wait a moment and press “I verified my email” to refresh
          your status.
        </p>
      </div>
    </div>
  );
};

export default VerifyRequired;
