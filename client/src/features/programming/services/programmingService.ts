import { 
  Programacion, 
  CreateProgramacionData, 
  UpdateProgramacionData, 
  ProgramacionFilters,
  Brigadista,
  Vehiculo,
  EstadisticasSemana,
  DatosGraficaSemana,
  ObraAprobada
} from '../types/programming';

const API_BASE = '/api/programming';

export class ProgrammingService {
  // ============ PROGRAMACIONES ============
  
  async getProgramaciones(filters?: ProgramacionFilters): Promise<Programacion[]> {
    const params = new URLSearchParams();
    
    if (filters?.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
    if (filters?.fechaHasta) params.append('fechaHasta', filters.fechaHasta);
    if (filters?.brigadistaId) params.append('brigadistaId', filters.brigadistaId.toString());
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.claveObra) params.append('claveObra', filters.claveObra);
    
    const response = await fetch(`${API_BASE}/programaciones?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Error al obtener programaciones');
    }
    
    return response.json();
  }

  async getProgramacionById(id: number): Promise<Programacion> {
    const response = await fetch(`${API_BASE}/programaciones/${id}`);
    if (!response.ok) {
      throw new Error('Error al obtener programación');
    }
    
    return response.json();
  }

  async createProgramacion(data: CreateProgramacionData): Promise<Programacion> {
    const response = await fetch(`${API_BASE}/programaciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear programación');
    }
    
    return response.json();
  }

  async updateProgramacion(id: number, data: UpdateProgramacionData): Promise<Programacion> {
    const response = await fetch(`${API_BASE}/programaciones/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar programación');
    }
    
    return response.json();
  }

  async deleteProgramacion(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/programaciones/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar programación');
    }
  }

  // ============ BRIGADISTAS ============
  
  async getBrigadistas(): Promise<Brigadista[]> {
    const response = await fetch(`${API_BASE}/brigadistas`);
    if (!response.ok) {
      throw new Error('Error al obtener brigadistas');
    }
    
    return response.json();
  }

  async getBrigadistasDisponibles(fecha: string, hora: string): Promise<Brigadista[]> {
    const params = new URLSearchParams({ fecha, hora });
    const response = await fetch(`${API_BASE}/brigadistas/disponibles?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Error al obtener brigadistas disponibles');
    }
    
    return response.json();
  }

  // ============ VEHÍCULOS ============
  
  async getVehiculos(): Promise<Vehiculo[]> {
    const response = await fetch(`${API_BASE}/vehiculos`);
    if (!response.ok) {
      throw new Error('Error al obtener vehículos');
    }
    
    return response.json();
  }

  async getVehiculosDisponibles(fecha: string, hora: string): Promise<Vehiculo[]> {
    const params = new URLSearchParams({ fecha, hora });
    const response = await fetch(`${API_BASE}/vehiculos/disponibles?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Error al obtener vehículos disponibles');
    }
    
    return response.json();
  }

  // ============ OBRAS APROBADAS ============
    async getObrasAprobadas(): Promise<ObraAprobada[]> {
    const response = await fetch(`${API_BASE}/obras-aprobadas`);
    if (!response.ok) {
      throw new Error('Error al obtener obras aprobadas');
    }
    
    return response.json();
  }

  // ============ ESTADÍSTICAS ============
    async getEstadisticasSemana(fechaInicio: string): Promise<EstadisticasSemana> {
    const params = new URLSearchParams({ fechaInicio });
    const response = await fetch(`${API_BASE}/dashboard/stats?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Error al obtener estadísticas de la semana');
    }
    
    return response.json();
  }
  async getDatosGraficaSemana(fechaInicio: string): Promise<DatosGraficaSemana[]> {
    const params = new URLSearchParams({ fechaInicio });
    const response = await fetch(`${API_BASE}/dashboard/grafica?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Error al obtener datos de gráfica semanal');
    }
    
    return response.json();
  }

  // ============ ACCIONES DEL BRIGADISTA ============
  
  async iniciarActividad(id: number): Promise<Programacion> {
    const response = await fetch(`${API_BASE}/programaciones/${id}/iniciar`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al iniciar actividad');
    }
    
    return response.json();
  }

  async completarActividad(id: number, muestrasObtenidas: number, observaciones?: string): Promise<Programacion> {
    const response = await fetch(`${API_BASE}/programaciones/${id}/completar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ muestrasObtenidas, observaciones }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al completar actividad');
    }
    
    return response.json();
  }

  async cancelarActividad(id: number, motivo: string): Promise<Programacion> {
    const response = await fetch(`${API_BASE}/programaciones/${id}/cancelar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ motivo }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al cancelar actividad');
    }
    
    return response.json();
  }

  async reprogramarActividad(id: number, nuevaFecha: string, nuevaHora: string): Promise<Programacion> {
    const response = await fetch(`${API_BASE}/programaciones/${id}/reprogramar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nuevaFecha, nuevaHora }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al reprogramar actividad');
    }
    
    return response.json();
  }

  // ============ PROGRAMACIONES POR BRIGADISTA ============
  
  async getProgramacionesBrigadista(brigadistaId: number, fecha?: string): Promise<Programacion[]> {
    const params = new URLSearchParams({ brigadistaId: brigadistaId.toString() });
    if (fecha) params.append('fecha', fecha);
    
    const response = await fetch(`${API_BASE}/programaciones/brigadista?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Error al obtener programaciones del brigadista');
    }
    
    return response.json();
  }

  // ============ ESTADÍSTICAS RÁPIDAS ============
  
  async getQuickStats(): Promise<{
    programacionesActivas: number;
    enProceso: number;
    completadasMes: number;
  }> {
    const response = await fetch(`${API_BASE}/quick-stats`);
    if (!response.ok) {
      throw new Error('Error al obtener estadísticas rápidas');
    }
    
    return response.json();
  }

  // ============ BRIGADISTA ACTUAL ============
  
  async getBrigadistaPerfil(): Promise<Brigadista> {
    const response = await fetch(`${API_BASE}/brigadista/perfil`);
    if (!response.ok) {
      throw new Error('Error al obtener perfil del brigadista');
    }
    
    return response.json();
  }

  async getBrigadistaProgramaciones(filters?: ProgramacionFilters): Promise<Programacion[]> {
    const params = new URLSearchParams();
    
    if (filters?.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
    if (filters?.fechaHasta) params.append('fechaHasta', filters.fechaHasta);
    if (filters?.estado) params.append('estado', filters.estado);
    
    const response = await fetch(`${API_BASE}/brigadista/programaciones?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Error al obtener programaciones del brigadista');
    }
    
    return response.json();
  }
}

export const programmingService = new ProgrammingService();
