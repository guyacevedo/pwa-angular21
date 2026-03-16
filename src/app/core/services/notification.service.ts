import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { UserStatus } from '../types/user-status.type';

export interface AuthNotification {
  userId: string;
  userName: string;
  userEmail: string;
  action: 'LOGIN' | 'LOGOUT';
  timestamp: Date;
  newStatus: UserStatus;
  previousStatus?: UserStatus;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private firestore = inject(Firestore);

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
      // Write notification to Firestore for FCM server to process
      await addDoc(collection(this.firestore, 'notifications'), {
        title: 'Usuario conectado',
        body: `${userData.firstName} ${userData.lastName} se ha conectado.`,
        action: 'LOGIN',
        userId: userData.id,
        userName: `${userData.firstName} ${userData.lastName}`,
        userEmail: userData.email,
        newStatus: 'ACTIVE',
        previousStatus: 'INACTIVE',
        timestamp: new Date(),
        read: false,
        sent: false, // FCM server will process and set to true
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
      // Write notification to Firestore for FCM server to process
      await addDoc(collection(this.firestore, 'notifications'), {
        title: 'Usuario desconectado',
        body: `${userData.firstName} ${userData.lastName} se ha desconectado.`,
        action: 'LOGOUT',
        userId: userData.id,
        userName: `${userData.firstName} ${userData.lastName}`,
        userEmail: userData.email,
        newStatus: 'INACTIVE',
        previousStatus: 'ACTIVE',
        timestamp: new Date(),
        read: false,
        sent: false, // FCM server will process and set to true
      });
    } catch (error) {
      console.error('Error sending logout notification:', error);
    }
  }
}
