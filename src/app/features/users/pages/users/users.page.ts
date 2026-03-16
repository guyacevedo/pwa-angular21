import {
  Component,
  Signal,
  inject,
  computed,
  signal,
  WritableSignal,
  effect,
} from '@angular/core';
import { Router } from '@angular/router';

import { AuthFacade } from '../../../auth/auth.facade';
import { PermissionsService } from '../../../../core/services/permissions.service';
import { User } from '../../../../core/models';
import { UserFacade } from '../../user.facade';
import { USER_ROLES_LABELS, UserRole } from '../../../../core/types/user-role.type';
import { USER_STATUS_LABELS } from '../../../../core/types/user-status.type';
import { FormHeaderComponent } from 'src/app/shared/components/form-header/form-header.component';
import { ModalFormUserComponent } from '../../components/modal-form-user/modal-form-user.component';
import {
  DataTableComponent,
  DataTableColumn,
} from '../../../../shared/components/data-table/data-table.component';
import { SearchFilterComponent } from '../../../../shared/components/search-filter/search-filter.component';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';

@Component({
  selector: 'app-users',
  imports: [
    FormHeaderComponent,
    ModalFormUserComponent,
    DataTableComponent,
    SearchFilterComponent,
    SvgIconComponent,
  ],
  template: `
    <app-form-header
      title="Usuarios"
      saveLabel="Nuevo Usuario"
      [showSave]="permissions.canManageUsers()"
      [disabled]="false"
      [loading]="false"
      (save)="openModal()"
    ></app-form-header>

    <main class="w-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-20">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-center justify-between mt-2 mb-1">
          <p class="text-slate-500 dark:text-slate-400 text-xs md:text-sm">
            Administra los roles y el acceso del equipo administrativo y operativo.
          </p>
          @if (permissions.canManageRoles()) {
            <button
              (click)="goToRoles()"
              class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors shrink-0"
            >
              <app-svg-icon icon="settings" size="14px"></app-svg-icon>
              Gestionar roles
            </button>
          }
        </div>

        <!-- Search & Filters -->
        <div class="mt-4 mb-3">
          <app-search-filter
            [searchTerm]="searchTerm()"
            placeholder="Buscar por nombre, DNI o correo..."
            [filters]="filterConfig()"
            (searchChange)="searchTerm.set($event)"
            (filterChange)="onFilterChange($event)"
          />
        </div>

        <!-- Data Table -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <app-data-table
            [data]="filteredUsers()"
            [columns]="columns"
            [loading]="userFacade.isLoading()"
            [error]="userFacade.error()"
            actionTrigger="row"
            emptyMessage="No se encontraron usuarios"
            emptyIcon="user"
            [itemsPerPage]="10"
            totalItemsLabel="Total de usuarios"
            (actionClick)="onRowClick($event)"
            (retryClick)="userFacade.getUsers()"
          />
        </div>
      </div>
    </main>

    @if (isModalOpen()) {
      <app-modal-form-user [user]="selectedUserEdit()" (closed)="onModalClosed($event)" />
    }
  `,
})
export class UsersPage {
  private readonly authFacade = inject(AuthFacade);
  readonly userFacade = inject(UserFacade);
  private readonly router = inject(Router);
  readonly permissions = inject(PermissionsService);

  readonly user: Signal<User | null> = this.authFacade.user;
  readonly users: Signal<User[]> = this.userFacade.users;

  readonly searchTerm: WritableSignal<string> = signal('');
  readonly selectedRole: WritableSignal<UserRole | 'ALL'> = signal('ALL');

  readonly isModalOpen = signal(false);
  readonly selectedUserEdit = signal<User | null>(null);

  private readonly roleOptions = [
    { label: 'Todos', value: 'ALL' },
    ...Object.entries(USER_ROLES_LABELS).map(([key, label]) => ({ label, value: key })),
  ];

  readonly filterConfig = computed(() => [
    {
      key: 'role',
      label: 'Rol',
      type: 'chip' as const,
      value: this.selectedRole(),
      options: this.roleOptions,
    },
  ]);

  readonly columns: DataTableColumn<User>[] = [
    {
      key: 'profilePictureUrl',
      label: '',
      type: 'custom',
      align: 'center',
      customFormat: () => '',
    },
    {
      key: 'firstName',
      label: 'Nombre',
      type: 'custom',
      sortable: true,
      customFormat: (u) => `${u.firstName} ${u.lastName}`,
    },
    {
      key: 'dni',
      label: 'C.C. / DNI',
      type: 'text',
      sortable: true,
    },
    {
      key: 'email',
      label: 'Correo',
      type: 'text',
      sortable: true,
      hiddenOnMobile: true,
    },
    {
      key: 'role',
      label: 'Rol',
      type: 'badge',
      align: 'center',
      badgeTextFunction: (u) => USER_ROLES_LABELS[u.role],
      badgeColorFunction: (u) =>
        u.role === 'ADMIN'
          ? 'bg-primary/10 text-primary border-primary/20'
          : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
    },
    {
      key: 'status',
      label: 'Estado',
      type: 'badge',
      align: 'center',
      badgeTextFunction: (u) => USER_STATUS_LABELS[u.status],
      badgeColorFunction: (u) => {
        switch (u.status) {
          case 'ACTIVE':
            return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
          case 'INACTIVE':
            return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
          case 'DISABLED':
            return 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
        }
      },
    },
    {
      key: 'lastLogin',
      label: 'Últ. acceso',
      type: 'date',
      hiddenOnMobile: true,
    },
  ];

  readonly filteredUsers = computed(() => {
    const all = this.users();
    const role = this.selectedRole();
    const term = this.searchTerm().toLowerCase().trim();

    const byRole = role === 'ALL' ? all : all.filter((u) => u.role === role);

    if (!term) return byRole;

    return byRole.filter(
      (u) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(term) ||
        u.dni.includes(term) ||
        u.email.toLowerCase().includes(term),
    );
  });

  constructor() {
    effect(() => {
      this.userFacade.getUsers();
    });
  }

  onFilterChange(event: { key: string; value: string | number | boolean }) {
    if (event.key === 'role') {
      this.selectedRole.set(event.value as UserRole | 'ALL');
    }
  }

  onRowClick(user: User) {
    this.router.navigate(['/users', user.id]);
  }

  goToRoles() {
    this.router.navigate(['/users/roles']);
  }

  openModal(userToEdit?: User) {
    this.selectedUserEdit.set(userToEdit || null);
    this.isModalOpen.set(true);
  }

  onModalClosed(result: { role: string }) {
    console.log('Modal closed with result:', result);
    this.isModalOpen.set(false);
    this.selectedUserEdit.set(null);
  }
}
