import type { Brigadista } from "../types/programming";

class BrigadistaService {
  async getAll(): Promise<Brigadista[]> {
    const response = await fetch("/api/brigadistas");
    if (!response.ok) throw new Error("Error al obtener brigadistas");
    return response.json();
  }

  async getById(id: number): Promise<Brigadista> {
    const response = await fetch(`/api/brigadistas/${id}`);
    if (!response.ok) throw new Error("Brigadista no encontrado");
    return response.json();
  }

  async create(data: Omit<Brigadista, "id" | "fechaRegistro" | "fechaActualizacion">): Promise<Brigadista> {
    const response = await fetch("/api/brigadistas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al crear brigadista");
    return response.json();
  }

  async update(id: number, data: Partial<Brigadista>): Promise<Brigadista> {
    const response = await fetch(`/api/brigadistas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al actualizar brigadista");
    return response.json();
  }

  async activate(id: number): Promise<Brigadista> {
    return this.update(id, { activo: true });
  }

  async deactivate(id: number): Promise<Brigadista> {
    return this.update(id, { activo: false });
  }

  // Utilidades
  getFullName(brigadista: Brigadista): string {
    return `${brigadista.nombre} ${brigadista.apellidos}`;
  }

  filterActive(brigadistas: Brigadista[]): Brigadista[] {
    return brigadistas.filter(b => b.activo);
  }

  sortByName(brigadistas: Brigadista[]): Brigadista[] {
    return [...brigadistas].sort((a, b) => 
      `${a.nombre} ${a.apellidos}`.localeCompare(`${b.nombre} ${b.apellidos}`)
    );
  }
}

export const brigadistaService = new BrigadistaService();