import { Routes } from '@angular/router';
import { manageConfigGuard } from '../../core/guards/role.guard'; // Only used for 'empresa' subroute

export const CONFIGURACION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/configuracion/configuracion.page').then((m) => m.ConfiguracionPage),
  },
  {
    path: 'empresa',
    canActivate: [manageConfigGuard],
    loadComponent: () =>
      import('./pages/empresa-config/empresa-config.page').then((m) => m.EmpresaConfigPage),
  },
];
