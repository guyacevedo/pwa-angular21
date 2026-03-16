/**
 * Simple FCM Notification Server
 * Listens to Firestore notifications and sends them via FCM
 */

require('dotenv').config();
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
  token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url:
    process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL ||
    'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const db = admin.firestore();
const messaging = admin.messaging();

console.log('[FCM Server] Starting notification server...');
console.log(`[FCM Server] Project ID: ${process.env.FIREBASE_PROJECT_ID}`);
console.log(`[FCM Server] Client Email: ${process.env.FIREBASE_CLIENT_EMAIL}`);

/**
 * Listen to notifications collection and send FCM messages
 */
function startListeningToNotifications() {
  console.log('[FCM Server] Setting up Firestore listener...');

  const query = db.collection('notifications').where('sent', '==', false);
  const processing = new Set();

  const unsubscribe = query.onSnapshot(
    async (snapshot) => {
      console.log(`[FCM Server] Found ${snapshot.docs.length} unsent notifications`);

      for (const doc of snapshot.docs) {
        if (processing.has(doc.id)) {
          console.log(`[FCM Server] Skipping ${doc.id} - already processing`);
          continue;
        }
        processing.add(doc.id);

        const notification = doc.data();
        console.log(`[FCM Server] Processing notification: ${doc.id}`);

        try {
          // Send to all admin users with FCM tokens
          // Note: We query only by role to avoid needing a composite index
          const usersSnapshot = await db
            .collection('users')
            .where('role', '==', 'ADMIN')
            .get();

          // Filter locally for users with FCM tokens
          const adminUsersWithTokens = usersSnapshot.docs.filter((doc) => {
            const user = doc.data();
            return user.fcmToken && typeof user.fcmToken === 'string' && user.fcmToken.length > 0;
          });

          console.log(`[FCM Server] Found ${adminUsersWithTokens.length} admin users with FCM tokens`);

          for (const userDoc of adminUsersWithTokens) {
            const user = userDoc.data();
            const fcmToken = user.fcmToken;

            try {
              const messageId = await messaging.send({
                token: fcmToken,
                notification: {
                  title: notification.title || 'Nueva Notificación',
                  body: notification.body || '',
                },
                data: {
                  ...(notification.data || {}),
                  title: notification.title || 'Nueva Notificación',
                  body: notification.body || '',
                },
                android: {
                  priority: 'high',
                  notification: {
                    sound: 'default',
                    clickAction: 'FLUTTER_NOTIFICATION_CLICK',
                    icon: 'ic_notification',
                  },
                },
                apns: {
                  headers: {
                    'apns-priority': '10',
                  },
                  payload: {
                    aps: {
                      sound: 'default',
                      'content-available': 1,
                    },
                  },
                },
                webpush: {
                  notification: {
                    title: notification.title || 'Nueva Notificación',
                    body: notification.body || '',
                    icon: '/favicon.ico',
                    badge: '/favicon.ico',
                    tag: 'app-notification',
                    requireInteraction: false,
                  },
                  data: {
                    ...(notification.data || {}),
                    title: notification.title || 'Nueva Notificación',
                    body: notification.body || '',
                  },
                },
              });

              console.log(`[FCM Server] Message sent to ${user.id}: ${messageId}`);
              console.log(`[FCM Server] Notification: "${notification.title}" - "${notification.body}"`);
            } catch (error) {
              console.error(`[FCM Server] Error sending to ${user.id}:`, error.message);
            }
          }

          // Mark notification as sent
          await doc.ref.update({
            sent: true,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            sentToUsers: adminUsersWithTokens.length,
          });

          console.log(`[FCM Server] Notification ${doc.id} marked as sent`);
        } catch (error) {
          console.error(`[FCM Server] Error processing notification ${doc.id}:`, error);
        } finally {
          processing.delete(doc.id);
        }
      }
    },
    (error) => {
      console.error('[FCM Server] Listener error:', error);
      // Retry after 5 seconds
      setTimeout(startListeningToNotifications, 5000);
    },
  );

  console.log('[FCM Server] Listener attached');

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('[FCM Server] Shutting down...');
    unsubscribe();
    admin.app().delete();
    process.exit(0);
  });
}

// Start the server
startListeningToNotifications();

console.log('[FCM Server] Ready! Listening for notifications...');
