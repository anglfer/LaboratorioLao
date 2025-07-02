// Sistema de Autenticación y Roles
export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: "admin" | "recepcionista" | "jefe_laboratorio" | "brigadista" | "laboratorista";
  activo: boolean;
  fechaCreacion: Date;
  brigadistaId?: number; // Para brigadistas, referencia al modelo Brigadista
}

export interface PermisoRol {
  rol: string;
  permisos: string[];
}

// Configuración de permisos por rol
export const ROLES_PERMISOS: PermisoRol[] = [
  {
    rol: "admin",
    permisos: [
      "ver_dashboard_admin",
      "gestionar_usuarios",
      "ver_presupuestos",
      "crear_presupuesto", 
      "editar_presupuesto",
      "aprobar_presupuesto",
      "rechazar_presupuesto",
      "ver_programaciones",
      "crear_programacion",
      "editar_programacion",
      "eliminar_programacion",
      "gestionar_conceptos",
      "ver_reportes",
      "gestionar_clientes",
      "gestionar_obras",
      "gestionar_brigadistas",
      "gestionar_vehiculos"
    ],
  },
  {
    rol: "recepcionista",
    permisos: [
      "ver_dashboard_recepcionista",
      "crear_presupuesto",
      "editar_presupuesto", 
      "ver_presupuestos",
      "enviar_presupuesto",
      "aprobar_presupuesto",
      "rechazar_presupuesto",
      "crear_programacion",
      "editar_programacion",
      "ver_programaciones",
      "eliminar_programacion",
      "gestionar_clientes"
    ],
  },
  {
    rol: "jefe_laboratorio",
    permisos: [
      "ver_dashboard_jefe",
      "crear_programacion",
      "editar_programacion",
      "ver_programaciones"
    ],
  },
  {
    rol: "brigadista",
    permisos: [
      "ver_dashboard_brigadista",
      "ver_programaciones_asignadas",
      "iniciar_programacion",
      "completar_programacion",
      "marcar_actividad_completada",
      "llenar_formulario_actividad"
    ],
  },
  {
    rol: "laboratorista",
    permisos: [
      "ver_dashboard_laboratorista",
      // Por definir
    ],
  },
];

// TODO: Implementar middleware de autenticación
// TODO: Implementar guards por componente
// TODO: Implementar login/logout
// TODO: Implementar gestión de sesiones
