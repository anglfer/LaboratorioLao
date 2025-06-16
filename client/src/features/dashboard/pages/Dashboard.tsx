import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Button } from "../../../shared/components/ui/button";
import { Badge } from "../../../shared/components/ui/badge";
import { useLocation } from "wouter";
import { 
  BarChart3,
  FileText,
  Users,
  Briefcase,
  TrendingUp,
  Plus
} from "lucide-react";

interface DashboardStats {
  totalClientes: number;
  totalPresupuestos: number;
  totalObras: number;
}

interface Presupuesto {
  id: number;
  claveObra: string | null;
  clienteId: number | null;
  estado: string;
  fechaSolicitud: string;
  total: string | null;
  cliente?: {
    nombre: string;
  };
  obra?: {
    clave: string;
    contratista: string;
  };
}

export default function Dashboard() {
  const [, navigate] = useLocation();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  const { data: recentPresupuestos, isLoading: presupuestosLoading } = useQuery<Presupuesto[]>({
    queryKey: ["/api/presupuestos"],
    queryFn: async () => {
      const response = await fetch("/api/presupuestos");
      if (!response.ok) throw new Error("Failed to fetch presupuestos");
      const data = await response.json();
      return data.slice(0, 5); // Solo los primeros 5
    },
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'borrador': return 'bg-gray-100 text-gray-800';
      case 'enviado': return 'bg-blue-100 text-blue-800';
      case 'aprobado': return 'bg-green-100 text-green-800';
      case 'rechazado': return 'bg-red-100 text-red-800';
      case 'finalizado': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Panel de Control</h2>
          <p className="text-gray-600 mt-1">Sistema de Gestión - Laboratorio LOA</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => navigate("/budgets")} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Presupuesto
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalClientes || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Presupuestos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalPresupuestos || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Briefcase className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Obras</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalObras || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Presupuestos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Presupuestos Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {presupuestosLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : recentPresupuestos && recentPresupuestos.length > 0 ? (
              <div className="space-y-4">
                {recentPresupuestos.map((presupuesto) => (
                  <div key={presupuesto.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {presupuesto.claveObra || `Presupuesto #${presupuesto.id}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        Cliente: {presupuesto.cliente?.nombre || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(presupuesto.fechaSolicitud).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getEstadoBadgeColor(presupuesto.estado)}>
                        {presupuesto.estado}
                      </Badge>
                      {presupuesto.total && (
                        <p className="text-sm font-medium text-gray-900">
                          ${Number(presupuesto.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/budgets")}
                >
                  Ver Todos los Presupuestos
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay presupuestos</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comienza creando tu primer presupuesto.
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => navigate("/budgets")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Presupuesto
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Resumen de Actividad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Clientes Activos</p>
                    <p className="text-xs text-gray-500">Registrados en el sistema</p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900">{stats?.totalClientes || 0}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Presupuestos</p>
                    <p className="text-xs text-gray-500">Total generados</p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900">{stats?.totalPresupuestos || 0}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded">
                    <Briefcase className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Obras</p>
                    <p className="text-xs text-gray-500">En gestión</p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900">{stats?.totalObras || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
