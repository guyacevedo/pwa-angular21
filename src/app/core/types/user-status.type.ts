export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'DISABLED';

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
    ACTIVE: 'Activo', // Activo cuando se loguea
    INACTIVE: 'Inactivo', // Inactivo cuando se desloguea y al crear un usuario nuevo
    DISABLED: 'Deshabilitado', // Deshabilitado cuando se deshabilita
};