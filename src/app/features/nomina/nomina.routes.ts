import { Routes } from '@angular/router';
import { viewNominaGuard } from '../../core/guards/role.guard';

export const NOMINA_ROUTES: Routes = [
  {
    path: '',
    canActivate: [viewNominaGuard],
    loadComponent: () => import('./pages/nomina/nomina.page').then((m) => m.NominaPage),
  },
];
