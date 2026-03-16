import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionsService } from '../services/permissions.service';
import { AuthFacade } from '../../features/auth/auth.facade';
import { map, take } from 'rxjs';

/** Guard genérico que verifica un permiso específico */
const createPermissionGuard = (permissionCheck: (p: PermissionsService) => boolean): CanActivateFn => {
  return () => {
    const permissions = inject(PermissionsService);
    const authFacade = inject(AuthFacade);
    const router = inject(Router);

    return authFacade.authState$.pipe(
      take(1),
      map(() => {
        if (permissionCheck(permissions)) {
          return true;
        }
        router.navigate(['/dashboard']);
        return false;
      }),
    );
  };
};

/** Guard para acceso a listado de usuarios */
export const viewUsersGuard: CanActivateFn = createPermissionGuard((p) => p.canViewUsers());

/** Guard para gestión de usuarios (crear/editar/eliminar) */
export const manageUsersGuard: CanActivateFn = createPermissionGuard((p) => p.canManageUsers());

/** Guard para gestión de roles y permisos */
export const manageRolesGuard: CanActivateFn = createPermissionGuard((p) => p.canManageRoles());

/** Guard para configuración de empresa */
export const manageConfigGuard: CanActivateFn = createPermissionGuard((p) => p.canManageConfig());

/** Guard legado: redirige a ADMIN si es posible ver usuarios */
export const adminGuard: CanActivateFn = viewUsersGuard;
