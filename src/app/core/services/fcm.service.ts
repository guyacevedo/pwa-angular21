import { Injectable, inject } from '@angular/core';
import { Messaging, getToken, onMessage } from '@angular/fire/messaging';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class FcmService {
  private messaging = inject(Messaging);
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  /**
   * Request notification permission and get FCM token
   */
  async requestPermissionAndGetToken(): Promise<string | null> {
    try {
      // Check if browser supports notifications
      if (!('Notification' in window)) {
        console.log('Browser does not support notifications');
        return null;
      }

      // Check current permission
      if (Notification.permission === 'granted') {
        return await this.getToken();
      }

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        return await this.getToken();
      }

      console.log('Notification permission denied');
      return null;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return null;
    }
  }

  /**
   * Get FCM token
   */
  private async getToken(): Promise<string | null> {
    try {
      const token = await getToken(this.messaging, {
        vapidKey:
          'BHVq1mPKKzA1jcUdKyxYKnYTfXRqR9zGnR8WnGKF2eJvWKQxD8gJqPp3QnJWzaYPkVkLnGqXqL9MqVpGKZv7vxU',
      });

      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Save FCM token to Firestore for current user
   */
  async saveFcmToken(userId: string): Promise<void> {
    try {
      const token = await this.requestPermissionAndGetToken();
      if (!token) {
        console.log('No FCM token available');
        return;
      }

      // Save token to user's document
      const userRef = doc(this.firestore, 'users', userId);
      await setDoc(
        userRef,
        {
          fcmToken: token,
          fcmTokenUpdatedAt: new Date(),
        },
        { merge: true },
      );

      console.log('FCM token saved for user:', userId);
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  }

  /**
   * Listen to foreground messages
   */
  listenToForegroundMessages(
    onMessage$: (payload: {
      notification?: { title?: string; body?: string; icon?: string };
      data?: Record<string, string>;
    }) => void,
  ): void {
    try {
      onMessage(this.messaging, (payload) => {
        console.log('[FcmService] Foreground message received:', payload);
        onMessage$(payload);

        // Show notification even in foreground
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(payload.notification?.title || 'Nueva Notificación', {
              body: payload.notification?.body || '',
              icon: payload.notification?.icon || '/favicon.ico',
              badge: '/favicon.ico',
              data: payload.data || {},
            });
          });
        }
      });
    } catch (error) {
      console.error('Error listening to foreground messages:', error);
    }
  }
}
