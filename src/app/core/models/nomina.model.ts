/** Liquidación individual de un empleado de bodega */
export interface LiquidacionEmpleado {
  empleadoId: string;
  nombre: string;
  baseDiaria: number;           // $20,000 fijo
  kilosAsignados: number;       // Kilos del día si se individualiza
  bonoProduccion: number;       // (totalKgDia / numEmpleados) × $5,000
  otrosBonos: number;           // Bonos adicionales o extensión de jornada
  deducciones: number;
  totalDiario: number;          // baseDiaria + bonoProduccion + otrosBonos - deducciones
  pagado: boolean;
  metodoPago?: string;
}

/** Liquidación diaria de toda la nómina de bodega */
export interface NominaDiaria {
  id: string;
  fecha: Date;
  totalKilosProcesados: number; // Total kg procesados en el día (para calcular bonos)
  numEmpleadosBodega: number;   // Cantidad de empleados activos ese día
  basePorEmpleado: number;      // $20,000
  bonoPorKg: number;            // $5,000 por (kg/empleado)
  empleados: LiquidacionEmpleado[];
  totalNomina: number;          // Suma de todos los totalDiario
  liquidadoPor: string;
  liquidadoEn: Date;
  notas?: string;
}
