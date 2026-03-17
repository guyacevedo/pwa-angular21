import { Injectable, signal, computed, inject, NgZone } from '@angular/core';
import { Firestore, doc, setDoc, onSnapshot } from '@angular/fire/firestore';
import { NotificationService } from './notification.service';
import { UserRole } from '../types/user-role.type';

export interface RolePermission {
  key: string;
  label: string;
  propietario: boolean;
  administrador: boolean;
  secretario: boolean;
  bodega: boolean;
  chofer: boolean;
  adminTi: boolean;
}

const DEFAULTS: RolePermission[] = [
  // Sistema
  { key: 'viewDashboard',     label: 'Ver dashboard',                    propietario: true,  administrador: true,  secretario: true,  bodega: true,  chofer: true,  adminTi: true  },
  { key: 'viewAdminStats',    label: 'Ver estadísticas ejecutivas',       propietario: true,  administrador: true,  secretario: false, bodega: false, chofer: false, adminTi: false },
  { key: 'viewUsers',         label: 'Ver listado de usuarios',           propietario: true,  administrador: true,  secretario: false, bodega: false, chofer: false, adminTi: true  },
  { key: 'manageUsers',       label: 'Crear / editar / eliminar usuarios',propietario: false, administrador: true,  secretario: false, bodega: false, chofer: false, adminTi: true  },
  { key: 'manageRoles',       label: 'Cambiar roles de usuarios',         propietario: false, administrador: false, secretario: false, bodega: false, chofer: false, adminTi: true  },
  { key: 'manageConfig',      label: 'Configuración de la empresa',       propietario: false, administrador: true,  secretario: false, bodega: false, chofer: false, adminTi: true  },
  { key: 'editProfile',       label: 'Editar su propio perfil',           propietario: true,  administrador: true,  secretario: true,  bodega: true,  chofer: true,  adminTi: true  },
  // Comercio
  { key: 'viewContactos',     label: 'Ver contactos',                     propietario: true,  administrador: true,  secretario: true,  bodega: true,  chofer: false, adminTi: false },
  { key: 'manageContactos',   label: 'Gestionar contactos',               propietario: false, administrador: true,  secretario: true,  bodega: false, chofer: false, adminTi: false },
  { key: 'viewVentas',        label: 'Ver ventas',                        propietario: true,  administrador: true,  secretario: true,  bodega: false, chofer: false, adminTi: false },
  { key: 'manageVentas',      label: 'Registrar y editar ventas',         propietario: false, administrador: true,  secretario: true,  bodega: false, chofer: false, adminTi: false },
  { key: 'viewCompras',       label: 'Ver compras',                       propietario: true,  administrador: true,  secretario: true,  bodega: true,  chofer: false, adminTi: false },
  { key: 'manageCompras',     label: 'Registrar y editar compras',        propietario: false, administrador: true,  secretario: true,  bodega: true,  chofer: false, adminTi: false },
  // Inventario
  { key: 'viewInventario',    label: 'Ver inventario de pescado',         propietario: true,  administrador: true,  secretario: true,  bodega: true,  chofer: false, adminTi: false },
  { key: 'manageInventario',  label: 'Ajustar stock de inventario',       propietario: false, administrador: true,  secretario: false, bodega: true,  chofer: false, adminTi: false },
  { key: 'viewInsumos',       label: 'Ver insumos',                       propietario: true,  administrador: true,  secretario: false, bodega: true,  chofer: false, adminTi: false },
  { key: 'manageInsumos',     label: 'Gestionar insumos',                 propietario: false, administrador: true,  secretario: false, bodega: true,  chofer: false, adminTi: false },
  // Activos
  { key: 'viewCavas',         label: 'Ver cavas',                         propietario: true,  administrador: true,  secretario: true,  bodega: true,  chofer: true,  adminTi: false },
  { key: 'manageCavas',       label: 'Gestionar cavas',                   propietario: false, administrador: true,  secretario: true,  bodega: true,  chofer: false, adminTi: false },
  // Logística
  { key: 'viewViajes',        label: 'Ver viajes',                        propietario: true,  administrador: true,  secretario: true,  bodega: false, chofer: true,  adminTi: false },
  { key: 'manageViajes',      label: 'Gestionar viajes',                  propietario: false, administrador: true,  secretario: false, bodega: false, chofer: true,  adminTi: false },
  { key: 'viewCamiones',      label: 'Ver flota de camiones',             propietario: true,  administrador: true,  secretario: false, bodega: false, chofer: true,  adminTi: false },
  { key: 'manageCamiones',    label: 'Gestionar flota de camiones',       propietario: false, administrador: true,  secretario: false, bodega: false, chofer: false, adminTi: false },
  // Finanzas
  { key: 'viewPrestamos',     label: 'Ver préstamos',                     propietario: true,  administrador: true,  secretario: true,  bodega: false, chofer: false, adminTi: false },
  { key: 'managePrestamos',   label: 'Gestionar préstamos',               propietario: false, administrador: true,  secretario: true,  bodega: false, chofer: false, adminTi: false },
  { key: 'viewNomina',        label: 'Ver nómina',                        propietario: true,  administrador: true,  secretario: false, bodega: false, chofer: false, adminTi: false },
  { key: 'manageNomina',      label: 'Liquidar nómina diaria',            propietario: false, administrador: true,  secretario: false, bodega: false, chofer: false, adminTi: false },
  { key: 'viewReportes',      label: 'Ver reportes',                      propietario: true,  administrador: true,  secretario: false, bodega: false, chofer: false, adminTi: false },
];

const DOC_PATH = 'config/role-permissions';

/** Mapeo de UserRole al campo en RolePermission */
function roleKey(role: UserRole): keyof Omit<RolePermission, 'key' | 'label'> {
  const map: Record<UserRole, keyof Omit<RolePermission, 'key' | 'label'>> = {
    PROPIETARIO:  'propietario',
    ADMINISTRADOR:'administrador',
    SECRETARIO:   'secretario',
    BODEGA:       'bodega',
    CHOFER:       'chofer',
    ADMIN_TI:     'adminTi',
  };
  return map[role];
}

@Injectable({ providedIn: 'root' })
export class RolePermissionsService {
  private readonly firestore = inject(Firestore);
  private readonly ngZone = inject(NgZone);
  private readonly notificationService = inject(NotificationService);

  private readonly _permissions = signal<RolePermission[]>(DEFAULTS);
  private readonly _loading = signal(false);
  private unsubscribe: (() => void) | null = null;

  readonly permissions = this._permissions.asReadonly();
  readonly loading = this._loading.asReadonly();

  /** Devuelve un Set de permission keys activas para el rol dado */
  permsForRole(role: UserRole): Set<string> {
    const field = roleKey(role);
    return new Set(
      this._permissions()
        .filter((p) => p[field])
        .map((p) => p.key),
    );
  }

  // Compatibilidad con código que aún use operatorPerms / guestPerms
  readonly operatorPerms = computed(() => this.permsForRole('SECRETARIO'));
  readonly guestPerms    = computed(() => this.permsForRole('CHOFER'));

  load(): void {
    if (this.unsubscribe) return;
    this._loading.set(true);
    const ref = doc(this.firestore, DOC_PATH);
    this.ngZone.runOutsideAngular(() => {
      this.unsubscribe = onSnapshot(
        ref,
        (snap) => {
          this.ngZone.run(() => {
            if (snap.exists()) {
              const data = snap.data() as { permissions: Partial<RolePermission>[] };
              if (Array.isArray(data.permissions)) {
                const saved = new Map(data.permissions.map((p) => [p.key, p]));
                const merged = DEFAULTS.map((d) => ({
                  ...d,
                  ...(saved.has(d.key) ? saved.get(d.key)! : {}),
                }));
                this._permissions.set(merged);
              }
            }
            this._loading.set(false);
          });
        },
        (e) => {
          console.warn('[RolePermissionsService] Error en listener Firestore, usando defaults.', e);
          this._loading.set(false);
        },
      );
    });
  }

  unload(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  async togglePermission(
    key: string,
    role: keyof Omit<RolePermission, 'key' | 'label'>,
    changedBy = 'Admin',
  ): Promise<void> {
    const perm = this._permissions().find((p) => p.key === key);
    const newValue = perm ? !perm[role] : true;

    this._permissions.update((perms) =>
      perms.map((p) => (p.key === key ? { ...p, [role]: !p[role] } : p)),
    );
    await this.persist();

    if (perm) {
      this.notificationService.notifyPermissionsUpdated(changedBy, perm.label, role, newValue);
    }
  }

  private async persist(): Promise<void> {
    try {
      const ref = doc(this.firestore, DOC_PATH);
      const toSave = this._permissions().map(
        ({ key, propietario, administrador, secretario, bodega, chofer, adminTi }) => ({
          key, propietario, administrador, secretario, bodega, chofer, adminTi,
        }),
      );
      await setDoc(ref, { permissions: toSave });
    } catch (e) {
      console.error('[RolePermissionsService] Error al persistir permisos.', e);
    }
  }
}
