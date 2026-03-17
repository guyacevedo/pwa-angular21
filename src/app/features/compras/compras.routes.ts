import { Routes } from '@angular/router';
import { viewComprasGuard, manageComprasGuard } from '../../core/guards/role.guard';

export const COMPRAS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [viewComprasGuard],
    loadComponent: () =>
      import('./pages/compras/compras.page').then((m) => m.ComprasPage),
  },
  {
    path: 'nueva',
    canActivate: [manageComprasGuard],
    loadComponent: () =>
      import('./pages/compra-form/compra-form.page').then((m) => m.CompraFormPage),
  },
  {
    path: ':id',
    canActivate: [viewComprasGuard],
    loadComponent: () =>
      import('./pages/compra-detalle/compra-detalle.page').then((m) => m.CompraDetallePage),
  },
];
