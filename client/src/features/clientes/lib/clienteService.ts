// Cliente API services
const BASE_URL = "/api/clientes";
const FULL_URL = "/api/clientes/full";

export const clienteService = {
  async getAll() {
    // Usar el endpoint full para obtener clientes con teléfonos y correos
    const response = await fetch(FULL_URL);
    if (!response.ok) throw new Error("Failed to fetch clientes");
    return response.json();
  },

  async getById(id: number) {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) throw new Error("Cliente not found");
    return response.json();
  },

  async create(data: Partial<import("./types").Cliente>) {
    const response = await fetch(BASE_URL, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to create cliente");
    return response.json();
  },

  async update(id: number, data: Partial<import("./types").Cliente>) {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to update cliente");
    return response.json();
  },

  async delete(id: number) {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete cliente");
  },
};
