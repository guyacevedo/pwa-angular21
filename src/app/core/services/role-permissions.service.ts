import { Injectable, signal, computed, inject, NgZone } from '@angular/core';
import { Firestore, doc, setDoc, onSnapshot } from '@angular/fire/firestore';
import { NotificationService } from './notification.service';

export interface RolePermission {
  key: string;
  label: string;
  operator: boolean;
  guest: boolean;
}

const DEFAULTS: RolePermission[] = [
  { key: 'viewDashboard', label: 'Acceder al dashboard', operator: true, guest: true },
  { key: 'viewAdminStats', label: 'Ver estadísticas globales', operator: false, guest: false },
  { key: 'viewUsers', label: 'Ver listado de usuarios', operator: false, guest: false },
  {
    key: 'manageUsers',
    label: 'Crear / editar / eliminar usuarios',
    operator: false,
    guest: false,
  },
  { key: 'manageRoles', label: 'Cambiar roles de usuarios', operator: false, guest: false },
  { key: 'manageConfig', label: 'Configuración de la empresa', operator: false, guest: false },
  { key: 'editProfile', label: 'Editar su propio perfil', operator: true, guest: true },
];

const DOC_PATH = 'config/role-permissions';

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

  readonly operatorPerms = computed(
    () =>
      new Set(
        this._permissions()
          .filter((p) => p.operator)
          .map((p) => p.key),
      ),
  );

  readonly guestPerms = computed(
    () =>
      new Set(
        this._permissions()
          .filter((p) => p.guest)
          .map((p) => p.key),
      ),
  );

  load(): void {
    if (this.unsubscribe) return; // Ya está escuchando
    this._loading.set(true);
    const ref = doc(this.firestore, DOC_PATH);
    this.ngZone.runOutsideAngular(() => {
      this.unsubscribe = onSnapshot(
        ref,
        (snap) => {
          this.ngZone.run(() => {
            if (snap.exists()) {
              const data = snap.data() as {
                permissions: { key: string; operator: boolean; guest: boolean }[];
              };
              if (Array.isArray(data.permissions)) {
                // Merge con defaults para incorporar nuevas claves sin perder las guardadas
                const saved = new Map(data.permissions.map((p) => [p.key, p]));
                const merged = DEFAULTS.map((d) => ({
                  ...d,
                  ...(saved.has(d.key)
                    ? { operator: saved.get(d.key)!.operator, guest: saved.get(d.key)!.guest }
                    : {}),
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
    role: 'operator' | 'guest',
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
      const toSave = this._permissions().map(({ key, operator, guest }) => ({
        key,
        operator,
        guest,
      }));
      await setDoc(ref, { permissions: toSave });
    } catch (e) {
      console.error('[RolePermissionsService] Error al persistir permisos.', e);
    }
  }
}
