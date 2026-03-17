import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { UserFacade } from '../../user.facade';
import { User } from '../../../../core/models';
import {
  UserRole,
  USER_ROLES_LABELS,
  USER_ROLES_DESCRIPTIONS,
} from '../../../../core/types/user-role.type';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { AppSuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { AppErrorModalComponent } from '../../../../shared/components/error-modal/error-modal.component';
import { PermissionsFacade } from '../../../../core/facades/permissions.facade';
import { RolePermission } from '../../../../core/services/role-permissions.service';

interface RoleDef {
  role: UserRole;
  label: string;
  description: string;
  badgeType: 'primary' | 'warning' | 'neutral';
}

type EditableRoleField = keyof Omit<RolePermission, 'key' | 'label' | 'propietario'>;

@Component({
  selector: 'app-roles',
  imports: [SvgIconComponent, StatusBadgeComponent, AppSuccessModalComponent, AppErrorModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-20">

      <!-- Top Bar -->
      <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center gap-3">
        <button
          (click)="goBack()"
          class="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-medium text-sm"
        >
          <app-svg-icon icon="arrowLeft" size="20px"></app-svg-icon>
          Volver
        </button>
        <span class="text-slate-200 dark:text-slate-700">|</span>
        <h1 class="text-sm font-bold text-slate-800 dark:text-slate-100">Roles y Permisos</h1>
      </div>

      <div class="max-w-5xl mx-auto px-4 py-6 space-y-6">

        <!-- Definición de roles -->
        <section>
          <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span class="inline-block size-1.5 bg-primary rounded-full"></span>
            Roles disponibles
          </p>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            @for (r of roleDefs; track r.role) {
              <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-4">
                <div class="flex items-center justify-between mb-2">
                  <app-status-badge [text]="r.label" [type]="r.badgeType" size="md" />
                  <span class="text-xs font-mono text-slate-300 dark:text-slate-600">{{ userCountByRole()[r.role] ?? 0 }}u</span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{{ r.description }}</p>
              </div>
            }
          </div>
        </section>

        <!-- Matriz de permisos editable -->
        <section>
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <span class="inline-block size-1.5 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
              Permisos por rol
            </p>
            <p class="text-xs text-slate-400 dark:text-slate-500">
              Propietario siempre tiene todos los permisos
            </p>
          </div>
          <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden overflow-x-auto">
            <!-- Header -->
            <div class="min-w-[700px] grid grid-cols-[2fr_repeat(5,1fr)] border-b border-slate-100 dark:border-slate-700 px-4 py-3 bg-slate-50 dark:bg-slate-900/50">
              <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Permiso</p>
              @for (col of editableCols; track col.field) {
                <p class="text-xs font-bold text-center" [class]="col.color">{{ col.label }}</p>
              }
            </div>
            <!-- Rows -->
            <div class="min-w-[700px]">
              @for (perm of rolePermsService.permissions(); track perm.key; let i = $index) {
                <div class="grid grid-cols-[2fr_repeat(5,1fr)] px-4 py-2.5 border-t border-slate-100 dark:border-slate-700"
                     [class.bg-slate-50]="i % 2 !== 0" [class.dark:bg-slate-900/20]="i % 2 !== 0">
                  <div class="self-center">
                    <p class="text-xs text-slate-600 dark:text-slate-300 font-medium">{{ perm.label }}</p>
                    <p class="text-[10px] text-slate-400 font-mono">{{ perm.key }}</p>
                  </div>

                  @for (col of editableCols; track col.field) {
                    <div class="flex justify-center items-center">
                      <button
                        type="button"
                        (click)="togglePerm(perm.key, col.field)"
                        class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
                        [class.bg-primary]="perm[col.field]"
                        [class.bg-slate-200]="!perm[col.field]"
                        [class.dark:bg-slate-600]="!perm[col.field]"
                        [attr.aria-checked]="perm[col.field]"
                        role="switch"
                      >
                        <span class="inline-block size-3.5 rounded-full bg-white shadow transition-transform"
                              [style.transform]="perm[col.field] ? 'translateX(1.125rem)' : 'translateX(0.175rem)'">
                        </span>
                      </button>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-2 px-1">
            Los cambios de permisos se aplican de inmediato para los usuarios conectados.
          </p>
        </section>

        <!-- Usuarios y sus roles -->
        <section>
          <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span class="inline-block size-1.5 bg-primary rounded-full"></span>
            Usuarios y sus roles
          </p>

          @if (userFacade.isLoading()) {
            <div class="space-y-2 animate-pulse">
              @for (i of [1,2,3,4]; track i) {
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 h-16"></div>
              }
            </div>
          } @else {
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
              @for (user of userFacade.users(); track user.id) {
                <div class="flex items-center gap-3 px-4 py-3"
                     [class.border-t]="!$first"
                     [class.border-slate-100]="!$first"
                     [class.dark:border-slate-700]="!$first">
                  <div class="size-9 rounded-full overflow-hidden shrink-0">
                    <img [src]="user.profilePictureUrl" [alt]="user.firstName" class="size-full object-cover" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {{ user.firstName }} {{ user.lastName }}
                    </p>
                    <p class="text-xs text-slate-400 dark:text-slate-500 truncate">{{ user.email }}</p>
                  </div>
                  <select
                    [disabled]="savingUserId() === user.id"
                    (change)="onRoleChange(user, $any($event.target).value)"
                    class="text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-600
                           bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200
                           px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    @for (r of roleDefs; track r.role) {
                      <option [value]="r.role" [selected]="r.role === user.role">{{ r.label }}</option>
                    }
                  </select>
                  @if (savingUserId() === user.id) {
                    <div class="size-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin shrink-0"></div>
                  }
                </div>
              }
            </div>
          }
        </section>

      </div>
    </div>

    <app-success-modal
      [isOpen]="showSuccess()"
      title="Rol actualizado"
      [message]="successMsg()"
      (close)="showSuccess.set(false)"
    />
    <app-error-modal
      [isOpen]="showError()"
      title="Error al actualizar"
      [message]="errorMsg()"
      (close)="showError.set(false)"
      (retry)="retryRoleChange()"
    />
  `,
})
export class RolesPage {
  private readonly router = inject(Router);
  readonly userFacade = inject(UserFacade);
  readonly rolePermsService = inject(PermissionsFacade);

  readonly showSuccess = signal(false);
  readonly showError = signal(false);
  readonly successMsg = signal('');
  readonly errorMsg = signal('');
  readonly savingUserId = signal<string | null>(null);

  private pendingUser: User | null = null;
  private pendingRole: UserRole | null = null;

  readonly roleDefs: RoleDef[] = [
    { role: 'PROPIETARIO',  label: USER_ROLES_LABELS.PROPIETARIO,  description: USER_ROLES_DESCRIPTIONS.PROPIETARIO,  badgeType: 'primary' },
    { role: 'ADMINISTRADOR',label: USER_ROLES_LABELS.ADMINISTRADOR,description: USER_ROLES_DESCRIPTIONS.ADMINISTRADOR,badgeType: 'primary' },
    { role: 'SECRETARIO',   label: USER_ROLES_LABELS.SECRETARIO,   description: USER_ROLES_DESCRIPTIONS.SECRETARIO,   badgeType: 'warning' },
    { role: 'BODEGA',       label: USER_ROLES_LABELS.BODEGA,       description: USER_ROLES_DESCRIPTIONS.BODEGA,       badgeType: 'warning' },
    { role: 'CHOFER',       label: USER_ROLES_LABELS.CHOFER,       description: USER_ROLES_DESCRIPTIONS.CHOFER,       badgeType: 'neutral' },
    { role: 'ADMIN_TI',     label: USER_ROLES_LABELS.ADMIN_TI,     description: USER_ROLES_DESCRIPTIONS.ADMIN_TI,     badgeType: 'primary' },
  ];

  /** Columnas editables de la matriz de permisos (todos excepto PROPIETARIO que es siempre true) */
  readonly editableCols: { field: EditableRoleField; label: string; color: string }[] = [
    { field: 'administrador', label: 'Admin',     color: 'text-primary' },
    { field: 'secretario',    label: 'Secret.',   color: 'text-amber-500' },
    { field: 'bodega',        label: 'Bodega',    color: 'text-emerald-600' },
    { field: 'chofer',        label: 'Chofer',    color: 'text-sky-500' },
    { field: 'adminTi',       label: 'TI',        color: 'text-violet-500' },
  ];

  readonly userCountByRole = computed(() => {
    const counts: Partial<Record<UserRole, number>> = {};
    for (const u of this.userFacade.users()) {
      counts[u.role] = (counts[u.role] ?? 0) + 1;
    }
    return counts;
  });

  togglePerm(key: string, role: EditableRoleField): void {
    this.rolePermsService.togglePermission(key, role);
  }

  async onRoleChange(user: User, newRole: UserRole): Promise<void> {
    if (user.role === newRole) return;
    this.pendingUser = user;
    this.pendingRole = newRole;
    await this.executeRoleChange();
  }

  async retryRoleChange(): Promise<void> {
    this.showError.set(false);
    await this.executeRoleChange();
  }

  private async executeRoleChange(): Promise<void> {
    if (!this.pendingUser || !this.pendingRole) return;
    const user = this.pendingUser;
    const role = this.pendingRole;

    this.savingUserId.set(user.id);
    try {
      await this.userFacade.updateUser({ id: user.id, role });
      this.successMsg.set(`El rol de ${user.firstName} ha sido actualizado a ${USER_ROLES_LABELS[role]}.`);
      this.showSuccess.set(true);
      this.pendingUser = null;
      this.pendingRole = null;
    } catch {
      this.errorMsg.set(`No se pudo actualizar el rol de ${user.firstName}. Intenta nuevamente.`);
      this.showError.set(true);
    } finally {
      this.savingUserId.set(null);
    }
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
