import { useQuery } from '@tanstack/react-query';
import { getAllListings } from '../../services/listings/listingService';
import type { FirebaseListing } from '../../types/firebase';
import type { FoodItem } from '../../types';

const convertFirebaseListingToFoodItem = (listing: FirebaseListing): FoodItem => {
  return {
    id: parseInt(listing.id.substring(0, 8), 16),
    name: listing.name,
    seller: listing.sellerName,
    sellerId: listing.sellerId,
    price: listing.price,
    image: listing.imageURL,
    location: listing.location,
    rating: 'N/A',
    description: listing.description,
  };
};

export const useListingsQuery = () => {
  return useQuery({
    queryKey: ['listings'],
    queryFn: async () => {
      const listings = await getAllListings(true);
      return listings.map(convertFirebaseListingToFoodItem);
    },
  });
};

export const useSellerListingsQuery = (sellerId: string | undefined) => {
  return useQuery({
    queryKey: ['listings', 'seller', sellerId],
    queryFn: async () => {
      if (!sellerId) return [];
      const { getListingsBySeller } = await import('../../services/listings/listingService');
      const listings = await getListingsBySeller(sellerId);
      return listings.map(convertFirebaseListingToFoodItem);
    },
    enabled: !!sellerId,
  });
};
