import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { applyActionCode, checkActionCode } from 'firebase/auth';
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
  const [errorCode, setErrorCode] = useState('');

  useEffect(() => {
    let timeout: number | undefined;

    const verify = async () => {
      if (!oobCode) {
        setError('Verification link is missing a code. Please request a new verification email.');
        setStatus('error');
        return;
      }

      try {
        // Pre-flight check to see what Firebase thinks about this code
        const info = await checkActionCode(auth, oobCode);
        logger.info('Verification code info', info);

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
        if (code) {
          setErrorCode(code);
        }

        // If the action code is already used but the user is now verified, treat as success
        try {
          await auth.currentUser?.reload();
          if (auth.currentUser?.emailVerified) {
            setStatus('success');
            return;
          }
        } catch (reloadErr) {
          logger.warn('Could not reload user after verification failure', reloadErr);
        }

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
        <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#0F1115] p-8 shadow-[0_20px_70px_rgba(0,0,0,0.45)]">
          <h1 className="text-xl font-semibold text-white">Email verified</h1>
          <p className="mt-3 text-sm text-gray-300">Redirecting you now...</p>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0B] p-6">
      <div className="w-full max-w-md space-y-4 rounded-xl border border-white/10 bg-[#0F1115] p-8 shadow-[0_20px_70px_rgba(0,0,0,0.45)]">
        <h1 className="text-xl font-semibold text-white">Try verifying again</h1>
        <ErrorAlert message={error} />
        {errorCode ? <p className="text-xs text-gray-400">Debug code: {errorCode}</p> : null}
        <button
          type="button"
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          onClick={() => navigate('/browse')}
        >
          Go back to browse
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
