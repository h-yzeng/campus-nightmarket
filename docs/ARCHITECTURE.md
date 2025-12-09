# Campus Night Market - Architecture Documentation

## System Overview

Campus Night Market is a food marketplace application for Illinois Tech students, enabling sellers to list food items and buyers to browse, order, and review purchases.

## Technology Stack

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 7
- **Routing**: React Router v6
- **State Management**:
  - Zustand (client state: auth, cart, navigation)
  - React Query (server state: listings, orders, reviews)
- **UI Library**: shadcn/ui (Radix UI + Tailwind CSS)
- **Forms**: React Hook Form + Zod validation
- **Error Tracking**: Sentry

### Backend

- **Authentication**: Firebase Authentication (email/password)
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage (images)
- **Functions**: Cloud Functions for Firebase (Node.js 20, 2nd Gen)
- **Messaging**: Firebase Cloud Messaging (FCM)

### DevOps

- **Hosting**: Vercel (frontend), Firebase Hosting (fallback)
- **CI/CD**: GitHub Actions
- **Dependency Updates**: Dependabot

---

## Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│  ┌────────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  React Router  │  │    Zustand   │  │   React Query    │   │
│  │   (Routing)    │  │ (Client State)│ │  (Server State)  │   │
│  └────────────────┘  └──────────────┘  └──────────────────┘   │
│            │                  │                   │             │
│            └──────────────────┴───────────────────┘             │
│                              │                                  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                               │ HTTPS
                               │
┌──────────────────────────────┼──────────────────────────────────┐
│                       FIREBASE SERVICES                         │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                 Firebase Authentication                │    │
│  │  (Email verification, whitelisted @hawk.illinoistech)  │    │
│  └────────────────────────────────────────────────────────┘    │
│                              │                                  │
│  ┌───────────────┬───────────┴──────────┬──────────────────┐  │
│  │               │                      │                  │  │
│  │  Firestore    │   Cloud Functions    │  Firebase Storage│  │
│  │  (Database)   │   (Server Logic)     │    (Images)      │  │
│  │               │                      │                  │  │
│  │ Collections:  │  Functions:          │  Buckets:        │  │
│  │ • users       │  • checkLoginRate    │  • listing-      │  │
│  │ • listings    │    Limit             │    images/       │  │
│  │ • orders      │  • saveSecurityQs    │  • profile-      │  │
│  │ • reviews     │  • verifySecurityAns │    photos/       │  │
│  │ • rateLimits  │  • resetPasswordWith │                  │  │
│  │ • verification│    Verification      │                  │  │
│  │   Tokens      │  • getUserSecurityQs │                  │  │
│  │               │  • sendNewOrder      │                  │  │
│  │ Indexes:      │    Notification      │                  │  │
│  │ • 11 composite│  • sendOrderStatus   │                  │  │
│  │   indexes for │    Notification      │                  │  │
│  │   queries     │  • sendOrderCancelled│                  │  │
│  │               │    Notification      │                  │  │
│  │ Rules:        │  • validateImageUpload                  │  │
│  │ • Role-based  │  • cleanupExpired    │                  │  │
│  │   read/write  │    Tokens            │                  │  │
│  │ • Email       │                      │                  │  │
│  │   verified    │  Triggers:           │                  │  │
│  │   required    │  • Firestore events  │                  │  │
│  │               │  • Storage events    │                  │  │
│  │               │  • Scheduled jobs    │                  │  │
│  └───────────────┴──────────────────────┴──────────────────┘  │
│                              │                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │         Firebase Cloud Messaging (Push Notifs)         │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. User Authentication Flow

```text
User → Signup Form → Firebase Auth (create user)
                   → Firestore (create user doc with role)
                   → Send verification email
                   → Redirect to /verify-email

User → Login Form → Firebase Auth (sign in)
                 → Check email verified
                 → Fetch user profile from Firestore
                 → Update Zustand auth store
                 → Redirect based on role (buyer → /browse, seller → /seller/dashboard)
```

### 2. Listing Creation Flow (Seller)

```text
Seller → CreateListing Form → Validate with Zod schema
                            → Upload image to Firebase Storage
                            → Create listing doc in Firestore
                            → Firestore rules check:
                              - isEmailVerified()
                              - isSeller(userId)
                              - sellerId matches auth.uid
                            → Success → Navigate to /seller/listings
```

### 3. Order Placement Flow (Buyer)

```text
Buyer → Browse Listings → Add to Cart (Zustand)
                        → Checkout → Create order in Firestore
                        → Firestore rules check:
                          - isEmailVerified()
                          - buyerId matches auth.uid
                        → Cloud Function (onDocumentCreated) triggers
                        → Send FCM notification to seller
                        → Update listing purchaseCount
                        → Success → Navigate to /orders
```

### 4. Rate Limiting Flow

```text
Login Attempt → checkLoginRateLimit callable function
             → Firestore transaction on rateLimits/{identifier}
             → Check attempts within 1-hour window
             → If > 5 attempts: block for 15 minutes
             → Return allowed: true/false
             → Client displays error or proceeds
```

---

## Security Model

### Authentication Requirements

- All users must use `@hawk.illinoistech.edu` email
- Email verification required for all write operations
- Seller role stored in Firestore `users/{userId}.isSeller`

### Firestore Security Rules

```javascript
// Example: Listings collection
match /listings/{listingId} {
  // Public read for active listings, auth required for inactive
  allow read: if resource.data.isActive == true || isAuthenticated();

  // Only verified sellers can create
  allow create: if isEmailVerified()
                && isSeller(request.auth.uid)
                && request.resource.data.sellerId == request.auth.uid;

  // Only listing owner can update/delete
  allow update, delete: if isEmailVerified()
                         && resource.data.sellerId == request.auth.uid;
}
```

### Rate Limiting

- **Login/Signup**: 5 attempts per hour, 15-min block
- **Security Questions**: 10 attempts per hour, progressive blocking (5-30 min)
- Storage: Firestore `rateLimits` collection (survives cold starts)

### Input Validation

- Client-side: Zod schemas
- Server-side: Cloud Functions validate + sanitize
- File uploads: Type, size (5MB max), extension matching

---

## State Management

### Zustand Stores (Client State)

```typescript
authStore:
  - user: User | null
  - profileData: ProfileData | null
  - loading: boolean

cartStore:
  - cart: CartItem[]
  - addToCart, removeFromCart, clearCart

navigationStore:
  - userMode: 'buyer' | 'seller'
  - setUserMode

notificationStore:
  - fcmToken: string | null
  - notifications: Notification[]
```

### React Query (Server State)

```typescript
// Queries
useListingsQuery() → getAllListings()
useSellerListingsQuery(sellerId) → getListingsBySeller()
useOrdersQuery(buyerId) → getOrdersByBuyer()
useSellerOrdersQuery(sellerId) → getOrdersBySeller()
useReviewsQuery(sellerId) → getReviewsBySeller()

// Mutations
createListingMutation
updateListingMutation
createOrderMutation
updateOrderStatusMutation
createReviewMutation
```

---

## Deployment Architecture

### Frontend (Vercel)

- **Build**: `vite build` → `dist/`
- **Deploy**: Vercel auto-deploys from `main` branch
- **Environment Variables**: Managed in Vercel dashboard
  - `VITE_FIREBASE_*` (project config)
  - `VITE_SENTRY_DSN`
  - `VITE_RECAPTCHA_SITE_KEY`

### Backend (Firebase)

- **Functions**: `npm --prefix functions run build` → deploy
- **Firestore Rules**: `firebase deploy --only firestore:rules`
- **Firestore Indexes**: `firebase deploy --only firestore:indexes`
- **Storage Rules**: `firebase deploy --only storage`

### CI/CD Pipeline (GitHub Actions)

```yaml
on: push to main
  1. Checkout code
  2. Install dependencies
  3. Run ESLint
  4. Run Jest tests (including seller guard test)
  5. Build frontend
  6. Deploy to Vercel (auto)
  7. Deploy Firebase (manual: firebase deploy --only functions)
```

---

## Scaling Considerations

### Current Limits

- Firestore: 1 million read/write per day (free tier)
- Cloud Functions: 2 million invocations/month (free tier)
- Storage: 5GB free
- No min instances → cold starts on functions

### Recommended Optimizations

1. **Set min instances on critical functions** (checkLoginRateLimit, notifications)
2. **Enable CDN caching** for listing images
3. **Implement pagination** on all list views (already done for listings)
4. **Add database query caching** (Redis/Memorystore)
5. **Monitor bundle size** (current: 390KB Firebase core + 253KB Sentry)

---

## Monitoring & Observability

### Current Setup

- **Frontend**: Sentry error tracking
- **Backend**: Cloud Functions logs (console.firebase.google.com)
- **Database**: Firestore usage metrics

### Missing

- Structured logging with trace IDs
- Active alerting (e.g., PagerDuty)
- APM (Application Performance Monitoring)
- Custom dashboards for business metrics

---

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install
cd functions && npm install

# Run dev server (frontend)
npm run dev

# Test functions locally
cd functions
npm run build
firebase emulators:start --only functions

# Run tests
npm test
```

### Code Quality

- **Linting**: ESLint (flat config)
- **Formatting**: Prettier
- **Type Checking**: TypeScript strict mode
- **Pre-commit Hooks**: simple-git-hooks (lint + format)

### Git Workflow

1. Create feature branch from `main`
2. Implement changes
3. Run `npm test` locally
4. Push → GitHub Actions runs CI
5. Merge PR after CI passes
6. Deploy to production

---

## Key Design Decisions

### Why Zustand over Redux?

- Simpler API, less boilerplate
- Better TypeScript support
- Only need client state for auth, cart, navigation

### Why React Query?

- Automatic caching, refetching, background updates
- Separates server state from client state
- Built-in loading/error states

### Why Firebase?

- Rapid development with auth, database, storage, functions
- Real-time capabilities (not currently used but available)
- Free tier sufficient for MVP
- Easy integration with Vercel

### Why Vercel for Frontend?

- Zero-config deployments
- Edge network for fast global access
- Automatic HTTPS
- Preview deployments for PRs

---

## Future Enhancements

1. **Search & Filters**: Full-text search (Algolia or Meilisearch)
2. **Payment Integration**: Stripe for online payments
3. **Admin Panel**: Manage users, listings, orders
4. **Analytics Dashboard**: Sales, popular items, user growth
5. **Real-time Chat**: Buyer-seller messaging
6. **PWA Support**: Offline capability, install prompt
7. **Multi-language**: i18n for international students

---

## References

- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/rules-structure)
- [Cloud Functions Best Practices](https://firebase.google.com/docs/functions/best-practices)
- [React Query Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
