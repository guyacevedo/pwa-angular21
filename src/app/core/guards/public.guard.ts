import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthFacade } from '../../features/auth/auth.facade';
import { map, take } from 'rxjs';

/**
 * Guard que permite el acceso solo si NO hay una sesión activa (rutas públicas como Login).
 * Utiliza el observable authState$ para esperar a que Firebase inicialice el estado.
 */
export const publicGuard: CanActivateFn = () => {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  return authFacade.authState$.pipe(
    take(1),
    map((user) => {
      if (!user) {
        return true;
      }

      // Redirigir al dashboard si ya está autenticado
      router.navigate(['/dashboard']);
      return false;
    }),
  );
};
