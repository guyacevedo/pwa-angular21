import { Injectable, inject, computed, effect } from '@angular/core';
import { AUTH_PROVIDER } from '../interfaces/auth-provider.interface';
import { RolePermissionsService } from './role-permissions.service';

@Injectable({ providedIn: 'root' })
export class PermissionsService {
  private readonly authProvider = inject(AUTH_PROVIDER);
  private readonly rolePerms = inject(RolePermissionsService);

  readonly role = computed(() => this.authProvider.user()?.role ?? 'GUEST');

  constructor() {
    // Cargar permisos desde Firestore en cuanto auth esté listo
    effect(() => {
      if (this.authProvider.authReady()) {
        this.rolePerms.load();
      }
    });
  }

  private has(key: string): boolean {
    const r = this.role();
    if (r === 'ADMIN') return true;
    if (r === 'OPERATOR') return this.rolePerms.operatorPerms().has(key);
    return this.rolePerms.guestPerms().has(key);
  }

  readonly canManageUsers    = computed(() => this.has('manageUsers'));
  readonly canViewUsers      = computed(() => this.has('viewUsers'));
  readonly canManageConfig   = computed(() => this.has('manageConfig'));
  readonly canManageRoles    = computed(() => this.has('manageRoles'));
  readonly canViewAdminStats = computed(() => this.has('viewAdminStats'));
  readonly canViewDashboard  = computed(() => this.has('viewDashboard'));
  readonly canEditProfile    = computed(() => this.has('editProfile'));
}
