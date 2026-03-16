import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthFacade } from '../../features/auth/auth.facade';
import { map, take } from 'rxjs';

/**
 * Guard que permite el acceso solo a usuarios autenticados.
 * Utiliza el observable authState$ para esperar a que Firebase inicialice el estado.
 */
export const authGuard: CanActivateFn = () => {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  return authFacade.authState$.pipe(
    take(1),
    map((user) => {
      if (user) {
        return true;
      }

      // Redirigir al login si no está autenticado
      router.navigate(['/auth/login']);
      return false;
    }),
  );
};
