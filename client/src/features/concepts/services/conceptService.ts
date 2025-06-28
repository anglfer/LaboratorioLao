import { Area, Subarea, Concepto, ConceptoFormData } from "../types/concept";

const API_BASE = "/api";

export const conceptService = {
  // Obtener todas las áreas
  async getAreas(): Promise<Area[]> {
    const response = await fetch(`${API_BASE}/areas`);
    if (!response.ok) {
      throw new Error("Error al obtener las áreas");
    }
    return response.json();
  },

  // Obtener subáreas por área
  async getSubareasByArea(areaCodigo: string): Promise<Subarea[]> {
    const response = await fetch(`${API_BASE}/areas/${areaCodigo}/subareas`);
    if (!response.ok) {
      throw new Error("Error al obtener las subáreas");
    }
    return response.json();
  },

  // Crear nuevo concepto
  async createConcepto(data: ConceptoFormData): Promise<Concepto> {
    const response = await fetch(`${API_BASE}/conceptos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al crear el concepto");
    }

    return response.json();
  },

  // Obtener conceptos por subárea
  async getConceptosBySubarea(subareaId: number): Promise<Concepto[]> {
    const response = await fetch(`${API_BASE}/subareas/${subareaId}/conceptos`);
    if (!response.ok) {
      throw new Error("Error al obtener los conceptos");
    }
    return response.json();
  },
};
