# FCM Notification Server

Simple Node.js server that listens to Firestore and sends Firebase Cloud Messaging (FCM) notifications.

## Setup

### 1. Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `app-base-7de4d`
3. **⚙️ Project Settings** → **Service Accounts** tab
4. Click **Generate New Private Key** → Download JSON file

### 2. Create `.env` file

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then edit `.env` with your service account credentials:

```env
FIREBASE_PROJECT_ID=app-base-7de4d
FIREBASE_PRIVATE_KEY_ID=xxxxx
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@app-base-7de4d.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=xxxxx
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40app-base-7de4d.iam.gserviceaccount.com

PORT=3000
```

**⚠️ IMPORTANT:** Never commit `.env` or `serviceAccountKey.json` to git!

### 3. Install Dependencies

```bash
cd fcm-notification-server
npm install
```

### 4. Run the Server

**Development (with auto-reload):**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

You should see:

```
[FCM Server] Starting notification server...
[FCM Server] Project ID: app-base-7de4d
[FCM Server] Client Email: firebase-adminsdk-xxxxx@app-base-7de4d.iam.gserviceaccount.com
[FCM Server] Setting up Firestore listener...
[FCM Server] Ready! Listening for notifications...
```

## How It Works

1. **User logs in** → FCM token saved to Firestore
2. **User (or another user) logs in/out** → Notification written to `notifications` collection with `sent: false`
3. **Server listens** → Detects unsent notifications
4. **Server sends** → Sends FCM message to all ADMIN users with FCM tokens
5. **Server marks** → Updates notification with `sent: true`

## Testing

1. Run this server: `npm run dev`
2. Log in with a user in the app
3. Log in with another user (or same from another device)
4. Check notifications on the first user's device

## Troubleshooting

### "Module not found: firebase-admin"

Run: `npm install`

### "FIREBASE_PRIVATE_KEY is not valid"

Make sure:

- Private key is wrapped in quotes
- `\n` is properly escaped: `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n`
- Don't include the JSON file itself, extract individual fields

### "No users found with FCM tokens"

- Check that users have `fcmToken` in Firestore
- User must be ADMIN role to receive notifications
- FCM token must be obtained after granting notification permission

### "Permission denied" error

- Service account needs Firestore and Cloud Messaging permissions
- In Firebase Console, make sure service account has role: **Editor** or **Firebase Admin**

## Deployment Options

### Option 1: Local Machine (Development)

Run on your development machine to test notifications locally.

### Option 2: Railway.app (Free)

1. Push code to GitHub
2. Connect to [Railway.app](https://railway.app/)
3. Set environment variables
4. Deploy!

### Option 3: Heroku (Free tier ending)

```bash
heroku create your-app-name
heroku config:set FIREBASE_PROJECT_ID=app-base-7de4d
heroku config:set FIREBASE_PRIVATE_KEY="..."
# ... set all other variables
git push heroku main
```

### Option 4: Google Cloud Run

```bash
gcloud run deploy fcm-server --source . --allow-unauthenticated
```

## Security

- ✅ Private key stored in `.env` (not committed)
- ✅ Only listens to notifications marked `sent: false`
- ✅ Only sends to ADMIN users
- ✅ Server-side validation of FCM tokens
- ✅ Firestore security rules should restrict who can write to `notifications`

## Monitoring

Server logs show:

- Number of unsent notifications
- Number of admin users found
- Which users received notifications
- Any errors during sending

## Next Steps

1. Run the server locally to test
2. Deploy to production (Railway, Heroku, or Cloud Run)
3. Keep it running 24/7 to handle notifications
4. Monitor logs for errors
