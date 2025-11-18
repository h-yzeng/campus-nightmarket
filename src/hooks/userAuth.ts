import { useState, useEffect } from 'react';
import type { ProfileData } from '../types';
import { 
  getInitialAccounts, 
  getInitialUser, 
  saveAccounts, 
  saveCurrentUser, 
  removeCurrentUser,
  type StoredAccount,
  type PageType
} from '../utils/storage';

export const useAuth = () => {
  const initialUser = getInitialUser();
  const [accounts, setAccounts] = useState<StoredAccount[]>(getInitialAccounts());
  const [profileData, setProfileData] = useState<ProfileData>(initialUser.profile);
  const [currentPage, setCurrentPage] = useState<PageType>(initialUser.page);

  useEffect(() => {
    saveAccounts(accounts);
  }, [accounts]);

  const handleCreateProfile = () => {
    const newAccount: StoredAccount = {
      email: profileData.email,
      password: profileData.password,
      profileData: { ...profileData }
    };
    setAccounts(prev => [...prev, newAccount]);
    saveCurrentUser(profileData);
    setCurrentPage('browse');
  };

  const handleLogin = (email: string, password: string): boolean => {
    const account = accounts.find(
      acc => acc.email === email && acc.password === password
    );

    if (account) {
      setProfileData(account.profileData);
      saveCurrentUser(account.profileData);
      setCurrentPage('browse');
      return true;
    }

    return false;
  };

  const handleSaveProfile = () => {
    saveCurrentUser(profileData);
    
    setAccounts(prev => 
      prev.map(acc => 
        acc.email === profileData.email 
          ? { ...acc, profileData: { ...profileData } }
          : acc
      )
    );
  };

  const handleSignOut = () => {
    setProfileData({
      email: '',
      password: '', 
      confirmPassword: '',
      firstName: '',
      lastName: '',
      studentId: '',
      bio: '',
      photo: null
    });
    removeCurrentUser();
    setCurrentPage('home');
  };

  return {
    profileData,
    setProfileData,
    currentPage,
    setCurrentPage,
    handleCreateProfile,
    handleLogin,
    handleSaveProfile,
    handleSignOut
  };
};