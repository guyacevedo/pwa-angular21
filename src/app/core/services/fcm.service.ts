import { Injectable, inject } from '@angular/core';
import { Messaging, getToken, onMessage } from '@angular/fire/messaging';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class FcmService {
  private messaging = inject(Messaging);
  private firestore = inject(Firestore);

  /**
   * Get FCM token without requesting permission
   * Only works if permission is already granted
   */
  private async getToken(): Promise<string | null> {
    try {
      const token = await getToken(this.messaging, {
        vapidKey: 'dZfZQDI5yY4xUzGXCOvp4assfV95eSHpyHrdjsWNdvc',
      });

      console.log('[FcmService] Token obtained:', token);
      return token;
    } catch (error) {
      console.error('[FcmService] Error getting token:', error);
      return null;
    }
  }

  /**
   * Save FCM token to Firestore for current user
   * Non-blocking - runs in background without awaiting in login flow
   */
  saveFcmToken(userId: string): void {
    // Run in background - don't block login
    this.saveFcmTokenAsync(userId).catch((error) => {
      console.error('[FcmService] Error in background save:', error);
    });
  }

  /**
   * Internal async method for saving FCM token
   */
  private async saveFcmTokenAsync(userId: string): Promise<void> {
    try {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.log('[FcmService] Notifications not supported');
        return;
      }

      // Only attempt if permission is already granted
      if (Notification.permission !== 'granted') {
        console.log('[FcmService] Notification permission not granted, skipping token save');
        return;
      }

      const token = await this.getToken();
      if (!token) {
        console.log('[FcmService] No FCM token available');
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

      console.log('[FcmService] FCM token saved for user:', userId);
    } catch (error) {
      console.error('[FcmService] Error saving FCM token:', error);
    }
  }

  /**
   * Request notification permission
   * Can be called from UI when user clicks to enable notifications
   */
  async requestNotificationPermission(): Promise<boolean> {
    try {
      if (!('Notification' in window)) {
        console.log('[FcmService] Notifications not supported');
        return false;
      }

      if (Notification.permission === 'granted') {
        return true;
      }

      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('[FcmService] Error requesting notification permission:', error);
      return false;
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
      // Wrap in setTimeout to ensure it doesn't block
      setTimeout(() => {
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
      }, 0);
    } catch (error) {
      console.error('[FcmService] Error listening to foreground messages:', error);
    }
  }
}
