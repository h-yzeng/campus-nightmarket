import { useState, useEffect } from 'react';
import { getUserProfile } from '../services/auth/userService';
import type { FirebaseUserProfile } from '../types/firebase';

export const useSellerProfile = (sellerId: string | undefined) => {
  const [sellerProfile, setSellerProfile] = useState<FirebaseUserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSellerProfile = async () => {
      if (!sellerId) {
        setSellerProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const profile = await getUserProfile(sellerId);
        setSellerProfile(profile);
      } catch (err) {
        console.error('Error fetching seller profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch seller profile');
        setSellerProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerProfile();
  }, [sellerId]);

  return {
    sellerProfile,
    loading,
    error,
  };
};
