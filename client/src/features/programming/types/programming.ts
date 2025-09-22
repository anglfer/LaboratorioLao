// Programming module types

export interface Brigadista {
  id: number;
  nombre: string;
  apellidos: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  fechaRegistro: Date;
  fechaActualizacion: Date;
}

export interface Vehiculo {
  id: number;
  clave: string;
  marca?: string;
  modelo?: string;
  año?: number;
  placas?: string;
  activo: boolean;
  fechaRegistro: Date;
  fechaActualizacion: Date;
}

export type EstadoProgramacion = 
  | "programada"
  | "en_proceso" 
  | "completada"
  | "cancelada"
  | "reprogramada";

export type TipoRecoleccion = 
  | "metros_cuadrados"
  | "metros_cubicos"
  | "metros_lineales"
  | "sondeo"
  | "piezas"
  | "condensacion";

export type TipoProgramacion = 
  | "obra_por_visita"
  | "obra_por_estancia";

export interface ProgramacionDetalle {
  id: number;
  programacionId: number;
  conceptoCodigo: string;
  cantidadMuestras: number;
  tipoRecoleccion: TipoRecoleccion;
  distribucionMuestras?: string;
  muestrasObtenidas?: number;
  observaciones?: string;
  esNoPresupuestado: boolean;
  descripcionConcepto?: string;
  unidadMedida?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  // Relaciones
  concepto?: {
    codigo: string;
    descripcion: string;
    unidad: string;
    precioUnitario: number;
  };
}

export interface Programacion {
  id: number;
  presupuestoId: number;
  claveObra: string;
  
  // Información temporal
  fechaProgramada: Date;
  horaProgramada: string;
  tipoProgramacion: TipoProgramacion;
  
  // Información de contacto
  nombreResidente?: string;
  telefonoResidente?: string;
  observacionesIniciales?: string;
  
  // Asignación de recursos
  brigadistaPrincipalId: number;
  brigadistaApoyoId?: number;
  vehiculoId: number;
  claveEquipo?: string;
  herramientasEspeciales?: string;
  
  // Observaciones y notas
  observacionesProgramacion?: string;
  instruccionesBrigadista?: string;
  condicionesEspeciales?: string;
  
  // Estado y seguimiento
  estado: EstadoProgramacion;
  motivoCancelacion?: string;
  observacionesComplecion?: string;
  
  // Fechas de control
  fechaCreacion: Date;
  fechaActualizacion: Date;
  fechaInicio?: Date;
  fechaComplecion?: Date;
  
  // Usuario tracking
  creadoPor?: number;
  actualizadoPor?: number;
  
  // Relaciones
  presupuesto?: {
    id: number;
    claveObra?: string;
    cliente?: {
      id: number;
      nombre: string;
    };
    estado: string;
  };
  obra?: {
    clave: string;
    nombre: string;
    descripcion?: string;
    direccion?: string;
  };
  brigadistaPrincipal: Brigadista;
  brigadistaApoyo?: Brigadista;
  vehiculo: Vehiculo;
  usuarioCreador?: {
    id: number;
    nombre: string;
    apellidos: string;
  };
  usuarioActualizador?: {
    id: number;
    nombre: string;
    apellidos: string;
  };
  detalles: ProgramacionDetalle[];
}

// Form data interfaces
export interface ProgramacionFormData {
  presupuestoId: number;
  claveObra: string;
  
  // Información temporal
  fechaProgramada: string; // ISO date string for forms
  horaProgramada: string;
  tipoProgramacion: TipoProgramacion;
  
  // Información de contacto
  nombreResidente?: string;
  telefonoResidente?: string;
  observacionesIniciales?: string;
  
  // Asignación de recursos
  brigadistaPrincipalId: number;
  brigadistaApoyoId?: number;
  vehiculoId: number;
  claveEquipo?: string;
  herramientasEspeciales?: string;
  
  // Observaciones y notas
  observacionesProgramacion?: string;
  instruccionesBrigadista?: string;
  condicionesEspeciales?: string;
  
  // Detalles de actividades
  detalles: Array<{
    conceptoCodigo: string;
    cantidadMuestras: number;
    tipoRecoleccion: TipoRecoleccion;
    distribucionMuestras?: string;
    esNoPresupuestado?: boolean;
    descripcionConcepto?: string;
    unidadMedida?: string;
  }>;
}

// Filter interfaces
export interface ProgramacionFilters {
  fechaInicio?: string;
  fechaFin?: string;
  brigadistaId?: number;
  estado?: EstadoProgramacion;
  claveObra?: string;
  clienteId?: number;
}

// Dashboard interfaces
export interface ProgramacionStats {
  programacionesTotales: number;
  programacionesCompletadas: number;
  programacionesPendientes: number;
  programacionesCanceladas: number;
  rendimientoSemanal: number; // Porcentaje
  brigadistasActivos: number;
  vehiculosEnUso: number;
}

export interface WeeklyProgramming {
  semana: string; // "2024-W01" format
  fechaInicio: Date;
  fechaFin: Date;
  stats: ProgramacionStats;
  programacionesDiarias: Array<{
    fecha: Date;
    programaciones: Programacion[];
  }>;
}

// Update interfaces
export interface ProgramacionStatusUpdate {
  id: number;
  estado: EstadoProgramacion;
  motivoCancelacion?: string;
  observacionesComplecion?: string;
  fechaInicio?: Date;
  fechaComplecion?: Date;
  detallesComplecion?: Array<{
    id: number;
    muestrasObtenidas: number;
    observaciones?: string;
  }>;
}

// Presupuesto aprobado para selección
export interface PresupuestoAprobado {
  id: number;
  claveObra?: string;
  cliente: {
    id: number;
    nombre: string;
  };
  obra?: {
    clave: string;
    nombre: string;
    descripcion?: string;
    direccion?: string;
    contratista?: string;
  };
  conceptos: Array<{
    codigo: string;
    descripcion: string;
    unidad: string;
    cantidad: number;
    precioUnitario: number;
  }>;
  fechaSolicitud: Date;
}

// Constants for UI
export const ESTADOS_PROGRAMACION: Record<EstadoProgramacion, { label: string; color: string; bgColor: string }> = {
  programada: { label: "Programada", color: "text-blue-600", bgColor: "bg-blue-100" },
  en_proceso: { label: "En Proceso", color: "text-yellow-600", bgColor: "bg-yellow-100" },
  completada: { label: "Completada", color: "text-green-600", bgColor: "bg-green-100" },
  cancelada: { label: "Cancelada", color: "text-red-600", bgColor: "bg-red-100" },
  reprogramada: { label: "Reprogramada", color: "text-purple-600", bgColor: "bg-purple-100" },
};

export const TIPOS_RECOLECCION: Record<TipoRecoleccion, string> = {
  metros_cuadrados: "m²",
  metros_cubicos: "m³", 
  metros_lineales: "m lineal",
  sondeo: "Sondeo",
  piezas: "Pza",
  condensacion: "Condensación",
};

export const TIPOS_PROGRAMACION: Record<TipoProgramacion, string> = {
  obra_por_visita: "Obra por Visita",
  obra_por_estancia: "Obra por Estancia",
};