import {
  Injectable,
  inject,
  EnvironmentInjector,
  runInInjectionContext,
  computed,
  signal,
} from '@angular/core';
import { initializeApp, deleteApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  getAuth,
} from 'firebase/auth';
import { Auth, user } from '@angular/fire/auth';
import { Observable, from, of, tap } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthRepository } from '../../core/interfaces/auth.repository';
import { User } from '../../core/models';
import { FirebaseUserService } from './firebase-user.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthService implements AuthRepository {
  private auth: Auth = inject(Auth);
  private userService = inject(FirebaseUserService);
  private injector = inject(EnvironmentInjector);

  private readonly _authReady = signal(false);
  public readonly authReady = this._authReady.asReadonly();

  readonly user$: Observable<User | null> = user(this.auth).pipe(
    switchMap((user) => {
      if (!user) return of(null);
      return from(this.mapFirebaseUserToUser(user));
    }),
    tap(() => this._authReady.set(true)),
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
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  private async mapFirebaseUserToUser(user: FirebaseUser): Promise<User> {
    return runInInjectionContext(this.injector, async () => {
      // Obtener datos completos desde Firestore
      const userData = await this.userService.getUserByUId(user.uid);
      if (userData) {
        return userData;
      }

      // Fallback: only Auth data
      return {
        id: user.uid,
        firstName: 'Desconocido',
        lastName: 'Desconocido',
        dni: 'Desconocido',
        email: user.email || '',
        phone: 'Desconocido',
        profilePictureUrl:
          user.photoURL ||
          'https://res.cloudinary.com/dfurubiqj/image/upload/v1759346209/default-profile_qzf9ga_mkixzk.png',
        registrationDate: new Date(user.metadata.creationTime || Date.now()),
        role: 'GUEST',
        status: 'DISABLED',
        lastLogin: new Date(user.metadata.lastSignInTime || Date.now()),
        lastLogout: new Date(user.metadata.lastSignInTime || Date.now()),
        uid: user.uid,
      } as User;
    });
  }
}
