// Sistema de Autenticación y Roles - Pendiente de implementar
export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: "empleado" | "brigadista" | "admin";
  activo: boolean;
  fechaCreacion: Date;
}

export interface PermisoRol {
  rol: string;
  permisos: string[];
}

// Configuración de permisos por rol
export const ROLES_PERMISOS: PermisoRol[] = [
  {
    rol: "empleado",
    permisos: [
      "ver_dashboard_empleado",
      "crear_presupuesto",
      "editar_presupuesto",
      "ver_presupuestos",
      "crear_programacion",
      "ver_programaciones",
      "gestionar_conceptos",
    ],
  },
  {
    rol: "brigadista",
    permisos: [
      "ver_dashboard_brigadista",
      "ver_programaciones_asignadas",
      "iniciar_programacion",
      "completar_programacion",
      "cancelar_programacion",
    ],
  },
  {
    rol: "admin",
    permisos: [
      "*", // Todos los permisos
    ],
  },
];

// TODO: Implementar middleware de autenticación
// TODO: Implementar guards por componente
// TODO: Implementar login/logout
// TODO: Implementar gestión de sesiones
