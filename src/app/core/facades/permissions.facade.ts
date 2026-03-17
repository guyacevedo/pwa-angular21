import { Injectable, inject } from '@angular/core';
import { RolePermissionsService, RolePermission } from '../services/role-permissions.service';

/**
 * Facade para la gestión de permisos de roles.
 * Encapsula RolePermissionsService y proporciona una API pública clara.
 */
@Injectable({ providedIn: 'root' })
export class PermissionsFacade {
  private readonly service = inject(RolePermissionsService);

  readonly permissions = this.service.permissions;
  readonly loading = this.service.loading;

  async togglePermission(
    key: string,
    role: keyof Omit<RolePermission, 'key' | 'label'>,
  ): Promise<void> {
    await this.service.togglePermission(key, role);
  }
}
