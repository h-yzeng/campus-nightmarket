import { useState } from 'react';
import { Mail, RefreshCw, X } from 'lucide-react';

interface EmailVerificationBannerProps {
  userEmail: string | null;
  onResendEmail: () => Promise<void>;
  onReloadUser: () => Promise<void>;
}

const EmailVerificationBanner = ({
  userEmail,
  onResendEmail,
  onReloadUser,
}: EmailVerificationBannerProps) => {
  const [dismissed, setDismissed] = useState(false);
  const [resending, setResending] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (dismissed) return null;

  const handleResend = async () => {
    setResending(true);
    setMessage(null);

    try {
      await onResendEmail();
      setMessage({
        type: 'success',
        text: 'Verification email sent! Please check your inbox.',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to send email',
      });
    } finally {
      setResending(false);
    }
  };

  const handleReload = async () => {
    setReloading(true);
    setMessage(null);

    try {
      await onReloadUser();
      setMessage({
        type: 'success',
        text: 'Checking verification status...',
      });

      // Give time for UI to update
      setTimeout(() => {
        setMessage(null);
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to refresh status',
      });
    } finally {
      setReloading(false);
    }
  };

  return (
    <div className="relative border-b-2 border-yellow-600 bg-[#2A2000] px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 shrink-0 text-yellow-500" size={20} />
          <div className="flex-1">
            <p className="mb-1 text-sm font-semibold text-white">Email Verification Required</p>
            <p className="mb-3 text-sm text-[#D0D0D0]">
              Please verify your email address ({userEmail}) to access all features. Check your
              inbox for the verification link.
            </p>

            {message && (
              <div
                className={`mb-3 rounded-lg border px-3 py-2 text-sm ${
                  message.type === 'success'
                    ? 'border-green-600 bg-[#0A2A0A] text-green-500'
                    : 'border-red-600 bg-[#2A0A0A] text-red-400'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleResend}
                disabled={resending}
                className="flex items-center gap-2 rounded-lg border-2 border-yellow-600 bg-[#3A3000] px-4 py-2 text-sm font-semibold text-yellow-400 transition-all hover:bg-[#4A4000] disabled:opacity-50"
              >
                <Mail size={16} />
                {resending ? 'Sending...' : 'Resend Verification Email'}
              </button>

              <button
                onClick={handleReload}
                disabled={reloading}
                className="flex items-center gap-2 rounded-lg border-2 border-[#3A3A3A] bg-[#1E1E1E] px-4 py-2 text-sm font-semibold text-[#E0E0E0] transition-all hover:border-[#4A4A4A] hover:bg-[#2A2A2A] disabled:opacity-50"
              >
                <RefreshCw size={16} className={reloading ? 'animate-spin' : ''} />
                {reloading ? 'Checking...' : 'I Verified My Email'}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-lg p-1 text-[#888888] transition-colors hover:bg-[#3A3A3A] hover:text-white"
          aria-label="Dismiss banner"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
