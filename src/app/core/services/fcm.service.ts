import { Injectable, inject } from '@angular/core';
import { Messaging, getToken, onMessage } from '@angular/fire/messaging';
import { Firestore, doc, updateDoc, deleteField } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class FcmService {
  private messaging = inject(Messaging);
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  /**
   * Request permission and get FCM token for current user
   */
  async initializeMessaging(): Promise<string | null> {
    try {
      // Check if service workers are supported
      if (!('serviceWorker' in navigator)) {
        console.warn('Service Workers not supported');
        return null;
      }

      // Register service worker
      await navigator.serviceWorker.register('/firebase-messaging-sw.js');

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return null;
      }

      // Get FCM token
      const token = await getToken(this.messaging, {
        vapidKey:
          'BFDwjnPBDmYb5V4L_vKXvKNzqcfr8aQ7Rw8F5L5JXLaKUzR7DGkLf0VqQqcVFKqL3Y-IvwQQvQwQvQwQvQ',
      });

      if (token && this.auth.currentUser) {
        // Save token to Firestore user document
        await updateDoc(doc(this.firestore, 'users', this.auth.currentUser.uid), {
          fcmToken: token,
        });
      }

      return token;
    } catch (error) {
      console.error('Error initializing messaging:', error);
      return null;
    }
  }

  /**
   * Listen to messages received while app is in foreground
   */
  listenToForegroundMessages(onMessage$: (payload: unknown) => void) {
    return onMessage(this.messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      onMessage$(payload);
    });
  }

  /**
   * Clear FCM token for user on logout
   */
  async clearFcmToken(): Promise<void> {
    try {
      if (this.auth.currentUser) {
        await updateDoc(doc(this.firestore, 'users', this.auth.currentUser.uid), {
          fcmToken: deleteField(),
        });
      }
    } catch (error) {
      console.error('Error clearing FCM token:', error);
    }
  }
}
