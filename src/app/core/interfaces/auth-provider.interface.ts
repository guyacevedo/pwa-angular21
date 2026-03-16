import { Signal, InjectionToken } from '@angular/core';
import { User } from '../models';

/**
 * Interfaz mínima para proveedores de autenticación.
 * Abstrae la dependencia de AuthFacade en servicios core.
 * Usada por PermissionsService y EstadisticasService.
 */
export interface AuthProvider {
  user: Signal<User | null>;
  authReady: Signal<boolean>;
}

export const AUTH_PROVIDER = new InjectionToken<AuthProvider>('AUTH_PROVIDER');
