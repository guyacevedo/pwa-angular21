import { Routes } from '@angular/router';
import { viewInventarioGuard, manageInventarioGuard } from '../../core/guards/role.guard';

export const INVENTARIO_ROUTES: Routes = [
  {
    path: '',
    canActivate: [viewInventarioGuard],
    loadComponent: () =>
      import('./pages/inventario/inventario.page').then((m) => m.InventarioPage),
  },
  {
    path: 'ajuste',
    canActivate: [manageInventarioGuard],
    loadComponent: () =>
      import('./pages/ajuste-stock/ajuste-stock.page').then((m) => m.AjusteStockPage),
  },
];
