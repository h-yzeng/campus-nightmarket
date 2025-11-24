import { useState, useEffect, useMemo } from 'react';
import type { ProfileData, PageType } from '../types';
import { useFirebaseAuth } from './useFirebaseAuth';
import type { SignupData } from '../services/auth/authService';
import type { FirebaseUserProfile } from '../types/firebase';

const convertFirebaseProfileToApp = (
  firebaseProfile: FirebaseUserProfile | null
): ProfileData => {
  if (!firebaseProfile) {
    return {
      email: '',
      password: '',
      confirmPassword: '',
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
    password: '',
    confirmPassword: '',
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
    clearError,
  } = useFirebaseAuth();

  const derivedProfileData = useMemo(
    () => convertFirebaseProfileToApp(firebaseProfile),
    [firebaseProfile]
  );

  const [profileData, setProfileData] = useState<ProfileData>(derivedProfileData);
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  useEffect(() => {
    setProfileData(derivedProfileData);
  }, [derivedProfileData]);

  useEffect(() => {
    if (firebaseProfile && currentPage === 'home') {
      setCurrentPage('browse');
    }
    if (!firebaseProfile && !loading && currentPage !== 'home' && currentPage !== 'login' && currentPage !== 'signup') {
      setCurrentPage('home');
    }
  }, [firebaseProfile, loading, currentPage]);

  const handleCreateProfile = async () => {
    try {
      const signupData: SignupData = {
        email: profileData.email,
        password: profileData.password,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        studentId: profileData.studentId,
      };

      await handleSignUp(signupData);
      setCurrentPage('browse');
    } catch (err) {
      console.error('Error creating profile:', err);
      throw err;
    }
  };

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      await handleSignIn({ email, password });
      setCurrentPage('browse');
      return true;
    } catch (err) {
      console.error('Error logging in:', err);
      return false;
    }
  };

  const handleSaveProfile = async () => {
    if (!user) {
      console.error('No user signed in');
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
        if (profileData.sellerInfo.paymentMethods &&
            Object.keys(profileData.sellerInfo.paymentMethods).length > 0) {
          updates.isSeller = true;
        }
      }

      await handleUpdateProfile(updates);
    } catch (err) {
      console.error('Error saving profile:', err);
      throw err;
    }
  };

  const handleSignOut = async () => {
    try {
      await firebaseSignOut();
      setCurrentPage('home');
    } catch (err) {
      console.error('Error signing out:', err);
      throw err;
    }
  };

  const handleBecomeSeller = async () => {
    if (!user) {
      console.error('No user signed in');
      return;
    }

    try {
      const sellerInfo: FirebaseUserProfile['sellerInfo'] = profileData.sellerInfo || {
        paymentMethods: {},
        preferredLocations: [],
      };

      await firebaseBecomeSeller(sellerInfo);

      setProfileData(prev => ({
        ...prev,
        isSeller: true,
        sellerInfo,
      }));
    } catch (err) {
      console.error('Error becoming seller:', err);
      throw err;
    }
  };

  return {
    profileData,
    setProfileData,
    currentPage,
    setCurrentPage,
    handleCreateProfile,
    handleLogin,
    handleSaveProfile,
    handleSignOut,
    handleBecomeSeller,
    handleResetPassword,
    user,
    loading,
    error,
    clearError,
  };
};
