import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { applyActionCode } from 'firebase/auth';
import LoadingState from '../components/common/LoadingState';
import ErrorAlert from '../components/common/ErrorAlert';
import { auth } from '../config/firebase';
import { logger } from '../utils/logger';

const SUCCESS_REDIRECT_DELAY_MS = 1500;

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const oobCode = useMemo(() => params.get('oobCode') || '', [params]);
  const continueUrl = useMemo(() => params.get('continueUrl') || '/browse', [params]);

  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>(
    oobCode ? 'verifying' : 'error'
  );
  const [error, setError] = useState(
    oobCode ? '' : 'Verification link is missing a code. Please request a new verification email.'
  );

  useEffect(() => {
    let timeout: number | undefined;

    const verify = async () => {
      if (!oobCode) {
        setError('Verification link is missing a code. Please request a new verification email.');
        setStatus('error');
        return;
      }

      try {
        await applyActionCode(auth, oobCode);
        setStatus('success');

        // Reload current user if present so UI updates immediately
        await auth.currentUser?.reload();

        timeout = window.setTimeout(() => {
          navigate(continueUrl, { replace: true });
        }, SUCCESS_REDIRECT_DELAY_MS);
      } catch (err) {
        logger.error('Email verification failed', err);
        const code = (err as { code?: string })?.code;

        if (code === 'auth/expired-action-code') {
          setError('This verification link has expired. Please resend a new verification email.');
        } else if (code === 'auth/invalid-action-code') {
          setError('This verification link is invalid or has already been used. Please resend.');
        } else {
          setError(
            'Unable to verify this link. Please resend a new verification email and try again.'
          );
        }

        setStatus('error');
      }
    };

    if (status === 'verifying') {
      void verify();
    }

    return () => {
      if (timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, [continueUrl, navigate, oobCode, status]);

  if (status === 'verifying') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0B] p-6">
        <LoadingState variant="spinner" size="lg" text="Verifying your email..." />
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0B] p-6">
        <div className="w-full max-w-md rounded-xl bg-white/95 p-8 shadow-xl">
          <h1 className="text-xl font-semibold text-gray-900">Email verified</h1>
          <p className="mt-3 text-sm text-gray-700">Redirecting you now...</p>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0B] p-6">
      <div className="w-full max-w-md space-y-4 rounded-xl bg-white/95 p-8 shadow-xl">
        <h1 className="text-xl font-semibold text-gray-900">Try verifying again</h1>
        <ErrorAlert message={error} />
        <button
          type="button"
          className="w-full rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
          onClick={() => navigate('/browse')}
        >
          Go back to browse
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
