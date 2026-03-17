/** Catálogo de especies de pescado disponibles */
export type EspeciePez =
  | 'BOCACHICO'
  | 'MOJARRA_ROJA'
  | 'MOJARRA_NEGRA'
  | 'BAGRE'
  | 'BLANQUILLO'
  | 'DONCELLA'
  | 'COMELON'
  | 'MONCHOLO'
  | 'VIEJITO'
  | 'CACHAMA'
  | 'NICURO'
  | 'CAPAZ'
  | 'DORADA'
  | 'PACORA';

/** Talla o categoría del pescado */
export type TallaPez =
  | 'PEQUENO'   // <0.3 kg
  | 'MEDIANO'   // 0.3–0.5 kg
  | 'GRANDE'    // >0.5 kg
  | 'MALO'      // Calidad inferior
  | 'FORCHO'    // Calidad regular
  | 'UNIDAD';   // Venta por pieza (ej. Viejito)

/** Estado de frescura / calidad */
export type CalidadPez = 'FRESCO' | 'REGULAR' | 'DESCARTE';

/** Unidad de medida para venta */
export type UnidadVenta = 'KG' | 'UNIDAD';

export const ESPECIE_LABELS: Record<EspeciePez, string> = {
  BOCACHICO:    'Bocachico',
  MOJARRA_ROJA: 'Mojarra Roja',
  MOJARRA_NEGRA:'Mojarra Negra',
  BAGRE:        'Bagre',
  BLANQUILLO:   'Blanquillo',
  DONCELLA:     'Doncella',
  COMELON:      'Comejón',
  MONCHOLO:     'Moncholo',
  VIEJITO:      'Viejito',
  CACHAMA:      'Cachama',
  NICURO:       'Nicuro',
  CAPAZ:        'Capaz',
  DORADA:       'Dorada',
  PACORA:       'Pacora',
};

export const TALLA_LABELS: Record<TallaPez, string> = {
  PEQUENO: 'Pequeño (<0.3 kg)',
  MEDIANO: 'Mediano (0.3–0.5 kg)',
  GRANDE:  'Grande (>0.5 kg)',
  MALO:    'Malo',
  FORCHO:  'Forcho',
  UNIDAD:  'Unidad',
};

export const CALIDAD_LABELS: Record<CalidadPez, string> = {
  FRESCO:   'Fresco',
  REGULAR:  'Regular',
  DESCARTE: 'Descarte',
};

/** Tallas disponibles por especie (Viejito solo UNIDAD) */
export const TALLAS_POR_ESPECIE: Record<EspeciePez, TallaPez[]> = {
  BOCACHICO:    ['PEQUENO', 'MEDIANO', 'GRANDE', 'MALO', 'FORCHO', 'UNIDAD'],
  MOJARRA_ROJA: ['PEQUENO', 'MEDIANO', 'GRANDE', 'MALO', 'FORCHO', 'UNIDAD'],
  MOJARRA_NEGRA:['PEQUENO', 'MEDIANO', 'GRANDE', 'MALO', 'FORCHO', 'UNIDAD'],
  BAGRE:        ['PEQUENO', 'MEDIANO', 'GRANDE', 'MALO', 'FORCHO'],
  BLANQUILLO:   ['PEQUENO', 'MEDIANO', 'GRANDE', 'MALO', 'FORCHO'],
  DONCELLA:     ['PEQUENO', 'MEDIANO', 'GRANDE', 'MALO', 'FORCHO'],
  COMELON:      ['PEQUENO', 'MEDIANO', 'GRANDE', 'MALO', 'FORCHO', 'UNIDAD'],
  MONCHOLO:     ['PEQUENO', 'MEDIANO', 'GRANDE', 'MALO', 'FORCHO', 'UNIDAD'],
  VIEJITO:      ['UNIDAD'],
  CACHAMA:      ['PEQUENO', 'MEDIANO', 'GRANDE', 'MALO', 'FORCHO'],
  NICURO:       ['PEQUENO', 'MEDIANO', 'GRANDE', 'MALO', 'FORCHO'],
  CAPAZ:        ['PEQUENO', 'MEDIANO', 'GRANDE', 'MALO', 'FORCHO'],
  DORADA:       ['PEQUENO', 'MEDIANO', 'GRANDE', 'MALO', 'FORCHO'],
  PACORA:       ['PEQUENO', 'MEDIANO', 'GRANDE', 'MALO', 'FORCHO'],
};

export const ESPECIES_LIST: EspeciePez[] = Object.keys(ESPECIE_LABELS) as EspeciePez[];
