export interface Cliente {
  id: number;
  nombre: string;
  direccion?: string;
  telefonos?: Telefono[];
  correos?: Correo[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Telefono {
  id: number;
  clienteId: number;
  telefono: string;
  createdAt?: string;
}

export interface Correo {
  id: number;
  clienteId: number;
  correo: string;
  createdAt?: string;
}

export interface Area {
  id: number;
  nombre: string;
  descripcion?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Obra {
  id: number;
  clave: string;
  nombre: string;
  descripcion?: string;
  clienteId: number;
  responsable?: string;
  contacto?: string;
  direccion?: string;
  contratista?: string;
  estado?: number;
  fechaInicio?: string;
  fechaFinPrevista?: string;
  presupuestoEstimado?: number;
  alcance?: string;
  objetivos?: string;
  cliente?: Cliente;
  createdAt?: string;
  updatedAt?: string;
}

export interface Presupuesto {
  id: number;
  obraId?: number;
  clienteId?: number;
  claveObra?: string;
  fechaSolicitud?: string;
  estado?: string;
  subtotal?: number;
  iva?: number;
  ivaMonto?: number;
  total?: number;
  manejaAnticipo?: boolean;
  porcentajeAnticipo?: number;
  usuarioId?: number;
  obra?: Obra;
  cliente?: Cliente;
  detalles?: PresupuestoDetalle[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PresupuestoDetalle {
  id: number;
  presupuestoId: number;
  conceptoCodigo: string;
  cantidad: number;
  precioUnitario: number;
  concepto?: ConceptoJerarquico;
}

export interface ConceptoJerarquico {
  codigo: string;
  descripcion: string;
  unidad?: string;
  precio?: number;
  nivel: number;
  parent?: string;
  areaId?: number;
  area?: Area;
  children?: ConceptoJerarquico[];
}

export interface DashboardStats {
  totalClientes: number;
  totalPresupuestos: number;
  totalObras: number;
}

// DTOs para crear/actualizar
export interface CreateClienteDto {
  nombre: string;
  direccion?: string;
}

export interface CreateTelefonoDto {
  telefono: string;
}

export interface CreateCorreoDto {
  correo: string;
}

export interface CreateObraDto {
  clave?: string;
  nombre: string;
  descripcion?: string;
  clienteId: number;
  responsable?: string;
  contacto?: string;
  direccion?: string;
  contratista?: string;
  estado?: number;
  fechaInicio?: string;
  fechaFinPrevista?: string;
  presupuestoEstimado?: number;
  alcance?: string;
  objetivos?: string;
}

export interface CreatePresupuestoDto {
  obraId?: number;
  clienteId?: number;
  claveObra?: string;
  fechaSolicitud?: string;
  estado?: string;
  subtotal?: number;
  iva?: number;
  ivaMonto?: number;
  total?: number;
  manejaAnticipo?: boolean;
  porcentajeAnticipo?: number;
}
