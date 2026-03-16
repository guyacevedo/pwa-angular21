import { Injectable, Signal, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../core/models';
import { AUTH_REPOSITORY } from 'src/app/core/interfaces/auth.repository';
import { AuthProvider } from 'src/app/core/interfaces/auth-provider.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthFacade implements AuthProvider {
  // Usando el token AUTH_REPOSITORY para inyectar la implementacion de AuthRepository
  private authService = inject(AUTH_REPOSITORY);
  private router = inject(Router);

  // Estado reactivo con señales
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _isLoggingOut = signal<boolean>(false);

  // Señales públicas
  readonly user: Signal<User | null> = this.authService.getCurrentUser;
  readonly isAuthenticated: Signal<boolean> = this.authService.isAuthenticated;
  readonly authReady: Signal<boolean> = this.authService.authReady;
  readonly authState$ = this.authService.authState$;
  readonly isLoading: Signal<boolean> = this._loading.asReadonly();
  readonly error: Signal<string | null> = this._error.asReadonly();
  readonly isLoggingOut: Signal<boolean> = this._isLoggingOut.asReadonly();

  /*
   * Inicia sesión con las credenciales proporcionadas y actualiza el estado.
   * @param email - Correo electrónico del usuario
   * @param password - Contraseña del usuario
   * @returns Promise<void>
   */
  async login(email: string, password: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      await this.authService.login(email, password);
      // Pequeño delay para asegurar que el estado de Firebase esté sincronizado en el cliente
      // antes de disparar la navegación en modo zoneless.
      setTimeout(async () => {
        const success = await this.router.navigateByUrl('/dashboard', { replaceUrl: true });
        if (!success) {
          console.error('Navigation to /dashboard failed');
        }
      }, 100);
    } catch (error: unknown) {
      const errorMessage = this.getLoginErrorMessage(error);
      this._error.set(errorMessage || 'Error del servidor. Intenta más tarde.');
    } finally {
      this._loading.set(false);
      this.consoleInform();
    }
  }

  /*
   * Registra un nuevo usuario con las credenciales proporcionadas
   * @param email - Correo electrónico del usuario
   * @param password - Contraseña del usuario
   * @returns Promise<void>
   */
  async register(email: string, password: string): Promise<string | void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const uid = await this.authService.register(email, password);
      return uid;
    } catch (error: unknown) {
      const errorMessage = this.getRegisterErrorMessage(error);
      this._error.set(errorMessage || 'Error del servidor. Intenta más tarde.');
      throw error; // Rethrow to propagate to the component
    } finally {
      this._loading.set(false);
      this.consoleInform();
    }
  }

  /*
   * Cierra la sesión del usuario actual y actualiza el estado.
   * @returns Promise<void>
   */
  async logout(): Promise<void> {
    this._isLoggingOut.set(true);
    this._loading.set(true);
    this._error.set(null);

    try {
      await this.authService.logout();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      this._error.set(message);
    } finally {
      this._loading.set(false);
      this._isLoggingOut.set(false);
      this.consoleInform();
    }
  }

  /*
   * Mapea los códigos de error de autenticación a mensajes de error amigables para el usuario.
   * @param error - El objeto de error que contiene el código de error.
   * @returns Un mensaje de error amigable para el usuario basado en el código de error.
   */
  private getLoginErrorMessage(error: unknown): string {
    const authError = error as { code?: string };
    const code = authError?.code;

    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Correo o contraseña incorrectos.';

      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Intenta más tarde.';

      case 'auth/invalid-email':
        return 'Correo electrónico inválido.';

      default:
        return 'Error al iniciar sesión. Intenta nuevamente.';
    }
  }

  /*
   * Mapea los códigos de error de registro a mensajes de error amigables para el usuario.
   * @param error - El objeto de error que contiene el código de error.
   * @returns Un mensaje de error amigable para el usuario basado en el código de error.
   */
  private getRegisterErrorMessage(error: unknown): string {
    const authError = error as { code?: string };
    const code = authError?.code;

    switch (code) {
      case 'auth/email-already-in-use':
        return 'Ese correo ya está registrado.';
      case 'auth/invalid-email':
        return 'Correo electrónico inválido.';
      case 'auth/weak-password':
        return 'La contraseña es muy débil. Usá una más segura.';
      default:
        return 'No se pudo crear la cuenta. Intenta más tarde.';
    }
  }

  /*
   * Informar en la consola el estado de autenticación
   */
  private consoleInform(): void {
    //const info = { isAuthenticated: this.isAuthenticated(), userSignal: this.user() };
    //console.log(info);
  }
}
