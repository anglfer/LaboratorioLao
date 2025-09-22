import type { Vehiculo } from "../types/programming";

class VehiculoService {
  async getAll(): Promise<Vehiculo[]> {
    const response = await fetch("/api/vehiculos");
    if (!response.ok) throw new Error("Error al obtener vehículos");
    return response.json();
  }

  async getById(id: number): Promise<Vehiculo> {
    const response = await fetch(`/api/vehiculos/${id}`);
    if (!response.ok) throw new Error("Vehículo no encontrado");
    return response.json();
  }

  async create(data: Omit<Vehiculo, "id" | "fechaRegistro" | "fechaActualizacion">): Promise<Vehiculo> {
    const response = await fetch("/api/vehiculos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al crear vehículo");
    return response.json();
  }

  async update(id: number, data: Partial<Vehiculo>): Promise<Vehiculo> {
    const response = await fetch(`/api/vehiculos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al actualizar vehículo");
    return response.json();
  }

  async activate(id: number): Promise<Vehiculo> {
    return this.update(id, { activo: true });
  }

  async deactivate(id: number): Promise<Vehiculo> {
    return this.update(id, { activo: false });
  }

  // Utilidades
  getDisplayName(vehiculo: Vehiculo): string {
    const parts = [vehiculo.clave];
    if (vehiculo.marca) parts.push(vehiculo.marca);
    if (vehiculo.modelo) parts.push(vehiculo.modelo);
    if (vehiculo.año) parts.push(vehiculo.año.toString());
    return parts.join(" - ");
  }

  filterActive(vehiculos: Vehiculo[]): Vehiculo[] {
    return vehiculos.filter(v => v.activo);
  }

  sortByClave(vehiculos: Vehiculo[]): Vehiculo[] {
    return [...vehiculos].sort((a, b) => a.clave.localeCompare(b.clave));
  }

  isAvailable(vehiculo: Vehiculo): boolean {
    return vehiculo.activo;
  }
}

export const vehiculoService = new VehiculoService();