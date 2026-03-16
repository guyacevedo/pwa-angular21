import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';

export interface Session {
  sessionId: string;
  userId: string;
  createdAt: string;
  active: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly CURRENT_SESSION_KEY = 'app_current_sessionId';
  private firestore = inject(Firestore);

  /**
   * Creates a session for the current browser in Firestore
   */
  async createSession(userId: string): Promise<string> {
    const sessionId = this.generateSessionId();
    sessionStorage.setItem(this.CURRENT_SESSION_KEY, sessionId);

    const sessionRef = doc(collection(this.firestore, 'sessions'), sessionId);
    await setDoc(sessionRef, {
      sessionId,
      userId,
      createdAt: new Date().toISOString(),
      active: true,
    });

    return sessionId;
  }

  /**
   * Marks current session as inactive in Firestore
   */
  async closeSession(_userId: string, sessionId: string): Promise<void> {
    try {
      const sessionRef = doc(this.firestore, 'sessions', sessionId);
      await updateDoc(sessionRef, { active: false });
    } catch (e) {
      console.error('[SessionService] Error closing session:', e);
    } finally {
      sessionStorage.removeItem(this.CURRENT_SESSION_KEY);
    }
  }

  /**
   * Checks Firestore for any other active sessions for this user.
   * Works across different browsers since Firestore is the shared source of truth.
   */
  async hasActiveSessions(userId: string): Promise<boolean> {
    try {
      const q = query(
        collection(this.firestore, 'sessions'),
        where('userId', '==', userId),
        where('active', '==', true),
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (e) {
      console.error('[SessionService] Error checking active sessions:', e);
      return false;
    }
  }

  getCurrentSessionId(): string | null {
    return sessionStorage.getItem(this.CURRENT_SESSION_KEY);
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}
