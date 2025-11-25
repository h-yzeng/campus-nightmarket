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
      // Invalidate all listings
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      // Invalidate seller's listings
      queryClient.invalidateQueries({ queryKey: ['listings', 'seller', variables.sellerId] });
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
      // Invalidate all listings
      queryClient.invalidateQueries({ queryKey: ['listings'] });
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
      // Invalidate all listings
      queryClient.invalidateQueries({ queryKey: ['listings'] });
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
      // Invalidate all listings
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
};
