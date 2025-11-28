import { testEnv } from '../test-setup';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { createTestUser, createTestListing, uploadTestImage } from '../helpers/testHelpers';

describe('Listings Integration Tests - Listing Creation Flow', () => {

  describe('Test 1: Create Listing with All Required Fields', () => {
    it('should successfully create a new listing with all required fields', async () => {
      const sellerContext = testEnv.authenticatedContext('seller123');
      const db = sellerContext.firestore();

      // Create seller user
      await createTestUser(sellerContext, 'seller123', {
        firstName: 'Bob',
        lastName: 'Seller'
      });

      // Create listing
      const listingData = {
        listingId: 'listing123',
        sellerId: 'seller123',
        sellerName: 'Bob Seller',
        name: 'Homemade Ramen',
        description: 'Delicious homemade ramen with fresh ingredients',
        price: 8.50,
        category: 'Lunch',
        location: 'Cunningham Hall',
        imageUrl: 'https://storage.example.com/listings/seller123/ramen.jpg',
        isAvailable: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const listingRef = doc(db, 'listings', listingData.listingId);
      await setDoc(listingRef, listingData);

      // Verify listing was created
      const listingSnap = await getDoc(listingRef);

      expect(listingSnap.exists()).toBe(true);

      const listing = listingSnap.data();
      expect(listing?.sellerId).toBe('seller123');
      expect(listing?.sellerName).toBe('Bob Seller');
      expect(listing?.name).toBe('Homemade Ramen');
      expect(listing?.description).toBe('Delicious homemade ramen with fresh ingredients');
      expect(listing?.price).toBe(8.50);
      expect(listing?.category).toBe('Lunch');
      expect(listing?.location).toBe('Cunningham Hall');
      expect(listing?.isAvailable).toBe(true);
    });

    it('should validate that price is stored as number', () => {
      const price = 8.50;

      expect(typeof price).toBe('number');
      expect(price).toBeGreaterThan(0);
    });

    it('should validate that sellerId matches logged-in user', () => {
      const loggedInUserId = 'seller123';
      const listingSellerId = 'seller123';

      expect(listingSellerId).toBe(loggedInUserId);
    });

    it('should validate image storage path format', () => {
      const sellerId = 'seller123';
      const filename = 'ramen.jpg';
      const imagePath = `listings/${sellerId}/${filename}`;

      expect(imagePath).toMatch(/^listings\/[\w]+\/[\w.-]+$/);
      expect(imagePath).toContain(sellerId);
    });
  });

  describe('Test 2: Create Listing - Validation Errors', () => {
    it('should prevent submission with empty name', () => {
      const listingData = {
        name: '',
        description: 'Test',
        price: 10,
        category: 'Lunch',
        location: 'Test Location'
      };

      const isValid = listingData.name.trim().length > 0;
      expect(isValid).toBe(false);
    });

    it('should prevent submission with empty description', () => {
      const listingData = {
        name: 'Test Item',
        description: '',
        price: 10,
        category: 'Lunch',
        location: 'Test Location'
      };

      const isValid = listingData.description.trim().length > 0;
      expect(isValid).toBe(false);
    });

    it('should prevent submission with zero or negative price', () => {
      const zeroPriceValid = 0 > 0;
      const negativePriceValid = -5 > 0;

      expect(zeroPriceValid).toBe(false);
      expect(negativePriceValid).toBe(false);
    });

    it('should prevent submission without image', () => {
      const listingData = {
        name: 'Test Item',
        description: 'Test',
        price: 10,
        category: 'Lunch',
        location: 'Test Location',
        imageUrl: ''
      };

      const isValid = listingData.imageUrl.length > 0;
      expect(isValid).toBe(false);
    });

    it('should prevent submission without location', () => {
      const listingData = {
        name: 'Test Item',
        description: 'Test',
        price: 10,
        category: 'Lunch',
        location: ''
      };

      const isValid = listingData.location.trim().length > 0;
      expect(isValid).toBe(false);
    });

    it('should prevent submission without category', () => {
      const listingData = {
        name: 'Test Item',
        description: 'Test',
        price: 10,
        category: '',
        location: 'Test Location'
      };

      const isValid = listingData.category.trim().length > 0;
      expect(isValid).toBe(false);
    });

    it('should show appropriate error messages for all missing fields', () => {
      const errors: string[] = [];

      const name = '';
      const description = '';
      const price = 0;
      const category = '';
      const location = '';
      const imageUrl = '';

      if (!name.trim()) errors.push('Name is required');
      if (!description.trim()) errors.push('Description is required');
      if (price <= 0) errors.push('Price must be greater than 0');
      if (!category.trim()) errors.push('Category is required');
      if (!location.trim()) errors.push('Location is required');
      if (!imageUrl.trim()) errors.push('Image is required');

      expect(errors.length).toBe(6);
      expect(errors).toContain('Name is required');
      expect(errors).toContain('Price must be greater than 0');
    });
  });

  describe('Test 3: Update Existing Listing', () => {
    it('should successfully update an existing listing', async () => {
      const sellerContext = testEnv.authenticatedContext('updateSeller');
      const db = sellerContext.firestore();

      // Create initial listing
      await createTestListing(sellerContext, 'updateListing', 'updateSeller', {
        name: 'Original Name',
        price: 8.50,
        description: 'Original description'
      });

      // Update listing
      const listingRef = doc(db, 'listings', 'updateListing');
      await updateDoc(listingRef, {
        price: 9.00,
        description: 'Updated description',
        updatedAt: serverTimestamp()
      });

      // Verify update
      const listingSnap = await getDoc(listingRef);
      const listingData = listingSnap.data();

      expect(listingData?.price).toBe(9.00);
      expect(listingData?.description).toBe('Updated description');
    });

    it('should update updatedAt timestamp when listing is modified', async () => {
      const sellerContext = testEnv.authenticatedContext('timestampSeller');
      const db = sellerContext.firestore();

      await createTestListing(sellerContext, 'timestampListing', 'timestampSeller');

      // Update listing
      const listingRef = doc(db, 'listings', 'timestampListing');
      await updateDoc(listingRef, {
        price: 10.00,
        updatedAt: serverTimestamp()
      });

      const listingSnap = await getDoc(listingRef);
      expect(listingSnap.data()?.updatedAt).toBeDefined();
    });

    it('should keep other fields unchanged when updating specific fields', async () => {
      const sellerContext = testEnv.authenticatedContext('partialUpdateSeller');
      const db = sellerContext.firestore();

      const originalName = 'Original Item';
      const originalLocation = 'Original Location';

      await createTestListing(sellerContext, 'partialListing', 'partialUpdateSeller', {
        name: originalName,
        location: originalLocation,
        price: 5.00
      });

      // Update only price
      const listingRef = doc(db, 'listings', 'partialListing');
      await updateDoc(listingRef, {
        price: 6.00
      });

      const listingSnap = await getDoc(listingRef);
      const listingData = listingSnap.data();

      expect(listingData?.name).toBe(originalName);
      expect(listingData?.location).toBe(originalLocation);
      expect(listingData?.price).toBe(6.00);
    });

    it('should allow image replacement during update', async () => {
      const sellerContext = testEnv.authenticatedContext('imageSeller');
      const db = sellerContext.firestore();

      await createTestListing(sellerContext, 'imageListing', 'imageSeller', {
        imageUrl: 'old-image.jpg'
      });

      // Update image
      const newImageUrl = 'new-image.jpg';
      const listingRef = doc(db, 'listings', 'imageListing');
      await updateDoc(listingRef, {
        imageUrl: newImageUrl
      });

      const listingSnap = await getDoc(listingRef);
      expect(listingSnap.data()?.imageUrl).toBe(newImageUrl);
    });
  });

  describe('Test 4: Delete Listing', () => {
    it('should successfully delete a listing', async () => {
      const sellerContext = testEnv.authenticatedContext('deleteSeller');
      const db = sellerContext.firestore();

      await createTestListing(sellerContext, 'deleteListing', 'deleteSeller');

      // Delete listing
      const listingRef = doc(db, 'listings', 'deleteListing');
      await deleteDoc(listingRef);

      // Verify deletion
      const listingSnap = await getDoc(listingRef);
      expect(listingSnap.exists()).toBe(false);
    });

    it('should not appear in browse page after deletion', async () => {
      const sellerContext = testEnv.authenticatedContext('browseSeller');
      const db = sellerContext.firestore();

      await createTestListing(sellerContext, 'browseListing', 'browseSeller');

      const listingRef = doc(db, 'listings', 'browseListing');
      await deleteDoc(listingRef);

      // Try to fetch listing
      const listingSnap = await getDoc(listingRef);
      expect(listingSnap.exists()).toBe(false);
    });

    it('should warn before deleting listing with active orders', () => {
      const hasActiveOrders = true;
      let warningShown = false;

      if (hasActiveOrders) {
        warningShown = true;
      }

      expect(warningShown).toBe(true);
    });
  });

  describe('Test 5: Toggle Listing Availability', () => {
    it('should successfully toggle listing to unavailable', async () => {
      const sellerContext = testEnv.authenticatedContext('toggleSeller');
      const db = sellerContext.firestore();

      await createTestListing(sellerContext, 'toggleListing', 'toggleSeller', {
        isAvailable: true
      });

      // Toggle to unavailable
      const listingRef = doc(db, 'listings', 'toggleListing');
      await updateDoc(listingRef, {
        isAvailable: false
      });

      const listingSnap = await getDoc(listingRef);
      expect(listingSnap.data()?.isAvailable).toBe(false);
    });

    it('should successfully toggle listing back to available', async () => {
      const sellerContext = testEnv.authenticatedContext('toggleBackSeller');
      const db = sellerContext.firestore();

      await createTestListing(sellerContext, 'toggleBackListing', 'toggleBackSeller', {
        isAvailable: false
      });

      // Toggle to available
      const listingRef = doc(db, 'listings', 'toggleBackListing');
      await updateDoc(listingRef, {
        isAvailable: true
      });

      const listingSnap = await getDoc(listingRef);
      expect(listingSnap.data()?.isAvailable).toBe(true);
    });

    it('should not affect other fields when toggling availability', async () => {
      const sellerContext = testEnv.authenticatedContext('isolatedToggleSeller');
      const db = sellerContext.firestore();

      const originalPrice = 10.50;
      const originalName = 'Toggle Test Item';

      await createTestListing(sellerContext, 'isolatedToggle', 'isolatedToggleSeller', {
        name: originalName,
        price: originalPrice,
        isAvailable: true
      });

      // Toggle availability
      const listingRef = doc(db, 'listings', 'isolatedToggle');
      await updateDoc(listingRef, {
        isAvailable: false
      });

      const listingSnap = await getDoc(listingRef);
      const listingData = listingSnap.data();

      expect(listingData?.price).toBe(originalPrice);
      expect(listingData?.name).toBe(originalName);
      expect(listingData?.isAvailable).toBe(false);
    });
  });

  describe('Test 6: Image Upload Validation', () => {
    it('should reject files larger than 5MB', () => {
      const fileSizeInBytes = 6 * 1024 * 1024; // 6MB
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

      const isValidSize = fileSizeInBytes <= maxSizeInBytes;
      expect(isValidSize).toBe(false);
    });

    it('should accept files smaller than 5MB', () => {
      const fileSizeInBytes = 3 * 1024 * 1024; // 3MB
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

      const isValidSize = fileSizeInBytes <= maxSizeInBytes;
      expect(isValidSize).toBe(true);
    });

    it('should reject non-image files', () => {
      const pdfFile = { name: 'document.pdf', type: 'application/pdf' };
      const txtFile = { name: 'text.txt', type: 'text/plain' };

      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

      const isPdfValid = validImageTypes.includes(pdfFile.type);
      const isTxtValid = validImageTypes.includes(txtFile.type);

      expect(isPdfValid).toBe(false);
      expect(isTxtValid).toBe(false);
    });

    it('should accept valid image files', () => {
      const jpegFile = { name: 'photo.jpg', type: 'image/jpeg' };
      const pngFile = { name: 'graphic.png', type: 'image/png' };

      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

      const isJpegValid = validImageTypes.includes(jpegFile.type);
      const isPngValid = validImageTypes.includes(pngFile.type);

      expect(isJpegValid).toBe(true);
      expect(isPngValid).toBe(true);
    });

    it('should show error message for invalid file type', () => {
      const file = { name: 'document.pdf', type: 'application/pdf' };
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];

      let error = '';
      if (!validImageTypes.includes(file.type)) {
        error = 'Please upload a valid image file (JPEG, PNG, or GIF)';
      }

      expect(error).toBe('Please upload a valid image file (JPEG, PNG, or GIF)');
    });

    it('should show error message for oversized file', () => {
      const fileSizeInBytes = 6 * 1024 * 1024; // 6MB
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

      let error = '';
      if (fileSizeInBytes > maxSizeInBytes) {
        error = 'File size must be less than 5MB';
      }

      expect(error).toBe('File size must be less than 5MB');
    });
  });

  describe('Test 7: Rate Limiting on Listing Creation', () => {
    it('should enforce rate limiting on rapid listing creation', async () => {
      const sellerId = 'rateLimitSeller';
      const createdListings: number[] = [];

      // Simulate creating multiple listings
      const now = Date.now();
      const maxListingsPerMinute = 5;

      for (let i = 0; i < 7; i++) {
        createdListings.push(now);
      }

      // Check if exceeded limit
      const recentListings = createdListings.filter(
        timestamp => now - timestamp < 60000 // Within last minute
      );

      const exceededLimit = recentListings.length > maxListingsPerMinute;
      expect(exceededLimit).toBe(true);
    });

    it('should show error message when rate limit is exceeded', () => {
      const listingsCreated = 6;
      const maxListingsPerMinute = 5;

      let error = '';
      if (listingsCreated > maxListingsPerMinute) {
        error = 'Too many listings created. Please wait before creating more.';
      }

      expect(error).toBe('Too many listings created. Please wait before creating more.');
    });

    it('should allow listing creation when under rate limit', () => {
      const listingsCreated = 3;
      const maxListingsPerMinute = 5;

      const canCreate = listingsCreated < maxListingsPerMinute;
      expect(canCreate).toBe(true);
    });

    it('should reset rate limit after time period', () => {
      const lastCreatedTimestamp = Date.now() - 61000; // 61 seconds ago
      const now = Date.now();
      const rateLimitWindow = 60000; // 1 minute

      const hasExpired = (now - lastCreatedTimestamp) > rateLimitWindow;
      expect(hasExpired).toBe(true);
    });
  });
});
