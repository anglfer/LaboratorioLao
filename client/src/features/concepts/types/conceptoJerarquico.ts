// ===========================================================================
// TIPOS PARA EL NUEVO SISTEMA JERÁRQUICO SIN PORCENTAJES
// ===========================================================================

// Área jerárquica (nodos intermedios de la jerarquía)
export interface AreaJerarquica {
  id: number;
  codigo: string;
  nombre: string;
  padreId?: number | null;
  nivel: number;
  createdAt: string;
  updatedAt: string;
  
  // Relaciones
  padre?: AreaJerarquica | null;
  hijos?: AreaJerarquica[];
  conceptos?: ConceptoJerarquico[];
}

// Concepto jerárquico (hojas del árbol con precios)
export interface ConceptoJerarquico {
  id: number;
  codigo: string;
  descripcion: string;
  unidad: string;
  precioUnitario: string; // String para manejar decimales precisos
  areaId: number;
  createdAt: string;
  updatedAt: string;
  
  // Relación con área
  area?: AreaJerarquica;
}

// Formularios
export interface AreaJerarquicaForm {
  codigo: string;
  nombre: string;
  padreId?: number | null;
  nivel: number;
}

export interface ConceptoJerarquicoForm {
  codigo: string;
  descripcion: string;
  unidad: string;
  precioUnitario: string;
  areaId: number;
}

// Árbol para UI
export interface ArbolCompleto extends AreaJerarquica {
  hijos: ArbolCompleto[];
  conceptos: ConceptoJerarquico[];
  expanded?: boolean; // Para UI state
}

// Filtros
export interface FiltrosAreas {
  nivel?: number;
  padreId?: number | null;
  busqueda?: string;
}

export interface FiltrosConceptos {
  areaId?: number;
  busqueda?: string;
}

// ===========================================================================
// UTILIDADES
// ===========================================================================

export const esAreaValida = (area: AreaJerarquica): boolean => {
  return !!(area.codigo && area.nombre);
};

export const esConceptoValido = (concepto: ConceptoJerarquico): boolean => {
  return !!(concepto.codigo && concepto.descripcion && concepto.unidad && concepto.precioUnitario);
};

export const tieneSubareas = (area: ArbolCompleto): boolean => {
  return area.hijos && area.hijos.length > 0;
};

export const tieneConceptos = (area: ArbolCompleto): boolean => {
  return area.conceptos && area.conceptos.length > 0;
};

export const puedeSerAreaFinal = (area: ArbolCompleto): boolean => {
  // Un área puede ser final si no tiene subareas
  return !tieneSubareas(area);
};

export const getNombreNivelArea = (nivel: number): string => {
  const nombres = {
    1: 'Categoría Principal',
    2: 'Subcategoría',
    3: 'Grupo',
    4: 'Subgrupo'
  };
  return nombres[nivel as keyof typeof nombres] || `Nivel ${nivel}`;
};
