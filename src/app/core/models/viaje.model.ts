export type EstadoViaje = 'PROGRAMADO' | 'EN_TRANSITO' | 'FINALIZADO' | 'CANCELADO';

export const ESTADO_VIAJE_LABELS: Record<EstadoViaje, string> = {
  PROGRAMADO:  'Programado',
  EN_TRANSITO: 'En tránsito',
  FINALIZADO:  'Finalizado',
  CANCELADO:   'Cancelado',
};

export type TipoGastoViaje = 'COMBUSTIBLE' | 'PEAJE' | 'VIATICO' | 'MANTENIMIENTO' | 'OTRO';

export const TIPO_GASTO_VIAJE_LABELS: Record<TipoGastoViaje, string> = {
  COMBUSTIBLE:   'Combustible',
  PEAJE:         'Peaje',
  VIATICO:       'Viático',
  MANTENIMIENTO: 'Mantenimiento',
  OTRO:          'Otro',
};

export interface GastoViaje {
  id: string;
  tipo: TipoGastoViaje;
  monto: number;
  descripcion?: string;
  fecha: Date;
  reciboUrl?: string;           // Foto del recibo (Cloudinary/Storage)
}

export interface Viaje {
  id: string;
  camionId: string;
  choferId: string;
  ventasIds: string[];          // IDs de ventas incluidas
  cavasIds: string[];           // IDs de cavas a transportar
  canastillasIds: string[];     // IDs de canastillas a transportar
  rutas: string[];              // Ciudades de destino en orden

  horaSalida: Date;
  horaLlegadaEstimada?: Date;
  horaLlegadaReal?: Date;

  gastos: GastoViaje[];
  totalGastos: number;

  estado: EstadoViaje;

  // Retorno
  cavasDevueltasIds: string[];  // Cavas recibidas de vuelta
  canastillasDevueltas: number; // Cantidad de canastillas devueltas
  notasRetorno?: string;

  notas?: string;
  creadoPor: string;
  creadoEn: Date;
  actualizadoEn: Date;
}
