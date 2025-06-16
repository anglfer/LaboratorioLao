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

export interface Concepto {
  codigo: string;
  subareaId: number;
  descripcion?: string;
  unidad: string;
  p_u: number | string; // Puede venir como string desde la DB
  subarea?: Subarea;
}

export interface ConceptoFormData {
  codigo: string;
  subareaId: number;
  descripcion?: string;
  unidad: string;
  p_u: number;
}
