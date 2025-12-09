# Cloud Functions API Documentation

This document describes the callable Cloud Functions available in the Campus Night Market application.

---

## Authentication & Rate Limiting

### `checkLoginRateLimit`

**Purpose**: Server-side rate limiting for login/signup attempts to prevent brute force attacks.

**Trigger**: HTTPS Callable (called from client before login/signup)

**Parameters**:

```typescript
{
  identifier?: string; // Optional identifier (email, IP). Falls back to auth.uid or IP
}
```

**Returns**:

```typescript
{
  allowed: boolean;
}
```

**Throws**:

- `resource-exhausted`: Too many attempts (>5 in 1 hour), blocked for 15 minutes

**Implementation**:

- Uses Firestore transaction on `rateLimits/login_{identifier}` collection
- Tracks attempts within 1-hour rolling window
- Persists across function cold starts

**Example Usage**:

```typescript
const { data } = await checkLoginRateLimit({ identifier: email });
if (!data.allowed) {
  // Show error, prevent login
}
```

---

## Security Questions

### `saveSecurityQuestions`

**Purpose**: Save user's security questions with bcrypt-hashed answers for password reset.

**Trigger**: HTTPS Callable

**Authentication**: Required (authenticated user can only update their own questions)

**Parameters**:

```typescript
{
  userId: string;
  questions: Array<{
    question: string;
    answer: string; // Plain text (will be hashed server-side)
  }>;
}
```

**Returns**:

```typescript
{
  success: boolean;
  message: string;
}
```

**Throws**:

- `Authentication required`: User not authenticated
- `Unauthorized`: User trying to update another user's questions
- `Invalid input`: Missing or malformed data
- `Exactly 3 security questions required`: Wrong number of questions

**Security**:

- Answers hashed with bcrypt (12 rounds)
- Normalized to lowercase + trimmed before hashing
- Stored in Firestore `users/{userId}.securityQuestions`

---

### `getUserSecurityQuestions`

**Purpose**: Retrieve a user's security questions (without answers) for password reset flow.

**Trigger**: HTTPS Callable

**Authentication**: Not required (App Check disabled to allow unauthenticated password reset)

**Parameters**:

```typescript
{
  email: string; // Must end with @hawk.illinoistech.edu
}
```

**Returns**:

```typescript
{
  questions: string[]; // Array of question strings (no answers)
}
```

**Throws**:

- `Email required`
- `Email must be a valid @hawk.illinoistech.edu address`
- `User not found`

**Rate Limiting**: None (consider adding)

---

### `verifySecurityAnswers`

**Purpose**: Verify user's answers to security questions and issue a verification token for password reset.

**Trigger**: HTTPS Callable

**Authentication**: Not required (App Check disabled)

**Parameters**:

```typescript
{
  email: string;
  answers: Array<{
    question: string;
    answer: string; // Plain text
  }>;
}
```

**Returns**:

```typescript
{
  verified: boolean;
  token: string; // Short-lived token (10 min expiry)
  userId: string;
  message: string;
}
```

**Throws**:

- `Invalid input`
- `User not found`
- `No security questions set for this account`
- `Security answers incorrect`
- `Too many verification attempts` (rate limited)

**Rate Limiting**:

- In-memory store (resets on cold start)
- 10 attempts per hour
- Progressive blocking: 5/10/15/30 min based on attempt count

**Security**:

- Uses bcrypt.compare() with multiple normalization strategies
- Token stored in Firestore `verificationTokens/{token}` with 10-min expiry
- Token deleted after successful password reset

---

### `resetPasswordWithVerification`

**Purpose**: Reset user's password after successful security question verification.

**Trigger**: HTTPS Callable

**Authentication**: Not required (App Check disabled)

**Parameters**:

```typescript
{
  email: string;
  newPassword: string; // Must be 12+ chars with upper/lower/number/special
  token: string; // From verifySecurityAnswers
}
```

**Returns**:

```typescript
{
  success: boolean;
  message: string;
}
```

**Throws**:

- `Missing required fields`
- `Email must be a valid @hawk.illinoistech.edu address`
- `Password must be at least 12 characters long`
- `Password must contain uppercase, lowercase, number, and special character`
- `Invalid or expired verification token`
- `Email does not match verification token`
- `Verification token has expired` (>10 min old)
- `User ID mismatch`
- `Failed to reset password`

**Security**:

- Password strength validated before update
- Token verified for email match and expiry
- Token deleted after successful reset
- Uses Firebase Admin SDK to update password

---

## Notifications

### `sendNewOrderNotification`

**Purpose**: Send FCM push notification to seller when new order is placed.

**Trigger**: Firestore `onCreate` → `orders/{orderId}`

**Parameters**: None (triggered automatically)

**Behavior**:

1. Read seller's FCM token from `users/{sellerId}.fcmToken`
2. Calculate total items in order
3. Send notification via Firebase Cloud Messaging
4. Notification includes order ID, buyer name, total amount
5. Deep link to `/seller/orders` on click

**Error Handling**: Logs error but doesn't fail order creation

---

### `sendOrderStatusNotification`

**Purpose**: Send FCM notification to buyer when order status changes.

**Trigger**: Firestore `onUpdate` → `orders/{orderId}` (when status field changes)

**Parameters**: None (triggered automatically)

**Status Messages**:

- `confirmed`: "Your order from {sellerName} has been confirmed"
- `ready`: "Your order from {sellerName} is ready for pickup"
- `completed`: "Thank you for your order from {sellerName}!"
- `cancelled`: "Your order from {sellerName} has been cancelled"

**Behavior**:

1. Check if status actually changed (avoid duplicate notifications)
2. Read buyer's FCM token from `users/{buyerId}.fcmToken`
3. Send notification with appropriate title/body
4. Deep link to `/orders/{orderId}` on click

---

### `sendOrderCancelledNotification`

**Purpose**: Send FCM notification to seller when buyer cancels order.

**Trigger**: Firestore `onUpdate` → `orders/{orderId}` (when status → cancelled)

**Parameters**: None (triggered automatically)

**Behavior**:

1. Only triggers if previous status was NOT cancelled
2. Read seller's FCM token
3. Send notification: "{buyerName} cancelled their order"
4. Deep link to `/seller/orders`

---

## Storage & Cleanup

### `validateImageUpload`

**Purpose**: Validate uploaded images for security and delete invalid files.

**Trigger**: Storage `onObjectFinalized` → any file upload

**Parameters**: None (triggered automatically)

**Validated Paths**:

- `profile-photos/*`
- `listing-images/*`

**Validations**:

1. **Content Type**: Only `image/jpeg`, `image/png`, `image/webp`, `image/gif`
2. **File Size**: Max 5MB
3. **Extension Match**: Extension must match content type (e.g., `.jpg` → `image/jpeg`)

**Behavior**:

- If validation fails: Delete file + log security event to `security_logs` collection
- If validation passes: Allow file to remain in storage

**Security Events Logged**:

- `invalid_file_upload`: Wrong content type
- `oversized_file_upload`: File > 5MB
- `extension_mismatch`: Extension doesn't match content type

---

### `cleanupExpiredTokens`

**Purpose**: Remove stale FCM tokens from user profiles.

**Trigger**: Cloud Scheduler (every 24 hours)

**Parameters**: None (scheduled job)

**Behavior**:

1. Query `users` collection where `fcmTokenUpdatedAt < 60 days ago`
2. Batch delete `fcmToken` and `fcmTokenUpdatedAt` fields
3. Log count of cleaned tokens

**Rationale**: FCM tokens can expire or become invalid. Periodic cleanup prevents sending notifications to dead tokens.

---

## Error Handling

All callable functions use consistent error handling:

```typescript
try {
  // Function logic
} catch (error) {
  logger.error('Error in functionName:', error);
  if (error instanceof Error) {
    throw new Error(error.message); // Preserve message
  }
  throw new Error('Generic fallback message');
}
```

**Logging**: Uses `firebase-functions/logger` which integrates with Cloud Logging

**Client Error Handling**:

```typescript
try {
  const result = await callableFunction(params);
} catch (error) {
  if (error.code === 'resource-exhausted') {
    // Rate limited
  } else if (error.code === 'unauthenticated') {
    // Auth required
  } else {
    // Generic error
  }
}
```

---

## Performance Considerations

### Cold Starts

- **Current**: No min instances set → cold starts on first invocation
- **Impact**: 1-3 second delay for first call after idle period
- **Recommendation**: Set min instances to 1 for critical functions (checkLoginRateLimit, notifications)

### Concurrency

- 2nd Gen functions support up to 1000 concurrent executions (default 100)
- Auto-scales based on load
- No manual scaling configuration needed for current usage

### Timeouts

- Default: 60 seconds
- Max: 60 minutes (2nd gen)
- Current functions complete in <5 seconds under normal load

### Memory

- Default: 256MB
- Current functions use <100MB
- Image validation may benefit from 512MB for large files

---

## Deployment

### Build Functions

```bash
cd functions
npm run build
```

### Deploy All Functions

```bash
firebase deploy --only functions
```

### Deploy Single Function

```bash
firebase deploy --only functions:checkLoginRateLimit
```

### View Logs

```bash
firebase functions:log
```

Or in Firebase Console → Functions → Logs

---

## Testing

### Local Testing

```bash
cd functions
npm run build
firebase emulators:start --only functions
```

Call functions at `http://localhost:5001/campus-night-market/us-central1/functionName`

### Unit Tests

Currently no unit tests for functions. **Recommendation**: Add Jest tests for:

- Rate limiting logic
- Security question verification
- Password validation
- Input sanitization

---

## Security Best Practices

1. **App Check**: Consider enabling on callable functions to prevent abuse
2. **Rate Limiting**: Already implemented for auth, consider for other endpoints
3. **Input Validation**: All inputs validated before processing
4. **Secrets**: Use Firebase Config or Secret Manager (not environment variables)
5. **Least Privilege**: Functions run with Firebase Admin SDK (full access) - consider service accounts for production

---

## Monitoring

### Metrics to Track

- **Invocation count**: Ensure within free tier limits
- **Error rate**: Monitor function failures
- **Latency**: Track p50, p95, p99 response times
- **Cold starts**: Frequency and impact on user experience

### Recommended Alerts

- Error rate > 5%
- Invocation count approaching quota
- Average latency > 3 seconds
- Failed deployments

---

## Future Enhancements

1. **Batch Operations**: Add functions for bulk listing updates
2. **Analytics**: Track popular items, user behavior
3. **Email Notifications**: Send emails for order confirmations (SendGrid/Mailgun)
4. **Image Optimization**: Auto-resize/compress images on upload
5. **Background Jobs**: Cleanup old orders, archive inactive listings
6. **Webhooks**: Integrate with external services (payment processors)
