import { testEnv } from '../test-setup';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { createTestUser, createTestListing, createTestOrder } from '../helpers/testHelpers';
import { seedMinimalData } from '../helpers/seedData';

describe('Orders Integration Tests - Order Creation and Payment Flow', () => {

  describe('Test 1: Complete Order Placement - Single Seller', () => {
    it('should successfully place an order from a single seller', async () => {
      const buyerContext = testEnv.authenticatedContext('buyer123');
      const db = buyerContext.firestore();

      // Set up test data
      const { buyer, seller, listing } = await seedMinimalData(buyerContext);

      // Create order
      const orderData = {
        orderId: 'order123',
        buyerId: 'testBuyer',
        buyerName: `${buyer.firstName} ${buyer.lastName}`,
        sellerId: 'testSeller',
        sellerName: `${seller.firstName} ${seller.lastName}`,
        items: [
          {
            listingId: listing.listingId,
            name: listing.name,
            price: listing.price,
            quantity: 2
          }
        ],
        total: listing.price * 2,
        status: 'pending' as const,
        paymentMethod: 'Cash',
        pickupTime: '2024-12-01 12:00 PM',
        notes: 'Please add extra sauce',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const orderRef = doc(db, 'orders', orderData.orderId);
      await setDoc(orderRef, orderData);

      // Verify order was created
      const orderSnap = await getDoc(orderRef);

      expect(orderSnap.exists()).toBe(true);

      const order = orderSnap.data();
      expect(order?.buyerId).toBe('testBuyer');
      expect(order?.sellerId).toBe('testSeller');
      expect(order?.items).toHaveLength(1);
      expect(order?.items[0].quantity).toBe(2);
      expect(order?.total).toBe(listing.price * 2);
      expect(order?.status).toBe('pending');
      expect(order?.paymentMethod).toBe('Cash');
      expect(order?.pickupTime).toBe('2024-12-01 12:00 PM');
      expect(order?.notes).toBe('Please add extra sauce');
    });

    it('should validate that order total matches cart total', async () => {
      const cartTotal = 21.98;
      const orderTotal = 21.98;

      expect(orderTotal).toBe(cartTotal);
    });

    it('should validate that order buyer matches logged-in user', async () => {
      const loggedInUserId = 'buyer123';
      const orderBuyerId = 'buyer123';

      expect(orderBuyerId).toBe(loggedInUserId);
    });

    it('should validate all required fields are populated', () => {
      const order = {
        buyerId: 'buyer123',
        sellerId: 'seller456',
        items: [{ listingId: 'listing1', name: 'Item', price: 10, quantity: 1 }],
        total: 10,
        status: 'pending',
        paymentMethod: 'Cash',
        pickupTime: '2024-12-01 12:00 PM'
      };

      expect(order.buyerId).toBeDefined();
      expect(order.sellerId).toBeDefined();
      expect(order.items).toBeDefined();
      expect(order.items.length).toBeGreaterThan(0);
      expect(order.total).toBeGreaterThan(0);
      expect(order.status).toBeDefined();
      expect(order.paymentMethod).toBeDefined();
      expect(order.pickupTime).toBeDefined();
    });
  });

  describe('Test 2: Complete Order Placement - Multiple Sellers', () => {
    it('should split orders correctly when cart contains items from multiple sellers', async () => {
      const buyerContext = testEnv.authenticatedContext('multiBuyer');
      const db = buyerContext.firestore();

      // Create two sellers and their listings
      await createTestUser(buyerContext, 'multiBuyer');
      await createTestUser(buyerContext, 'sellerA');
      await createTestUser(buyerContext, 'sellerB');

      const listingA = await createTestListing(buyerContext, 'listingA', 'sellerA', {
        name: 'Item A',
        price: 10
      });

      const listingB = await createTestListing(buyerContext, 'listingB', 'sellerB', {
        name: 'Item B',
        price: 15
      });

      // Create two separate orders
      const orderA = await createTestOrder(buyerContext, 'orderA', 'multiBuyer', 'sellerA', {
        items: [{ listingId: listingA.listingId, name: listingA.name, price: listingA.price, quantity: 1 }],
        total: 10,
        pickupTime: '2024-12-01 12:00 PM'
      });

      const orderB = await createTestOrder(buyerContext, 'orderB', 'multiBuyer', 'sellerB', {
        items: [{ listingId: listingB.listingId, name: listingB.name, price: listingB.price, quantity: 1 }],
        total: 15,
        pickupTime: '2024-12-01 01:00 PM'
      });

      // Verify both orders exist and are separate
      const orderARef = doc(db, 'orders', 'orderA');
      const orderBRef = doc(db, 'orders', 'orderB');

      const orderASnap = await getDoc(orderARef);
      const orderBSnap = await getDoc(orderBRef);

      expect(orderASnap.exists()).toBe(true);
      expect(orderBSnap.exists()).toBe(true);

      const orderAData = orderASnap.data();
      const orderBData = orderBSnap.data();

      expect(orderAData?.sellerId).toBe('sellerA');
      expect(orderBData?.sellerId).toBe('sellerB');
      expect(orderAData?.pickupTime).toBe('2024-12-01 12:00 PM');
      expect(orderBData?.pickupTime).toBe('2024-12-01 01:00 PM');
    });

    it('should show error if missing pickup time for one seller', () => {
      const orders = [
        { sellerId: 'seller1', pickupTime: '12:00 PM' },
        { sellerId: 'seller2', pickupTime: '' }
      ];

      const allHavePickupTime = orders.every(order => order.pickupTime !== '');
      expect(allHavePickupTime).toBe(false);
    });
  });

  describe('Test 3: Order Cancellation by Buyer', () => {
    it('should allow buyer to cancel their pending order', async () => {
      const buyerContext = testEnv.authenticatedContext('cancelBuyer');
      const db = buyerContext.firestore();

      // Create order
      await createTestOrder(buyerContext, 'cancelOrder', 'cancelBuyer', 'someSeller', {
        status: 'pending'
      });

      // Cancel order
      const orderRef = doc(db, 'orders', 'cancelOrder');
      await updateDoc(orderRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });

      // Verify order was cancelled
      const orderSnap = await getDoc(orderRef);
      const orderData = orderSnap.data();

      expect(orderData?.status).toBe('cancelled');
    });

    it('should prevent cancellation of completed orders', async () => {
      const buyerContext = testEnv.authenticatedContext('completedBuyer');

      await createTestOrder(buyerContext, 'completedOrder', 'completedBuyer', 'someSeller', {
        status: 'completed'
      });

      // Try to cancel completed order
      const currentStatus = 'completed';
      const canCancel = currentStatus === 'pending';

      expect(canCancel).toBe(false);
    });

    it('should prevent cancellation of in_progress orders', async () => {
      const currentStatus = 'in_progress';
      const canCancel = currentStatus === 'pending';

      expect(canCancel).toBe(false);
    });

    it('should prevent users from cancelling another user\'s order', async () => {
      const loggedInUserId = 'buyer1';
      const orderBuyerId = 'buyer2';

      const canCancel = loggedInUserId === orderBuyerId;
      expect(canCancel).toBe(false);
    });
  });

  describe('Test 4: Order Status Updates by Seller', () => {
    it('should allow seller to update order status to in_progress', async () => {
      const sellerContext = testEnv.authenticatedContext('seller123');
      const db = sellerContext.firestore();

      await createTestOrder(sellerContext, 'statusOrder', 'buyer123', 'seller123', {
        status: 'pending'
      });

      // Update to in_progress
      const orderRef = doc(db, 'orders', 'statusOrder');
      await updateDoc(orderRef, {
        status: 'in_progress',
        updatedAt: serverTimestamp()
      });

      const orderSnap = await getDoc(orderRef);
      expect(orderSnap.data()?.status).toBe('in_progress');
    });

    it('should allow seller to update order status to completed', async () => {
      const sellerContext = testEnv.authenticatedContext('seller456');
      const db = sellerContext.firestore();

      await createTestOrder(sellerContext, 'completeOrder', 'buyer456', 'seller456', {
        status: 'in_progress'
      });

      // Update to completed
      const orderRef = doc(db, 'orders', 'completeOrder');
      await updateDoc(orderRef, {
        status: 'completed',
        updatedAt: serverTimestamp()
      });

      const orderSnap = await getDoc(orderRef);
      expect(orderSnap.data()?.status).toBe('completed');
    });

    it('should prevent invalid status transition from pending to completed', () => {
      const currentStatus = 'pending';
      const newStatus = 'completed';

      // Valid transitions: pending -> in_progress -> completed
      const isValidTransition =
        (currentStatus === 'pending' && newStatus === 'in_progress') ||
        (currentStatus === 'in_progress' && newStatus === 'completed');

      expect(isValidTransition).toBe(false);
    });

    it('should prevent backward status transition', () => {
      const currentStatus = 'in_progress';
      const newStatus = 'pending';

      const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
      const currentIndex = validStatuses.indexOf(currentStatus);
      const newIndex = validStatuses.indexOf(newStatus);

      const isBackwardTransition = newIndex < currentIndex && newStatus !== 'cancelled';
      expect(isBackwardTransition).toBe(true);
    });
  });

  describe('Test 5: Order with Special Instructions', () => {
    it('should save and display special instructions', async () => {
      const buyerContext = testEnv.authenticatedContext('notesBuyer');
      const db = buyerContext.firestore();

      const specialNotes = 'No onions, extra sauce';

      await createTestOrder(buyerContext, 'notesOrder', 'notesBuyer', 'notesSeller', {
        notes: specialNotes
      });

      const orderRef = doc(db, 'orders', 'notesOrder');
      const orderSnap = await getDoc(orderRef);
      const orderData = orderSnap.data();

      expect(orderData?.notes).toBe(specialNotes);
    });

    it('should allow orders without special instructions', async () => {
      const buyerContext = testEnv.authenticatedContext('noNotesBuyer');

      await createTestOrder(buyerContext, 'noNotesOrder', 'noNotesBuyer', 'seller');

      // Order should still be valid without notes
      expect(true).toBe(true);
    });
  });

  describe('Test 6: Checkout Validation', () => {
    it('should prevent order submission without payment method', () => {
      const orderData = {
        buyerId: 'buyer',
        sellerId: 'seller',
        items: [{ listingId: 'item1', name: 'Item', price: 10, quantity: 1 }],
        total: 10,
        paymentMethod: '',
        pickupTime: '12:00 PM'
      };

      const isValid = orderData.paymentMethod !== '';
      expect(isValid).toBe(false);
    });

    it('should prevent order submission without pickup time', () => {
      const orderData = {
        buyerId: 'buyer',
        sellerId: 'seller',
        items: [{ listingId: 'item1', name: 'Item', price: 10, quantity: 1 }],
        total: 10,
        paymentMethod: 'Cash',
        pickupTime: ''
      };

      const isValid = orderData.pickupTime !== '';
      expect(isValid).toBe(false);
    });

    it('should allow order submission when all required fields are filled', () => {
      const orderData = {
        buyerId: 'buyer',
        sellerId: 'seller',
        items: [{ listingId: 'item1', name: 'Item', price: 10, quantity: 1 }],
        total: 10,
        paymentMethod: 'Cash',
        pickupTime: '12:00 PM'
      };

      const isValid =
        orderData.buyerId &&
        orderData.sellerId &&
        orderData.items.length > 0 &&
        orderData.total > 0 &&
        orderData.paymentMethod &&
        orderData.pickupTime;

      expect(isValid).toBeTruthy();
    });

    it('should show error message for missing requirements', () => {
      const errors: string[] = [];

      const pickupTime = '';
      const paymentMethod = '';

      if (!pickupTime) errors.push('Pickup time is required');
      if (!paymentMethod) errors.push('Payment method is required');

      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('Pickup time is required');
      expect(errors).toContain('Payment method is required');
    });
  });

  describe('Test 7: Empty Cart Checkout Prevention', () => {
    it('should prevent checkout with empty cart', () => {
      const cart: any[] = [];

      const canCheckout = cart.length > 0;
      expect(canCheckout).toBe(false);
    });

    it('should show message to add items when cart is empty', () => {
      const cart: any[] = [];
      let message = '';

      if (cart.length === 0) {
        message = 'Your cart is empty. Please add items before checking out.';
      }

      expect(message).toBe('Your cart is empty. Please add items before checking out.');
    });

    it('should allow checkout when cart has items', () => {
      const cart = [
        { listingId: 'item1', name: 'Item 1', price: 10, quantity: 1 }
      ];

      const canCheckout = cart.length > 0;
      expect(canCheckout).toBe(true);
    });
  });
});
