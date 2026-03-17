import { Routes } from '@angular/router';
import { viewCamionesGuard, manageCamionesGuard } from '../../core/guards/role.guard';

export const CAMIONES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [viewCamionesGuard],
    loadComponent: () => import('./pages/camiones/camiones.page').then((m) => m.CamionesPage),
  },
  {
    path: 'nuevo',
    canActivate: [manageCamionesGuard],
    loadComponent: () => import('./pages/camion-form/camion-form.page').then((m) => m.CamionFormPage),
  },
  {
    path: ':id/editar',
    canActivate: [manageCamionesGuard],
    loadComponent: () => import('./pages/camion-form/camion-form.page').then((m) => m.CamionFormPage),
  },
];
