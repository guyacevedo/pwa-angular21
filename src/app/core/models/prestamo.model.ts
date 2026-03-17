/** Tipo de préstamo según dirección */
export type TipoPrestamo =
  | 'RECIBIDO'   // Proveedor nos presta (tiene interés)
  | 'OTORGADO';  // Nosotros le prestamos al cliente (sin interés)

export const TIPO_PRESTAMO_LABELS: Record<TipoPrestamo, string> = {
  RECIBIDO:  'Recibido de proveedor',
  OTORGADO:  'Otorgado a cliente',
};

export type EstadoPrestamo = 'ACTIVO' | 'PAGADO' | 'ANULADO';

export interface Prestamo {
  id: string;
  contactoId: string;
  tipo: TipoPrestamo;
  montoOriginal: number;
  saldoPendiente: number;
  tasaInteresMensual: number;   // % mensual; 0 si es OTORGADO
  estado: EstadoPrestamo;

  fechaInicio: Date;
  fechaVencimiento?: Date;
  fechaUltimoMovimiento: Date;

  notas?: string;
  creadoPor: string;
  creadoEn: Date;
  actualizadoEn: Date;
}

/** Movimiento de abono a un préstamo */
export interface AbonoPrestamo {
  id: string;
  prestamoId: string;
  contactoId: string;
  monto: number;
  interesPagado: number;
  capitalPagado: number;
  saldoAnterior: number;
  saldoNuevo: number;
  metodoPago: string;
  referencia?: string;
  fecha: Date;
  registradoPor: string;
}
