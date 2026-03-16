import { Injectable } from '@angular/core';

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
  private readonly SESSIONS_STORAGE_KEY = 'app_sessions';

  constructor() {
    // Listen for storage changes from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === this.SESSIONS_STORAGE_KEY) {
        console.log('[SessionService] Sessions updated from another tab');
      }
    });
  }

  /**
   * Create a new session for a user
   */
  async createSession(userId: string): Promise<string> {
    const sessionId = this.generateSessionId();

    const sessions = this.getAllSessions();
    const userSessions = sessions[userId] || [];

    const session: Session = {
      sessionId,
      userId,
      createdAt: new Date().toISOString(),
      active: true,
    };

    userSessions.push(session);
    sessions[userId] = userSessions;

    localStorage.setItem(this.SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    sessionStorage.setItem('app_current_sessionId', sessionId);

    console.log(`[SessionService] Created session ${sessionId} for user ${userId}`);
    return sessionId;
  }

  /**
   * Close a specific session
   */
  async closeSession(userId: string, sessionId: string): Promise<void> {
    const sessions = this.getAllSessions();
    const userSessions = sessions[userId] || [];

    const sessionIndex = userSessions.findIndex((s) => s.sessionId === sessionId);
    if (sessionIndex !== -1) {
      userSessions[sessionIndex].active = false;
      sessions[userId] = userSessions;
      localStorage.setItem(this.SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
      console.log(`[SessionService] Closed session ${sessionId} for user ${userId}`);
    }

    sessionStorage.removeItem('app_current_sessionId');
  }

  /**
   * Check if user has active sessions
   * Always reads from localStorage to get latest state from other tabs
   */
  async hasActiveSessions(userId: string): Promise<boolean> {
    // Force read from localStorage (not cached)
    const stored = localStorage.getItem(this.SESSIONS_STORAGE_KEY);
    const sessions = stored ? JSON.parse(stored) : {};
    const userSessions = (sessions[userId] || []) as Session[];

    console.log(
      `[SessionService] All sessions for ${userId}:`,
      userSessions.map((s) => ({ id: s.sessionId.substring(0, 10), active: s.active })),
    );

    const activeCount = userSessions.filter((s: Session) => s.active).length;

    console.log(
      `[SessionService] User ${userId} has ${activeCount} active sessions (${userSessions.length} total)`,
    );
    return activeCount > 0;
  }

  /**
   * Get current session ID from sessionStorage (tab-specific)
   */
  getCurrentSessionId(): string | null {
    return sessionStorage.getItem('app_current_sessionId');
  }

  /**
   * Get all sessions from localStorage
   */
  private getAllSessions(): Record<string, Session[]> {
    const stored = localStorage.getItem(this.SESSIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}
