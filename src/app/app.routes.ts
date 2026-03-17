import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.routes').then((m) => m.USERS_ROUTES),
      },
      {
        path: 'configuracion',
        loadChildren: () =>
          import('./features/configuracion/configuracion.routes').then(
            (m) => m.CONFIGURACION_ROUTES,
          ),
      },
      {
        path: 'contactos',
        loadChildren: () =>
          import('./features/contactos/contactos.routes').then((m) => m.CONTACTOS_ROUTES),
      },
      {
        path: 'inventario',
        loadChildren: () =>
          import('./features/inventario/inventario.routes').then((m) => m.INVENTARIO_ROUTES),
      },
      {
        path: 'insumos',
        loadChildren: () =>
          import('./features/insumos/insumos.routes').then((m) => m.INSUMOS_ROUTES),
      },
      {
        path: 'compras',
        loadChildren: () =>
          import('./features/compras/compras.routes').then((m) => m.COMPRAS_ROUTES),
      },
      {
        path: 'ventas',
        loadChildren: () =>
          import('./features/ventas/ventas.routes').then((m) => m.VENTAS_ROUTES),
      },
      {
        path: 'cavas',
        loadChildren: () =>
          import('./features/cavas/cavas.routes').then((m) => m.CAVAS_ROUTES),
      },
      {
        path: 'viajes',
        loadChildren: () =>
          import('./features/viajes/viajes.routes').then((m) => m.VIAJES_ROUTES),
      },
      {
        path: 'camiones',
        loadChildren: () =>
          import('./features/camiones/camiones.routes').then((m) => m.CAMIONES_ROUTES),
      },
      {
        path: 'prestamos',
        loadChildren: () =>
          import('./features/prestamos/prestamos.routes').then((m) => m.PRESTAMOS_ROUTES),
      },
      {
        path: 'nomina',
        loadChildren: () =>
          import('./features/nomina/nomina.routes').then((m) => m.NOMINA_ROUTES),
      },
      {
        path: 'reportes',
        loadChildren: () =>
          import('./features/reportes/reportes.routes').then((m) => m.REPORTES_ROUTES),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  // Redirect to dashboard if no route matches
  {
    path: '**',
    redirectTo: '',
  },
];
