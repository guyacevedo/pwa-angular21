import { Routes } from '@angular/router';
import { viewCavasGuard, manageCavasGuard } from '../../core/guards/role.guard';

export const CAVAS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [viewCavasGuard],
    loadComponent: () =>
      import('./pages/cavas/cavas.page').then((m) => m.CavasPage),
  },
  {
    path: 'nueva',
    canActivate: [manageCavasGuard],
    loadComponent: () =>
      import('./pages/cava-form/cava-form.page').then((m) => m.CavaFormPage),
  },
  {
    path: ':id/editar',
    canActivate: [manageCavasGuard],
    loadComponent: () =>
      import('./pages/cava-form/cava-form.page').then((m) => m.CavaFormPage),
  },
];
