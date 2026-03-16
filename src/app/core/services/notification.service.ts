import { Injectable, inject } from '@angular/core';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { httpsCallable, Functions } from '@angular/fire/functions';

export interface AuthNotification {
  userId: string;
  userName: string;
  userEmail: string;
  action: 'LOGIN' | 'LOGOUT';
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private firestore = inject(Firestore);
  private functions = inject(Functions);

  /**
   * Send login notification to users with canViewUsers permission
   */
  async notifyLogin(userData: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }): Promise<void> {
    try {
      // Get users with canViewUsers permission
      const usersWithPermission = await this.getUsersWithViewPermission();

      if (usersWithPermission.length === 0) return;

      // Call cloud function to send notifications
      const sendNotifications = httpsCallable(this.functions, 'sendAuthNotifications');

      await sendNotifications({
        recipientIds: usersWithPermission,
        notification: {
          title: 'Usuario conectado',
          body: `${userData.firstName} ${userData.lastName} se ha conectado.`,
          data: {
            action: 'LOGIN',
            userId: userData.id,
            userName: `${userData.firstName} ${userData.lastName}`,
            userEmail: userData.email,
          },
        },
      });
    } catch (error) {
      console.error('Error sending login notification:', error);
    }
  }

  /**
   * Send logout notification to users with canViewUsers permission
   */
  async notifyLogout(userData: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }): Promise<void> {
    try {
      // Get users with canViewUsers permission
      const usersWithPermission = await this.getUsersWithViewPermission();

      if (usersWithPermission.length === 0) return;

      // Call cloud function to send notifications
      const sendNotifications = httpsCallable(this.functions, 'sendAuthNotifications');

      await sendNotifications({
        recipientIds: usersWithPermission,
        notification: {
          title: 'Usuario desconectado',
          body: `${userData.firstName} ${userData.lastName} se ha desconectado.`,
          data: {
            action: 'LOGOUT',
            userId: userData.id,
            userName: `${userData.firstName} ${userData.lastName}`,
            userEmail: userData.email,
          },
        },
      });
    } catch (error) {
      console.error('Error sending logout notification:', error);
    }
  }

  /**
   * Get list of user IDs with canViewUsers permission (ADMIN or OPERATOR role)
   */
  private async getUsersWithViewPermission(): Promise<string[]> {
    try {
      const q = query(
        collection(this.firestore, 'users'),
        where('role', 'in', ['ADMIN', 'OPERATOR']),
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.id);
    } catch (error) {
      console.error('Error getting users with permission:', error);
      return [];
    }
  }
}
