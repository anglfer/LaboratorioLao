import { useState } from "react";
import { DashboardSelector } from "../components/DashboardSelector";
import { Button } from "../../../shared/components/ui/button";
import { Badge } from "../../../shared/components/ui/badge";

type UserRole = "empleado" | "brigadista";

export default function Dashboard() {
  // Por ahora permitimos cambiar el tipo de usuario para demostración
  // En el futuro esto vendrá del contexto de autenticación
  const [userRole, setUserRole] = useState<UserRole>("empleado");

  return (
    <div className="space-y-4">
      {/* Selector temporal para demo */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">
            Vista actual:
          </span>
          <Badge variant={userRole === "empleado" ? "default" : "secondary"}>
            {userRole === "empleado" ? "Empleado" : "Brigadista"}
          </Badge>
        </div>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={userRole === "empleado" ? "default" : "outline"}
            onClick={() => setUserRole("empleado")}
          >
            Vista Empleado
          </Button>
          <Button
            size="sm"
            variant={userRole === "brigadista" ? "default" : "outline"}
            onClick={() => setUserRole("brigadista")}
          >
            Vista Brigadista
          </Button>
        </div>
      </div>

      {/* Dashboard actual */}
      <DashboardSelector userRole={userRole} />
    </div>
  );
}
