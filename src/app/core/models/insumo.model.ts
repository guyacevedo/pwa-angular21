/** Tipos de insumos operativos */
export type TipoInsumo = 'HIELO' | 'PITA' | 'PAPEL' | 'SAL' | 'OTRO';

export const INSUMO_LABELS: Record<TipoInsumo, string> = {
  HIELO: 'Hielo',
  PITA:  'Pita',
  PAPEL: 'Papel/Bolsas',
  SAL:   'Sal',
  OTRO:  'Otro',
};

/** Stock actual de un insumo */
export interface Insumo {
  id: string;
  tipo: TipoInsumo;
  nombre: string;              // Ej: "Hielo en bloque", "Pita x500m"
  stockActual: number;
  unidad: string;              // kg, rollos, bolsas, sacos
  puntoReorden: number;        // Stock mínimo para alerta
  precioUnitario: number;
  ultimaCompra: Date;
  ultimaActualizacion: Date;
  activo: boolean;
}

/** Compra de insumo */
export interface CompraInsumo {
  id: string;
  insumoId: string;
  proveedorId?: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  total: number;
  fecha: Date;
  registradoPor: string;
  notas?: string;
}
