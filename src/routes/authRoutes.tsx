import { lazy, Suspense, useEffect, useState } from 'react';
import { Route, useNavigate } from 'react-router-dom';
import type { AppRoutesProps } from './types';
import { PageLoadingFallback } from './shared';
import type { ProfileData } from '../types';

const Signup = lazy(() => import('../pages/Signup'));
const Login = lazy(() => import('../pages/Login'));
const VerifyEmail = lazy(() => import('../pages/VerifyEmail'));
const VerifyRequired = lazy(() => import('../pages/VerifyRequired'));

// eslint-disable-next-line react-refresh/only-export-components
const LoginWrapper = (props: Pick<AppRoutesProps, 'handleLogin'>) => {
  const navigate = useNavigate();

  const handleLoginWithNavigation = async (email: string, password: string) => {
    const success = await props.handleLogin(email, password);
    if (success) {
      navigate('/browse');
    }
    return success;
  };

  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Login onLogin={handleLoginWithNavigation} onGoToSignup={() => navigate('/signup')} />
    </Suspense>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
const SignupWrapper = (props: Pick<AppRoutesProps, 'setProfileData' | 'handleCreateProfile'>) => {
  const navigate = useNavigate();

  const [localProfileData, setLocalProfileData] = useState<ProfileData>({
    email: '',
    firstName: '',
    lastName: '',
    studentId: '',
    bio: '',
    photo: null,
    isSeller: false,
  });

  useEffect(() => {
    props.setProfileData(localProfileData);
  }, [localProfileData, props]);

  const handleSignupWithNavigation = async (password: string) => {
    await props.handleCreateProfile(password);
    navigate('/browse');
  };

  const handleProfileDataChange = (data: ProfileData) => {
    setLocalProfileData(data as ProfileData);
  };

  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Signup
        profileData={localProfileData}
        setProfileData={handleProfileDataChange}
        onCreateProfile={handleSignupWithNavigation}
        onGoToLogin={() => navigate('/login')}
        onBrowseFood={() => navigate('/preview')}
      />
    </Suspense>
  );
};

export const renderAuthRoutes = (props: AppRoutesProps) => (
  <>
    <Route path="/login" element={<LoginWrapper handleLogin={props.handleLogin} />} />
    <Route
      path="/signup"
      element={
        <SignupWrapper
          setProfileData={props.setProfileData}
          handleCreateProfile={props.handleCreateProfile}
        />
      }
    />
    <Route path="/verify-email" element={<VerifyEmail />} />
    <Route
      path="/verify-required"
      element={
        <VerifyRequired
          onResend={props.handleResendVerification}
          onReload={props.handleReloadUser}
        />
      }
    />
  </>
);
