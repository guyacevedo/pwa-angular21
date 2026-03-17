/** Camión de la flota de la pesquera */
export interface Camion {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  color?: string;
  tipoFurgon?: string;
  choferId: string;              // Usuario asignado con rol CHOFER

  // Documentos con vencimiento (alertas 30 días antes)
  vencimientoSoat: Date;
  vencimientoTecnomecanica: Date;
  vencimientoAunap: Date;        // Permiso AUNAP para transporte de pescado
  vencimientoLicencia?: Date;    // Licencia del vehículo

  activo: boolean;
  notas?: string;
  creadoEn: Date;
  actualizadoEn: Date;
}

/** Alerta de vencimiento de documento de camión */
export interface AlertaVencimientoCamion {
  camionId: string;
  placa: string;
  tipoDocumento: 'SOAT' | 'TECNOMECANICA' | 'AUNAP' | 'LICENCIA';
  fechaVencimiento: Date;
  diasRestantes: number;
  nivel: 'CRITICO' | 'ADVERTENCIA' | 'INFO'; // <7, 7-15, 15-30 días
}
