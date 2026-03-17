import { EspeciePez, TallaPez, CalidadPez } from './especie.model';

/** Stock de un producto específico (especie + talla + calidad) en bodega */
export interface ItemInventario {
  id: string;                     // especie_talla_calidad o UUID
  especie: EspeciePez;
  talla: TallaPez;
  calidad: CalidadPez;
  stockKg: number;                // Stock en kilogramos
  stockUnidades: number;          // Stock en unidades (para tallas que lo permiten)
  precioCompraPromedio: number;   // Costo promedio ponderado
  precioVentaKg: number;          // Precio de venta por kg
  precioVentaUnidad: number;      // Precio de venta por unidad (0 si no aplica)
  fechaUltimoIngreso: Date;       // Para calcular días en bodega
  ultimaActualizacion: Date;
  alertaRotacion: boolean;        // true si lleva más de 2 días sin movimiento
}

/** Ajuste manual de stock */
export interface AjusteInventario {
  id: string;
  itemInventarioId: string;
  especie: EspeciePez;
  talla: TallaPez;
  calidad: CalidadPez;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  cantidadKg: number;
  cantidadUnidades: number;
  motivoAjuste: string;
  stockAnteriorKg: number;
  stockNuevoKg: number;
  registradoPor: string;
  fecha: Date;
}
