export interface Brigadista {
  id: number;
  nombre: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  fechaRegistro: string;
}

export interface Vehiculo {
  id: number;
  clave: string;
  descripcion: string;
  activo: boolean;
  fechaRegistro: string;
}

export enum TipoProgramacion {
  OBRA_POR_VISITA = "obra_por_visita",
  OBRA_POR_ESTANCIA = "obra_por_estancia",
}

export enum TipoRecoleccion {
  METROS_CUADRADOS = "metros_cuadrados",
  METROS_CUBICOS = "metros_cubicos",
  METROS_LINEALES = "metros_lineales",
  SONDEO = "sondeo",
  PIEZAS = "piezas",
  CONDENSACION = "condensacion",
}

export enum EstadoProgramacion {
  PROGRAMADA = "programada",
  EN_PROCESO = "en_proceso",
  COMPLETADA = "completada",
  CANCELADA = "cancelada",
  REPROGRAMADA = "reprogramada",
}

export interface Programacion {
  id: number;
  claveObra: string;
  /** Nueva propiedad: nombre de la actividad o descripción breve */
  actividad?: string;
  fechaProgramada: string;
  horaProgramada: string;
  tipoProgramacion: TipoProgramacion;
  nombreResidente?: string;
  telefonoResidente?: string;
  conceptoCodigo: string;
  cantidadMuestras: number;
  tipoRecoleccion: TipoRecoleccion;
  brigadistaId: number;
  brigadistaApoyoId?: number;
  vehiculoId: number;
  claveEquipo?: string;
  observaciones?: string;
  instrucciones?: string;
  condicionesEspeciales?: string;
  estado: EstadoProgramacion;
  fechaCreacion: string;
  fechaActualizacion: string;
  motivoCancelacion?: string;
  muestrasObtenidas?: number;
  /** Nueva propiedad: muestras previstas */
  muestrasPrevistas?: number;
  fechaInicio?: string;
  fechaCompletado?: string;

  // Relaciones
  obra?: {
    clave: string;
    areaCodigo: string;
    contratista?: string;
    area: {
      codigo: string;
      nombre: string;
    };
  };
  concepto?: {
    codigo: string;
    descripcion: string;
    unidad: string;
    p_u: number;
  };
  brigadista?: Brigadista;
  brigadistaApoyo?: Brigadista;
  vehiculo?: Vehiculo;
}

export interface CreateProgramacionData {
  claveObra: string;
  fechaProgramada: string;
  horaProgramada: string;
  tipoProgramacion: TipoProgramacion;
  nombreResidente?: string;
  telefonoResidente?: string;
  conceptoCodigo: string;
  cantidadMuestras: number;
  tipoRecoleccion: TipoRecoleccion;
  brigadistaId: number;
  brigadistaApoyoId?: number;
  vehiculoId: number;
  /** Nueva propiedad: ubicación textual */
  ubicacion?: string;
  claveEquipo?: string;
  observaciones?: string;
  instrucciones?: string;
  condicionesEspeciales?: string;
}

export interface UpdateProgramacionData {
  estado?: EstadoProgramacion;
  muestrasObtenidas?: number;
  motivoCancelacion?: string;
  observaciones?: string;
  fechaInicio?: string;
  fechaCompletado?: string;
}

export interface ProgramacionFilters {
  fechaDesde?: string;
  fechaHasta?: string;
  brigadistaId?: number;
  estado?: EstadoProgramacion;
  claveObra?: string;
}

// Tipos para estadísticas del dashboard de programación
export interface EstadisticasSemana {
  programacionesTotales: number;
  programacionesCompletadas: number;
  programacionesPendientes: number;
  programacionesCanceladas: number;
  rendimientoSemanal: number;
  brigadistasActivos: number;
  vehiculosEnUso: number;
}

export interface DatosGraficaSemana {
  dia: string;
  fecha: string;
  programadas: number;
  completadas: number;
  pendientes: number;
  canceladas: number;
}

// Tipo para el dropdown de obras aprobadas
export interface ObraAprobada {
  clave: string;
  clienteNombre: string;
  descripcionObra: string;
  ubicacion: string;
  contratista: string;
  conceptos: Array<{
    codigo: string;
    descripcion: string;
    unidad: string;
    cantidad: number;
  }>;
}
