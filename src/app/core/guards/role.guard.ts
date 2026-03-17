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

// Sistema
export const viewUsersGuard:    CanActivateFn = createPermissionGuard((p) => p.canViewUsers());
export const manageUsersGuard:  CanActivateFn = createPermissionGuard((p) => p.canManageUsers());
export const manageRolesGuard:  CanActivateFn = createPermissionGuard((p) => p.canManageRoles());
export const manageConfigGuard: CanActivateFn = createPermissionGuard((p) => p.canManageConfig());

// Comercio
export const viewContactosGuard:   CanActivateFn = createPermissionGuard((p) => p.canViewContactos());
export const manageContactosGuard: CanActivateFn = createPermissionGuard((p) => p.canManageContactos());
export const viewVentasGuard:      CanActivateFn = createPermissionGuard((p) => p.canViewVentas());
export const manageVentasGuard:    CanActivateFn = createPermissionGuard((p) => p.canManageVentas());
export const viewComprasGuard:     CanActivateFn = createPermissionGuard((p) => p.canViewCompras());
export const manageComprasGuard:   CanActivateFn = createPermissionGuard((p) => p.canManageCompras());

// Inventario
export const viewInventarioGuard:   CanActivateFn = createPermissionGuard((p) => p.canViewInventario());
export const manageInventarioGuard: CanActivateFn = createPermissionGuard((p) => p.canManageInventario());
export const viewInsumosGuard:      CanActivateFn = createPermissionGuard((p) => p.canViewInsumos());
export const manageInsumosGuard:    CanActivateFn = createPermissionGuard((p) => p.canManageInsumos());

// Activos
export const viewCavasGuard:   CanActivateFn = createPermissionGuard((p) => p.canViewCavas());
export const manageCavasGuard: CanActivateFn = createPermissionGuard((p) => p.canManageCavas());

// Logística
export const viewViajesGuard:      CanActivateFn = createPermissionGuard((p) => p.canViewViajes());
export const manageViajesGuard:    CanActivateFn = createPermissionGuard((p) => p.canManageViajes());
export const viewCamionesGuard:    CanActivateFn = createPermissionGuard((p) => p.canViewCamiones());
export const manageCamionesGuard:  CanActivateFn = createPermissionGuard((p) => p.canManageCamiones());

// Finanzas
export const viewPrestamosGuard:   CanActivateFn = createPermissionGuard((p) => p.canViewPrestamos());
export const managePrestamosGuard: CanActivateFn = createPermissionGuard((p) => p.canManagePrestamos());
export const viewNominaGuard:      CanActivateFn = createPermissionGuard((p) => p.canViewNomina());
export const manageNominaGuard:    CanActivateFn = createPermissionGuard((p) => p.canManageNomina());
export const viewReportesGuard:    CanActivateFn = createPermissionGuard((p) => p.canViewReportes());

/** Guard legado */
export const adminGuard: CanActivateFn = viewUsersGuard;
