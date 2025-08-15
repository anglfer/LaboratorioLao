// Tipos para el módulo de obras
export interface Obra {
  clave: string; // Primary key is clave, not id
  nombre: string;
  descripcion: string;
  responsable?: string;
  contacto?: string;
  direccion?: string;
  fechaInicio?: string;
  fechaFinPrevista?: string;
  fechaFin?: string;
  estado: number; // Number in DB but we'll map to ObraEstado
  presupuestoEstimado?: number;
  presupuestoTotal?: number;
  cliente?: {
    id: number;
    nombre: string;
    telefonos?: Array<{ telefono: string }>;
    correos?: Array<{ correo: string }>;
  };
  notas?: string;
  alcance?: string;
  objetivos?: string;
  razonCancelacion?: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  creadoPor?: string;
  actualizadoPor?: string;
  // Campos legacy para compatibilidad
  areaCodigo?: string;
  contratista?: string | null;
  
  // Computed properties for UI compatibility
  id: string; // Map clave to id for UI compatibility
}

export type ObraEstado = 
  | "planificacion"
  | "iniciada" 
  | "en_progreso"
  | "pausada"
  | "completada"
  | "cancelada";

export interface CreateObraRequest {
  clave?: string;
  nombre: string;
  descripcion: string;
  responsable: string;
  contacto?: string;
  direccion: string;
  fechaInicio?: Date;
  fechaFinPrevista?: Date;
  presupuestoEstimado?: number;
  clienteId?: number;
  clienteNuevo?: {
    nombre: string;
    direccion?: string;
    telefonos?: string[];
    correos?: string[];
  };
  notas?: string;
  alcance?: string;
  objetivos?: string;
  estado?: ObraEstado;
}

export interface UpdateObraRequest extends Partial<CreateObraRequest> {
  clave: string; // Use clave instead of id
}

export interface ObraFilters {
  searchTerm?: string;
  estado?: string;
  clienteId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface ObraSortConfig {
  field: string;
  direction: "asc" | "desc";
}

export interface PresupuestoResumen {
  id: number;
  fechaSolicitud: string;
  estado: string;
  total?: number | null;
}
