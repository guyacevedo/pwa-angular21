export interface EstadisticasDiarias {
  fecha: string | Date; // YYYY-MM-DD
  updatedAt: Date;

  // Usuarios (Snapshot)
  usuariosTotales: number;
  usuariosActivos: number;
  usuariosInactivos: number;
  usuariosDeshabilitados: number;
  usuariosAdmin: number;
  usuariosInvitados: number;

  // Comercio
  ventasDia: number;             // Cantidad de ventas del día
  ventasMontoDia: number;        // Monto total vendido en el día
  comprasDia: number;            // Cantidad de compras del día
  comprasMontoDia: number;       // Monto total comprado en el día
  totalKilosProcesados: number;  // Kg procesados/vendidos en el día
  margenBruto: number;           // ventasMontoDia - comprasMontoDia
  utilidadNeta: number;          // margenBruto - gastos operativos

  // Cartera
  carteraTotalClientes: number;  // Saldo total por cobrar a clientes
  carteraTotalProveedores: number; // Saldo total por pagar a proveedores

  // Inventario
  inventarioValorizado: number;  // Valor del stock actual a precio de compra

  // Logística
  viajesActivos: number;         // Viajes en tránsito
  cavasEnCirculacion: number;    // Cavas fuera de bodega

  // Top 10
  top10Productos: { especie: string; talla: string; kg: number; monto: number }[];
  top10Clientes: { clienteId: string; nombre: string; monto: number }[];
}

export interface KPIWidget {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}
