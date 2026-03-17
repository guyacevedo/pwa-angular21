/** Tipo de relación comercial del contacto */
export type TipoContacto = 'CLIENTE' | 'PROVEEDOR' | 'AMBOS';

export const TIPO_CONTACTO_LABELS: Record<TipoContacto, string> = {
  CLIENTE:   'Cliente',
  PROVEEDOR: 'Proveedor',
  AMBOS:     'Cliente y Proveedor',
};

/** Ciudades de distribución nacional */
export const CIUDADES_DISTRIBUCION = [
  'Magangué',
  'Bogotá',
  'Cartagena',
  'Barranquilla',
  'Sincelejo',
  'Montería',
  'Valledupar',
  'Honda',
  'Barrancabermeja',
  'Otra',
] as const;

/** Contacto: puede ser cliente, proveedor o ambos */
export interface Contacto {
  id: string;
  tipo: TipoContacto;
  nombre: string;               // Nombre completo o razón social
  nit?: string;                 // NIT o cédula empresarial
  cedula?: string;              // Cédula personal
  telefono: string;
  telefonoAlt?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  notas?: string;

  // Cartera y activos pendientes
  saldoCartera: number;         // + cliente nos debe, - tiene saldo a favor
  cavasPendientes: number;      // Cavas que tiene por devolver
  canastillasPendientes: number;// Canastillas retornables por devolver
  prestamoPendiente: number;    // Préstamo activo (si existe)

  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
  creadoPor: string;
}
