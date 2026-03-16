import { Injectable, inject, computed, signal } from '@angular/core';
import { initializeApp, deleteApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  getAuth,
} from 'firebase/auth';
import { Auth, user } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Firestore, doc, onSnapshot } from '@angular/fire/firestore';
import { mapUserDates } from '../utils/firestore.utils';
import { AuthRepository } from '../../core/interfaces/auth.repository';
import { User } from '../../core/models';
import { FirebaseUserService } from './firebase-user.service';
import { NotificationService } from './notification.service';
import { FcmService } from './fcm.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthService implements AuthRepository {
  private auth: Auth = inject(Auth);
  private userService = inject(FirebaseUserService);
  private firestore = inject(Firestore);
  private notificationService = inject(NotificationService);
  private fcmService = inject(FcmService);

  private readonly _authReady = signal(false);
  public readonly authReady = this._authReady.asReadonly();

  readonly user$: Observable<User | null> = user(this.auth).pipe(
    switchMap((authUser) => {
      if (!authUser) {
        this._authReady.set(true);
        return of(null);
      }
      // Use realtime listener for Firestore user data instead of one-time read
      return new Observable<User | null>((subscriber) => {
        const unsubscribe = onSnapshot(
          doc(this.firestore, 'users', authUser.uid),
          (docSnapshot) => {
            if (docSnapshot.exists()) {
              const data = docSnapshot.data();
              const userData = {
                ...data,
                ...mapUserDates(data),
              } as User;
              subscriber.next(userData);
              this._authReady.set(true);
            } else {
              // User doc doesn't exist, use fallback
              subscriber.next({
                id: authUser.uid,
                firstName: 'Desconocido',
                lastName: 'Desconocido',
                dni: 'Desconocido',
                email: authUser.email || '',
                phone: 'Desconocido',
                profilePictureUrl:
                  authUser.photoURL ||
                  'https://res.cloudinary.com/dfurubiqj/image/upload/v1759346209/default-profile_qzf9ga_mkixzk.png',
                registrationDate: new Date(authUser.metadata.creationTime || Date.now()),
                role: 'GUEST',
                status: 'DISABLED',
                lastLogin: new Date(authUser.metadata.lastSignInTime || Date.now()),
                lastLogout: new Date(authUser.metadata.lastSignInTime || Date.now()),
                uid: authUser.uid,
              } as User);
              this._authReady.set(true);
            }
          },
          (error) => {
            console.error('Error listening to user data:', error);
            subscriber.error(error);
          },
        );
        return () => unsubscribe();
      });
    }),
  );

  readonly authState$ = this.user$;

  public readonly getCurrentUser = toSignal(this.user$, { initialValue: null });

  public readonly isAuthenticated = computed(() => !!this.getCurrentUser());

  async register(email: string, password: string): Promise<string> {
    // Creamos una app secundaria para evitar que el registro automático afecte la sesión actual
    // Firebase Auth (client) loguea automáticamente al usuario creado en la instancia usada.
    const secondaryApp = initializeApp(environment.firebase!, 'SecondaryRegistration');
    const secondaryAuth = getAuth(secondaryApp);

    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      return userCredential.user.uid;
    } catch (error) {
      console.error('Firebase Auth Register Error:', error);
      throw error;
    } finally {
      // Limpiamos la app secundaria inmediatamente
      await deleteApp(secondaryApp);
    }
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
    // Update user lastLogin and status to ACTIVE after login
    const currentUser = this.auth.currentUser;
    if (currentUser) {
      // Get user data for notification
      const userData = await this.userService.getUserByUId(currentUser.uid);

      // Save FCM token for push notifications
      await this.fcmService.saveFcmToken(currentUser.uid);

      await this.userService.updateUser({
        id: currentUser.uid,
        lastLogin: new Date(),
        status: 'ACTIVE',
      });

      // Send login notification to users with permissions
      if (userData) {
        await this.notificationService.notifyLogin({
          id: userData.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
        });
      }

      // Small delay to ensure Firestore has persisted the update before user$ observable re-reads
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  async logout(): Promise<void> {
    // Update user lastLogout and status to INACTIVE before logout
    const currentUser = this.auth.currentUser;
    if (currentUser) {
      // Get user data for notification
      const userData = await this.userService.getUserByUId(currentUser.uid);

      await this.userService.updateUser({
        id: currentUser.uid,
        lastLogout: new Date(),
        status: 'INACTIVE',
      });

      // Send logout notification to users with permissions
      if (userData) {
        await this.notificationService.notifyLogout({
          id: userData.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
        });
      }
    }
    await signOut(this.auth);
  }
}
