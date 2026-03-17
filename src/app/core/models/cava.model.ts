/** Estado operativo de una cava de icopor */
export type EstadoCava =
  | 'DISPONIBLE'       // En bodega, lista para usar
  | 'EN_VIAJE'         // Actualmente en un camión
  | 'PENDIENTE_RETORNO'// Entregada al cliente, esperando devolución
  | 'BAJA';            // Dada de baja (fin de vida útil o daño)

export const ESTADO_CAVA_LABELS: Record<EstadoCava, string> = {
  DISPONIBLE:        'Disponible',
  EN_VIAJE:          'En viaje',
  PENDIENTE_RETORNO: 'Pendiente retorno',
  BAJA:              'Baja',
};

/** Cava de icopor reutilizable con ID físico único */
export interface Cava {
  id: string;                  // ID del sistema
  codigoFisico: string;        // Número grabado en la cava (ej. "C-001")
  capacidadKg: number;         // Capacidad máxima en kg (28 kg estándar)
  estado: EstadoCava;
  viajesRealizados: number;    // Conteo de viajes completados
  vidaUtilMax: number;         // Máximo de viajes (10–15)
  alertaBajaProxima: boolean;  // true si queda ≤3 viajes de vida útil

  // Ubicación actual
  clienteActualId?: string;    // ID del cliente que la tiene
  ventaActualId?: string;      // ID de la venta asociada
  viajeActualId?: string;      // ID del viaje activo

  // Costos
  costoCompra: number;
  costoPersonalizacion: number; // Marcado, numeración, ajustes
  costoTotal: number;           // costoCompra + costoPersonalizacion
  fleteUso: number;             // Flete cobrado por uso en cada viaje

  activaDesde: Date;
  fechaUltimoBaja?: Date;
  notas?: string;
  creadoEn: Date;
  actualizadoEn: Date;
}

/** Canastilla de plástico/cartón */
export type TipoCanastilla = 'RETORNABLE' | 'DESECHABLE';

export const TIPO_CANASTILLA_LABELS: Record<TipoCanastilla, string> = {
  RETORNABLE:  'Retornable',
  DESECHABLE:  'Desechable (un solo uso)',
};

export interface Canastilla {
  id: string;
  tipo: TipoCanastilla;
  descripcion?: string;
  capacidadKg: number;
  estado: 'DISPONIBLE' | 'EN_USO' | 'BAJA';
  clienteActualId?: string;
  ventaActualId?: string;
  viajeActualId?: string;
  costoUnitario: number;
  viajesRealizados: number;
  creadoEn: Date;
  actualizadoEn: Date;
}
