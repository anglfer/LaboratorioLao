import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import { Button } from "../../../shared/components/ui/button";
import {
  Users,
  FileText,
  Calendar,
  Settings,
  BarChart3,
  UserCheck,
  Truck,
  Building2,
} from "lucide-react";
import { useLocation, Router } from "wouter";
import { useAdminStats } from "../hooks/useAdminStats";

export function AdminDashboard() {
  // Detectar si hay un router en contexto usando useLocation
  let hasRouter = true;
  let navigate;
  try {
    const [, setLocation] = useLocation();
    navigate = setLocation;
  } catch (e) {
    hasRouter = false;
    navigate = (_path: string) => {};
  }

  const adminModules = [
    {
      title: "Gestión de Usuarios",
      description: "Administrar usuarios del sistema",
      icon: Users,
      path: "/admin/usuarios",
      color: "bg-blue-500",
    },
    {
      title: "Presupuestos",
      description: "Ver y gestionar todos los presupuestos",
      icon: FileText,
      path: "/presupuestos",
      color: "bg-green-500",
    },
    {
      title: "Programaciones",
      description: "Administrar programaciones del laboratorio",
      icon: Calendar,
      path: "/programacion",
      color: "bg-purple-500",
    },
    {
      title: "Brigadistas",
      description: "Gestión de brigadistas y asignaciones",
      icon: UserCheck,
      path: "/admin/brigadistas",
      color: "bg-orange-500",
    },
    {
      title: "Vehículos",
      description: "Administrar flota de vehículos",
      icon: Truck,
      path: "/admin/vehiculos",
      color: "bg-red-500",
    },
    {
      title: "Obras y Áreas",
      description: "Gestionar obras y áreas de trabajo",
      icon: Building2,
      path: "/admin/obras",
      color: "bg-indigo-500",
    },
    {
      title: "Reportes",
      description: "Visualizar reportes y estadísticas",
      icon: BarChart3,
      path: "/admin/reportes",
      color: "bg-teal-500",
    },
    {
      title: "Configuración",
      description: "Configuración del sistema",
      icon: Settings,
      path: "/admin/configuracion",
      color: "bg-gray-500",
    },
  ];

  const { data: stats, isLoading } = useAdminStats();

  const content = (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Panel de Administración
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona todos los aspectos del sistema de laboratorio
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {adminModules.map((module) => {
          const Icon = module.icon;
          return (
            <Card
              key={module.path}
              className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${module.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-lg">{module.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {module.description}
                </p>
                <Button
                  onClick={() => navigate(module.path)}
                  className="w-full"
                  variant="outline"
                >
                  Acceder
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Clientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? "..." : stats?.totalClientes ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Presupuestos
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? "..." : stats?.totalPresupuestos ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Obras</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? "..." : stats?.totalObras ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Si no hay router en contexto, envolver en <Router>
  if (!hasRouter) {
    return <Router>{content}</Router>;
  }
  return content;
}
