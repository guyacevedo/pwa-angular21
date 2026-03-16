import { Routes } from '@angular/router';
import { viewUsersGuard, manageUsersGuard, manageRolesGuard } from '../../core/guards/role.guard';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [viewUsersGuard],
    loadComponent: () => import('./pages/users/users.page').then((m) => m.UsersPage),
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then((m) => m.ProfilePage),
  },
  {
    path: 'roles',
    canActivate: [manageRolesGuard],
    loadComponent: () => import('./pages/roles/roles.page').then((m) => m.RolesPage),
  },
  {
    path: ':id',
    canActivate: [manageUsersGuard],
    loadComponent: () => import('./pages/user-detail/user-detail.page').then((m) => m.UserDetailPage),
  },
];
