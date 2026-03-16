"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAuthNotifications = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();
/**
 * Send authentication notifications to multiple users
 * Called when a user logs in or out
 */
exports.sendAuthNotifications = functions.https.onCall(async (data, context) => {
    // Verify user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to send notifications');
    }
    try {
        const { recipientIds, notification } = data;
        if (!recipientIds || recipientIds.length === 0) {
            return { success: true, sent: 0 };
        }
        // Get FCM tokens for all recipients
        const tokens = [];
        for (const userId of recipientIds) {
            try {
                const userDoc = await db.collection('users').doc(userId).get();
                const userData = userDoc.data();
                if (userData?.fcmToken) {
                    tokens.push(userData.fcmToken);
                }
            }
            catch (error) {
                console.error(`Error getting FCM token for user ${userId}:`, error);
            }
        }
        if (tokens.length === 0) {
            console.log('No FCM tokens found for recipients');
            return { success: true, sent: 0 };
        }
        // Send notification to all tokens
        const messagePayload = {
            tokens,
            notification: {
                title: notification.title,
                body: notification.body,
            },
            data: {
                action: notification.data.action,
                userId: notification.data.userId,
                userName: notification.data.userName,
                userEmail: notification.data.userEmail,
            },
            webpush: {
                fcmOptions: {
                    link: '/users',
                },
                notification: {
                    title: notification.title,
                    body: notification.body,
                    icon: '/logo-raw.png',
                    badge: '/logo-raw.png',
                    tag: notification.data.action,
                },
            },
        };
        const response = await messaging.sendMulticast(messagePayload);
        // Log errors for failed sends
        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(tokens[idx]);
                }
            });
            console.error(`Failed to send notifications to ${failedTokens.length} tokens:`, failedTokens);
        }
        return {
            success: true,
            sent: response.successCount,
            failed: response.failureCount,
        };
    }
    catch (error) {
        console.error('Error sending auth notifications:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send notifications');
    }
});
//# sourceMappingURL=index.js.map