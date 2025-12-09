import { useState, useEffect, useMemo } from 'react';
import type { ProfileData } from '../../types';
import { useFirebaseAuth } from './useFirebaseAuth';
import type { SignupData } from '../../services/auth/authService';
import type { FirebaseUserProfile } from '../../types/firebase';
import { logger } from '../../utils/logger';

const convertFirebaseProfileToApp = (firebaseProfile: FirebaseUserProfile | null): ProfileData => {
  if (!firebaseProfile) {
    return {
      email: '',
      firstName: '',
      lastName: '',
      studentId: '',
      bio: '',
      photo: null,
      isSeller: false,
    };
  }

  return {
    email: firebaseProfile.email,
    firstName: firebaseProfile.firstName,
    lastName: firebaseProfile.lastName,
    studentId: firebaseProfile.studentId,
    bio: firebaseProfile.bio,
    photo: firebaseProfile.photoURL,
    isSeller: firebaseProfile.isSeller,
    sellerInfo: firebaseProfile.sellerInfo,
  };
};

export const useAuth = () => {
  const {
    user,
    profile: firebaseProfile,
    loading,
    error,
    handleSignUp,
    handleSignIn,
    handleSignOut: firebaseSignOut,
    handleUpdateProfile,
    handleBecomeSeller: firebaseBecomeSeller,
    handleResetPassword,
    handleResendVerification,
    handleReloadUser,
    clearError,
  } = useFirebaseAuth();

  const derivedProfileData = useMemo(
    () => convertFirebaseProfileToApp(firebaseProfile),
    [firebaseProfile]
  );

  const [profileData, setProfileData] = useState<ProfileData>(derivedProfileData);

  useEffect(() => {
    setProfileData(derivedProfileData);
  }, [derivedProfileData]);

  const handleCreateProfile = async (password: string) => {
    try {
      const signupData: SignupData = {
        email: profileData.email,
        password: password,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        studentId: profileData.studentId,
      };

      await handleSignUp(signupData);
    } catch (err) {
      logger.error('Error creating profile:', err);
      throw err;
    }
  };

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      await handleSignIn({ email, password });
      return true;
    } catch (err) {
      logger.error('Error logging in:', err);
      return false;
    }
  };

  const handleSaveProfile = async () => {
    if (!user) {
      logger.error('No user signed in');
      return;
    }

    try {
      const updates: Partial<FirebaseUserProfile> = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        studentId: profileData.studentId,
        bio: profileData.bio,
        photoURL: profileData.photo,
      };

      if (profileData.sellerInfo) {
        updates.sellerInfo = profileData.sellerInfo;
        if (
          profileData.sellerInfo.paymentMethods &&
          Object.keys(profileData.sellerInfo.paymentMethods).length > 0
        ) {
          updates.isSeller = true;
        }
      }

      await handleUpdateProfile(updates);
    } catch (err) {
      logger.error('Error saving profile:', err);
      throw err;
    }
  };

  const handleSignOut = async () => {
    try {
      await firebaseSignOut();
    } catch (err) {
      logger.error('Error signing out:', err);
      throw err;
    }
  };

  const handleBecomeSeller = async () => {
    if (!user) {
      logger.error('No user signed in');
      return;
    }

    try {
      const sellerInfo: FirebaseUserProfile['sellerInfo'] = profileData.sellerInfo || {
        paymentMethods: {},
        preferredLocations: [],
      };

      await firebaseBecomeSeller(sellerInfo);

      setProfileData((prev) => ({
        ...prev,
        isSeller: true,
        sellerInfo,
      }));
    } catch (err) {
      logger.error('Error becoming seller:', err);
      throw err;
    }
  };

  return {
    profileData,
    setProfileData,
    handleCreateProfile,
    handleLogin,
    handleSaveProfile,
    handleSignOut,
    handleBecomeSeller,
    handleResetPassword,
    handleResendVerification,
    handleReloadUser,
    user,
    loading,
    error,
    clearError,
  };
};
