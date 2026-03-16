import { Injectable, inject } from '@angular/core';
import { RolePermissionsService } from '../services/role-permissions.service';

/**
 * Facade para la gestión de permisos de roles.
 * Encapsula RolePermissionsService y proporciona una API pública clara.
 * Usada en la página de roles para mantener la separación de capas.
 */
@Injectable({ providedIn: 'root' })
export class PermissionsFacade {
  private readonly service = inject(RolePermissionsService);

  // Signals públicas expuestas desde el servicio
  readonly permissions = this.service.permissions;
  readonly loading = this.service.loading;
  readonly operatorPerms = this.service.operatorPerms;
  readonly guestPerms = this.service.guestPerms;

  /**
   * Alterna el permiso de un rol
   */
  async togglePermission(key: string, role: 'operator' | 'guest'): Promise<void> {
    await this.service.togglePermission(key, role);
  }
}
