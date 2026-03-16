import { Injectable, inject, computed } from '@angular/core';

import { EstadisticasDiarias, KPIWidget } from '../models/estadisticas.model';
import { UserFacade } from 'src/app/features/users/user.facade';
import { AUTH_PROVIDER } from '../interfaces/auth-provider.interface';
import { PermissionsService } from './permissions.service';

export interface AlertaNegocio {
  tipo: 'warning' | 'danger' | 'info';
  titulo: string;
  descripcion: string;
  ruta?: string;
}

@Injectable({
  providedIn: 'root',
})
export class EstadisticasService {
  private usuariosFacade = inject(UserFacade);
  private authProvider = inject(AUTH_PROVIDER);
  private permissions = inject(PermissionsService);

  public async refresh(): Promise<void> {
    await this.usuariosFacade.getUsers();
  }

  private hoy(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  readonly estadisticasDiarias = computed<EstadisticasDiarias>(() => {
    const users = this.usuariosFacade.users();
    const stats = {
      fecha: this.hoy(),
      updatedAt: this.hoy(),
      usuariosTotales: 0,
      usuariosActivos: 0,
      usuariosInactivos: 0,
      usuariosDeshabilitados: 0,
      usuariosAdmin: 0,
      usuariosInvitados: 0,
    };

    for (const user of users) {
      stats.usuariosTotales++;
      if (user.status === 'ACTIVE') stats.usuariosActivos++;
      if (user.status === 'INACTIVE') stats.usuariosInactivos++;
      if (user.status === 'DISABLED') stats.usuariosDeshabilitados++;
      if (user.role === 'ADMIN') stats.usuariosAdmin++;
      if (user.role === 'GUEST') stats.usuariosInvitados++;
    }

    return stats;
  });

  /** Widgets de administrador: métricas globales de todos los usuarios */
  readonly adminWidgets = computed<KPIWidget[]>(() => {
    const s = this.estadisticasDiarias();
    return [
      {
        label: 'Usuarios Totales',
        value: s.usuariosTotales,
        icon: 'people',
        color: 'primary',
        trend: 'neutral',
      },
      {
        label: 'Activos',
        value: s.usuariosActivos,
        icon: 'check',
        color: 'success',
        trend: 'neutral',
      },
      {
        label: 'Inactivos',
        value: s.usuariosInactivos,
        icon: 'alert',
        color: 'warning',
        trend: 'neutral',
      },
      {
        label: 'Deshabilitados',
        value: s.usuariosDeshabilitados,
        icon: 'error',
        color: 'danger',
      },
      {
        label: 'Administradores',
        value: s.usuariosAdmin,
        icon: 'settings',
        color: 'primary',
        trend: 'neutral',
      },
      {
        label: 'Invitados',
        value: s.usuariosInvitados,
        icon: 'user',
        color: 'slate',
      },
    ];
  });

  /** Widgets de invitado: solo datos de la propia cuenta */
  readonly guestWidgets = computed<KPIWidget[]>(() => {
    const currentUser = this.authProvider.user();
    if (!currentUser) return [];

    const statusLabel: Record<string, string> = {
      ACTIVE: 'Activa',
      INACTIVE: 'Inactiva',
      DISABLED: 'Deshabilitada',
    };
    const statusColor: Record<string, KPIWidget['color']> = {
      ACTIVE: 'success',
      INACTIVE: 'warning',
      DISABLED: 'danger',
    };

    return [
      {
        label: 'Mi Estado',
        value: statusLabel[currentUser.status] ?? currentUser.status,
        icon: currentUser.status === 'ACTIVE' ? 'check' : 'alert',
        color: statusColor[currentUser.status] ?? 'slate',
      },
      {
        label: 'Mi Rol',
        value: currentUser.role === 'ADMIN' ? 'Administrador' : 'Invitado',
        icon: 'user',
        color: currentUser.role === 'ADMIN' ? 'primary' : 'slate',
      },
    ];
  });

  /** Widgets a mostrar según el rol del usuario actual y sus permisos */
  readonly widgets = computed<KPIWidget[]>(() => {
    const canViewAdminStats = this.permissions.canViewAdminStats();
    return canViewAdminStats ? this.adminWidgets() : this.guestWidgets();
  });

  /** Alertas de negocio (solo relevantes para ADMIN) */
  readonly adminAlertas = computed<AlertaNegocio[]>(() => {
    const s = this.estadisticasDiarias();
    const alertas: AlertaNegocio[] = [];

    if (s.usuariosDeshabilitados > 0) {
      alertas.push({
        tipo: 'danger',
        titulo: `${s.usuariosDeshabilitados} usuario${s.usuariosDeshabilitados > 1 ? 's' : ''} deshabilitado${s.usuariosDeshabilitados > 1 ? 's' : ''}`,
        descripcion: 'Revisa las cuentas deshabilitadas y toma acción.',
        ruta: '/users',
      });
    }

    if (s.usuariosInactivos > 0) {
      alertas.push({
        tipo: 'warning',
        titulo: `${s.usuariosInactivos} usuario${s.usuariosInactivos > 1 ? 's' : ''} inactivo${s.usuariosInactivos > 1 ? 's' : ''}`,
        descripcion: 'Estos usuarios aún no han activado su cuenta.',
        ruta: '/users',
      });
    }

    if (s.usuariosTotales === 0) {
      alertas.push({
        tipo: 'info',
        titulo: 'Sin usuarios registrados',
        descripcion: 'Crea el primer usuario para comenzar.',
        ruta: '/users',
      });
    }

    return alertas;
  });

  /** Alertas personales para GUEST */
  readonly guestAlertas = computed<AlertaNegocio[]>(() => {
    const currentUser = this.authProvider.user();
    if (!currentUser) return [];
    const alertas: AlertaNegocio[] = [];

    if (currentUser.status === 'INACTIVE') {
      alertas.push({
        tipo: 'warning',
        titulo: 'Cuenta inactiva',
        descripcion: 'Tu cuenta aún no ha sido activada. Contacta al administrador.',
      });
    }

    if (currentUser.status === 'DISABLED') {
      alertas.push({
        tipo: 'danger',
        titulo: 'Cuenta deshabilitada',
        descripcion: 'Tu cuenta ha sido deshabilitada. Contacta al administrador.',
      });
    }

    return alertas;
  });

  /** Alertas a mostrar según los permisos del usuario actual */
  readonly alertas = computed<AlertaNegocio[]>(() => {
    const canViewAdminStats = this.permissions.canViewAdminStats();
    return canViewAdminStats ? this.adminAlertas() : this.guestAlertas();
  });
}
