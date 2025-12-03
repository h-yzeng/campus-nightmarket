import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createListing,
  updateListing,
  deleteListing,
  toggleListingAvailability,
} from '../../services/listings/listingService';
import type { CreateListing, UpdateListing } from '../../types/firebase';

export const useCreateListingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingData: CreateListing) => {
      return await createListing(listingData);
    },
    onSuccess: (_data, variables) => {
      // Invalidate and refetch all listings immediately
      queryClient.invalidateQueries({ queryKey: ['listings'], refetchType: 'active' });
      // Invalidate seller's listings specifically
      queryClient.invalidateQueries({ queryKey: ['listings', 'seller', variables.sellerId], refetchType: 'active' });
    },
  });
};

export const useUpdateListingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listingId, data }: { listingId: string; data: UpdateListing }) => {
      return await updateListing(listingId, data);
    },
    onSuccess: () => {
      // Invalidate and refetch all listings immediately
      queryClient.invalidateQueries({ queryKey: ['listings'], refetchType: 'active' });
    },
  });
};

export const useDeleteListingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: string) => {
      return await deleteListing(listingId);
    },
    onSuccess: () => {
      // Invalidate and refetch all listings immediately
      queryClient.invalidateQueries({ queryKey: ['listings'], refetchType: 'active' });
    },
  });
};

export const useToggleListingAvailabilityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: string) => {
      return await toggleListingAvailability(listingId);
    },
    onSuccess: () => {
      // Invalidate and refetch all listings immediately
      queryClient.invalidateQueries({ queryKey: ['listings'], refetchType: 'active' });
    },
  });
};
