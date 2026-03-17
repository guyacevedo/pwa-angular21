import { EspeciePez, TallaPez, UnidadVenta } from './especie.model';
import { ModalidadPago } from './compra.model';

export type ModalidadEmpaque = 'BOLSA' | 'CAVA' | 'CANASTILLA' | 'MIXTO';

export const MODALIDAD_EMPAQUE_LABELS: Record<ModalidadEmpaque, string> = {
  BOLSA:      'Bolsa (directo)',
  CAVA:       'Cava de icopor',
  CANASTILLA: 'Canastilla',
  MIXTO:      'Mixto',
};

export type EstadoVenta = 'PAGADA' | 'CREDITO' | 'ANULADA';

/** Ítem de producto dentro de una venta */
export interface ItemVenta {
  especie: EspeciePez;
  talla: TallaPez;
  cantidad: number;
  unidad: UnidadVenta;
  precioUnitario: number;
  subtotal: number;
}

/** Gastos operativos asociados a la venta */
export interface GastosVenta {
  hielo: number;
  pita: number;
  otros: number;
  descripcionOtros?: string;
}

/** Venta registrada */
export interface Venta {
  id: string;
  clienteId: string;
  fecha: Date;
  items: ItemVenta[];

  modalidadEmpaque: ModalidadEmpaque;
  cavasIds: string[];           // IDs de cavas utilizadas
  canastillasIds: string[];     // IDs de canastillas utilizadas

  subtotalProductos: number;
  gastos: GastosVenta;
  totalGastos: number;          // suma de gastos
  flete: number;
  descuentos: number;
  aumentos: number;
  total: number;                // subtotalProductos + totalGastos + flete - descuentos + aumentos

  modalidadPago: ModalidadPago;
  saldoPendiente: number;
  prestamoDescontado: number;

  estado: EstadoVenta;
  viajeId?: string;             // Asignada a un viaje (si aplica)
  notas?: string;
  creadoPor: string;
  creadoEn: Date;
  actualizadoEn: Date;
}

/** Abono a una venta a crédito */
export interface AbonoVenta {
  id: string;
  ventaId: string;
  clienteId: string;
  monto: number;
  tipo: 'ABONO' | 'DESCUENTO_PRESTAMO' | 'AJUSTE';
  metodoPago: string;
  referencia?: string;
  saldoAnterior: number;
  saldoNuevo: number;
  fecha: Date;
  registradoPor: string;
}
