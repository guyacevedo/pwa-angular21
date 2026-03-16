# How to Get Your VAPID Key

## Step 1: Open Firebase Console

1. Go to https://console.firebase.google.com/
2. Select project: **app-base-7de4d**

## Step 2: Navigate to Cloud Messaging Settings

1. Click **⚙️ Project Settings** (gear icon, top left)
2. Go to **Cloud Messaging** tab

## Step 3: Generate or Copy VAPID Key

Look for "Web Push certificates" section:

- If you see "Generate Key Pair" button → Click it
- If you see a key already generated → Copy the **Public key** (starts with `BH...`)

## Step 4: Update Your Code

Replace the VAPID key placeholder in:

**File: `src/app/core/services/fcm.service.ts` (line ~49)**

Find this:

```typescript
const token = await getToken(this.messaging, {
  vapidKey:
    'BHVq1mPKKzA1jcUdKyxYKnYTfXRqR9zGnR8WnGKF2eJvWKQxD8gJqPp3QnJWzaYPkVkLnGqXqL9MqVpGKZv7vxU',
});
```

Replace with your actual key:

```typescript
const token = await getToken(this.messaging, {
  vapidKey: 'YOUR_ACTUAL_VAPID_KEY_HERE',
});
```

## Step 5: Test

1. Save the file
2. Run your app: `npm start`
3. Open your app in browser
4. Log in with a test user
5. You should see a notification permission dialog
6. Grant permission
7. Check browser console for: `[FcmService] FCM Token: ...`

## Your Firebase Project Details

- **Project ID:** `app-base-7de4d`
- **Sender ID:** `768864792786`
- **Console URL:** https://console.firebase.google.com/project/app-base-7de4d/settings/cloudmessaging

---

**Need help?** Check the Cloud Messaging documentation: https://firebase.google.com/docs/cloud-messaging/js/client
