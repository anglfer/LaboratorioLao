// Budget types
export interface Budget {
  id: number;
  claveObra?: string;
  clienteId?: number;
  nombreContratista?: string;
  descripcionObra?: string;
  tramo?: string;
  colonia?: string;
  calle?: string;
  contactoResponsable?: string;
  formaPago?: string;
  iva?: number;
  subtotal?: number;
  ivaMonto?: number;
  total?: number;
  estado?: BudgetStatus;
  fechaSolicitud?: Date;
  fechaInicio?: Date;
  razonRechazo?: string; // Nuevo campo para la razón de rechazo
  tipoAprobacion?: TipoAprobacion; // Nuevo campo para el tipo de aprobación
  cliente?: Client;
  obra?: Project;
  // Usuario que creó el presupuesto
  usuario?: SimpleUser;
  // Último usuario que lo modificó
  ultimoUsuario?: SimpleUser;
  detalles?: BudgetDetail[];
}

export interface SimpleUser {
  id: number;
  nombre: string;
  apellidos?: string;
  email: string;
}

export interface BudgetDetail {
  id: number;
  presupuestoId: number;
  conceptoCodigo: string;
  cantidad: number;
  precioUnitario: number;
  subtotal?: number;
  estado?: DetailStatus;
  concepto?: Concept;
}

export interface Client {
  id: number;
  nombre: string;
  direccion?: string;
  telefonos?: Array<{ telefono: string }>;
  correos?: Array<{ correo: string }>;
}

export interface Project {
  claveObra: string;
  areaCodigo: string;
  contratista?: string;
  area?: Area;
}

export interface Area {
  codigo: string;
  nombre: string;
}

export interface Subarea {
  id: number;
  nombre: string;
  areaCodigo: string;
  area?: Area;
}

export interface Concept {
  codigo: string;
  descripcion: string;
  unidad: string;
  p_u: number;
  subarea?: Subarea;
}

export type BudgetStatus =
  | "borrador"
  | "enviado"
  | "aprobado"
  | "rechazado"
  | "finalizado";

export type TipoAprobacion = "cliente" | "interno";

export type DetailStatus = "en_proceso" | "completado" | "cancelado";

export interface BudgetFormData {
  clienteId?: number;
  clienteNuevo?: {
    nombre: string;
    direccion?: string;
    telefonos: string[];
    correos: string[];
  };
  copiarDeCliente?: boolean;
  nombreContratista: string;
  descripcionObra: string;
  alcance?: string;
  direccion?: string;
  contactoResponsable?: string;
  areaCodigo: string;
  conceptos: Array<{
    conceptoCodigo: string;
    cantidad: number;
    precioUnitario: number;
  }>;
  conceptosSeleccionados?: string[];
  manejaAnticipo?: boolean;
  porcentajeAnticipo?: number;
}
