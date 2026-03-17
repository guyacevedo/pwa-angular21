import { Routes } from '@angular/router';
import { viewViajesGuard, manageViajesGuard } from '../../core/guards/role.guard';

export const VIAJES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [viewViajesGuard],
    loadComponent: () => import('./pages/viajes/viajes.page').then((m) => m.ViajesPage),
  },
  {
    path: 'nuevo',
    canActivate: [manageViajesGuard],
    loadComponent: () => import('./pages/viaje-form/viaje-form.page').then((m) => m.ViajeFormPage),
  },
  {
    path: ':id',
    canActivate: [viewViajesGuard],
    loadComponent: () => import('./pages/viaje-detalle/viaje-detalle.page').then((m) => m.ViajeDetallePage),
  },
];
