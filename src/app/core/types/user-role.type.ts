export type UserRole =
  | 'PROPIETARIO'  // Dueño: acceso ejecutivo total, reportes
  | 'ADMINISTRADOR' // Administrador: operaciones completas + gestión
  | 'SECRETARIO'   // Secretario/a: ventas, compras, contactos, abonos
  | 'BODEGA'       // Bodega: inventario, compras, insumos, calidad
  | 'CHOFER'       // Chofer: viajes, gastos, retorno de cavas
  | 'ADMIN_TI';    // TI: configuración del sistema, logs, usuarios

export const USER_ROLES_LABELS: Record<UserRole, string> = {
  PROPIETARIO: 'Propietario',
  ADMINISTRADOR: 'Administrador',
  SECRETARIO: 'Secretario/a',
  BODEGA: 'Bodega',
  CHOFER: 'Chofer',
  ADMIN_TI: 'Admin TI',
};

export const USER_ROLES_DESCRIPTIONS: Record<UserRole, string> = {
  PROPIETARIO: 'Acceso ejecutivo: dashboard, reportes y estadísticas globales',
  ADMINISTRADOR: 'Acceso completo: operaciones, flota, nómina y usuarios',
  SECRETARIO: 'Acceso comercial: ventas, compras, contactos y abonos',
  BODEGA: 'Acceso de bodega: inventario, compras, insumos y calidad',
  CHOFER: 'Acceso de logística: viajes, gastos y retorno de cavas',
  ADMIN_TI: 'Acceso técnico: configuración del sistema y usuarios',
};
