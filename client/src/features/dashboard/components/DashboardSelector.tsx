// import { BrigadistaDashboard } from "./BrigadistaDashboard";
import { EmpleadoDashboard } from "./EmpleadoDashboard";
import { SafeDisplay } from "../../../shared/components/ui/safe-display";
import React from "react";

// Tipos de usuario (posteriormente vendrá del sistema de auth)
type UserRole = "empleado" | "brigadista";

interface DashboardSelectorProps {
  userRole?: UserRole;
}

// Componente que actúa como límite de error para capturar errores en el dashboard
class DashboardErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Error en el Dashboard:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-700 mb-2">
            Error en el Dashboard
          </h2>
          <p className="text-red-600">
            Ha ocurrido un error al renderizar el dashboard. Por favor, contacte
            al soporte técnico.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export function DashboardSelector({
  userRole = "empleado",
}: DashboardSelectorProps) {
  // Por ahora usamos un valor por defecto, pero luego se integrará con el contexto de auth
  // const { user } = useAuth(); // Futuro hook de autenticación
  // const role = user?.role || 'empleado';

  return (
    <DashboardErrorBoundary>
      {userRole === "brigadista" ? (
        {
          /* <BrigadistaDashboard /> */
        }
      ) : (
        <EmpleadoDashboard />
      )}
    </DashboardErrorBoundary>
  );
}
