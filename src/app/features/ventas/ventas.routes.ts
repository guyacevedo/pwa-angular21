import { Routes } from '@angular/router';
import { viewVentasGuard, manageVentasGuard } from '../../core/guards/role.guard';

export const VENTAS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [viewVentasGuard],
    loadComponent: () =>
      import('./pages/ventas/ventas.page').then((m) => m.VentasPage),
  },
  {
    path: 'nueva',
    canActivate: [manageVentasGuard],
    loadComponent: () =>
      import('./pages/venta-form/venta-form.page').then((m) => m.VentaFormPage),
  },
  {
    path: ':id',
    canActivate: [viewVentasGuard],
    loadComponent: () =>
      import('./pages/venta-detalle/venta-detalle.page').then((m) => m.VentaDetallePage),
  },
];
