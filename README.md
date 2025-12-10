<div align="center">

# 🌙 Campus Night Market

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.6-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/tests-430%20passing-success)](https://github.com/h-yzeng/campus-nightmarket)
[![PWA](https://img.shields.io/badge/PWA-Ready-purple)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## A modern marketplace for late-night food exchange on campus

Buy, sell, and trade food with verified IIT students • Never go hungry during late-night study sessions

[Quick Start](#-quick-start) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Documentation](#-key-concepts)

</div>

---

## ✨ Quick Start

```bash
# Clone the repository
git clone https://github.com/h-yzeng/campus-nightmarket.git
cd campus-nightmarket

# Install dependencies
npm install

# Set up environment variables (see Installation section)
cp .env.local.example .env.local
# Edit .env.local with your Firebase config

# Start development server
npm run dev

# Run tests
npm test
```

## 🎯 Features

### For Buyers

- **Browse Listings**: Search and filter food items by category, location, and seller
- **Shopping Cart**: Add multiple items from different sellers
- **Favorites/Wishlist**: Save favorite listings for quick access later
- **Search History**: Auto-suggestions based on recent and popular searches
- **Order Management**: Track your orders from placement to completion with infinite scroll
- **Seller Ratings**: View ratings and reviews before purchasing
- **Real-time Notifications**: Get notified about order status updates with sound feedback
- **Review System**: Leave reviews for completed orders
- **Dynamic Page Titles**: SEO-optimized titles for each page

### For Sellers

- **Dashboard**: Overview of sales statistics and order status
- **Listing Management**: Create, edit, and manage food listings
- **Order Fulfillment**: Track and update order statuses
- **Payment Options**: Support Cash, CashApp, Venmo, and Zelle
- **Profile Management**: Set preferred locations and payment methods
- **Sales Analytics**: View earnings, purchase counts and ratings
- **Seller Onboarding**: Guided setup for new sellers

### Security & Authentication

- **Student Verification**: Email verification required (must be @illinoistech.edu addresses)
- **Secure Authentication**: Firebase Authentication with rate limiting
- **Auto-logout**: 10-minute inactivity timeout
- **Error Tracking**: Integrated Sentry for production monitoring (ready for re-enablement)
- **Push Notifications**: Real-time order updates via Firebase Cloud Messaging
- **Firestore Security Rules**: Granular access control for all collections including favorites

## 🛠 Tech Stack

### Frontend

- **React 19.2** - Modern React with concurrent features and React Compiler
- **TypeScript 5.9** - Type-safe development
- **Vite 7.2** - Lightning-fast build tool and dev server
- **TailwindCSS 4.1** - Utility-first styling with modern CSS
- **React Router 7.9** - Client-side routing with type-safe navigation
- **React Helmet Async** - Dynamic page titles and SEO optimization

### State Management & Data Fetching

- **TanStack Query 5.90** - Server state management with optimized caching and devtools
- **Zustand 5.0** - Lightweight client state management with persistence

### Backend Services

- **Firebase 12.6** - Complete backend infrastructure
  - **Authentication** - Secure user authentication with email verification
  - **Cloud Firestore** - Scalable NoSQL database with real-time sync
  - **Storage** - Image uploads with compression
  - **Cloud Messaging** - Push notifications via service worker
  - **Functions** - Serverless backend (optional)

### Developer Tools

- **ESLint 9** - Modern flat config linting
- **Prettier 3.7** - Opinionated code formatting with Tailwind plugin
- **Jest 29** - Unit and integration testing (430 tests passing)
- **React Testing Library** - Component testing best practices
- **Sentry** - Error tracking (ready for migration to @sentry/browser)
- **Sharp** - Server-side image processing for PWA icons

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Firebase account** (free tier works)
- **Git** for version control

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/h-yzeng/campus-nightmarket.git
cd campus-nightmarket
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Firebase

#### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Enable the following services:
   - **Authentication**: Enable Email/Password provider
   - **Firestore Database**: Start in production mode
   - **Storage**: Set up with default rules
   - **Cloud Messaging**: Enable for push notifications

#### Get Firebase Configuration

1. In Firebase Console, go to Project Settings > General
2. Scroll to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register your app (e.g., "Campus Night Market")
5. Copy the configuration values

#### Configure Environment Variables

1. Copy the example environment file:

   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and fill in your Firebase credentials:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

3. Get your VAPID key for push notifications:
   - Go to Project Settings > Cloud Messaging
   - Under "Web Push certificates", click "Generate key pair"
   - Copy the key and add it to `.env.local`:

     ```env
     VITE_FIREBASE_VAPID_KEY=your_vapid_key_here
     ```

4. (Optional) Set up Sentry for error tracking:
   - Create an account at [sentry.io](https://sentry.io/)
   - Create a new project
   - Copy the DSN and add it to `.env.local`:

     ```env
     VITE_SENTRY_DSN=your_sentry_dsn_here
     ```

### 4. Set up Firebase Security Rules

Deploy the Firestore and Storage rules:

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
firebase deploy --only firestore:indexes
```

### 5. Configure Email Whitelist (Development)

During development, you may want to bypass email verification for certain accounts. Edit `src/config/emailWhitelist.ts` to add email addresses.

## 💻 Development

### Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Run tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Code formatting and linting

```bash
# Format code
npm run format

# Check formatting
npm run format:check

# Lint code
npm run lint
```

## 📁 Project Structure

```bash
campus-nightmarket/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── common/         # Shared UI components (FavoriteButton, PageHead, etc.)
│   │   ├── browse/         # Browse page components (SearchSuggestions, FiltersPanel)
│   │   ├── checkout/       # Checkout flow components
│   │   ├── dashboard/      # Seller dashboard components
│   │   ├── onboarding/     # Seller onboarding modal (SellerOnboarding.tsx)
│   │   ├── orders/         # Order-related components
│   │   └── settings/       # Settings components (NotificationSoundSettings)
│   ├── config/             # Configuration files
│   │   ├── firebase.ts     # Firebase initialization
│   │   ├── sentry.tsx      # Sentry error tracking setup
│   │   └── emailWhitelist.ts # Development email whitelist
│   ├── constants/          # App-wide constants
│   │   ├── categories.ts   # Food categories
│   │   ├── locations.ts    # Campus pickup locations
│   │   └── index.ts        # Exported constants
│   ├── hooks/              # Custom React hooks
│   │   ├── mutations/      # TanStack Query mutations
│   │   ├── queries/        # TanStack Query queries (useInfiniteQuery for orders)
│   │   ├── useAuth.ts      # Authentication logic
│   │   ├── useCart.ts      # Shopping cart management
│   │   ├── useFavorites.ts # Favorites/wishlist management
│   │   ├── useSearchHistory.ts # Search history with localStorage
│   │   └── useNavigation.ts # Navigation helpers
│   ├── lib/                # Library code and utilities
│   │   ├── schemas/        # Zod validation schemas
│   │   └── toast.ts        # Toast notification helpers
│   ├── pages/              # Page components
│   │   ├── buyer/          # Buyer-specific pages (Browse, Cart, Favorites, Orders)
│   │   ├── seller/         # Seller-specific pages (Dashboard, Listings, Orders)
│   │   ├── Home.tsx        # Landing page with SEO
│   │   ├── Login.tsx       # Login page
│   │   └── Signup.tsx      # Registration page
│   ├── routes/             # React Router configuration
│   │   └── index.tsx       # Route definitions
│   ├── services/           # Business logic and API calls
│   │   ├── auth/           # Authentication services
│   │   ├── listings/       # Listing management
│   │   ├── orders/         # Order management (with pagination support)
│   │   ├── notifications/  # Push notifications with sound playback
│   │   ├── reviews/        # Review system
│   │   ├── favorites/      # Favorites/wishlist service
│   │   └── storage/        # Image upload/storage
│   ├── stores/             # Zustand state stores
│   │   ├── authStore.ts    # Auth state
│   │   ├── cartStore.ts    # Cart state
│   │   ├── navigationStore.ts # Navigation state
│   │   └── notificationStore.ts # Notifications state
│   ├── styles/             # Global styles
│   │   └── index.css       # Tailwind imports and global CSS
│   ├── types/              # TypeScript type definitions
│   │   ├── index.ts        # Main type exports
│   │   └── firebase.ts     # Firebase-specific types
│   ├── utils/              # Utility functions
│   │   ├── errorMessages.ts # User-friendly error messages
│   │   ├── logger.ts       # Console logging utility
│   │   ├── queryKeys.ts    # TanStack Query cache keys
│   │   ├── rateLimiter.ts  # Rate limiting logic
│   │   ├── routeConfig.ts  # Route protection config
│   │   ├── storage.ts      # LocalStorage helpers
│   │   ├── validation.ts   # Validation utilities
│   │   └── notificationSounds.ts # Sound playback for notifications
│   ├── App.tsx             # Root application component
│   └── main.tsx            # Application entry point
├── firebase/               # Firebase configuration
│   ├── firestore.rules     # Firestore security rules (includes favorites collection)
│   ├── firestore.indexes.json # Firestore indexes
│   └── storage.rules       # Storage security rules
├── scripts/                # Build and utility scripts
│   ├── generate-icons.js   # Generate PWA icons from SVG
│   └── generate-sounds.js  # Generate notification sound files
├── public/                 # Static assets
│   ├── icons/              # PWA icons (72px to 512px)
│   ├── sounds/             # Notification sound files (MP3)
│   ├── firebase-messaging-sw.js # Service worker for FCM
│   └── apple-touch-icon.png # iOS home screen icon
├── tests/                  # Test files
├── .env.local.example      # Example environment variables
├── firebase.json           # Firebase project configuration
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## 📚 Key Concepts

### State Management Architecture

This application uses a hybrid approach to state management:

- **TanStack Query (React Query)**: Manages all server state (listings, orders, reviews)
  - Automatic caching and background refetching
  - Optimistic updates for better UX
  - Configured with 2-minute stale time and 10-minute garbage collection

- **Zustand**: Manages UI state (cart, navigation, notifications)
  - Lightweight and performant
  - Persistent cart state using localStorage
  - Simple API for component consumption

### Route Protection & User Modes

Users can seamlessly switch between buyer and seller modes:

- **Buyer Mode**: Browse, purchase, and review food listings
- **Seller Mode**: List items, manage orders, and track sales
- **Seller Onboarding**: First-time sellers complete a one-time setup (phone, location, payment methods)
- **Auto-switching**: Mode syncs with route navigation automatically

### Caching Strategy

React Query is configured for optimal performance:

- **Stale Time**: 2 minutes (data considered fresh)
- **GC Time**: 10 minutes (unused data retained)
- **Refetch on Focus**: Disabled by default
- **Refetch on Reconnect**: Always for stale data
- **Infinite Queries**: Used for orders pagination (Load More pattern)
- **Optimistic Updates**: Favorites toggle with instant UI feedback

### Image Upload

Images are uploaded to Firebase Storage with the following flow:

1. File selected and validated (type, size)
2. Compressed on client-side if needed
3. Uploaded to `/listings/{userId}/{timestamp}-{filename}`
4. Download URL saved to Firestore document

### Order Flow

1. **Buyer adds items to cart** → Cart stored in Zustand + localStorage
2. **Buyer proceeds to checkout** → Orders grouped by seller
3. **Order placed** → Firestore document created, seller notified via FCM with sound
4. **Seller updates status** → `pending` → `confirmed` → `ready` → `completed`
5. **Buyer receives notifications** → Push notifications with customizable sounds
6. **Buyer can cancel** → Only when status is `pending` or `confirmed`
7. **Buyer leaves review** → After status is `completed`
8. **Orders paginated** → Infinite scroll with "Load More" button

### Seller Onboarding Flow

1. **User clicks "Switch to Seller"** → System checks if user has completed seller onboarding
2. **If not onboarded** → Modal appears requesting:
   - Phone number (for buyer contact)
   - Preferred pickup location
   - At least one payment method (CashApp, Venmo, or Zelle)
3. **Submit onboarding** → Profile updated with `isSeller: true`
4. **Auto-redirect to Seller Dashboard** → Ready to create first listing

### Favorites/Wishlist System

1. **Click heart icon** → Instantly toggle favorite status with optimistic updates
2. **Firestore sync** → Favorites stored in `/favorites` collection with security rules
3. **Access via menu** → "My Favorites" link in user dropdown (buyer mode only)
4. **View favorites page** → Grid of all saved listings with heart icons to unfavorite
5. **Cross-device sync** → Favorites persist across all logged-in devices

### Search & Discovery

1. **Search bar** → Type to search listings by name or description
2. **Auto-suggestions** → Recent searches (last 10) + popular searches dropdown
3. **Search history** → Stored in localStorage, with clear option
4. **Enter to search** → Saves query to history automatically
5. **Advanced filters** → Category, location, price range, availability, sorting

## 🔐 Environment Variables

| Variable                            | Description                          | Required      |
| ----------------------------------- | ------------------------------------ | ------------- |
| `VITE_FIREBASE_API_KEY`             | Firebase API key                     | Yes           |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Firebase Auth domain                 | Yes           |
| `VITE_FIREBASE_PROJECT_ID`          | Firebase project ID                  | Yes           |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Firebase Storage bucket              | Yes           |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID                        | Yes           |
| `VITE_FIREBASE_APP_ID`              | Firebase app ID                      | Yes           |
| `VITE_FIREBASE_MEASUREMENT_ID`      | Google Analytics ID                  | No            |
| `VITE_FIREBASE_VAPID_KEY`           | FCM VAPID key for push notifications | Yes           |
| `VITE_SENTRY_DSN`                   | Sentry DSN for error tracking        | No            |
| `VITE_RECAPTCHA_SITE_KEY`           | reCAPTCHA v3 site key                | No            |
| `VITE_APP_CHECK_DEBUG_TOKEN`        | Firebase App Check debug token       | No (Dev only) |

## 🔧 Common Issues & Troubleshooting

### Email verification not working

- Check Firebase Console > Authentication > Settings > Email verification template
- Ensure the action URL is correct
- Check spam folder

### Images not uploading

- Verify Firebase Storage is enabled
- Check storage rules in `firebase/storage.rules`
- Ensure file size is under 5MB

### Push notifications not working

- Service worker must be registered
- User must grant notification permission
- VAPID key must be correctly configured

### Rate limiting errors

- Development: Rate limits auto-clear on refresh
- Production: Wait for timeout period or implement Redis-based solution

## 🌐 Deployment

### Vercel (Current)

The project is currently deployed on Vercel with automatic deployments:

1. Push your code to GitHub
2. Vercel automatically builds and deploys from the `main` branch
3. Environment variables are configured in Vercel dashboard
4. Preview deployments are created for pull requests

**Production URL**: Automatically assigned by Vercel

**Environment Variables**: All `VITE_*` variables must be added in Vercel Project Settings → Environment Variables

### Manual Deployment

```bash
# Build for production
npm run build

# Preview the build locally
npm run preview
```

### Alternative: Firebase Hosting

You can also deploy to Firebase Hosting:

```bash
npm run build
firebase deploy --only hosting
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Support

For issues and questions:

- 🐛 [Open an issue on GitHub](https://github.com/h-yzeng/campus-nightmarket/issues)
- 📧 Contact: <hzeng9@illinoistech.edu>
- 📚 Check the [troubleshooting section](#-common-issues--troubleshooting)

## 🙏 Acknowledgments

- Built for **Illinois Institute of Technology** students
- Designed for campus food exchange and community building
- Powered by Firebase and modern React ecosystem

---

<div align="center">

### Quick Links

| Resource       | Link                                                                            |
| -------------- | ------------------------------------------------------------------------------- |
| 🏠 Repository  | [h-yzeng/campus-nightmarket](https://github.com/h-yzeng/campus-nightmarket)     |
| 📝 Issues      | [Report a bug](https://github.com/h-yzeng/campus-nightmarket/issues/new)        |
| 💬 Discussions | [GitHub Discussions](https://github.com/h-yzeng/campus-nightmarket/discussions) |
| 📧 Contact     | <hzeng9@illinoistech.edu>                                                       |

#### Made with ❤️ for IIT students
