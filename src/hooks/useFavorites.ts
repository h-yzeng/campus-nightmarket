import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getFavoriteIds,
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
} from '../services/favorites/favoritesService';

/**
 * Hook for managing user's favorite listings
 */
export function useFavorites(userId: string | undefined) {
  const queryClient = useQueryClient();

  // Query to get favorite listing IDs
  const { data: favoriteIds = [], isLoading } = useQuery({
    queryKey: ['favorites', userId],
    queryFn: () => (userId ? getFavoriteIds(userId) : Promise.resolve([])),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });

  // Mutation to toggle favorite status
  const toggleMutation = useMutation({
    mutationFn: ({ listingId, isFavorited }: { listingId: string; isFavorited: boolean }) => {
      if (!userId) throw new Error('User not authenticated');
      return toggleFavorite(userId, listingId, isFavorited);
    },
    onMutate: async ({ listingId, isFavorited }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['favorites', userId] });

      // Snapshot the previous value
      const previousFavorites = queryClient.getQueryData<string[]>(['favorites', userId]);

      // Optimistically update to the new value
      queryClient.setQueryData<string[]>(['favorites', userId], (old = []) => {
        if (isFavorited) {
          return old.filter((id) => id !== listingId);
        } else {
          return [...old, listingId];
        }
      });

      return { previousFavorites };
    },
    onError: (error, _variables, context) => {
      // If the mutation fails, roll back to the previous value
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites', userId], context.previousFavorites);
      }
      toast.error('Failed to update favorites');
      console.error('Error toggling favorite:', error);
    },
    onSuccess: (_data, { isFavorited }) => {
      toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
    },
    onSettled: () => {
      // Always refetch after error or success
      void queryClient.invalidateQueries({ queryKey: ['favorites', userId] });
    },
  });

  // Mutation to add to favorites
  const addMutation = useMutation({
    mutationFn: (listingId: string) => {
      if (!userId) throw new Error('User not authenticated');
      return addToFavorites(userId, listingId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['favorites', userId] });
      toast.success('Added to favorites');
    },
    onError: (error) => {
      toast.error('Failed to add to favorites');
      console.error('Error adding to favorites:', error);
    },
  });

  // Mutation to remove from favorites
  const removeMutation = useMutation({
    mutationFn: (listingId: string) => {
      if (!userId) throw new Error('User not authenticated');
      return removeFromFavorites(userId, listingId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['favorites', userId] });
      toast.success('Removed from favorites');
    },
    onError: (error) => {
      toast.error('Failed to remove from favorites');
      console.error('Error removing from favorites:', error);
    },
  });

  // Helper function to check if a listing is favorited
  const isFavorited = (listingId: string) => {
    return favoriteIds.includes(listingId);
  };

  // Helper function to toggle favorite
  const handleToggleFavorite = (listingId: string) => {
    const currentlyFavorited = isFavorited(listingId);
    toggleMutation.mutate({ listingId, isFavorited: currentlyFavorited });
  };

  return {
    favoriteIds,
    isLoading,
    isFavorited,
    toggleFavorite: handleToggleFavorite,
    addToFavorites: addMutation.mutate,
    removeFromFavorites: removeMutation.mutate,
    isToggling: toggleMutation.isPending,
  };
}
