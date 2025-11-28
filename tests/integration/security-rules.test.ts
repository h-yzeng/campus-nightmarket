import { testEnv } from '../test-setup';
import {
  assertSucceeds,
  assertFails,
  RulesTestContext
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { createTestUser, createTestListing, createTestOrder, createTestReview } from '../helpers/testHelpers';

describe('Firestore Security Rules Tests', () => {

  describe('Test 1: Users Collection - Read Own Profile', () => {
    it('should allow authenticated user to read own profile', async () => {
      const userContext = testEnv.authenticatedContext('user123');
      const db = userContext.firestore();

      // Create user profile
      await createTestUser(userContext, 'user123');

      // User should be able to read own profile
      const profileRef = doc(db, 'users', 'user123');
      await assertSucceeds(getDoc(profileRef));
    });

    it('should allow authenticated user to read other profiles', async () => {
      const user1Context = testEnv.authenticatedContext('user123');
      const user2Context = testEnv.authenticatedContext('user456');

      // Create both users
      await createTestUser(user1Context, 'user123');
      await createTestUser(user2Context, 'user456');

      // User 123 tries to read user 456's profile
      const db1 = user1Context.firestore();
      const profile456Ref = doc(db1, 'users', 'user456');

      // This should succeed - authenticated users can view other profiles (for seller info)
      await assertSucceeds(getDoc(profile456Ref));
    });

    it('should prevent unauthenticated users from reading any profile', async () => {
      const authedContext = testEnv.authenticatedContext('user123');
      await createTestUser(authedContext, 'user123');

      const unauthedContext = testEnv.unauthenticatedContext();
      const db = unauthedContext.firestore();

      const profileRef = doc(db, 'users', 'user123');
      await assertFails(getDoc(profileRef));
    });
  });

  describe('Test 2: Users Collection - Write Own Profile', () => {
    it('should allow user to update own profile', async () => {
      const userContext = testEnv.authenticatedContext('user123');
      const db = userContext.firestore();

      await createTestUser(userContext, 'user123');

      const profileRef = doc(db, 'users', 'user123');
      await assertSucceeds(updateDoc(profileRef, { bio: 'New bio' }));
    });

    it('should prevent user from updating other user\'s profile', async () => {
      const user1Context = testEnv.authenticatedContext('user123');
      const user2Context = testEnv.authenticatedContext('user456');

      await createTestUser(user1Context, 'user123');
      await createTestUser(user2Context, 'user456');

      // User 123 tries to update user 456's profile
      const db1 = user1Context.firestore();
      const profile456Ref = doc(db1, 'users', 'user456');

      await assertFails(updateDoc(profile456Ref, { bio: 'Hacked bio' }));
    });

    it('should prevent user from changing their uid', async () => {
      const userContext = testEnv.authenticatedContext('user123');
      const db = userContext.firestore();

      await createTestUser(userContext, 'user123');

      const profileRef = doc(db, 'users', 'user123');

      // Trying to change uid should fail
      await assertFails(updateDoc(profileRef, { uid: 'different_id' }));
    });
  });

  describe('Test 3: Listings Collection - Create Only Own Listings', () => {
    it('should allow seller to create own listing', async () => {
      const sellerContext = testEnv.authenticatedContext('seller123');
      const db = sellerContext.firestore();

      const listingRef = doc(collection(db, 'listings'));
      const listingData = {
        sellerId: 'seller123',
        sellerName: 'Test Seller',
        name: 'Pizza',
        description: 'Delicious pizza',
        price: 10,
        category: 'Lunch',
        location: 'Cunningham Hall',
        imageUrl: 'test.jpg',
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await assertSucceeds(setDoc(listingRef, listingData));
    });

    it('should prevent seller from creating listing for another seller', async () => {
      const sellerContext = testEnv.authenticatedContext('seller123');
      const db = sellerContext.firestore();

      const listingRef = doc(collection(db, 'listings'));
      const listingData = {
        sellerId: 'seller456', // Different seller
        sellerName: 'Other Seller',
        name: 'Pizza',
        description: 'Delicious pizza',
        price: 10,
        category: 'Lunch',
        location: 'Cunningham Hall',
        imageUrl: 'test.jpg',
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await assertFails(setDoc(listingRef, listingData));
    });
  });

  describe('Test 4: Listings Collection - Read Permissions', () => {
    it('should allow authenticated users to read listings', async () => {
      const sellerContext = testEnv.authenticatedContext('seller123');
      const buyerContext = testEnv.authenticatedContext('buyer123');

      // Seller creates listing
      await createTestListing(sellerContext, 'listing1', 'seller123');

      // Buyer should be able to read it
      const db = buyerContext.firestore();
      const listingRef = doc(db, 'listings', 'listing1');

      await assertSucceeds(getDoc(listingRef));
    });

    it('should prevent unauthenticated users from reading listings', async () => {
      const sellerContext = testEnv.authenticatedContext('seller123');
      await createTestListing(sellerContext, 'listing1', 'seller123');

      const unauthedContext = testEnv.unauthenticatedContext();
      const db = unauthedContext.firestore();

      const listingRef = doc(db, 'listings', 'listing1');
      await assertFails(getDoc(listingRef));
    });

    it('should allow authenticated users to list all listings', async () => {
      const sellerContext = testEnv.authenticatedContext('seller123');
      await createTestListing(sellerContext, 'listing1', 'seller123');
      await createTestListing(sellerContext, 'listing2', 'seller123');

      const buyerContext = testEnv.authenticatedContext('buyer123');
      const db = buyerContext.firestore();

      const listingsRef = collection(db, 'listings');
      await assertSucceeds(getDocs(listingsRef));
    });
  });

  describe('Test 5: Listings Collection - Update Only Own Listings', () => {
    it('should allow seller to update own listing', async () => {
      const sellerContext = testEnv.authenticatedContext('seller123');
      const db = sellerContext.firestore();

      await createTestListing(sellerContext, 'listing1', 'seller123');

      const listingRef = doc(db, 'listings', 'listing1');
      await assertSucceeds(updateDoc(listingRef, { price: 12 }));
    });

    it('should prevent seller from updating another seller\'s listing', async () => {
      const seller1Context = testEnv.authenticatedContext('seller123');
      const seller2Context = testEnv.authenticatedContext('seller456');

      // Seller 1 creates listing
      await createTestListing(seller1Context, 'listing1', 'seller123');

      // Seller 2 tries to update it
      const db2 = seller2Context.firestore();
      const listingRef = doc(db2, 'listings', 'listing1');

      await assertFails(updateDoc(listingRef, { price: 12 }));
    });

    it('should prevent seller from changing sellerId on listing', async () => {
      const sellerContext = testEnv.authenticatedContext('seller123');
      const db = sellerContext.firestore();

      await createTestListing(sellerContext, 'listing1', 'seller123');

      const listingRef = doc(db, 'listings', 'listing1');
      await assertFails(updateDoc(listingRef, { sellerId: 'seller456' }));
    });
  });

  describe('Test 6: Orders Collection - Buyer Creates Order', () => {
    it('should allow buyer to create order for themselves', async () => {
      const buyerContext = testEnv.authenticatedContext('buyer123');
      const db = buyerContext.firestore();

      const orderRef = doc(collection(db, 'orders'));
      const orderData = {
        buyerId: 'buyer123',
        buyerName: 'Test Buyer',
        buyerEmail: 'buyer123@hawk.illinoistech.edu',
        sellerId: 'seller456',
        sellerName: 'Test Seller',
        items: [{ listingId: 'item1', name: 'Item', price: 10, quantity: 1 }],
        total: 10,
        status: 'pending',
        paymentMethod: 'cashApp',
        pickupTime: '12:00 PM',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await assertSucceeds(setDoc(orderRef, orderData));
    });

    it('should prevent buyer from creating order for another buyer', async () => {
      const buyerContext = testEnv.authenticatedContext('buyer123');
      const db = buyerContext.firestore();

      const orderRef = doc(collection(db, 'orders'));
      const orderData = {
        buyerId: 'buyer456', // Different buyer
        buyerName: 'Other Buyer',
        buyerEmail: 'buyer456@hawk.illinoistech.edu',
        sellerId: 'seller789',
        sellerName: 'Test Seller',
        items: [{ listingId: 'item1', name: 'Item', price: 10, quantity: 1 }],
        total: 10,
        status: 'pending',
        paymentMethod: 'venmo',
        pickupTime: '12:00 PM',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await assertFails(setDoc(orderRef, orderData));
    });
  });

  describe('Test 7: Orders Collection - Read Permissions', () => {
    it('should allow buyer to read own order', async () => {
      const buyerContext = testEnv.authenticatedContext('buyer123');
      const db = buyerContext.firestore();

      await createTestOrder(buyerContext, 'order1', 'buyer123', 'seller456');

      const orderRef = doc(db, 'orders', 'order1');
      await assertSucceeds(getDoc(orderRef));
    });

    it('should allow seller to read order they are selling', async () => {
      const buyerContext = testEnv.authenticatedContext('buyer123');
      const sellerContext = testEnv.authenticatedContext('seller456');

      // Buyer creates order
      await createTestOrder(buyerContext, 'order1', 'buyer123', 'seller456');

      // Seller should be able to read it
      const db = sellerContext.firestore();
      const orderRef = doc(db, 'orders', 'order1');

      await assertSucceeds(getDoc(orderRef));
    });

    it('should prevent other users from reading order', async () => {
      const buyerContext = testEnv.authenticatedContext('buyer123');
      const otherUserContext = testEnv.authenticatedContext('user789');

      // Buyer creates order
      await createTestOrder(buyerContext, 'order1', 'buyer123', 'seller456');

      // Other user tries to read it
      const db = otherUserContext.firestore();
      const orderRef = doc(db, 'orders', 'order1');

      await assertFails(getDoc(orderRef));
    });
  });

  describe('Test 8: Orders Collection - Status Updates', () => {
    it('should allow buyer to cancel own pending order', async () => {
      const buyerContext = testEnv.authenticatedContext('buyer123');
      const db = buyerContext.firestore();

      await createTestOrder(buyerContext, 'order1', 'buyer123', 'seller456', {
        status: 'pending'
      });

      const orderRef = doc(db, 'orders', 'order1');
      await assertSucceeds(updateDoc(orderRef, { status: 'cancelled' }));
    });

    it('should allow seller to update order status to in_progress', async () => {
      const buyerContext = testEnv.authenticatedContext('buyer123');
      const sellerContext = testEnv.authenticatedContext('seller456');

      await createTestOrder(buyerContext, 'order1', 'buyer123', 'seller456', {
        status: 'pending'
      });

      const db = sellerContext.firestore();
      const orderRef = doc(db, 'orders', 'order1');

      await assertSucceeds(updateDoc(orderRef, { status: 'in_progress' }));
    });

    it('should prevent buyer from changing order total', async () => {
      const buyerContext = testEnv.authenticatedContext('buyer123');
      const db = buyerContext.firestore();

      await createTestOrder(buyerContext, 'order1', 'buyer123', 'seller456', {
        total: 20
      });

      const orderRef = doc(db, 'orders', 'order1');
      await assertFails(updateDoc(orderRef, { total: 5 }));
    });

    it('should prevent changing buyerId or sellerId', async () => {
      const buyerContext = testEnv.authenticatedContext('buyer123');
      const db = buyerContext.firestore();

      await createTestOrder(buyerContext, 'order1', 'buyer123', 'seller456');

      const orderRef = doc(db, 'orders', 'order1');
      await assertFails(updateDoc(orderRef, { buyerId: 'different_buyer' }));
      await assertFails(updateDoc(orderRef, { sellerId: 'different_seller' }));
    });
  });

  describe('Test 9: Reviews Collection - Create Review', () => {
    it('should allow buyer to create review for own completed order', async () => {
      const buyerContext = testEnv.authenticatedContext('buyer123');
      const db = buyerContext.firestore();

      // Create completed order first
      await createTestOrder(buyerContext, 'order1', 'buyer123', 'seller456', {
        status: 'completed'
      });

      // Create review
      const reviewRef = doc(collection(db, 'reviews'));
      const reviewData = {
        buyerId: 'buyer123',
        sellerId: 'seller456',
        orderId: 'order1',
        rating: 5,
        comment: 'Great seller!',
        createdAt: new Date()
      };

      await assertSucceeds(setDoc(reviewRef, reviewData));
    });

    it('should prevent buyer from creating review for another buyer', async () => {
      const buyerContext = testEnv.authenticatedContext('buyer123');
      const db = buyerContext.firestore();

      const reviewRef = doc(collection(db, 'reviews'));
      const reviewData = {
        buyerId: 'buyer456', // Different buyer
        sellerId: 'seller789',
        orderId: 'order2',
        rating: 5,
        comment: 'Great seller!',
        createdAt: new Date()
      };

      await assertFails(setDoc(reviewRef, reviewData));
    });

    it('should allow reading reviews for a seller', async () => {
      const buyer1Context = testEnv.authenticatedContext('buyer123');
      const buyer2Context = testEnv.authenticatedContext('buyer456');

      // Create review
      await createTestReview(buyer1Context, 'review1', 'buyer123', 'seller789', 'order1');

      // Another buyer should be able to read it
      const db = buyer2Context.firestore();
      const reviewRef = doc(db, 'reviews', 'review1');

      await assertSucceeds(getDoc(reviewRef));
    });
  });

  describe('Test 10: Storage Rules - Image Upload', () => {
    it('should allow user to upload to their profile photo path', async () => {
      const userContext = testEnv.authenticatedContext('user123');
      const storage = userContext.storage();

      const imageData = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]); // PNG header
      const blob = new Blob([imageData], { type: 'image/png' });

      const storageRef = ref(storage, 'profilePhotos/user123/photo.jpg');
      await assertSucceeds(uploadBytes(storageRef, blob));
    });

    it('should prevent user from uploading to another user\'s profile path', async () => {
      const userContext = testEnv.authenticatedContext('user123');
      const storage = userContext.storage();

      const imageData = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
      const blob = new Blob([imageData], { type: 'image/png' });

      const storageRef = ref(storage, 'profilePhotos/user456/photo.jpg');
      await assertFails(uploadBytes(storageRef, blob));
    });

    it('should allow seller to upload listing image', async () => {
      const sellerContext = testEnv.authenticatedContext('seller123');
      const storage = sellerContext.storage();

      const imageData = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
      const blob = new Blob([imageData], { type: 'image/png' });

      const storageRef = ref(storage, 'listings/seller123/item.jpg');
      await assertSucceeds(uploadBytes(storageRef, blob));
    });

    it('should prevent seller from uploading to another seller\'s listing path', async () => {
      const sellerContext = testEnv.authenticatedContext('seller123');
      const storage = sellerContext.storage();

      const imageData = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
      const blob = new Blob([imageData], { type: 'image/png' });

      const storageRef = ref(storage, 'listings/seller456/item.jpg');
      await assertFails(uploadBytes(storageRef, blob));
    });

    it('should prevent unauthenticated users from uploading images', async () => {
      const unauthedContext = testEnv.unauthenticatedContext();
      const storage = unauthedContext.storage();

      const imageData = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
      const blob = new Blob([imageData], { type: 'image/png' });

      const storageRef = ref(storage, 'profilePhotos/anyuser/photo.jpg');
      await assertFails(uploadBytes(storageRef, blob));
    });
  });
});
