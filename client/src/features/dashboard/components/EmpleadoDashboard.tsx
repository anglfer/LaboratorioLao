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
import { useNavigate } from "react-router-dom";
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
  Calendar,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Target,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import {
  PRIMARY_COLORS,
  FUNCTIONAL_COLORS,
  NEUTRAL_COLORS,
  SECONDARY_COLORS,
} from "../../../shared/constants/brandColors";

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
  const navigate = useNavigate();

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

  // Nuevas queries para gráficas
  const { data: ventasMensuales } = useQuery({
    queryKey: ["/api/empleado/charts/ventas-mensuales"],
    queryFn: async () => {
      const response = await fetch("/api/empleado/charts/ventas-mensuales");
      if (!response.ok) throw new Error("Failed to fetch ventas mensuales");
      return response.json();
    },
  });

  const { data: estadoPresupuestos } = useQuery({
    queryKey: ["/api/empleado/charts/estado-presupuestos"],
    queryFn: async () => {
      const response = await fetch("/api/empleado/charts/estado-presupuestos");
      if (!response.ok) throw new Error("Failed to fetch estado presupuestos");
      return response.json();
    },
  });

  const { data: rendimientoLab } = useQuery({
    queryKey: ["/api/empleado/charts/rendimiento-laboratorio"],
    queryFn: async () => {
      const response = await fetch(
        "/api/empleado/charts/rendimiento-laboratorio"
      );
      if (!response.ok) throw new Error("Failed to fetch rendimiento");
      return response.json();
    },
  });

  const { data: areasData } = useQuery({
    queryKey: ["/api/empleado/charts/areas-trabajo"],
    queryFn: async () => {
      const response = await fetch("/api/empleado/charts/areas-trabajo");
      if (!response.ok) throw new Error("Failed to fetch areas");
      return response.json();
    },
  });

  // Colores para gráficas usando la paleta empresarial
  const CHART_COLORS = {
    primary: PRIMARY_COLORS.corporate,
    success: FUNCTIONAL_COLORS.success,
    warning: FUNCTIONAL_COLORS.warning,
    error: FUNCTIONAL_COLORS.error,
    professional: SECONDARY_COLORS.professional,
    accent: SECONDARY_COLORS.accent,
  };

  const PIE_COLORS = [
    CHART_COLORS.primary,
    CHART_COLORS.professional,
    CHART_COLORS.accent,
    CHART_COLORS.warning,
    CHART_COLORS.error,
  ];

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
      <div
        className="min-h-screen"
        style={{ backgroundColor: NEUTRAL_COLORS.backgroundLight }}
      >
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h1
              className="text-3xl font-bold"
              style={{ color: SECONDARY_COLORS.professional }}
            >
              Dashboard Ejecutivo
            </h1>
          </div>
          <div className="text-center py-12">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
              style={{ borderColor: PRIMARY_COLORS.corporate }}
            ></div>
            <p style={{ color: NEUTRAL_COLORS.textSecondary }}>
              Cargando análisis empresarial...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: NEUTRAL_COLORS.backgroundLight }}
    >
      <div className="space-y-6 p-6">
        {/* Header Empresarial */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-4xl font-bold mb-2"
              style={{ color: SECONDARY_COLORS.professional }}
            >
              Dashboard Ejecutivo
            </h1>
            <p
              className="text-lg"
              style={{ color: NEUTRAL_COLORS.textSecondary }}
            >
              Análisis integral del desempeño empresarial - Laboratorio LAO
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => navigate("/budgets")}
              className="text-white font-medium"
              style={{ backgroundColor: PRIMARY_COLORS.corporate }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Presupuesto
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/concepts")}
              style={{
                borderColor: PRIMARY_COLORS.corporate,
                color: PRIMARY_COLORS.corporate,
              }}
            >
              <Target className="mr-2 h-4 w-4" />
              Gestionar Conceptos
            </Button>
          </div>
        </div>

        {/* KPIs Principales */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <Card
            className="border-l-4"
            style={{ borderLeftColor: PRIMARY_COLORS.corporate }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className="text-sm font-medium"
                style={{ color: SECONDARY_COLORS.professional }}
              >
                Obras Activas
              </CardTitle>
              <div
                className="p-2 rounded"
                style={{ backgroundColor: PRIMARY_COLORS.corporateLight }}
              >
                <Building
                  className="h-4 w-4"
                  style={{ color: PRIMARY_COLORS.corporate }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="text-3xl font-bold mb-1"
                style={{ color: SECONDARY_COLORS.professional }}
              >
                {stats?.obrasEnProceso || 0}
              </div>
              <div
                className="flex items-center text-xs"
                style={{ color: FUNCTIONAL_COLORS.success }}
              >
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12% vs mes anterior
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-l-4"
            style={{ borderLeftColor: FUNCTIONAL_COLORS.warning }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className="text-sm font-medium"
                style={{ color: SECONDARY_COLORS.professional }}
              >
                Muestras en Análisis
              </CardTitle>
              <div
                className="p-2 rounded"
                style={{ backgroundColor: `${FUNCTIONAL_COLORS.warning}20` }}
              >
                <TestTube
                  className="h-4 w-4"
                  style={{ color: FUNCTIONAL_COLORS.warning }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="text-3xl font-bold mb-1"
                style={{ color: SECONDARY_COLORS.professional }}
              >
                {stats?.muestrasEnLaboratorio || 0}
              </div>
              <div
                className="flex items-center text-xs"
                style={{ color: NEUTRAL_COLORS.textSecondary }}
              >
                <Clock className="h-3 w-3 mr-1" />
                Programadas hoy
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-l-4"
            style={{ borderLeftColor: SECONDARY_COLORS.accent }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className="text-sm font-medium"
                style={{ color: SECONDARY_COLORS.professional }}
              >
                Presupuestos Activos
              </CardTitle>
              <div
                className="p-2 rounded"
                style={{ backgroundColor: `${SECONDARY_COLORS.accent}20` }}
              >
                <FileText
                  className="h-4 w-4"
                  style={{ color: SECONDARY_COLORS.accent }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="text-3xl font-bold mb-1"
                style={{ color: SECONDARY_COLORS.professional }}
              >
                {stats?.presupuestosPendientes || 0}
              </div>
              <div
                className="flex items-center text-xs"
                style={{ color: NEUTRAL_COLORS.textSecondary }}
              >
                <AlertCircle className="h-3 w-3 mr-1" />
                Requieren seguimiento
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-l-4"
            style={{ borderLeftColor: FUNCTIONAL_COLORS.success }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className="text-sm font-medium"
                style={{ color: SECONDARY_COLORS.professional }}
              >
                Facturación Pendiente
              </CardTitle>
              <div
                className="p-2 rounded"
                style={{ backgroundColor: `${FUNCTIONAL_COLORS.success}20` }}
              >
                <DollarSign
                  className="h-4 w-4"
                  style={{ color: FUNCTIONAL_COLORS.success }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="text-3xl font-bold mb-1"
                style={{ color: SECONDARY_COLORS.professional }}
              >
                ${stats?.facturacionPendiente?.toLocaleString() || 0}
              </div>
              <div
                className="flex items-center text-xs"
                style={{ color: FUNCTIONAL_COLORS.success }}
              >
                <ArrowUpRight className="h-3 w-3 mr-1" />
                Listo para cobro
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-l-4"
            style={{ borderLeftColor: SECONDARY_COLORS.professional }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className="text-sm font-medium"
                style={{ color: SECONDARY_COLORS.professional }}
              >
                Ventas del Mes
              </CardTitle>
              <div
                className="p-2 rounded"
                style={{
                  backgroundColor: `${SECONDARY_COLORS.professional}20`,
                }}
              >
                <TrendingUp
                  className="h-4 w-4"
                  style={{ color: SECONDARY_COLORS.professional }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="text-3xl font-bold mb-1"
                style={{ color: SECONDARY_COLORS.professional }}
              >
                ${stats?.ventasMes?.toLocaleString() || 0}
              </div>
              <div
                className="flex items-center text-xs"
                style={{ color: FUNCTIONAL_COLORS.success }}
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {stats?.presupuestosAprobados || 0} aprobados
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficas Analíticas */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Gráfica de Ventas Mensuales */}
          <Card
            className="shadow-sm border-0"
            style={{ backgroundColor: "white" }}
          >
            <CardHeader>
              <CardTitle
                className="flex items-center"
                style={{ color: SECONDARY_COLORS.professional }}
              >
                <BarChart3
                  className="mr-2 h-5 w-5"
                  style={{ color: PRIMARY_COLORS.corporate }}
                />
                Tendencia de Ventas - Últimos 12 Meses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ventasMensuales || []}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={NEUTRAL_COLORS.backgroundLight}
                    />
                    <XAxis
                      dataKey="periodo"
                      tick={{
                        fontSize: 12,
                        fill: NEUTRAL_COLORS.textSecondary,
                      }}
                    />
                    <YAxis
                      tick={{
                        fontSize: 12,
                        fill: NEUTRAL_COLORS.textSecondary,
                      }}
                      tickFormatter={(value) =>
                        `$${(value / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip
                      formatter={(value: any) => [
                        `$${Number(value).toLocaleString()}`,
                        "Ventas",
                      ]}
                      labelStyle={{ color: SECONDARY_COLORS.professional }}
                      contentStyle={{
                        backgroundColor: "white",
                        border: `1px solid ${NEUTRAL_COLORS.backgroundLight}`,
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke={PRIMARY_COLORS.corporate}
                      fill={PRIMARY_COLORS.corporateLight}
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gráfica de Estado de Presupuestos */}
          <Card
            className="shadow-sm border-0"
            style={{ backgroundColor: "white" }}
          >
            <CardHeader>
              <CardTitle
                className="flex items-center"
                style={{ color: SECONDARY_COLORS.professional }}
              >
                <PieChart
                  className="mr-2 h-5 w-5"
                  style={{ color: PRIMARY_COLORS.corporate }}
                />
                Distribución de Presupuestos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={
                        estadoPresupuestos?.map((item: any, index: number) => ({
                          name: item.estado,
                          value: item._count.id,
                          total: item._sum.total || 0,
                        })) || []
                      }
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {estadoPresupuestos?.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any, props: any) => [
                        `${value} presupuestos`,
                        `$${Number(props.payload.total).toLocaleString()}`,
                      ]}
                      contentStyle={{
                        backgroundColor: "white",
                        border: `1px solid ${NEUTRAL_COLORS.backgroundLight}`,
                        borderRadius: "8px",
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rendimiento y Áreas de Trabajo */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Rendimiento del Laboratorio */}
          <Card
            className="shadow-sm border-0"
            style={{ backgroundColor: "white" }}
          >
            <CardHeader>
              <CardTitle
                className="flex items-center"
                style={{ color: SECONDARY_COLORS.professional }}
              >
                <Activity
                  className="mr-2 h-5 w-5"
                  style={{ color: PRIMARY_COLORS.corporate }}
                />
                Rendimiento Laboratorio - Últimos 30 Días
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rendimientoLab || []}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={NEUTRAL_COLORS.backgroundLight}
                    />
                    <XAxis
                      dataKey="fecha"
                      tick={{
                        fontSize: 12,
                        fill: NEUTRAL_COLORS.textSecondary,
                      }}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("es-MX", {
                          month: "short",
                          day: "numeric",
                        })
                      }
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{
                        fontSize: 12,
                        fill: NEUTRAL_COLORS.textSecondary,
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{
                        fontSize: 12,
                        fill: NEUTRAL_COLORS.textSecondary,
                      }}
                    />
                    <Tooltip
                      labelFormatter={(value) =>
                        new Date(value).toLocaleDateString("es-MX")
                      }
                      contentStyle={{
                        backgroundColor: "white",
                        border: `1px solid ${NEUTRAL_COLORS.backgroundLight}`,
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="muestras_procesadas"
                      stroke={PRIMARY_COLORS.corporate}
                      strokeWidth={2}
                      name="Muestras Procesadas"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="tiempo_promedio"
                      stroke={FUNCTIONAL_COLORS.warning}
                      strokeWidth={2}
                      name="Tiempo Promedio (hrs)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Áreas de Trabajo */}
          <Card
            className="shadow-sm border-0"
            style={{ backgroundColor: "white" }}
          >
            <CardHeader>
              <CardTitle
                className="flex items-center"
                style={{ color: SECONDARY_COLORS.professional }}
              >
                <Building
                  className="mr-2 h-5 w-5"
                  style={{ color: PRIMARY_COLORS.corporate }}
                />
                Distribución por Áreas de Trabajo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={areasData || []} layout="horizontal">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={NEUTRAL_COLORS.backgroundLight}
                    />
                    <XAxis
                      type="number"
                      tick={{
                        fontSize: 12,
                        fill: NEUTRAL_COLORS.textSecondary,
                      }}
                      tickFormatter={(value) =>
                        `$${(value / 1000).toFixed(0)}k`
                      }
                    />
                    <YAxis
                      type="category"
                      dataKey="nombre"
                      tick={{
                        fontSize: 12,
                        fill: NEUTRAL_COLORS.textSecondary,
                      }}
                      width={100}
                    />
                    <Tooltip
                      formatter={(value: any) => [
                        `$${Number(value).toLocaleString()}`,
                        "Monto Total",
                      ]}
                      contentStyle={{
                        backgroundColor: "white",
                        border: `1px solid ${NEUTRAL_COLORS.backgroundLight}`,
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="totalMonto"
                      fill={PRIMARY_COLORS.corporate}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sección Inferior: Alertas y Presupuestos Recientes */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Alertas del Sistema */}
          <Card
            className="shadow-sm border-0"
            style={{ backgroundColor: "white" }}
          >
            <CardHeader>
              <CardTitle
                className="flex items-center"
                style={{ color: SECONDARY_COLORS.professional }}
              >
                <AlertCircle
                  className="mr-2 h-5 w-5"
                  style={{ color: FUNCTIONAL_COLORS.warning }}
                />
                Centro de Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alertasLoading ? (
                  <p
                    className="text-center"
                    style={{ color: NEUTRAL_COLORS.textSecondary }}
                  >
                    Analizando estado del sistema...
                  </p>
                ) : alertas?.length === 0 ? (
                  <div className="text-center py-6">
                    <CheckCircle2
                      className="h-12 w-12 mx-auto mb-3"
                      style={{ color: FUNCTIONAL_COLORS.success }}
                    />
                    <p
                      className="font-medium"
                      style={{ color: FUNCTIONAL_COLORS.success }}
                    >
                      Sistema Operando Óptimamente
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: NEUTRAL_COLORS.textSecondary }}
                    >
                      Todos los procesos funcionando correctamente
                    </p>
                  </div>
                ) : (
                  alertas?.map((alerta) => (
                    <div
                      key={alerta.id}
                      className="flex items-start space-x-3 p-4 rounded-lg border-l-4"
                      style={{
                        backgroundColor: NEUTRAL_COLORS.backgroundLight,
                        borderLeftColor:
                          alerta.tipo === "critica"
                            ? FUNCTIONAL_COLORS.error
                            : alerta.tipo === "importante"
                            ? FUNCTIONAL_COLORS.warning
                            : PRIMARY_COLORS.corporate,
                      }}
                    >
                      {getAlertIcon(alerta.tipo)}
                      <div className="flex-1">
                        <p
                          className="text-sm font-medium"
                          style={{ color: SECONDARY_COLORS.professional }}
                        >
                          {alerta.mensaje}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: NEUTRAL_COLORS.textSecondary }}
                        >
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
          <Card
            className="shadow-sm border-0"
            style={{ backgroundColor: "white" }}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle
                className="flex items-center"
                style={{ color: SECONDARY_COLORS.professional }}
              >
                <FileText
                  className="mr-2 h-5 w-5"
                  style={{ color: PRIMARY_COLORS.corporate }}
                />
                Actividad Reciente
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/budgets")}
                className="text-sm"
                style={{
                  borderColor: PRIMARY_COLORS.corporate,
                  color: PRIMARY_COLORS.corporate,
                }}
              >
                Ver Todos
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {presupuestosLoading ? (
                  <p
                    className="text-center"
                    style={{ color: NEUTRAL_COLORS.textSecondary }}
                  >
                    Cargando actividad reciente...
                  </p>
                ) : presupuestosRecientes?.length === 0 ? (
                  <div className="text-center py-6">
                    <FileText
                      className="h-12 w-12 mx-auto mb-3"
                      style={{ color: NEUTRAL_COLORS.textSecondary }}
                    />
                    <p style={{ color: NEUTRAL_COLORS.textSecondary }}>
                      No hay actividad reciente
                    </p>
                  </div>
                ) : (
                  presupuestosRecientes?.map((presupuesto) => (
                    <div
                      key={presupuesto.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:shadow-sm transition-shadow cursor-pointer"
                      style={{
                        backgroundColor: NEUTRAL_COLORS.backgroundLight,
                        borderColor: "#e5e7eb",
                      }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span
                            className="font-semibold"
                            style={{ color: SECONDARY_COLORS.professional }}
                          >
                            {presupuesto.claveObra || `#${presupuesto.id}`}
                          </span>
                          <Badge
                            variant={getEstadoColor(presupuesto.estado) as any}
                            className="text-xs font-medium"
                            style={{
                              backgroundColor:
                                presupuesto.estado === "aprobado"
                                  ? FUNCTIONAL_COLORS.success
                                  : presupuesto.estado === "enviado"
                                  ? PRIMARY_COLORS.corporate
                                  : presupuesto.estado === "rechazado"
                                  ? FUNCTIONAL_COLORS.error
                                  : NEUTRAL_COLORS.textSecondary,
                              color: "white",
                            }}
                          >
                            {presupuesto.estado.toUpperCase()}
                          </Badge>
                        </div>
                        <p
                          className="text-sm mb-1"
                          style={{ color: SECONDARY_COLORS.professional }}
                        >
                          <SafeDisplay
                            value={presupuesto.cliente}
                            fallback="Cliente no disponible"
                          />
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: NEUTRAL_COLORS.textSecondary }}
                        >
                          {new Date(
                            presupuesto.fechaSolicitud
                          ).toLocaleDateString("es-MX", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className="font-bold text-lg"
                          style={{ color: PRIMARY_COLORS.corporate }}
                        >
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
    </div>
  );
}
