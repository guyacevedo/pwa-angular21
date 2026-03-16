import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from '@angular/fire/firestore';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private firestore = inject(Firestore);

  /**
   * Send push notification to users with FCM tokens
   * Note: This requires Firebase Admin SDK on backend for production use
   * For now, we update a field to trigger listeners
   */
  async sendPushNotificationToAdmins(
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    try {
      // Get all admin users with FCM tokens
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('role', '==', 'ADMIN'), where('fcmToken', '!=', null));

      const snapshot = await getDocs(q);
      const users = snapshot.docs.map((doc) => doc.data() as User);

      console.log(`Found ${users.length} admin users with FCM tokens`);

      // Update notification field for each user
      for (const user of users) {
        const userRef = doc(this.firestore, 'users', user.id);
        await updateDoc(userRef, {
          pendingNotification: {
            title,
            body,
            data,
            timestamp: new Date(),
          },
        });
      }
    } catch (error) {
      console.error('Error sending push notifications:', error);
    }
  }

  /**
   * Send push notification to specific users
   */
  async sendPushNotificationToUsers(
    userIds: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    try {
      for (const userId of userIds) {
        const userRef = doc(this.firestore, 'users', userId);
        await updateDoc(userRef, {
          pendingNotification: {
            title,
            body,
            data,
            timestamp: new Date(),
          },
        });
      }

      console.log(`Push notification queued for ${userIds.length} users`);
    } catch (error) {
      console.error('Error sending push notifications:', error);
    }
  }
}
