export interface EstadisticasDiarias {
  fecha: string | Date; // YYYY-MM-DD
  updatedAt: Date;

  // Usuarios (Snapshot)
  usuariosTotales: number;
  usuariosActivos: number;
  usuariosInactivos: number;
  usuariosInvitados: number;
  usuariosAdmin: number;
  usuariosDeshabilitados: number;

}

export interface KPIWidget {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}
