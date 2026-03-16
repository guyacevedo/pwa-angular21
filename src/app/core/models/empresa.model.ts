export interface Empresa {
  id?: string;
  // Datos básicos
  nombre: string;
  nit: string;
  direccion: string;
  ciudad?: string;
  departamento?: string;
  pais?: string;
  telefono: string;
  email: string;
  sitioWeb?: string;
  // Datos legales
  regimenTributario?: string;
  matriculaComercio?: string;
  representanteLegal?: string;
  cedulaRepresentante?: string;
  actividadEconomica?: string;
  camaraComercio?: string;
  // Facturación
  pieDePaginaFactura?: string;
  // Branding (para PDFs y app)
  logoUrl?: string;
  colorPrimario?: string;
  colorSecundario?: string;
  // Auditoría
  updatedAt?: Date;
  updatedBy?: string;
}
