# Campus Night Market

A modern web application for late-night food exchange on campus, built specifically for IIT students. Buy, sell, and trade food with verified students - never go hungry during those late-night study sessions again.

## Features

### For Buyers

- **Browse Listings**: Search and filter food items by category, location, and seller
- **Shopping Cart**: Add multiple items from different sellers
- **Order Management**: Track your orders from placement to completion
- **Seller Ratings**: View ratings and reviews before purchasing
- **Real-time Notifications**: Get notified about order status updates
- **Review System**: Leave reviews for completed orders

### For Sellers

- **Dashboard**: Overview of sales statistics and order status
- **Listing Management**: Create, edit, and manage food listings
- **Order Fulfillment**: Track and update order statuses
- **Payment Options**: Support Cash, CashApp, Venmo, and Zelle
- **Profile Management**: Set preferred locations and payment methods
- **Sales Analytics**: View earnings, purchase counts and ratings

### Security & Authentication

- **Student Verification**: Email verification required (must be @illinoistech.edu addresses)
- **Secure Authentication**: Firebase Authentication with rate limiting
- **Auto-logout**: 10-minute inactivity timeout
- **Error Tracking**: Integrated Sentry for production monitoring
- **Push Notifications**: Real-time order updates via Firebase Cloud Messaging

## Tech Stack

### Frontend

- **React 19.2** - Modern React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **TailwindCSS 4** - Utility-first styling
- **React Router 7** - Client-side routing

### State Management & Data Fetching

- **TanStack Query (React Query)** - Server state management with optimized caching
- **Zustand** - Lightweight client state management

### Backend Services

- **Firebase Authentication** - User authentication
- **Cloud Firestore** - NoSQL database
- **Firebase Storage** - Image uploads
- **Firebase Cloud Messaging** - Push notifications
- **Firebase Functions** - Serverless backend (optional)

### Developer Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Unit testing
- **React Testing Library** - Component testing
- **Sentry** - Error tracking and monitoring

## Prerequisites

- **Node.js** 18+ and npm
- **Firebase account** (free tier works)
- **Git** for version control

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/campus-nightmarket.git
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
```

### 5. Configure Email Whitelist (Development)

During development, you may want to bypass email verification for certain accounts. Edit `src/config/emailWhitelist.ts` to add email addresses.

## Development

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

## Firebase Emulator (Optional)

For local development without using live Firebase services:

1. Install Firebase CLI:

   ```bash
   npm install -g firebase-tools
   ```

2. Start emulators:

   ```bash
   firebase emulators:start
   ```

3. Update `src/config/firebase.ts` to use emulator endpoints when in development mode

## Project Structure

```bash
campus-nightmarket/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── common/         # Shared UI components (LoadingState, ErrorAlert, etc.)
│   │   ├── browse/         # Browse page components
│   │   ├── checkout/       # Checkout flow components
│   │   ├── dashboard/      # Seller dashboard components
│   │   ├── onboarding/     # First-time user guide
│   │   └── orders/         # Order-related components
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
│   │   ├── queries/        # TanStack Query queries
│   │   ├── useAuth.ts      # Authentication logic
│   │   ├── useCart.ts      # Shopping cart management
│   │   └── useNavigation.ts # Navigation helpers
│   ├── lib/                # Library code and utilities
│   │   ├── schemas/        # Zod validation schemas
│   │   └── toast.ts        # Toast notification helpers
│   ├── pages/              # Page components
│   │   ├── buyer/          # Buyer-specific pages
│   │   ├── seller/         # Seller-specific pages
│   │   ├── Home.tsx        # Landing page
│   │   ├── Login.tsx       # Login page
│   │   └── Signup.tsx      # Registration page
│   ├── routes/             # React Router configuration
│   │   └── index.tsx       # Route definitions
│   ├── services/           # Business logic and API calls
│   │   ├── auth/           # Authentication services
│   │   ├── listings/       # Listing management
│   │   ├── orders/         # Order management
│   │   ├── notifications/  # Push notifications
│   │   ├── reviews/        # Review system
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
│   │   └── validation.ts   # Validation utilities
│   ├── App.tsx             # Root application component
│   └── main.tsx            # Application entry point
├── firebase/               # Firebase configuration
│   ├── firestore.rules     # Firestore security rules
│   ├── firestore.indexes.json # Firestore indexes
│   └── storage.rules       # Storage security rules
├── public/                 # Static assets
│   └── firebase-messaging-sw.js # Service worker for FCM
├── tests/                  # Test files
├── .env.local.example      # Example environment variables
├── firebase.json           # Firebase project configuration
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## Key Concepts

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

### Route Protection

Routes are automatically protected based on user mode (buyer/seller):

- Buyer routes require buyer mode
- Seller routes require seller mode and `isSeller: true` in profile
- Auto-switching prevents manual URL manipulation

### Caching Strategy

React Query is configured for optimal performance:

- **Stale Time**: 2 minutes (data considered fresh)
- **GC Time**: 10 minutes (unused data retained)
- **Refetch on Focus**: Disabled by default
- **Refetch on Reconnect**: Always for stale data

### Image Upload

Images are uploaded to Firebase Storage with the following flow:

1. File selected and validated (type, size)
2. Compressed on client-side if needed
3. Uploaded to `/listings/{userId}/{timestamp}-{filename}`
4. Download URL saved to Firestore document

### Order Flow

1. **Buyer adds items to cart** → Cart stored in Zustand + localStorage
2. **Buyer proceeds to checkout** → Orders grouped by seller
3. **Order placed** → Firestore document created, seller notified
4. **Seller updates status** → `pending` → `confirmed` → `ready` → `completed`
5. **Buyer can cancel** → Only when status is `pending` or `confirmed`
6. **Buyer leaves review** → After status is `completed`

## Environment Variables

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

## Common Issues & Troubleshooting

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

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:

- Open an issue on GitHub
- Contact the development team at [hzeng9@illinoistech.edu]

## Acknowledgments

- Built for Illinois Institute of Technology students
- Designed for campus food exchange and community building
- Powered by Firebase and modern React ecosystem
