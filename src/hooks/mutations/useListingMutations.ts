import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createListing,
  updateListing,
  deleteListing,
  toggleListingAvailability,
} from '../../services/listings/listingService';
import type { CreateListing, UpdateListing } from '../../types/firebase';
import type { ListingWithFirebaseId } from '../../types';
import { queryKeys } from '../../utils/queryKeys';

export const useCreateListingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingData: CreateListing) => {
      return await createListing(listingData);
    },
    onSuccess: (_data, variables) => {
      // Invalidate and refetch all listings immediately
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.all, refetchType: 'active' });
      // Invalidate seller's listings specifically
      queryClient.invalidateQueries({
        queryKey: queryKeys.listings.seller(variables.sellerId),
        refetchType: 'active',
      });
    },
  });
};

export const useUpdateListingMutation = () => {
  const queryClient = useQueryClient();

  const updateSellerListingsCache = (
    listingId: string,
    updater: (listing: ListingWithFirebaseId) => ListingWithFirebaseId
  ) => {
    const queries = queryClient.getQueriesData<ListingWithFirebaseId[]>({
      queryKey: queryKeys.listings.all,
      predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[1] === 'seller',
    });

    queries.forEach(([queryKey, data]) => {
      if (!data) return;
      const next = data.map((listing) =>
        listing.firebaseId === listingId ? updater(listing) : listing
      );
      queryClient.setQueryData(queryKey, next);
    });
  };

  return useMutation({
    mutationFn: async ({ listingId, data }: { listingId: string; data: UpdateListing }) => {
      return await updateListing(listingId, data);
    },
    onSuccess: (_data, variables) => {
      updateSellerListingsCache(variables.listingId, (listing) => ({
        ...listing,
        ...variables.data,
        // Keep firebaseId and other existing fields intact
        firebaseId: listing.firebaseId,
      }));
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.all, refetchType: 'active' });
    },
  });
};

export const useDeleteListingMutation = () => {
  const queryClient = useQueryClient();

  const pruneSellerListingsCache = (listingId: string) => {
    const queries = queryClient.getQueriesData<ListingWithFirebaseId[]>({
      queryKey: queryKeys.listings.all,
      predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[1] === 'seller',
    });

    queries.forEach(([queryKey, data]) => {
      if (!data) return;
      const next = data.filter((listing) => listing.firebaseId !== listingId);
      queryClient.setQueryData(queryKey, next);
    });
  };

  return useMutation({
    mutationFn: async (listingId: string) => {
      return await deleteListing(listingId);
    },
    onSuccess: (_data, listingId) => {
      pruneSellerListingsCache(listingId);
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.all, refetchType: 'active' });
    },
  });
};

export const useToggleListingAvailabilityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: string) => {
      return await toggleListingAvailability(listingId);
    },
    onMutate: async (listingId) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.listings.all,
        predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[1] === 'seller',
      });

      const previousSellerQueries = queryClient.getQueriesData<ListingWithFirebaseId[]>({
        queryKey: queryKeys.listings.all,
        predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[1] === 'seller',
      });

      const toggleCache = (data?: ListingWithFirebaseId[]) =>
        data?.map((listing) =>
          listing.firebaseId === listingId
            ? { ...listing, isAvailable: !listing.isAvailable }
            : listing
        );

      previousSellerQueries.forEach(([queryKey, data]) => {
        if (!data) return;
        queryClient.setQueryData(queryKey, toggleCache(data));
      });

      return { previousSellerQueries };
    },
    onError: (_error, _listingId, context) => {
      context?.previousSellerQueries?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.all, refetchType: 'active' });
      queryClient.invalidateQueries({
        queryKey: queryKeys.listings.all,
        predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[1] === 'seller',
        refetchType: 'active',
      });
    },
  });
};
