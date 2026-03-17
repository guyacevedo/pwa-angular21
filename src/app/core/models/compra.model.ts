import { EspeciePez, TallaPez, CalidadPez, UnidadVenta } from './especie.model';
import { TipoInsumo } from './insumo.model';

export type ModalidadPago = 'CONTADO' | 'CREDITO';

export const MODALIDAD_PAGO_LABELS: Record<ModalidadPago, string> = {
  CONTADO: 'Contado',
  CREDITO: 'Crédito',
};

export type EstadoCompra = 'PAGADA' | 'CREDITO' | 'ANULADA';

/** Ítem de una compra (puede ser pescado o insumo) */
export interface ItemCompra {
  // Si es pescado
  especie?: EspeciePez;
  talla?: TallaPez;
  calidad?: CalidadPez;
  // Si es insumo
  insumoId?: string;
  tipoInsumo?: TipoInsumo;
  nombreInsumo?: string;

  esInsumo: boolean;
  cantidad: number;
  unidad: UnidadVenta | string;  // KG, UNIDAD, o unidad libre para insumos
  precioUnitario: number;
  subtotal: number;
}

export interface Compra {
  id: string;
  proveedorId: string;
  fecha: Date;
  items: ItemCompra[];

  subtotalProductos: number;
  flete: number;
  descuentos: number;
  aumentos: number;
  total: number;

  modalidadPago: ModalidadPago;
  saldoPendiente: number;
  prestamoDescontado: number;   // Monto descontado de préstamo existente

  estado: EstadoCompra;
  notas?: string;
  creadoPor: string;
  creadoEn: Date;
  actualizadoEn: Date;
}

/** Abono a una compra a crédito */
export interface AbonoCompra {
  id: string;
  compraId: string;
  proveedorId: string;
  monto: number;
  tipo: 'ABONO' | 'DESCUENTO_PRESTAMO' | 'AJUSTE';
  metodoPago: string;
  referencia?: string;
  saldoAnterior: number;
  saldoNuevo: number;
  fecha: Date;
  registradoPor: string;
}
