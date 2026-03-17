export type TipoAlerta =
  | 'STOCK_BAJO'
  | 'ROTACION_URGENTE'
  | 'VENCIMIENTO_DOCUMENTO'
  | 'CAVA_FIN_VIDA_UTIL'
  | 'CARTERA_VENCIDA'
  | 'CAVA_PENDIENTE_RETORNO'
  | 'INSUMO_BAJO';

export type NivelAlerta = 'INFO' | 'ADVERTENCIA' | 'CRITICO';

export interface Alerta {
  id: string;
  tipo: TipoAlerta;
  nivel: NivelAlerta;
  titulo: string;
  descripcion: string;
  entidadTipo?: string;  // 'inventario', 'cava', 'camion', 'contacto', etc.
  entidadId?: string;
  resuelta: boolean;
  fecha: Date;
  fechaResolucion?: Date;
}
