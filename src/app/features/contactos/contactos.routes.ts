import { Routes } from '@angular/router';
import { viewContactosGuard, manageContactosGuard } from '../../core/guards/role.guard';

export const CONTACTOS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [viewContactosGuard],
    loadComponent: () =>
      import('./pages/contactos/contactos.page').then((m) => m.ContactosPage),
  },
  {
    path: 'nuevo',
    canActivate: [manageContactosGuard],
    loadComponent: () =>
      import('./pages/contacto-form/contacto-form.page').then((m) => m.ContactoFormPage),
  },
  {
    path: ':id',
    canActivate: [viewContactosGuard],
    loadComponent: () =>
      import('./pages/contacto-detalle/contacto-detalle.page').then((m) => m.ContactoDetallePage),
  },
  {
    path: ':id/editar',
    canActivate: [manageContactosGuard],
    loadComponent: () =>
      import('./pages/contacto-form/contacto-form.page').then((m) => m.ContactoFormPage),
  },
];
