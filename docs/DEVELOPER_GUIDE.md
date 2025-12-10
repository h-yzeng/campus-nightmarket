# Campus Nightmarket - Developer Guide

> **Last Updated**: December 9, 2025  
> **For**: New developers joining the project

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Folder Structure](#folder-structure)
4. [Key Concepts](#key-concepts)
5. [State Management](#state-management)
6. [Data Flow](#data-flow)
7. [Authentication Flow](#authentication-flow)
8. [Common Patterns](#common-patterns)
9. [Testing](#testing)
10. [Debugging Tips](#debugging-tips)

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore, Auth, Storage, and FCM enabled
- Environment variables configured (see `.env.example`)

### Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

---

## Architecture Overview

### Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS 4.1
- **Routing**: React Router 7.1
- **State Management**: Zustand (local state) + TanStack Query (server state)
- **Backend**: Firebase (Auth, Firestore, Storage, FCM)
- **Testing**: Jest + React Testing Library

### Design Principles

1. **Separation of Concerns**: Clear boundaries between UI, business logic, and data
2. **Type Safety**: Comprehensive TypeScript coverage
3. **Performance**: Code splitting, lazy loading, infinite scroll
4. **UX**: Optimistic updates, loading states, error handling
5. **Security**: Input validation, XSS prevention, Firebase security rules

---

## Folder Structure

```
src/
├── components/          # React components
│   ├── layout/         # Header, Footer, ErrorBoundary
│   ├── features/       # ListingCard, ReviewModal, NotificationBell
│   ├── common/         # Reusable UI components
│   ├── browse/         # Browse page components
│   ├── checkout/       # Checkout flow components
│   └── ...
├── hooks/              # Custom React hooks
│   ├── auth/          # useAuth, useFirebaseAuth, useRouteProtection
│   ├── features/      # useCart, useFavorites, useNotifications
│   ├── data/          # useOrderManagement, useFilteredListings
│   ├── queries/       # TanStack Query hooks (data fetching)
│   └── mutations/     # TanStack Query hooks (data updates)
├── pages/              # Page components (lazy loaded)
│   ├── auth/          # Login, Signup, ForgotPassword
│   ├── shared/        # Home, UserProfile, NotFound
│   ├── buyer/         # Browse, Cart, Checkout, Orders
│   └── seller/        # Dashboard, CreateListing, SellerOrders
├── routes/             # Route configuration
│   ├── index.tsx      # Main routes
│   ├── authRoutes.tsx # Auth routes (login, signup)
│   ├── buyerRoutes.tsx # Buyer routes (shopping)
│   └── sellerRoutes.tsx # Seller routes (selling)
├── services/           # External service integrations
│   ├── auth/          # Firebase Auth operations
│   ├── listings/      # Listing CRUD operations
│   ├── orders/        # Order management
│   ├── reviews/       # Review system
│   ├── favorites/     # Favorites management
│   ├── notifications/ # FCM push notifications
│   └── storage/       # Firebase Storage (images)
├── stores/             # Zustand state stores
│   ├── authStore.ts   # User authentication state
│   ├── cartStore.ts   # Shopping cart state
│   ├── notificationStore.ts # Notifications state
│   └── navigationStore.ts # Navigation/search state
├── types/              # TypeScript type definitions
│   ├── index.ts       # Core app types
│   └── firebase.ts    # Firebase-specific types
├── utils/              # Utility functions
│   ├── validation.ts  # Input validation
│   ├── queryKeys.ts   # TanStack Query key factory
│   ├── routeConfig.ts # Route type definitions
│   ├── logger.ts      # Logging utility
│   └── ...
├── config/             # Configuration files
│   └── firebase.ts    # Firebase initialization
└── constants/          # App constants
    ├── categories.ts  # Food categories
    └── locations.ts   # Campus locations
```

---

## Key Concepts

### 1. Buyer vs. Seller Mode

Users can switch between two modes:

- **Buyer Mode**: Browse listings, add to cart, place orders, submit reviews
- **Seller Mode**: Create listings, manage inventory, fulfill orders

**How it works:**

- Mode is stored in `navigationStore` (Zustand)
- Header changes based on mode (cart icon vs. dashboard link)
- Routes auto-switch mode based on URL (see `routeConfig.ts`)
- Some routes are mode-specific, others are shared

### 2. State Management Strategy

We use a **hybrid approach**:

| Data Type     | Tool           | Storage      | Reason                                  |
| ------------- | -------------- | ------------ | --------------------------------------- |
| User auth     | Zustand        | localStorage | Global access, persists across sessions |
| Cart          | Zustand        | localStorage | Survives page refresh, sync to Firebase |
| Notifications | Zustand        | localStorage | Offline support, quick access           |
| Listings      | TanStack Query | Memory cache | Server-driven, automatic revalidation   |
| Orders        | TanStack Query | Memory cache | Real-time updates, optimistic UI        |
| Reviews       | TanStack Query | Memory cache | Infrequent changes, cache invalidation  |

**Why not just Redux or just React Query?**

- Zustand: Better for client-only state (cart, UI preferences)
- TanStack Query: Better for server state (automatic caching, refetching, mutations)
- Using both gives us the best of both worlds

### 3. Data Fetching Patterns

We use **TanStack Query** for all server data:

```typescript
// Query (read data)
const { data, isLoading, error } = useQuery({
  queryKey: ['listings', filters],
  queryFn: () => getAllListings(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Mutation (write data)
const mutation = useMutation({
  mutationFn: (data) => createListing(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['listings'] });
  },
});
```

**Benefits:**

- Automatic caching and deduplication
- Background refetching
- Optimistic updates
- Loading/error states built-in
- Request cancellation
- Pagination support (infinite scroll)

### 4. Authentication Flow

```
1. User signs up/logs in
   ↓
2. Firebase Auth creates user
   ↓
3. Email verification sent
   ↓
4. useFirebaseAuth detects auth state change
   ↓
5. Fetch user profile from Firestore
   ↓
6. Convert Firebase profile to app profile
   ↓
7. Store in Zustand authStore
   ↓
8. Components read from store
```

**Key Files:**

- `services/auth/authService.ts` - Firebase Auth operations
- `hooks/auth/useFirebaseAuth.ts` - Auth state listener
- `hooks/auth/useAuth.ts` - Main auth hook (public API)
- `stores/authStore.ts` - Global auth state

### 5. Order Lifecycle

```
Cart → Checkout → Place Order → Pending → Confirmed → Ready → Completed
                                    ↓
                                Cancelled
```

**Statuses:**

- `pending`: Order created, waiting seller confirmation
- `confirmed`: Seller accepted, preparing food
- `ready`: Food ready for pickup
- `completed`: Order fulfilled
- `cancelled`: Order cancelled by buyer or seller

**Notifications:**

- Buyer notified on status changes (confirmed, ready, completed)
- Seller notified on new orders
- Uses Firebase Cloud Messaging (FCM)

---

## State Management

### Zustand Stores

#### authStore.ts

```typescript
{
  user: User | null,           // Firebase User object
  profileData: ProfileData,    // User profile (name, bio, etc.)
  setUser: (user) => void,
  setProfileData: (data) => void,
  clearAuth: () => void
}
```

#### cartStore.ts

```typescript
{
  cart: CartItem[],            // Shopping cart items
  addToCart: (item) => void,
  updateCartQuantity: (id, qty) => void,
  removeFromCart: (id) => void,
  clearCart: () => void,
  setCart: (cart) => void      // For cloud sync
}
```

#### notificationStore.ts

```typescript
{
  notifications: Notification[],
  unreadCount: number,
  handlers: { markAsRead, clearNotification, ... },
  permissionState: 'granted' | 'denied' | 'default',
  setNotifications: (notifications) => void
}
```

### TanStack Query Keys

Centralized in `utils/queryKeys.ts`:

```typescript
queryKeys = {
  listings: {
    all: ['listings'],
    list: (filters) => ['listings', 'list', filters],
    detail: (id) => ['listings', 'detail', id],
    seller: (sellerId) => ['listings', 'seller', sellerId],
  },
  orders: {
    all: ['orders'],
    buyer: (buyerId) => ['orders', 'buyer', buyerId],
    seller: (sellerId) => ['orders', 'seller', sellerId],
  },
  // ... more keys
};
```

**Why?**

- Type-safe keys
- Easier invalidation
- Prevents typos
- Better refactoring

---

## Data Flow

### Example: Placing an Order

```
1. User clicks "Checkout" in Cart page
   ↓
2. CartWrapper passes cart to Checkout component
   ↓
3. User selects payment method and pickup time
   ↓
4. Clicks "Place Order" button
   ↓
5. handlePlaceOrder called (from useOrderManagement)
   ↓
6. Rate limiting check (max 5 orders per minute)
   ↓
7. Group cart items by seller
   ↓
8. Create separate order for each seller
   ↓
9. useCreateOrderMutation sends data to Firestore
   ↓
10. On success:
    - Clear cart (Zustand + Firebase)
    - Invalidate order queries (TanStack Query)
    - Show success toast
    - Navigate to orders page
    ↓
11. Seller receives push notification (FCM)
```

### Example: Adding to Favorites

```
1. User clicks heart icon on listing
   ↓
2. toggleFavorite called (from useFavorites)
   ↓
3. Optimistic update: UI immediately toggles heart
   ↓
4. Mutation sent to Firestore in background
   ↓
5. If success: Show toast, keep UI change
   ↓
6. If error: Revert UI, show error toast
```

---

## Authentication Flow

### Signup Flow

```typescript
// 1. User fills signup form (Signup.tsx)
// 2. Form validation (client-side)
// 3. handleCreateProfile called

const handleCreateProfile = async (
  email, password, firstName, lastName, studentId
) => {
  // 4. Create Firebase Auth user
  const user = await signUp({ email, password, ... });

  // 5. Create Firestore profile
  await createUserProfile(user.uid, profileData);

  // 6. Send verification email
  await sendEmailVerification(user);

  // 7. Navigate to /verify-email
  navigate('/verify-email');
};
```

### Login Flow

```typescript
// 1. User enters email/password (Login.tsx)
// 2. Rate limiting check (max 5 attempts per minute)
// 3. handleLogin called

const handleLogin = async (email, password) => {
  // 4. Sign in with Firebase Auth
  const user = await signIn({ email, password });

  // 5. useFirebaseAuth detects auth state change
  // 6. Fetch user profile from Firestore
  const profile = await getUserProfile(user.uid);

  // 7. Update authStore
  setUser(user);
  setProfileData(profile);

  // 8. Navigate to /browse
  navigate('/browse');
};
```

### Email Verification

```typescript
// 1. User clicks link in verification email
// 2. Redirected to /verify-email with oobCode param
// 3. Firebase automatically verifies email
// 4. User clicks "Continue" button
// 5. Reload user to get emailVerified: true
await handleReloadUser();
// 6. Navigate to /browse
```

---

## Common Patterns

### 1. Route Wrapper Pattern

```typescript
// Used in all route files (buyerRoutes, sellerRoutes, etc.)

const BrowseWrapper = (props) => {
  // 1. Fetch data with hooks
  const { data, isLoading } = useListingsQuery();

  // 2. Get auth state
  const user = useAuthStore((state) => state.user);

  // 3. Render page with data
  return (
    <RequireAuth user={user} loading={isLoading}>
      <Browse
        listings={data?.listings}
        onAddToCart={props.addToCart}
        // ... other props
      />
    </RequireAuth>
  );
};
```

**Why?**

- Separates data fetching from UI rendering
- Handles loading/error states
- Makes pages easier to test (pure components)

### 2. Optimistic Updates

```typescript
// Used in mutations for instant UI feedback

const mutation = useMutation({
  mutationFn: updateFavorite,

  // Before mutation starts
  onMutate: async (newData) => {
    // 1. Cancel ongoing queries
    await queryClient.cancelQueries(['favorites']);

    // 2. Snapshot previous data
    const previous = queryClient.getQueryData(['favorites']);

    // 3. Optimistically update cache
    queryClient.setQueryData(['favorites'], newData);

    // 4. Return context for rollback
    return { previous };
  },

  // If mutation fails
  onError: (err, variables, context) => {
    // Rollback to previous data
    queryClient.setQueryData(['favorites'], context.previous);
  },

  // Always refetch after mutation
  onSettled: () => {
    queryClient.invalidateQueries(['favorites']);
  },
});
```

### 3. Infinite Scroll

```typescript
// Used for Browse page listings

const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
} = useInfiniteQuery({
  queryKey: ['listings', filters],
  queryFn: ({ pageParam = null }) =>
    getAllListings({ ...filters, startAfter: pageParam }),
  getNextPageParam: (lastPage) => lastPage.lastDoc,
});

// Flatten pages into single array
const listings = data?.pages.flatMap(page => page.listings) ?? [];

// Load more on scroll
<InfiniteScroll
  loadMore={fetchNextPage}
  hasMore={hasNextPage}
  loading={isFetchingNextPage}
>
  {listings.map(item => <ListingCard key={item.id} {...item} />)}
</InfiniteScroll>
```

---

## Testing

### Test Organization

```
tests/
├── components/      # Component tests
├── hooks/           # Hook tests
├── services/        # Service/API tests
├── utils/           # Utility function tests
├── security/        # Security feature tests
├── smoke/           # Smoke tests (quick sanity checks)
└── setup.ts         # Test configuration
```

### Testing Patterns

#### Component Testing

```typescript
// Example: ListingCard.test.tsx

import { render, screen } from '@testing-library/react';
import ListingCard from '../ListingCard';

// Mock hooks
jest.mock('../../hooks/features/useFavorites', () => ({
  useFavorites: () => ({
    isFavorited: () => false,
    toggleFavorite: jest.fn(),
  }),
}));

test('renders listing card with correct data', () => {
  render(<ListingCard item={mockListing} />);

  expect(screen.getByText(mockListing.name)).toBeInTheDocument();
  expect(screen.getByText(`$${mockListing.price}`)).toBeInTheDocument();
});
```

#### Hook Testing

```typescript
// Example: useAuth.test.ts

import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';

test('returns loading state initially', () => {
  const { result } = renderHook(() => useAuth());

  expect(result.current.loading).toBe(true);
  expect(result.current.user).toBeNull();
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- ListingCard.test.tsx

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

---

## Debugging Tips

### 1. Firebase Errors

**Problem**: Cryptic Firebase error codes

```
FirebaseError: Missing or insufficient permissions
```

**Solution**: Check Firestore security rules

```javascript
// firestore.rules
match /listings/{listingId} {
  allow read: if true;
  allow write: if request.auth != null &&
                  request.auth.uid == request.resource.data.sellerId;
}
```

### 2. Query Not Updating

**Problem**: Data not refreshing after mutation

**Solution**: Invalidate queries after mutation

```typescript
const mutation = useMutation({
  mutationFn: createListing,
  onSuccess: () => {
    // This is crucial!
    queryClient.invalidateQueries({ queryKey: ['listings'] });
  },
});
```

### 3. Cart Not Syncing

**Problem**: Cart empty after page refresh

**Solution**: Check Zustand persist middleware

```typescript
// cartStore.ts
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      /* ... */
    }),
    {
      name: 'cart-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### 4. Infinite Loop in useEffect

**Problem**: useEffect triggers repeatedly

**Solution**: Check dependency array

```typescript
// ❌ Bad - missing dependency
useEffect(() => {
  fetchData(userId);
}, []); // userId should be in deps

// ✅ Good
useEffect(() => {
  if (userId) {
    fetchData(userId);
  }
}, [userId]);
```

### 5. TypeScript Errors

**Problem**: Type errors in production build

**Solution**: Run type checking before build

```bash
# Check for type errors
npm run build

# Or use tsc directly
npx tsc --noEmit
```

### 6. Debugging Tools

**React DevTools**

- Inspect component tree
- View props and state
- Track re-renders

**TanStack Query DevTools**

- View all queries and their status
- See cache data
- Manually trigger refetch
- Already enabled in development mode

**Firebase Emulator**

```bash
# Run local Firebase emulators
firebase emulators:start
```

---

## Additional Resources

- [React Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Firebase Docs](https://firebase.google.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## Need Help?

1. Check existing code for similar patterns
2. Read inline comments (we've added lots!)
3. Check this guide
4. Ask the team on Slack/Discord
5. Open an issue on GitHub

---

**Happy Coding! 🚀**
