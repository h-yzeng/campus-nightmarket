# Server-Side Guardrails Plan

We need backend enforcement to complement client checks. Suggested steps:

1. **API Gateway / Callable Functions**
   - Route sensitive operations (orders, listings, reviews) through Cloud Functions/Edge middleware.
   - Verify Firebase ID token, roles, and email verification status on each request.

2. **Rate Limiting at Server**
   - Introduce per-user + per-IP rate limits (Cloud Functions: `functions.https.onCall` + Firestore/Redis counters; Vercel Edge: middleware + Upstash Redis).
   - Mirror client keys: `order_creation`, `login_failed`, `listing_creation` with server-enforced quotas.

3. **Input Validation**
   - Reuse shared Zod schemas (`/src/lib/schemas`) on the server; reject on mismatch.
   - Enforce size/type limits for images (if uploads go through a signed URL service, validate metadata).

4. **Authorization Rules**
   - Orders: buyerId must match auth uid; sellerId must be a seller; disallow status changes unless `uid === sellerId`.
   - Listings: creation/update/delete only by owner; availability toggles require seller role.
   - Reviews: ensure order belongs to buyer, is completed, and not already reviewed.

5. **Firestore Security Rules Updates**
   - Encode the above checks in `firebase/firestore.rules` with helper functions for readability.
   - Add allow/deny with explicit checks on `request.time`, `request.auth.token.email_verified`, and ownership.

6. **Auditing & Logging**
   - Emit structured logs for allow/deny decisions with correlation IDs; forward to Sentry/BQ for analysis.

7. **Testing**
   - Add emulator tests that cover allowed/denied scenarios for each rule set.
   - Add integration tests that exercise callable endpoints with mocked ID tokens.
