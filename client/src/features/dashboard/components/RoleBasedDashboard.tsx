import { useAuth } from "../hooks/useAuth";
import { AdminDashboard } from "./AdminDashboard";
import { RecepcionistaDashboard } from "./RecepcionistaDashboard";
import { BrigadistaDashboard } from "./BrigadistaDashboard";
import { Card, CardContent } from "../../../shared/components/ui/card";
import { AlertCircle } from "lucide-react";

export function RoleBasedDashboard() {
  const { usuario, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Sesión no válida
            </h2>
            <p className="text-gray-600">
              Por favor, inicia sesión para acceder al sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Renderizar dashboard según el rol
  switch (usuario.rol) {
    case "admin":
      return <AdminDashboard />;

    case "recepcionista":
      return <RecepcionistaDashboard />;

    case "brigadista":
      return <BrigadistaDashboard />;

    case "jefe_laboratorio":
      return (
        <div className="p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Dashboard de Jefe de Laboratorio
              </h2>
              <p className="text-gray-600 mb-4">
                Panel en desarrollo. Funcionalidades de programación
                próximamente.
              </p>
            </CardContent>
          </Card>
        </div>
      );

    case "laboratorista":
      return (
        <div className="p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Dashboard de Laboratorista
              </h2>
              <p className="text-gray-600 mb-4">
                Panel en desarrollo. Funcionalidades por definir.
              </p>
            </CardContent>
          </Card>
        </div>
      );

    default:
      return (
        <div className="p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Rol no reconocido
              </h2>
              <p className="text-gray-600">
                Tu rol ({usuario.rol}) no tiene un dashboard configurado.
              </p>
            </CardContent>
          </Card>
        </div>
      );
  }
}
