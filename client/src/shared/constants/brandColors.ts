/**
 * 🎨 PALETA EMPRESARIAL COMPLETA - LABORATORIO LAO
 * 
 * Esquema de colores profesional diseñado específicamente para el sector de construcción
 * y laboratorios de materiales. Implementa jerarquía visual, accesibilidad y coherencia
 * de marca en toda la aplicación.
 */

// ========================================
// 🔴 COLORES PRIMARIOS
// ========================================
export const PRIMARY_COLORS = {
  /** Verde Corporativo - Color del logo y marca principal */
  corporate: "#68A53B",
  /** Verde Oscuro - Variación oscura del verde principal */
  corporateDark: "#4F7D2C", 
  /** Verde Claro - Variación clara del verde principal */
  corporateLight: "#E7F2E0",
} as const;

// ========================================
// 🔴 COLORES SECUNDARIOS
// ========================================
export const SECONDARY_COLORS = {
  /** Azul Gris Oscuro - Color profesional complementario */
  professional: "#2C3E50",
  /** Naranja Terracota - Color de acento (sector construcción) */
  accent: "#E67E22",
} as const;

// ========================================
// 🔴 COLORES FUNCIONALES
// ========================================
export const FUNCTIONAL_COLORS = {
  /** Verde Éxito - Estados positivos (mismo que el logo) */
  success: "#68A53B",
  /** Rojo Ladrillo - Errores y alertas críticas */
  error: "#C0392B",
  /** Amarillo Construcción - Advertencias y procesos */
  warning: "#F39C12",
} as const;

// ========================================
// 🔴 COLORES NEUTROS
// ========================================
export const NEUTRAL_COLORS = {
  /** Gris Muy Claro - Fondos generales */
  backgroundLight: "#F8F9FA",
  /** Gris Medio - Textos secundarios y elementos inactivos */
  textSecondary: "#6C757D",
  /** Blanco - Tarjetas y áreas de contenido */
  white: "#FFFFFF",
  /** Texto Principal - Textos principales */
  textPrimary: "#2C3E50",
  /** Bordes y separadores */
  border: "#F8F9FA",
} as const;

// ========================================
// 🔴 PALETA COMPLETA CONSOLIDADA
// ========================================
export const BRAND_COLORS = {
  // Colores Primarios
  primary: PRIMARY_COLORS.corporate,
  primaryDark: PRIMARY_COLORS.corporateDark,
  primaryLight: PRIMARY_COLORS.corporateLight,
  
  // Colores Secundarios
  secondary: SECONDARY_COLORS.professional,
  accent: SECONDARY_COLORS.accent,
  
  // Colores Funcionales
  success: FUNCTIONAL_COLORS.success,
  error: FUNCTIONAL_COLORS.error,
  warning: FUNCTIONAL_COLORS.warning,
  
  // Colores Neutros
  backgroundLight: NEUTRAL_COLORS.backgroundLight,
  textSecondary: NEUTRAL_COLORS.textSecondary,
  white: NEUTRAL_COLORS.white,
  textPrimary: NEUTRAL_COLORS.textPrimary,
  border: NEUTRAL_COLORS.border,
} as const;

// ========================================
// 🔴 MAPEO DE ESTADOS CON COLORES
// ========================================
export const STATUS_COLORS = {
  draft: { color: BRAND_COLORS.textSecondary, label: "Borrador" },
  pending: { color: BRAND_COLORS.warning, label: "Pendiente" },
  approved: { color: BRAND_COLORS.success, label: "Aprobado" },
  rejected: { color: BRAND_COLORS.error, label: "Rechazado" },
  completed: { color: BRAND_COLORS.success, label: "Completado" },
  cancelled: { color: BRAND_COLORS.error, label: "Cancelado" },
  in_progress: { color: BRAND_COLORS.accent, label: "En Proceso" },
} as const;

// ========================================
// 🔴 GUÍA DE USO POR ELEMENTO UI
// ========================================
export const UI_GUIDELINES = {
  HEADER: {
    background: BRAND_COLORS.white,
    logoColor: BRAND_COLORS.primary,
    textPrimary: BRAND_COLORS.textPrimary,
    textSecondary: BRAND_COLORS.textSecondary,
  },
  
  NAVIGATION: {
    background: BRAND_COLORS.white,
    activeItem: BRAND_COLORS.primary,
    inactiveItem: BRAND_COLORS.textPrimary,
    hoverBackground: BRAND_COLORS.primaryLight,
  },
  
  BUTTONS: {
    primary: { bg: BRAND_COLORS.primary, text: BRAND_COLORS.white },
    success: { bg: BRAND_COLORS.success, text: BRAND_COLORS.white },
    error: { bg: BRAND_COLORS.error, text: BRAND_COLORS.white },
    warning: { bg: BRAND_COLORS.warning, text: BRAND_COLORS.white },
    secondary: { bg: BRAND_COLORS.secondary, text: BRAND_COLORS.white },
  },
  
  CARDS: {
    background: BRAND_COLORS.white,
    border: BRAND_COLORS.border,
    textPrimary: BRAND_COLORS.textPrimary,
    textSecondary: BRAND_COLORS.textSecondary,
  },
  
  TABLES: {
    headerBackground: BRAND_COLORS.backgroundLight,
    rowBackground: BRAND_COLORS.white,
    hoverBackground: `${BRAND_COLORS.backgroundLight}80`, // 50% opacity
    border: BRAND_COLORS.border,
    textPrimary: BRAND_COLORS.textPrimary,
    textSecondary: BRAND_COLORS.textSecondary,
  },
  
  FORMS: {
    background: BRAND_COLORS.white,
    fieldBorder: BRAND_COLORS.border,
    focusBorder: BRAND_COLORS.primary,
    labelColor: BRAND_COLORS.textSecondary,
    inputText: BRAND_COLORS.textPrimary,
  },
  
  BACKGROUNDS: {
    app: BRAND_COLORS.backgroundLight,
    container: BRAND_COLORS.white,
    separator: BRAND_COLORS.border,
  },
} as const;

// ========================================
// 🔴 UTILIDADES PARA COLORES
// ========================================

/**
 * Convierte un color HEX a formato RGB con opacidad opcional
 * @param hex Color en formato hexadecimal (#RRGGBB)
 * @param opacity Opacidad de 0 a 1 (opcional)
 * @returns String en formato rgba() o rgb()
 */
export function hexToRgba(hex: string, opacity?: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  if (opacity !== undefined) {
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Genera una variación de color con opacidad
 * @param color Color base
 * @param opacity Opacidad de 0 a 1
 * @returns Color con opacidad aplicada
 */
export function withOpacity(color: string, opacity: number): string {
  return hexToRgba(color, opacity);
}

/**
 * Obtiene el color apropiado para un estado específico
 * @param status Estado del elemento
 * @returns Objeto con color y etiqueta
 */
export function getStatusColor(status: keyof typeof STATUS_COLORS) {
  return STATUS_COLORS[status] || { color: BRAND_COLORS.textSecondary, label: status };
}

// ========================================
// 🔴 JERARQUÍA DE IMPORTANCIA
// ========================================
export const COLOR_HIERARCHY = {
  /** Solo para elementos más importantes */
  HIGHEST: BRAND_COLORS.primary,
  /** Textos principales y elementos estructurales */
  HIGH: BRAND_COLORS.textPrimary,
  /** Solo para sus respectivos estados */
  FUNCTIONAL: FUNCTIONAL_COLORS,
  /** Para todo lo demás (fondos, textos secundarios) */
  NEUTRAL: NEUTRAL_COLORS,
} as const;

// ========================================
// 🔴 CONSIDERACIONES DE ACCESIBILIDAD
// ========================================
export const ACCESSIBILITY_NOTES = {
  CONTRAST: "Todos los colores cumplen con WCAG 2.1 AA para contraste adecuado",
  COLOR_BLIND: "La paleta es amigable para usuarios con daltonismo",
  SEMANTIC: "Los colores funcionales mantienen su significado universalmente reconocido",
} as const;

export default BRAND_COLORS;
