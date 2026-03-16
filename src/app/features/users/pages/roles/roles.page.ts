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

interface RoleDef {
  role: UserRole;
  label: string;
  description: string;
  badgeType: 'primary' | 'warning' | 'neutral';
}

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

      <div class="max-w-4xl mx-auto px-4 py-6 space-y-6">

        <!-- Definición de roles -->
        <section>
          <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span class="inline-block size-1.5 bg-primary rounded-full"></span>
            Roles disponibles
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            @for (r of roleDefs; track r.role) {
              <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
                <div class="flex items-center justify-between mb-3">
                  <app-status-badge [text]="r.label" [type]="r.badgeType" size="md" />
                  <span class="text-xs font-mono text-slate-300 dark:text-slate-600">{{ r.role }}</span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{{ r.description }}</p>
                <p class="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-3">
                  {{ userCountByRole()[r.role] ?? 0 }}
                  <span class="font-normal text-slate-400"> usuario{{ (userCountByRole()[r.role] ?? 0) !== 1 ? 's' : '' }}</span>
                </p>
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
              ADMIN siempre tiene todos los permisos
            </p>
          </div>
          <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <!-- Header -->
            <div class="grid grid-cols-[1fr_80px_100px_80px] border-b border-slate-100 dark:border-slate-700 px-4 py-3 bg-slate-50 dark:bg-slate-900/50">
              <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Permiso</p>
              <p class="text-xs font-bold text-center text-primary">Admin</p>
              <p class="text-xs font-bold text-center text-amber-500">Operador</p>
              <p class="text-xs font-bold text-center text-slate-400 dark:text-slate-500">Invitado</p>
            </div>
            <!-- Rows -->
            @for (perm of rolePermsService.permissions(); track perm.key; let i = $index) {
              <div class="grid grid-cols-[1fr_80px_100px_80px] px-4 py-3 border-t border-slate-100 dark:border-slate-700"
                   [class.bg-slate-50]="i % 2 !== 0" [class.dark:bg-slate-900/20]="i % 2 !== 0">
                <p class="text-xs text-slate-600 dark:text-slate-300 font-medium self-center">{{ perm.label }}</p>

                <!-- Admin: siempre activo, no editable -->
                <div class="flex justify-center items-center">
                  <app-svg-icon icon="check" size="16px" class="text-emerald-500 opacity-40"></app-svg-icon>
                </div>

                <!-- Operator: toggle -->
                <div class="flex justify-center items-center">
                  <button
                    type="button"
                    (click)="togglePerm(perm.key, 'operator')"
                    class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    [class.bg-amber-400]="perm.operator"
                    [class.bg-slate-200]="!perm.operator"
                    [class.dark:bg-slate-600]="!perm.operator"
                    [attr.aria-checked]="perm.operator"
                    role="switch"
                  >
                    <span class="inline-block size-3.5 rounded-full bg-white shadow transition-transform"
                          [style.transform]="perm.operator ? 'translateX(1.125rem)' : 'translateX(0.175rem)'">
                    </span>
                  </button>
                </div>

                <!-- Guest: toggle -->
                <div class="flex justify-center items-center">
                  <button
                    type="button"
                    (click)="togglePerm(perm.key, 'guest')"
                    class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    [class.bg-primary]="perm.guest"
                    [class.bg-slate-200]="!perm.guest"
                    [class.dark:bg-slate-600]="!perm.guest"
                    [attr.aria-checked]="perm.guest"
                    role="switch"
                  >
                    <span class="inline-block size-3.5 rounded-full bg-white shadow transition-transform"
                          [style.transform]="perm.guest ? 'translateX(1.125rem)' : 'translateX(0.175rem)'">
                    </span>
                  </button>
                </div>
              </div>
            }
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
                  <!-- Role selector con [selected] en cada option para fix del bug -->
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
    { role: 'ADMIN',    label: USER_ROLES_LABELS.ADMIN,    description: USER_ROLES_DESCRIPTIONS.ADMIN,    badgeType: 'primary' },
    { role: 'OPERATOR', label: USER_ROLES_LABELS.OPERATOR, description: USER_ROLES_DESCRIPTIONS.OPERATOR, badgeType: 'warning' },
    { role: 'GUEST',    label: USER_ROLES_LABELS.GUEST,    description: USER_ROLES_DESCRIPTIONS.GUEST,    badgeType: 'neutral' },
  ];

  readonly userCountByRole = computed(() => {
    const counts: Partial<Record<UserRole, number>> = {};
    for (const u of this.userFacade.users()) {
      counts[u.role] = (counts[u.role] ?? 0) + 1;
    }
    return counts;
  });

  togglePerm(key: string, role: 'operator' | 'guest'): void {
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
