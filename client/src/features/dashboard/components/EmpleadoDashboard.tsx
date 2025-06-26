import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import { Button } from "../../../shared/components/ui/button";
import { Badge } from "../../../shared/components/ui/badge";
import { SafeDisplay } from "../../../shared/components/ui/safe-display";
import { useLocation } from "wouter";
import {
  BarChart3,
  FileText,
  Users,
  Briefcase,
  TrendingUp,
  Plus,
  AlertCircle,
  DollarSign,
  Clock,
  CheckCircle2,
  TestTube,
  Building,
  Activity,
} from "lucide-react";

interface EmpleadoStats {
  // Estadísticas Operativas
  obrasEnProceso: number;
  muestrasEnLaboratorio: number;
  presupuestosPendientes: number;
  informesPorGenerar: number;
  facturacionPendiente: number;

  // Indicadores de Rendimiento
  tiempoPromedioEnsayo: number; // en horas
  eficienciaLaboratorio: number; // porcentaje

  // Financieros
  ventasMes: number;
  presupuestosAprobados: number;
}

interface AlertaOperativa {
  id: number;
  tipo: "critica" | "importante" | "info";
  mensaje: string;
  fecha: string;
}

interface PresupuestoReciente {
  id: number;
  claveObra: string | null;
  cliente: string;
  estado: string;
  total: number;
  fechaSolicitud: string;
}

export function EmpleadoDashboard() {
  const [, navigate] = useLocation();

  const { data: stats, isLoading: statsLoading } = useQuery<EmpleadoStats>({
    queryKey: ["/api/empleado/stats"],
    queryFn: async () => {
      const response = await fetch("/api/empleado/stats");
      if (!response.ok) throw new Error("Failed to fetch empleado stats");
      return response.json();
    },
  });

  const { data: alertas, isLoading: alertasLoading } = useQuery<
    AlertaOperativa[]
  >({
    queryKey: ["/api/empleado/alertas"],
    queryFn: async () => {
      const response = await fetch("/api/empleado/alertas");
      if (!response.ok) throw new Error("Failed to fetch alertas");
      return response.json();
    },
  });

  const { data: presupuestosRecientes, isLoading: presupuestosLoading } =
    useQuery<PresupuestoReciente[]>({
      queryKey: ["/api/empleado/presupuestos-recientes"],
      queryFn: async () => {
        const response = await fetch("/api/empleado/presupuestos-recientes");
        if (!response.ok) throw new Error("Failed to fetch presupuestos");
        return response.json();
      },
    });

  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case "critica":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "importante":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case "info":
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "aprobado":
        return "default";
      case "enviado":
        return "secondary";
      case "borrador":
        return "outline";
      case "rechazado":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard Operativo</h1>
        </div>
        <div className="text-center py-8">Cargando estadísticas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Operativo</h1>
          <p className="text-muted-foreground">
            Vista general del estado del laboratorio en tiempo real
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => navigate("/budgets")}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Presupuesto
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin/concepts")}>
            Gestionar Conceptos
          </Button>
        </div>
      </div>

      {/* Estadísticas Operativas Principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Obras en Proceso
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.obrasEnProceso || 0}
            </div>
            <p className="text-xs text-muted-foreground">obras activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Muestras en Lab
            </CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.muestrasEnLaboratorio || 0}
            </div>
            <p className="text-xs text-muted-foreground">pendientes análisis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presupuestos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.presupuestosPendientes || 0}
            </div>
            <p className="text-xs text-muted-foreground">requieren atención</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Informes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.informesPorGenerar || 0}
            </div>
            <p className="text-xs text-muted-foreground">por generar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturación</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.facturacionPendiente?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">pendiente cobro</p>
          </CardContent>
        </Card>
      </div>

      {/* Indicadores de Rendimiento */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tiempo Promedio Ensayo
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.tiempoPromedioEnsayo || 0}h
            </div>
            <p className="text-xs text-muted-foreground">
              +2h vs. mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Eficiencia Laboratorio
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.eficienciaLaboratorio || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              procesadas vs. recibidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ventas del Mes
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.ventasMes?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.presupuestosAprobados || 0} presupuestos aprobados
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Alertas Operativas */}
        <Card>
          <CardHeader>
            <CardTitle>Alertas del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alertasLoading ? (
                <p className="text-center text-muted-foreground">
                  Cargando alertas...
                </p>
              ) : alertas?.length === 0 ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    Todo funcionando correctamente
                  </p>
                </div>
              ) : (
                alertas?.map((alerta) => (
                  <div
                    key={alerta.id}
                    className="flex items-start space-x-3 p-3 border rounded-lg"
                  >
                    {getAlertIcon(alerta.tipo)}
                    <div className="flex-1">
                      <p className="text-sm">{alerta.mensaje}</p>
                      <p className="text-xs text-muted-foreground">
                        {alerta.fecha}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Presupuestos Recientes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Presupuestos Recientes</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/budgets")}
            >
              Ver todos
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {presupuestosLoading ? (
                <p className="text-center text-muted-foreground">
                  Cargando presupuestos...
                </p>
              ) : presupuestosRecientes?.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No hay presupuestos recientes
                </p>
              ) : (
                presupuestosRecientes?.map((presupuesto) => (
                  <div
                    key={presupuesto.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {presupuesto.claveObra || `#${presupuesto.id}`}
                        </span>
                        <Badge
                          variant={getEstadoColor(presupuesto.estado) as any}
                        >
                          {presupuesto.estado}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <SafeDisplay
                          value={presupuesto.cliente}
                          fallback="Cliente no disponible"
                        />
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {presupuesto.fechaSolicitud}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${presupuesto.total?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
