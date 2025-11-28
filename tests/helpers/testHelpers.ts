import { RulesTestContext } from '@firebase/rules-unit-testing';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';

export interface TestUser {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  studentId: string;
  securityQuestions: Array<{
    question: string;
    answer: string;
  }>;
  createdAt: any;
}

export interface TestListing {
  listingId: string;
  sellerId: string;
  sellerName: string;
  name: string;
  description: string;
  price: number;
  category: string;
  location: string;
  imageUrl: string;
  isAvailable: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface TestOrder {
  orderId: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  sellerId: string;
  sellerName: string;
  items: Array<{
    listingId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  paymentMethod: 'cashApp' | 'venmo' | 'zelle';
  pickupTime: string;
  notes?: string;
  createdAt: any;
  updatedAt: any;
}

export interface TestReview {
  reviewId: string;
  buyerId: string;
  sellerId: string;
  orderId: string;
  rating: number;
  comment?: string;
  createdAt: any;
}

/**
 * Create a test user in Firestore
 */
export async function createTestUser(
  context: RulesTestContext,
  userId: string,
  userData?: Partial<TestUser>
): Promise<TestUser> {
  const db = context.firestore();

  const defaultUser: TestUser = {
    uid: userId,
    email: `${userId}@hawk.illinoistech.edu`,
    firstName: 'Test',
    lastName: 'User',
    studentId: `A20${Math.floor(100000 + Math.random() * 900000)}`,
    securityQuestions: [
      { question: 'What is your favorite color?', answer: 'Blue' },
      { question: 'What is your pet name?', answer: 'Fluffy' }
    ],
    createdAt: serverTimestamp(),
    ...userData
  };

  await setDoc(doc(db, 'users', userId), defaultUser);
  return defaultUser;
}

/**
 * Create a test listing in Firestore
 */
export async function createTestListing(
  context: RulesTestContext,
  listingId: string,
  sellerId: string,
  listingData?: Partial<TestListing>
): Promise<TestListing> {
  const db = context.firestore();

  const defaultListing: TestListing = {
    listingId,
    sellerId,
    sellerName: 'Test Seller',
    name: 'Test Listing',
    description: 'Test description',
    price: 10.99,
    category: 'Lunch',
    location: 'Cunningham Hall',
    imageUrl: 'https://example.com/test.jpg',
    isAvailable: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...listingData
  };

  await setDoc(doc(db, 'listings', listingId), defaultListing);
  return defaultListing;
}

/**
 * Create a test order in Firestore
 */
export async function createTestOrder(
  context: RulesTestContext,
  orderId: string,
  buyerId: string,
  sellerId: string,
  orderData?: Partial<TestOrder>
): Promise<TestOrder> {
  const db = context.firestore();

  const defaultOrder: TestOrder = {
    orderId,
    buyerId,
    buyerName: 'Test Buyer',
    buyerEmail: `${buyerId}@hawk.illinoistech.edu`,
    sellerId,
    sellerName: 'Test Seller',
    items: [
      {
        listingId: 'listing1',
        name: 'Test Item',
        price: 10.99,
        quantity: 1
      }
    ],
    total: 10.99,
    status: 'pending',
    paymentMethod: 'cashApp',
    pickupTime: '2024-12-01 12:00 PM',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...orderData
  };

  await setDoc(doc(db, 'orders', orderId), defaultOrder);
  return defaultOrder;
}

/**
 * Create a test review in Firestore
 */
export async function createTestReview(
  context: RulesTestContext,
  reviewId: string,
  buyerId: string,
  sellerId: string,
  orderId: string,
  reviewData?: Partial<TestReview>
): Promise<TestReview> {
  const db = context.firestore();

  const defaultReview: TestReview = {
    reviewId,
    buyerId,
    sellerId,
    orderId,
    rating: 5,
    comment: 'Great seller!',
    createdAt: serverTimestamp(),
    ...reviewData
  };

  await setDoc(doc(db, 'reviews', reviewId), defaultReview);
  return defaultReview;
}

/**
 * Upload a test image to Firebase Storage
 */
export async function uploadTestImage(
  context: RulesTestContext,
  path: string,
  fileName: string = 'test.jpg'
): Promise<string> {
  const storage = context.storage();

  // Create a fake image blob
  const imageData = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]); // PNG header
  const blob = new Blob([imageData], { type: 'image/png' });

  const storageRef = ref(storage, `${path}/${fileName}`);
  await uploadBytes(storageRef, blob);

  return `${path}/${fileName}`;
}

/**
 * Helper to assert that a promise fails
 */
export async function expectToFail(promise: Promise<any>): Promise<void> {
  try {
    await promise;
    throw new Error('Expected promise to fail but it succeeded');
  } catch (error) {
    // Expected to fail
    if (error instanceof Error && error.message.includes('Expected promise to fail')) {
      throw error;
    }
  }
}

/**
 * Helper to assert that a promise succeeds
 */
export async function expectToSucceed(promise: Promise<any>): Promise<void> {
  try {
    await promise;
  } catch (error) {
    throw new Error(`Expected promise to succeed but it failed: ${error}`);
  }
}

/**
 * Generate a valid student ID
 */
export function generateStudentId(): string {
  return `A20${Math.floor(100000 + Math.random() * 900000)}`;
}

/**
 * Generate a valid IIT email
 */
export function generateIITEmail(name: string = 'test'): string {
  return `${name}${Math.floor(Math.random() * 10000)}@hawk.illinoistech.edu`;
}

/**
 * Wait for a specified time
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Clean up all collections in Firestore
 */
export async function cleanupFirestore(context: RulesTestContext): Promise<void> {
  const db = context.firestore();
  const collections = ['users', 'listings', 'orders', 'reviews'];

  // Note: In emulator, you can use clearFirestore() from test environment
  // This is just a helper for additional cleanup if needed
}
