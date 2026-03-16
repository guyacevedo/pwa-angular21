# Push Notifications Setup Guide

## Overview

This PWA now includes push notifications that alert ADMIN and OPERATOR users when other users login or logout.

## Prerequisites

### 1. Firebase Project Upgrade to Blaze Plan

Cloud Functions require a Blaze (pay-as-you-go) plan:

1. Go to [Firebase Console - Usage Details](https://console.firebase.google.com/project/app-base-7de4d/usage/details)
2. Click "Upgrade Project"
3. Select **Blaze** plan
4. Complete payment setup

### 2. FCM (Firebase Cloud Messaging) VAPID Key

The VAPID key in `src/app/core/services/fcm.service.ts` is a placeholder. You need to:

1. Go to Firebase Console → Project Settings → Cloud Messaging tab
2. Copy your **Server API Key** (or generate new credentials)
3. Replace the VAPID key in `src/app/core/services/fcm.service.ts` line 34

## Deployment Steps

### Deploy Cloud Functions

Once your project is on Blaze plan:

```bash
firebase deploy --only functions
```

This deploys the `sendAuthNotifications` callable function that:

- Receives notification requests from the app
- Retrieves FCM tokens from user documents
- Sends multicast notifications to all recipients

### How It Works

#### Login Flow

1. User logs in
2. `FirebaseAuthService.login()` calls `notificationService.notifyLogin()`
3. Notification service queries for ADMIN and OPERATOR users
4. Cloud Function `sendAuthNotifications` is called with:
   - List of recipient user IDs
   - Notification title, body, and metadata
5. Function retrieves FCM tokens from Firestore
6. Firebase Cloud Messaging sends notifications to all recipients

#### Logout Flow

Same as login, but calls `notifyLogout()` instead

#### FCM Token Management

- **On Login**: `fcmService.initializeMessaging()` requests permission and stores token in user document
- **On Logout**: `fcmService.clearFcmToken()` removes token from user document

## User Experience

### For Users with Permissions (ADMIN/OPERATOR)

1. When app first loads, users see a browser notification permission prompt
2. If granted:
   - App stores their FCM token in their Firestore document
   - They receive notifications for login/logout events
3. If denied:
   - No notifications are sent to them
   - They can re-enable in browser settings

### Notification Format

**On Login:**

- Title: "Usuario conectado"
- Body: "{FirstName} {LastName} se ha conectado."

**On Logout:**

- Title: "Usuario desconectado"
- Body: "{FirstName} {LastName} se ha desconectado."

When clicked, notifications navigate to `/users` page.

## Configuration Files

### Service Worker

`public/firebase-messaging-sw.js` - Handles background notifications when app is not in focus

### Services

- `src/app/core/services/fcm.service.ts` - Manages FCM tokens and message listeners
- `src/app/core/services/notification.service.ts` - Sends login/logout notifications
- `functions/src/index.ts` - Cloud Function that handles multicast messaging

### Firestore Security Rules

Add to your Firestore rules if needed:

```javascript
// Allow users to read/write their own FCM token
allow write: if request.auth.uid == resource.id {
  allow update: if request.resource.data.keys().hasAll(['fcmToken'])
                  || !('fcmToken' in request.resource.data);
}
```

## Troubleshooting

### Notifications Not Received

1. **Check browser permission**: Ensure notifications are allowed in browser settings
2. **Check FCM token**: Verify token is stored in Firestore user document
3. **Check Cloud Function logs**: `firebase functions:log`
4. **Check service worker**: Open DevTools → Application → Service Workers

### Permission Denied for Cloud Functions Deployment

Ensure you have:

- Firebase CLI authenticated: `firebase login`
- Project owner or editor role on Firebase project
- Blaze plan enabled

### Service Worker Not Registering

1. Check if `/firebase-messaging-sw.js` is accessible
2. Ensure browser supports Service Workers (all modern browsers)
3. Check browser console for errors

## Testing

### Manual Testing

1. Open app in two browsers (or tabs)
2. One browser: Log in as ADMIN user
3. Second browser: Log in as another user (with notifications permission granted)
4. First browser: See notification when second user logs in
5. Second browser: Log out
6. First browser: See notification when second user logs out

### Firebase Emulator Testing

For local development with emulator:

```bash
firebase emulators:start
```

Notifications won't work in emulator, but Cloud Function logic can be tested.

## Notes

- Notifications are only sent to users with ADMIN or OPERATOR roles
- FCM tokens are stored in user Firestore documents
- Tokens are cleared on logout
- Notifications work in background (service worker handles them)
- Notifications also work in foreground (browser handles them)
