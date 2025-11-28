import { RulesTestContext } from '@firebase/rules-unit-testing';
import {
  createTestUser,
  createTestListing,
  createTestOrder,
  TestUser,
  TestListing,
  TestOrder
} from './testHelpers';

export interface SeedData {
  users: {
    buyer1: TestUser;
    buyer2: TestUser;
    seller1: TestUser;
    seller2: TestUser;
  };
  listings: {
    listing1: TestListing;
    listing2: TestListing;
    listing3: TestListing;
  };
  orders: {
    order1: TestOrder;
    order2: TestOrder;
  };
}

/**
 * Seed the database with test data
 * This creates a consistent set of test data that can be used across multiple tests
 */
export async function seedDatabase(context: RulesTestContext): Promise<SeedData> {
  // Create test users
  const buyer1 = await createTestUser(context, 'buyer1', {
    email: 'buyer1@hawk.illinoistech.edu',
    firstName: 'John',
    lastName: 'Buyer',
    studentId: 'A20111111'
  });

  const buyer2 = await createTestUser(context, 'buyer2', {
    email: 'buyer2@hawk.illinoistech.edu',
    firstName: 'Jane',
    lastName: 'Smith',
    studentId: 'A20222222'
  });

  const seller1 = await createTestUser(context, 'seller1', {
    email: 'seller1@hawk.illinoistech.edu',
    firstName: 'Bob',
    lastName: 'Seller',
    studentId: 'A20333333'
  });

  const seller2 = await createTestUser(context, 'seller2', {
    email: 'seller2@hawk.illinoistech.edu',
    firstName: 'Alice',
    lastName: 'Merchant',
    studentId: 'A20444444'
  });

  // Create test listings
  const listing1 = await createTestListing(context, 'listing1', 'seller1', {
    name: 'Homemade Ramen',
    description: 'Delicious homemade ramen with fresh ingredients',
    price: 8.50,
    category: 'Lunch',
    location: 'Cunningham Hall',
    sellerName: 'Bob Seller'
  });

  const listing2 = await createTestListing(context, 'listing2', 'seller1', {
    name: 'Pizza Slice',
    description: 'Fresh pizza slice',
    price: 5.00,
    category: 'Lunch',
    location: 'Cunningham Hall',
    sellerName: 'Bob Seller'
  });

  const listing3 = await createTestListing(context, 'listing3', 'seller2', {
    name: 'Bubble Tea',
    description: 'Taiwanese bubble tea',
    price: 6.00,
    category: 'Drinks',
    location: 'IIT Tower',
    sellerName: 'Alice Merchant'
  });

  // Create test orders
  const order1 = await createTestOrder(context, 'order1', 'buyer1', 'seller1', {
    buyerName: 'John Buyer',
    buyerEmail: 'buyer1@hawk.illinoistech.edu',
    sellerName: 'Bob Seller',
    items: [
      {
        listingId: 'listing1',
        name: 'Homemade Ramen',
        price: 8.50,
        quantity: 2
      }
    ],
    total: 17.00,
    status: 'pending',
    paymentMethod: 'cashApp',
    pickupTime: '2024-12-01 12:00 PM'
  });

  const order2 = await createTestOrder(context, 'order2', 'buyer2', 'seller2', {
    buyerName: 'Jane Smith',
    buyerEmail: 'buyer2@hawk.illinoistech.edu',
    sellerName: 'Alice Merchant',
    items: [
      {
        listingId: 'listing3',
        name: 'Bubble Tea',
        price: 6.00,
        quantity: 1
      }
    ],
    total: 6.00,
    status: 'completed',
    paymentMethod: 'venmo',
    pickupTime: '2024-12-01 02:00 PM'
  });

  return {
    users: { buyer1, buyer2, seller1, seller2 },
    listings: { listing1, listing2, listing3 },
    orders: { order1, order2 }
  };
}

/**
 * Seed minimal data for quick tests
 */
export async function seedMinimalData(context: RulesTestContext): Promise<{
  buyer: TestUser;
  seller: TestUser;
  listing: TestListing;
}> {
  const buyer = await createTestUser(context, 'testBuyer', {
    email: 'testbuyer@hawk.illinoistech.edu',
    firstName: 'Test',
    lastName: 'Buyer',
    studentId: 'A20999999'
  });

  const seller = await createTestUser(context, 'testSeller', {
    email: 'testseller@hawk.illinoistech.edu',
    firstName: 'Test',
    lastName: 'Seller',
    studentId: 'A20888888'
  });

  const listing = await createTestListing(context, 'testListing', 'testSeller', {
    name: 'Test Item',
    description: 'Test item for testing',
    price: 5.00,
    category: 'Lunch',
    location: 'Test Location',
    sellerName: 'Test Seller'
  });

  return { buyer, seller, listing };
}
