import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { UserFacade } from '../../user.facade';
import { AuthFacade } from '../../../auth/auth.facade';
import { PermissionsService } from '../../../../core/services/permissions.service';
import { User } from '../../../../core/models';
import { USER_ROLES_LABELS } from '../../../../core/types/user-role.type';
import { USER_STATUS_LABELS } from '../../../../core/types/user-status.type';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { ModalFormUserComponent } from '../../components/modal-form-user/modal-form-user.component';

@Component({
  selector: 'app-user-detail',
  imports: [DatePipe, SvgIconComponent, StatusBadgeComponent, ModalFormUserComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-20">

      <!-- Top Bar -->
      <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <button
          (click)="goBack()"
          class="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-medium text-sm"
        >
          <app-svg-icon icon="arrowLeft" size="20px"></app-svg-icon>
          Volver a Usuarios
        </button>

        @if (user() && permissions.canManageUsers()) {
          <button
            (click)="openEditModal()"
            class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition-colors"
          >
            <app-svg-icon icon="edit" size="16px"></app-svg-icon>
            Editar
          </button>
        }
      </div>

      @if (isLoading()) {
        <!-- Skeleton -->
        <div class="max-w-3xl mx-auto px-4 mt-8 animate-pulse">
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-6 mb-6">
            <div class="size-24 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0"></div>
            <div class="flex-1 space-y-3 w-full">
              <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48"></div>
              <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded w-32"></div>
              <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded w-40"></div>
            </div>
          </div>
          @for (i of [1, 2]; track i) {
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 mb-4 space-y-4">
              <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded w-40"></div>
              <div class="grid grid-cols-2 gap-4">
                @for (j of [1, 2, 3, 4]; track j) {
                  <div class="space-y-2">
                    <div class="h-3 bg-slate-100 dark:bg-slate-800 rounded w-20"></div>
                    <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      } @else if (!user()) {
        <!-- Not Found -->
        <div class="flex flex-col items-center justify-center py-32 text-slate-400">
          <app-svg-icon icon="error" size="64px" class="opacity-30 mb-4"></app-svg-icon>
          <p class="text-lg font-medium mb-2">Usuario no encontrado</p>
          <button (click)="goBack()" class="text-primary font-medium text-sm hover:underline">
            Volver al listado
          </button>
        </div>
      } @else {
        <div class="max-w-3xl mx-auto px-4 mt-8 space-y-4">

          <!-- Header Card: Avatar + name + badges -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div class="size-24 rounded-2xl overflow-hidden ring-4 ring-primary/10 shrink-0 shadow-sm">
              <img
                [src]="user()!.profilePictureUrl"
                [alt]="user()!.firstName"
                class="size-full object-cover object-top"
              />
            </div>
            <div class="flex-1 text-center sm:text-left">
              <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white">
                {{ user()!.firstName }} {{ user()!.lastName }}
              </h1>
              <p class="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{{ user()!.email }}</p>
              <div class="flex items-center justify-center sm:justify-start gap-2 mt-3 flex-wrap">
                <app-status-badge
                  [text]="roleLabel()"
                  [type]="['PROPIETARIO','ADMINISTRADOR','ADMIN_TI'].includes(user()!.role) ? 'primary' : 'neutral'"
                  size="md"
                />
                <app-status-badge
                  [text]="statusLabel()"
                  [type]="statusBadgeType()"
                  size="md"
                />
              </div>
              @if (isSelf()) {
                <p class="text-xs text-primary font-semibold mt-2 opacity-70">Este es tu perfil</p>
              }
            </div>
          </div>

          <!-- Personal Info -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
            <h2 class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <div class="size-1.5 bg-primary rounded-full"></div>
              Información Personal
            </h2>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
              <div>
                <p class="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide mb-1">Nombre</p>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ user()!.firstName }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide mb-1">Apellidos</p>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ user()!.lastName }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide mb-1">C.C. / DNI</p>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ user()!.dni }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide mb-1">Correo</p>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{{ user()!.email }}</p>
              </div>
              @if (user()!.phone) {
                <div>
                  <p class="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide mb-1">Teléfono</p>
                  <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ user()!.phone }}</p>
                </div>
              }
            </div>
          </div>

          <!-- Account Info -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
            <h2 class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <div class="size-1.5 bg-primary rounded-full"></div>
              Cuenta y Acceso
            </h2>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
              <div>
                <p class="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide mb-1">Rol</p>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ roleLabel() }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide mb-1">Estado</p>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ statusLabel() }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide mb-1">Registro</p>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {{ user()!.registrationDate | date: 'dd/MM/yyyy' }}
                </p>
              </div>
              <div>
                <p class="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide mb-1">Último acceso</p>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {{ user()!.lastLogin | date: 'dd/MM/yyyy HH:mm' }}
                </p>
              </div>
              <div>
                <p class="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide mb-1">Último cierre</p>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {{ user()!.lastLogout | date: 'dd/MM/yyyy HH:mm' }}
                </p>
              </div>
            </div>
          </div>

        </div>
      }
    </div>

    @if (isEditModalOpen()) {
      <app-modal-form-user [user]="user()" (closed)="onEditModalClosed($event)" />
    }
  `,
})
export class UserDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userFacade = inject(UserFacade);
  private readonly authFacade = inject(AuthFacade);
  readonly permissions = inject(PermissionsService);

  readonly user = signal<User | null>(null);
  readonly isLoading = signal(true);
  readonly isEditModalOpen = signal(false);

  readonly roleLabel = computed(() => USER_ROLES_LABELS[this.user()?.role ?? 'CHOFER']);
  readonly statusLabel = computed(() => USER_STATUS_LABELS[this.user()?.status ?? 'INACTIVE']);
  readonly statusBadgeType = computed(() => {
    switch (this.user()?.status) {
      case 'ACTIVE': return 'success' as const;
      case 'INACTIVE': return 'warning' as const;
      case 'DISABLED': return 'danger' as const;
      default: return 'neutral' as const;
    }
  });
  readonly isSelf = computed(() => this.authFacade.user()?.id === this.user()?.id);

  constructor() {
    effect(() => {
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) {
        this.isLoading.set(false);
        return;
      }
      this.userFacade.getUserById(id).then((u) => {
        this.user.set(u);
        this.isLoading.set(false);
      });
    });
  }

  goBack() {
    this.router.navigate(['/users']);
  }

  openEditModal() {
    this.isEditModalOpen.set(true);
  }

  onEditModalClosed(result: { role: string }) {
    this.isEditModalOpen.set(false);
    if (result.role === 'confirm') {
      // Reload user data
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.isLoading.set(true);
        this.userFacade.getUserById(id).then((u) => {
          this.user.set(u);
          this.isLoading.set(false);
        });
      }
    }
  }
}
