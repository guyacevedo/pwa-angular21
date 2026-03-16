# Multi-Session Management Test Guide

## Problem Fixed

Previously, when a user logged out in one browser tab (S1), it would incorrectly mark the user as INACTIVE in other tabs (S2) even though S2 was still logged in. This happened because both tabs shared the same `localStorage` key for storing the current session ID.

## Solution Implemented

Changed from using `localStorage` to `sessionStorage` for storing the current tab's session ID:

- `sessionStorage` is tab-specific (each tab has its own isolated storage)
- `localStorage` is shared across all tabs (perfect for the sessions list)

## Files Modified

- `src/app/core/services/session.service.ts`:
  - Line 45: `localStorage.setItem('sessionId', ...)` → `sessionStorage.setItem('app_current_sessionId', ...)`
  - Line 66: `localStorage.removeItem('sessionId')` → `sessionStorage.removeItem('app_current_sessionId')`
  - Line 96: `localStorage.getItem('sessionId')` → `sessionStorage.getItem('app_current_sessionId')`

## Test Scenario

### Prerequisites

- Server running on http://localhost:4200
- Fresh localStorage (no previous sessions)

### Steps

#### 1. Tab S1 - Login

1. Open http://localhost:4200 in **Tab 1** (S1)
2. Log in with valid credentials
3. Open browser console (F12)
4. Check logs:
   ```
   [SessionService] Created session XXXX-YYYYYYYY for user USER_ID
   ```
5. Verify in DevTools → Application → Session Storage:
   - Key: `app_current_sessionId`
   - Value: `XXXX-YYYYYYYY` (S1's session ID)

#### 2. Tab S2 - Login (Same User)

1. Open new browser tab/window (S2)
2. Go to http://localhost:4200
3. Log in with **same user** as S1
4. Open console in S2
5. Check logs:
   ```
   [SessionService] Created session ZZZZ-WWWWWWWW for user USER_ID
   ```
6. Verify in DevTools → Application → Session Storage:
   - Key: `app_current_sessionId`
   - Value: `ZZZZ-WWWWWWWW` (S2's session ID, DIFFERENT from S1)
7. Check Local Storage:
   - Key: `app_sessions`
   - Value should contain 2 active sessions for USER_ID

#### 3. S1 - Logout

1. Switch back to Tab S1
2. Click Logout button
3. Open console, look for:
   ```
   [SessionService] Closed session XXXX-YYYYYYYY for user USER_ID
   [Auth] User USER_ID has other sessions: true
   [Auth] User USER_ID still has active sessions, keeping ACTIVE status
   ```
4. **IMPORTANT**: User should NOT be marked as INACTIVE (status should remain ACTIVE)

#### 4. Verify Results

**In S1 (after logout):**

- Should be logged out
- Should see login form

**In S2 (while still logged in):**

- Should still be logged in
- User status should still be ACTIVE
- Dashboard/app should work normally
- Console should NOT show any status changes

**In localStorage (check any tab):**

- `app_sessions` should show:
  - Session XXXX-YYYYYYYY (from S1): `active: false` ❌
  - Session ZZZZ-WWWWWWWW (from S2): `active: true` ✅

## Expected Console Output

### S1 Login

```
[SessionService] Created session 1773677658425-abc123def for user 44wHlMOJZHOEk7cNM2wuxIy688u2
[FcmService] No FCM token available  (expected on localhost)
[Auth] Saving FCM token for user: 44wHlMOJZHOEk7cNM2wuxIy688u2
```

### S2 Login

```
[SessionService] Created session 1773677658426-xyz789ghi for user 44wHlMOJZHOEk7cNM2wuxIy688u2
[FcmService] No FCM token available  (expected on localhost)
```

### S1 Logout

```
[SessionService] Closed session 1773677658425-abc123def for user 44wHlMOJZHOEk7cNM2wuxIy688u2
[SessionService] User 44wHlMOJZHOEk7cNM2wuxIy688u2 has 1 active sessions (2 total)
[Auth] User 44wHlMOJZHOEk7cNM2wuxIy688u2 has other sessions: true
[Auth] User 44wHlMOJZHOEk7cNM2wuxIy688u2 still has active sessions, keeping ACTIVE status
```

## Test Verification Checklist

- [ ] S1 creates session with unique ID
- [ ] S2 creates session with different unique ID
- [ ] Both sessions visible in localStorage `app_sessions`
- [ ] S1 logout closes only S1's session
- [ ] S2 remains ACTIVE after S1 logout
- [ ] User status in Firestore remains ACTIVE (not marked INACTIVE)
- [ ] S2 can still use app normally after S1 logout

## Troubleshooting

### If S2 becomes INACTIVE when S1 logs out:

- Check if sessionStorage is being used correctly
- Verify `getCurrentSessionId()` reads from sessionStorage, not localStorage
- Check browser storage (F12 → Storage) - each tab should have different sessionId

### If both sessions show inactive:

- Check if closeSession() is finding and closing the wrong session
- Verify session IDs match between what's stored and what's being searched for

### FCM Token Errors:

- Expected on localhost (Service Worker not registered)
- Will work in production with HTTPS and Service Worker enabled

## Automated Test

Run: `node test-multi-session.js`

This simulates the scenario using mock storage and validates the logic.
