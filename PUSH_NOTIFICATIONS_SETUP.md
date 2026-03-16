# Push Notifications Setup

This document explains how to set up and use push notifications in the PWA.

## Overview

The app uses Firebase Cloud Messaging (FCM) to send push notifications to users. The implementation:

1. **Requests notification permission** when user logs in
2. **Saves FCM token** to Firestore for each user
3. **Sends push notifications** to admin users when other users login/logout
4. **Displays notifications** on mobile and browser (even when app is closed)

## Setup Steps

### 1. Get VAPID Key from Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `app-base-7de4d`
3. Go to **Project Settings** → **Cloud Messaging** tab
4. Under "Web Push certificates", click **Generate Key Pair**
5. Copy the public key (will look like: `BHVq1mPKKzA1jcUdKyxYKnYT...`)

### 2. Update VAPID Key in Code

Replace the VAPID key in both files:

**File:** `src/app/core/services/fcm.service.ts` (line ~45)

```typescript
const token = await getToken(this.messaging, {
  vapidKey: 'YOUR_PUBLIC_VAPID_KEY_HERE', // Replace with your key
});
```

**File:** `public/firebase-messaging-sw.js` (keep consistent)

### 3. Enable Web Push in Firebase Console

1. Go to **Project Settings** → **Cloud Messaging**
2. Ensure **Web Push** is enabled
3. Make sure your Firebase project has a valid **Sender ID**

### 4. Test Push Notifications

#### Option A: Using Firebase Console (Manual Testing)

1. Go to Firebase Console → **Cloud Messaging**
2. Click **Send your first message**
3. Create a notification:
   - **Title:** "Test"
   - **Body:** "This is a test notification"
4. Select **Target** → **User segment** (or send to all)
5. Click **Review** → **Publish**

#### Option B: Programmatically (From Your App)

The app automatically sends push notifications when users login/logout:

1. **Admin users** receive a push when another user logs in/out
2. Notifications show even when the app is closed (background message)
3. When app is open, notifications still appear (foreground message)

### 5. User Experience

**When user logs in:**

1. Permission dialog appears (first time only)
2. User grants permission → FCM token is saved
3. Other admins receive a push notification

**When user logs out:**

1. Notification is sent to all admins
2. Even if they're not in the app, they receive it

**When notification is clicked:**

- App opens and focuses the user on the dashboard

## How It Works

### Flow Diagram

```
User Login
  ↓
Request notification permission
  ↓
Get FCM token from Firebase
  ↓
Save token to user's Firestore document
  ↓
Send notification to all admin users
  ↓
Admin receives push notification (browser or mobile)
```

### Key Files

- **`public/firebase-messaging-sw.js`** - Service Worker handling background messages
- **`src/app/core/services/fcm.service.ts`** - FCM token management
- **`src/app/core/services/push-notification.service.ts`** - Sending notifications
- **`src/app/core/services/notification.service.ts`** - Notification orchestration
- **`src/app/app.ts`** - Service Worker registration and foreground listening

## Troubleshooting

### Notifications not appearing?

1. **Check permissions:**
   - Browser Settings → Notifications → Allow for your app
   - On mobile, check app notification settings

2. **Check Service Worker:**
   - Open DevTools → **Application** → **Service Workers**
   - Should show `firebase-messaging-sw.js` as **Active**

3. **Check FCM Token:**
   - Open DevTools → **Console**
   - Look for: `[FcmService] FCM Token: ...`
   - If not appearing, notifications permission was denied

4. **Check Firestore:**
   - Go to Firebase Console → **Firestore**
   - Find your user document
   - Check for `fcmToken` field

### Browser Specific Issues

**Chrome:** Requires HTTPS (except localhost)
**Firefox:** Same HTTPS requirement
**Safari iOS:** Limited support for web push (may require app manifest changes)

## Notes

- Push notifications require HTTPS in production
- Localhost works without HTTPS for development
- FCM tokens expire and refresh automatically
- Maximum 5 notification attributes per message
- Notifications are rate-limited per user to prevent spam

## Production Deployment

Before deploying to production:

1. ✅ VAPID key is set correctly
2. ✅ Service Worker is registered
3. ✅ HTTPS is enabled
4. ✅ Firebase Cloud Messaging is enabled
5. ✅ Test with real devices
6. ✅ Monitor notification delivery in Firebase Console

## References

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Protocol](https://datatracker.ietf.org/doc/html/draft-thomson-webpush-protocol)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
