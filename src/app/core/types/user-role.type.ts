export type UserRole =
  | 'ADMIN'     // Administrador: acceso total
  | 'OPERATOR'  // Operador: acceso operativo, sin gestión de usuarios ni config
  | 'GUEST'     // Invitado: solo lectura y perfil propio

export const USER_ROLES_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  OPERATOR: 'Operador',
  GUEST: 'Invitado',
};

export const USER_ROLES_DESCRIPTIONS: Record<UserRole, string> = {
  ADMIN: 'Acceso total: usuarios, configuración y estadísticas',
  OPERATOR: 'Acceso operativo: dashboard y perfil propio',
  GUEST: 'Acceso limitado: solo lectura y perfil propio',
};
