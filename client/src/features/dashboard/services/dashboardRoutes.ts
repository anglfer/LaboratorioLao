// Utilidad para obtener la ruta de dashboard según el rol
export function getDashboardRoute(rol: string): string {
  // Siempre redirige a la raíz, donde el router muestra el dashboard correcto según el rol
  return "/";
}
