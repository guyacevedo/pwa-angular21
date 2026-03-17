import { Routes } from '@angular/router';
import { viewInsumosGuard } from '../../core/guards/role.guard';

export const INSUMOS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [viewInsumosGuard],
    loadComponent: () =>
      import('./pages/insumos/insumos.page').then((m) => m.InsumosPage),
  },
];
