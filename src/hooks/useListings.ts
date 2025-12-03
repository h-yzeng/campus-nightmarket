import { useState, useEffect } from 'react';
import { getAllListings } from '../services/listings/listingService';
import type { FirebaseListing } from '../types/firebase';
import type { FoodItem } from '../types';
import { logger } from '../utils/logger';

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
    category: listing.category,
    isAvailable: listing.isAvailable,
    purchaseCount: listing.purchaseCount,
    datePosted: listing.createdAt
      ? new Date(listing.createdAt.seconds * 1000).toISOString()
      : undefined,
  };
};

export const useListings = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const listings = await getAllListings(true);
      const convertedItems = listings.map(convertFirebaseListingToFoodItem);
      setFoodItems(convertedItems);
    } catch (err) {
      logger.error('Error loading listings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  return {
    foodItems,
    loading,
    error,
    refreshListings: loadListings,
  };
};
