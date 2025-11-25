# Cloud Functions for Night Market

This directory contains Firebase Cloud Functions that handle automatic notifications for your Night Market app.

## What These Functions Do

### 1. `sendNewOrderNotification`
- **Trigger**: When a new order document is created in Firestore
- **Action**: Sends notification to the seller
- **Message**: "New Order! [Buyer Name] ordered [X] item(s) for $[Total]"

### 2. `sendOrderStatusNotification`
- **Trigger**: When an order's status field is updated
- **Action**: Sends notification to the buyer
- **Messages**:
  - `confirmed`: "Order Confirmed! Your order from [Seller] has been confirmed"
  - `ready`: "Order Ready! Your order from [Seller] is ready for pickup"
  - `completed`: "Order Completed - Thank you for your order from [Seller]!"
  - `cancelled`: "Order Cancelled - Your order from [Seller] has been cancelled"

### 3. `sendOrderCancelledNotification`
- **Trigger**: When buyer cancels an order
- **Action**: Sends notification to the seller
- **Message**: "Order Cancelled - [Buyer Name] cancelled their order"

### 4. `cleanupExpiredTokens`
- **Trigger**: Runs every 24 hours (scheduled)
- **Action**: Removes FCM tokens older than 60 days from Firestore
- **Purpose**: Keeps the database clean and prevents sending to invalid tokens

## Setup & Deployment

### Prerequisites

1. **Install Firebase CLI** (if not already installed):
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**:
```bash
firebase login
```

3. **Initialize Firebase** (if not already done):
```bash
firebase init
```

### Install Dependencies

```bash
cd functions
npm install
```

### Build the Functions

```bash
npm run build
```

### Deploy to Firebase

```bash
npm run deploy
```

Or deploy from the root directory:
```bash
firebase deploy --only functions
```

### Deploy Individual Functions

```bash
firebase deploy --only functions:sendNewOrderNotification
firebase deploy --only functions:sendOrderStatusNotification
```

## Testing Locally

### Run Functions Emulator

```bash
npm run serve
```

This starts the Firebase emulators for local testing.

## Monitoring & Logs

### View Logs in Console

```bash
npm run logs
```

Or view logs for a specific function:
```bash
firebase functions:log --only sendNewOrderNotification
```

### View Logs in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Functions** → **Logs**

## Cost Considerations

Firebase Cloud Functions pricing:
- **Free tier**: 2 million invocations/month
- **Paid tier**: $0.40 per million invocations after free tier

For this app:
- Typical usage: ~100-500 orders/day = 3,000-15,000 invocations/month
- Well within free tier limits

## Troubleshooting

### "Insufficient permissions" error
Make sure your Firebase project has Cloud Functions enabled and your account has appropriate permissions.

### Functions not triggering
1. Check Firestore rules allow the functions to read documents
2. Verify the collection/document paths match exactly
3. Check function logs for errors

### Notifications not sending
1. Verify FCM tokens are being saved to Firestore
2. Check that users have granted notification permissions
3. Ensure the `fcmToken` field exists in the user document

## Environment Variables

If you need to add environment variables:

```bash
firebase functions:config:set app.url="https://your-app-url.com"
```

Then access in code:
```typescript
const appUrl = functions.config().app.url;
```

## Updating Functions

After making changes to `src/index.ts`:

1. Build: `npm run build`
2. Deploy: `npm run deploy`

## Firebase Blaze Plan Required

**Note**: Cloud Functions require the Firebase **Blaze (Pay as you go)** plan. The free Spark plan does not support Cloud Functions.

To upgrade:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Upgrade** in the bottom left
4. Choose **Blaze** plan

Don't worry - you'll still get the free tier limits, and you can set budget alerts to avoid unexpected charges.
