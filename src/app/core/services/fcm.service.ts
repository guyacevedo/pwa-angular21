import { Injectable, inject } from '@angular/core';
import { Messaging, getToken, onMessage } from '@angular/fire/messaging';
import { Firestore, doc, setDoc, arrayUnion } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class FcmService {
  private messaging = inject(Messaging);
  private firestore = inject(Firestore);
  private foregroundCallback:
    | ((payload: {
        notification?: { title?: string; body?: string; icon?: string };
        data?: Record<string, string>;
      }) => void)
    | null = null;

  constructor() {
    // Set up onMessage listener early within injection context
    try {
      onMessage(this.messaging, (payload) => {
        console.log('[FcmService] Foreground message received:', payload);
        if (this.foregroundCallback) {
          this.foregroundCallback(payload);
        }
      });
    } catch (error) {
      console.error('[FcmService] Error setting up foreground listener:', error);
    }
  }

  /**
   * Get FCM token without requesting permission
   * Only works if permission is already granted
   */
  private async getToken(): Promise<string | null> {
    try {
      const token = await getToken(this.messaging, {
        vapidKey:
          'BDyWBbTyUWVQSxkBaZvVF2nxaQgImVcTpLL7EQE9JtF-QoRWMV5XgnSG5x39zgT5xdmIF6_SQrJn4ZGtsB8v9jU',
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
    // Wait for Service Worker to be ready, then save token in background
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(() => {
          this.saveFcmTokenAsync(userId).catch((error) => {
            console.error('[FcmService] Error in background save:', error);
          });
        })
        .catch((error) => {
          console.error('[FcmService] Service Worker not ready:', error);
        });
    } else {
      console.warn('[FcmService] Service Workers not supported');
    }
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

      // Save token to user's fcmTokens array (support multiple devices/sessions)
      const userRef = doc(this.firestore, 'users', userId);
      await setDoc(
        userRef,
        {
          fcmTokens: arrayUnion(token), // Accumulate tokens from multiple devices
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
   * Register callback for foreground messages
   */
  listenToForegroundMessages(
    onMessage$: (payload: {
      notification?: { title?: string; body?: string; icon?: string };
      data?: Record<string, string>;
    }) => void,
  ): void {
    // Store callback to be called when messages arrive
    // NOTE: app.ts already calls registration.showNotification() — do NOT duplicate here
    this.foregroundCallback = onMessage$;
  }
}
