import { Routes } from '@angular/router';
import { viewReportesGuard } from '../../core/guards/role.guard';

export const REPORTES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [viewReportesGuard],
    loadComponent: () => import('./pages/reportes/reportes.page').then((m) => m.ReportesPage),
  },
];
