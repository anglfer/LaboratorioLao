import { BrigadistaDashboard } from "./BrigadistaDashboard";
import { EmpleadoDashboard } from "./EmpleadoDashboard";

// Tipos de usuario (posteriormente vendrá del sistema de auth)
type UserRole = "empleado" | "brigadista";

interface DashboardSelectorProps {
  userRole?: UserRole;
}

export function DashboardSelector({
  userRole = "empleado",
}: DashboardSelectorProps) {
  // Por ahora usamos un valor por defecto, pero luego se integrará con el contexto de auth
  // const { user } = useAuth(); // Futuro hook de autenticación
  // const role = user?.role || 'empleado';

  switch (userRole) {
    case "brigadista":
      return <BrigadistaDashboard />;
    case "empleado":
    default:
      return <EmpleadoDashboard />;
  }
}
