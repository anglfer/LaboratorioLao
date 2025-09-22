import type {
  Programacion,
  ProgramacionFormData,
  ProgramacionFilters,
  ProgramacionStatusUpdate,
  WeeklyProgramming,
  PresupuestoAprobado
} from "../types/programming";

class ProgrammingService {
  // ============ PROGRAMACIONES ============
  
  async getAll(filters?: ProgramacionFilters): Promise<Programacion[]> {
    const params = new URLSearchParams();
    
    if (filters?.fechaInicio) params.append("fechaInicio", filters.fechaInicio);
    if (filters?.fechaFin) params.append("fechaFin", filters.fechaFin);
    if (filters?.brigadistaId) params.append("brigadistaId", filters.brigadistaId.toString());
    if (filters?.estado) params.append("estado", filters.estado);
    if (filters?.claveObra) params.append("claveObra", filters.claveObra);
    if (filters?.clienteId) params.append("clienteId", filters.clienteId.toString());
    
    const response = await fetch(`/api/programaciones?${params.toString()}`);
    if (!response.ok) throw new Error("Error al obtener programaciones");
    return response.json();
  }

  async getById(id: number): Promise<Programacion> {
    const response = await fetch(`/api/programaciones/${id}`);
    if (!response.ok) throw new Error("Programación no encontrada");
    return response.json();
  }

  async create(data: ProgramacionFormData): Promise<Programacion> {
    const response = await fetch("/api/programaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al crear programación");
    return response.json();
  }

  async update(id: number, data: Partial<ProgramacionFormData>): Promise<Programacion> {
    const response = await fetch(`/api/programaciones/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al actualizar programación");
    return response.json();
  }

  async updateStatus(id: number, statusUpdate: ProgramacionStatusUpdate): Promise<Programacion> {
    const response = await fetch(`/api/programaciones/${id}/estado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(statusUpdate),
    });
    if (!response.ok) throw new Error("Error al actualizar estado");
    return response.json();
  }

  async delete(id: number): Promise<void> {
    const response = await fetch(`/api/programaciones/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Error al eliminar programación");
  }

  // ============ ESTADÍSTICAS ============
  
  async getWeeklyStats(fecha?: string): Promise<WeeklyProgramming> {
    const params = fecha ? `?fecha=${fecha}` : "";
    const response = await fetch(`/api/programaciones/stats/semanal${params}`);
    if (!response.ok) throw new Error("Error al obtener estadísticas semanales");
    return response.json();
  }

  // ============ PRESUPUESTOS APROBADOS ============
  
  async getPresupuestosAprobados(): Promise<PresupuestoAprobado[]> {
    const response = await fetch("/api/presupuestos-aprobados");
    if (!response.ok) throw new Error("Error al obtener presupuestos aprobados");
    return response.json();
  }

  // ============ FILTROS Y BÚSQUEDAS ============
  
  async searchByClaveObra(clave: string): Promise<Programacion[]> {
    return this.getAll({ claveObra: clave });
  }

  async getByBrigadista(brigadistaId: number, fechaInicio?: string, fechaFin?: string): Promise<Programacion[]> {
    return this.getAll({ brigadistaId, fechaInicio, fechaFin });
  }

  async getByEstado(estado: string, fechaInicio?: string, fechaFin?: string): Promise<Programacion[]> {
    return this.getAll({ estado: estado as any, fechaInicio, fechaFin });
  }

  // ============ UTILIDADES ============
  
  formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getWeekRange(date: Date): { start: string; end: string } {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    return {
      start: this.formatDateForAPI(start),
      end: this.formatDateForAPI(end)
    };
  }

  getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const weekNumber = Math.ceil(date.getDate() / 7);
    return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
  }
}

export const programmingService = new ProgrammingService();