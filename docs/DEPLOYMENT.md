# Deployment and Rollback Guide

## Prerequisites

- Firebase CLI installed (`npm install -g firebase-tools`)
- Vercel CLI installed (`npm install -g vercel`)
- Logged in to Firebase (`firebase login`)
- Logged in to Vercel (`vercel login`)
- Access to Firebase project: `campus-night-market`
- Access to Vercel project: `campus-nightmarket`

---

## Environment Configuration

### Firebase Project

```bash
# Check current project
firebase use

# Should show: campus-night-market

# List all projects
firebase projects:list
```

### Environment Variables

#### Frontend (Vercel)

Managed in Vercel Dashboard → Project Settings → Environment Variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_FIREBASE_VAPID_KEY`
- `VITE_SENTRY_DSN`
- `VITE_RECAPTCHA_SITE_KEY`
- `VITE_APP_CHECK_DEBUG_TOKEN` (development only)

Pull env vars locally:

```bash
vercel env pull .vercel.env
```

#### Backend (Cloud Functions)

Firebase Config (if needed):

```bash
firebase functions:config:set app.url="https://campus-nightmarket.vercel.app"
```

---

## Deployment Procedures

### 1. Full Deployment (Frontend + Backend)

**When to use**: Major releases, coordinated changes across frontend/backend

```bash
# Step 1: Run tests locally
npm test

# Step 2: Build frontend
npm run build

# Step 3: Build functions
npm --prefix functions run build

# Step 4: Deploy Firestore rules & indexes
firebase deploy --only firestore:rules,firestore:indexes

# Step 5: Deploy Cloud Functions
firebase deploy --only functions

# Step 6: Deploy frontend to Vercel
vercel --prod

# Step 7: Verify deployment
# - Check Vercel deployment URL
# - Check Firebase Functions dashboard
# - Test critical flows (login, browse, create listing, order)
```

---

### 2. Frontend-Only Deployment

**When to use**: UI changes, route updates, client-side logic

```bash
# Step 1: Run lint & tests
npm run lint
npm test

# Step 2: Build
npm run build

# Step 3: Deploy to Vercel production
vercel --prod

# Or use automatic deployment (push to main branch)
git push origin main
# Vercel auto-deploys on push to main
```

**Verification**:

1. Check Vercel deployment status in dashboard
2. Visit production URL: `https://campus-nightmarket.vercel.app`
3. Test affected features in browser

---

### 3. Backend-Only Deployment

**When to use**: Cloud Function updates, Firestore rules/indexes changes

#### Deploy Firestore Rules

```bash
# Test rules locally (optional)
firebase emulators:start --only firestore

# Deploy rules
firebase deploy --only firestore:rules

# Verify in Firebase Console → Firestore → Rules
```

#### Deploy Firestore Indexes

```bash
# Deploy indexes
firebase deploy --only firestore:indexes

# Check status in Firebase Console → Firestore → Indexes
# Wait for "Building" → "Enabled" status
```

#### Deploy Cloud Functions

```bash
# Build functions
npm --prefix functions run build

# Deploy all functions
firebase deploy --only functions

# Deploy single function
firebase deploy --only functions:checkLoginRateLimit

# Deploy multiple specific functions
firebase deploy --only functions:sendNewOrderNotification,sendOrderStatusNotification
```

**Verification**:

1. Check Firebase Console → Functions → Dashboard
2. View logs: `firebase functions:log`
3. Test function invocations (e.g., trigger login rate limit)

---

### 4. Hotfix Deployment

**When to use**: Critical bugs, security issues

```bash
# Step 1: Create hotfix branch
git checkout -b hotfix/critical-bug-fix

# Step 2: Make minimal changes

# Step 3: Test locally
npm test

# Step 4: Commit & push
git add .
git commit -m "fix: critical bug description"
git push origin hotfix/critical-bug-fix

# Step 5: Merge to main (skip PR for urgent fixes)
git checkout main
git merge hotfix/critical-bug-fix
git push origin main

# Step 6: Deploy immediately
vercel --prod  # Frontend
firebase deploy --only functions  # If backend affected

# Step 7: Monitor logs & error tracking (Sentry, Firebase logs)
```

---

## Rollback Procedures

### 1. Frontend Rollback (Vercel)

#### Option A: Redeploy Previous Deployment

```bash
# Step 1: List recent deployments
vercel ls campus-nightmarket

# Step 2: Promote previous deployment to production
vercel promote <deployment-url>

# Example:
# vercel promote campus-nightmarket-abc123.vercel.app
```

#### Option B: Revert Git Commit + Redeploy

```bash
# Step 1: Find commit to revert to
git log --oneline

# Step 2: Revert to previous commit
git revert <bad-commit-sha>

# Step 3: Push
git push origin main

# Vercel auto-deploys the reverted state
```

**Verification**: Check production URL and test affected features

---

### 2. Backend Rollback (Cloud Functions)

#### Option A: Redeploy Previous Code

```bash
# Step 1: Check out previous working commit
git checkout <previous-working-commit>

# Step 2: Build & deploy functions
npm --prefix functions run build
firebase deploy --only functions

# Step 3: Return to main branch
git checkout main
```

#### Option B: Revert Specific Function

```bash
# Step 1: Revert code changes
git revert <bad-commit-sha>

# Step 2: Rebuild & redeploy affected function
npm --prefix functions run build
firebase deploy --only functions:affectedFunctionName
```

#### Option C: Use Firebase Deployment History (if available)

Firebase doesn't natively support rollback, but you can:

1. Go to Firebase Console → Functions → Deployment History
2. Note the last working deployment timestamp
3. Check out code from that time
4. Redeploy

**Verification**: Check Firebase Functions logs for errors

---

### 3. Firestore Rules Rollback

```bash
# Step 1: Check out previous rules
git checkout <previous-commit> firebase/firestore.rules

# Step 2: Deploy old rules
firebase deploy --only firestore:rules

# Step 3: Verify in Firebase Console → Firestore → Rules

# Step 4: If successful, commit the revert
git add firebase/firestore.rules
git commit -m "revert: rollback firestore rules to previous version"
git push origin main
```

---

### 4. Firestore Indexes Rollback

**Note**: Index deletion can break queries. Prefer adding new indexes over deleting.

```bash
# Step 1: Edit firebase/firestore.indexes.json to previous state
git checkout <previous-commit> firebase/firestore.indexes.json

# Step 2: Deploy
firebase deploy --only firestore:indexes

# Step 3: Monitor Firebase Console → Indexes for build status
```

**Warning**: Removing indexes while queries depend on them will cause errors.

---

## Emergency Procedures

### Complete Outage

1. **Check Status**:
   - Vercel Status: <https://www.vercel-status.com/>
   - Firebase Status: <https://status.firebase.google.com/>

2. **Enable Maintenance Mode** (if available):
   - Redirect all routes to maintenance page
   - Set via Vercel rewrites or Firebase Hosting

3. **Rollback** (see procedures above)

4. **Communication**:
   - Post status update (Twitter, Discord, email)
   - Estimate time to resolution

---

### Data Corruption

1. **Identify Scope**:
   - Check Firestore logs for anomalous writes
   - Identify affected collections/documents

2. **Pause Writes**:
   - Temporarily restrict Firestore rules:

     ```javascript
     match /{document=**} {
       allow read: if true;
       allow write: if false; // Block all writes
     }
     ```

   - Deploy: `firebase deploy --only firestore:rules`

3. **Restore Data**:
   - Use Firestore export/import (if backups exist)
   - Manually fix affected documents

4. **Re-enable Writes**:
   - Restore normal rules
   - Deploy: `firebase deploy --only firestore:rules`

---

### Security Breach

1. **Immediate Actions**:
   - Rotate Firebase API keys (Firebase Console → Project Settings)
   - Invalidate all user sessions:

     ```javascript
     // Run in Firebase Console → Firestore
     // Delete all FCM tokens
     ```

   - Block malicious IPs in Firestore rules (if identifiable)

2. **Audit**:
   - Check Cloud Functions logs for suspicious activity
   - Review Firestore audit logs
   - Check storage for uploaded malicious files

3. **Patch**:
   - Fix vulnerability in code
   - Deploy patched version ASAP

4. **Communication**:
   - Notify affected users
   - Post security advisory

---

## Monitoring Post-Deployment

### Vercel Monitoring

- **Deployment Logs**: Vercel Dashboard → Project → Deployments
- **Runtime Logs**: Vercel Dashboard → Functions (if any)
- **Error Tracking**: Sentry dashboard

### Firebase Monitoring

- **Functions Logs**: `firebase functions:log` or Firebase Console → Functions → Logs
- **Firestore Usage**: Firebase Console → Firestore → Usage
- **Performance**: Firebase Console → Performance Monitoring

### Key Metrics to Watch

| Metric               | Tool             | Threshold           |
| -------------------- | ---------------- | ------------------- |
| Error rate           | Sentry           | <1%                 |
| Function invocations | Firebase Console | <1M/day (free tier) |
| P95 latency          | Firebase Console | <500ms              |
| Firestore reads      | Firebase Console | <50K/day            |
| Cold starts          | Functions Logs   | Monitor frequency   |

---

## Automated Rollback (Future)

**Recommendation**: Set up automated rollback triggers:

1. **Sentry Integration**: Auto-rollback if error rate >5% in first 10 min
2. **Health Checks**: Ping `/api/health` endpoint; rollback if fails
3. **Canary Deployments**: Route 10% traffic to new version; rollback if errors

**Implementation** (Vercel):

```json
// vercel.json
{
  "checks": [
    {
      "name": "Health Check",
      "path": "/api/health"
    }
  ]
}
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing locally (`npm test`)
- [ ] Linter passing (`npm run lint`)
- [ ] Functions build successfully (`npm --prefix functions run build`)
- [ ] Frontend build successfully (`npm run build`)
- [ ] Environment variables up to date
- [ ] Database migrations completed (if any)
- [ ] Changelog updated
- [ ] Stakeholders notified (if major release)

### During Deployment

- [ ] Deploy Firestore rules first (if changed)
- [ ] Deploy indexes and wait for "Enabled" status
- [ ] Deploy functions and verify in dashboard
- [ ] Deploy frontend last
- [ ] Monitor logs for first 10 minutes

### Post-Deployment

- [ ] Verify critical user flows (login, browse, create listing, order)
- [ ] Check error rates in Sentry
- [ ] Monitor Firebase Functions logs
- [ ] Verify indexes are being used (no missing index warnings)
- [ ] Test on mobile devices
- [ ] Update status page (if public-facing)

---

## References

- [Vercel CLI Docs](https://vercel.com/docs/cli)
- [Firebase Deploy Docs](https://firebase.google.com/docs/cli#deployment)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Cloud Functions Deployment](https://firebase.google.com/docs/functions/manage-functions)
