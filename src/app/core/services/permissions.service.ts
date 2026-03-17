import { Injectable, inject, computed, effect } from '@angular/core';
import { AUTH_PROVIDER } from '../interfaces/auth-provider.interface';
import { RolePermissionsService } from './role-permissions.service';
import { UserRole } from '../types/user-role.type';

@Injectable({ providedIn: 'root' })
export class PermissionsService {
  private readonly authProvider = inject(AUTH_PROVIDER);
  private readonly rolePerms = inject(RolePermissionsService);

  readonly role = computed<UserRole>(() => this.authProvider.user()?.role ?? 'CHOFER');

  constructor() {
    effect(() => {
      if (this.authProvider.authReady()) {
        this.rolePerms.load();
      }
    });
  }

  private has(key: string): boolean {
    return this.rolePerms.permsForRole(this.role()).has(key);
  }

  // Sistema
  readonly canManageUsers    = computed(() => this.has('manageUsers'));
  readonly canViewUsers      = computed(() => this.has('viewUsers'));
  readonly canManageConfig   = computed(() => this.has('manageConfig'));
  readonly canManageRoles    = computed(() => this.has('manageRoles'));
  readonly canViewAdminStats = computed(() => this.has('viewAdminStats'));
  readonly canViewDashboard  = computed(() => this.has('viewDashboard'));
  readonly canEditProfile    = computed(() => this.has('editProfile'));

  // Comercio
  readonly canViewContactos   = computed(() => this.has('viewContactos'));
  readonly canManageContactos = computed(() => this.has('manageContactos'));
  readonly canViewVentas      = computed(() => this.has('viewVentas'));
  readonly canManageVentas    = computed(() => this.has('manageVentas'));
  readonly canViewCompras     = computed(() => this.has('viewCompras'));
  readonly canManageCompras   = computed(() => this.has('manageCompras'));

  // Inventario
  readonly canViewInventario   = computed(() => this.has('viewInventario'));
  readonly canManageInventario = computed(() => this.has('manageInventario'));
  readonly canViewInsumos      = computed(() => this.has('viewInsumos'));
  readonly canManageInsumos    = computed(() => this.has('manageInsumos'));

  // Activos
  readonly canViewCavas   = computed(() => this.has('viewCavas'));
  readonly canManageCavas = computed(() => this.has('manageCavas'));

  // Logística
  readonly canViewViajes     = computed(() => this.has('viewViajes'));
  readonly canManageViajes   = computed(() => this.has('manageViajes'));
  readonly canViewCamiones   = computed(() => this.has('viewCamiones'));
  readonly canManageCamiones = computed(() => this.has('manageCamiones'));

  // Finanzas
  readonly canViewPrestamos   = computed(() => this.has('viewPrestamos'));
  readonly canManagePrestamos = computed(() => this.has('managePrestamos'));
  readonly canViewNomina      = computed(() => this.has('viewNomina'));
  readonly canManageNomina    = computed(() => this.has('manageNomina'));
  readonly canViewReportes    = computed(() => this.has('viewReportes'));
}
