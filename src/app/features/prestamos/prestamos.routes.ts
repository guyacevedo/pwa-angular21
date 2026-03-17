import { Routes } from '@angular/router';
import { viewPrestamosGuard, managePrestamosGuard } from '../../core/guards/role.guard';

export const PRESTAMOS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [viewPrestamosGuard],
    loadComponent: () =>
      import('./pages/prestamos/prestamos.page').then((m) => m.PrestamosPage),
  },
  {
    path: 'nuevo',
    canActivate: [managePrestamosGuard],
    loadComponent: () =>
      import('./pages/prestamo-form/prestamo-form.page').then((m) => m.PrestamoFormPage),
  },
];
