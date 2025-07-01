import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import { Button } from "../../../shared/components/ui/button";
import { Badge } from "../../../shared/components/ui/badge";
import {
  Calendar,
  Users,
  Truck,
  TrendingUp,
  Activity,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import {
  useEstadisticasSemana,
  useDatosGraficaSemana,
} from "../hooks/useProgramming";
import { format, addWeeks, subWeeks, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";

interface ProgrammingDashboardProps {
  className?: string;
}

export default function ProgrammingDashboard({
  className,
}: ProgrammingDashboardProps) {
  const [fechaSemana, setFechaSemana] = useState(() =>
    format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd")
  );
  const { data: estadisticas, isLoading: loadingEstadisticas } =
    useEstadisticasSemana(fechaSemana);
  const {
    data: datosGrafica,
    isLoading: loadingGrafica,
    error: errorGrafica,
  } = useDatosGraficaSemana(fechaSemana);

  const handleSemanaAnterior = () => {
    const nuevaFecha = subWeeks(new Date(fechaSemana), 1);
    setFechaSemana(
      format(startOfWeek(nuevaFecha, { weekStartsOn: 1 }), "yyyy-MM-dd")
    );
  };

  const handleSemanaProxima = () => {
    const nuevaFecha = addWeeks(new Date(fechaSemana), 1);
    setFechaSemana(
      format(startOfWeek(nuevaFecha, { weekStartsOn: 1 }), "yyyy-MM-dd")
    );
  };

  const getRendimientoColor = (rendimiento: number) => {
    if (rendimiento >= 80) return "text-green-600";
    if (rendimiento >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getEstadoBadge = (estado: string, cantidad: number) => {
    const config = {
      completadas: {
        variant: "default" as const,
        color: "bg-green-100 text-green-800",
      },
      pendientes: {
        variant: "secondary" as const,
        color: "bg-yellow-100 text-yellow-800",
      },
      canceladas: {
        variant: "destructive" as const,
        color: "bg-red-100 text-red-800",
      },
      proceso: {
        variant: "outline" as const,
        color: "bg-blue-100 text-blue-800",
      },
    };

    const { color } = config[estado as keyof typeof config] || config.proceso;

    return <Badge className={color}>{cantidad}</Badge>;
  };

  if (loadingEstadisticas) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Panel de Control - Programación
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header con navegación de semana */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-blue-900 flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Panel de Control - Programación
          </h2>
          <p className="text-gray-600 text-lg mt-1">
            Vista semanal de actividades y rendimiento
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={handleSemanaAnterior}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-center min-w-[220px]">
            <p className="font-semibold text-lg">
              Semana del{" "}
              {format(new Date(fechaSemana), "dd MMM yyyy", { locale: es })} al{" "}
              {format(addWeeks(new Date(fechaSemana), 1), "dd MMM yyyy", {
                locale: es,
              })}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleSemanaProxima}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Tarjetas principales con iconos grandes y colores */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-semibold text-blue-900">
                Programaciones Totales
              </CardTitle>
              <p className="text-xs text-blue-700">Esta semana</p>
            </div>
            <Calendar className="h-10 w-10 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-blue-900">
              {estadisticas?.programacionesTotales || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-semibold text-green-900">
                Rendimiento
              </CardTitle>
              <p className="text-xs text-green-700">
                Completadas vs Programadas
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-400" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-4xl font-extrabold ${getRendimientoColor(
                estadisticas?.rendimientoSemanal || 0
              )}`}
            >
              {estadisticas?.rendimientoSemanal?.toFixed(1) || 0}%
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-semibold text-yellow-900">
                Brigadistas Activos
              </CardTitle>
              <p className="text-xs text-yellow-700">Con asignaciones</p>
            </div>
            <Users className="h-10 w-10 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-yellow-900">
              {estadisticas?.brigadistasActivos || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-semibold text-purple-900">
                Vehículos en Uso
              </CardTitle>
              <p className="text-xs text-purple-700">Transporte asignado</p>
            </div>
            <Truck className="h-10 w-10 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-purple-900">
              {estadisticas?.vehiculosEnUso || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tarjetas de estado detallado */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">
                {estadisticas?.programacionesCompletadas || 0}
              </div>
              {getEstadoBadge(
                "completadas",
                estadisticas?.programacionesCompletadas || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Muestras recolectadas exitosamente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-yellow-600">
                {estadisticas?.programacionesPendientes || 0}
              </div>
              {getEstadoBadge(
                "pendientes",
                estadisticas?.programacionesPendientes || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Actividades aún no ejecutadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
            <Activity className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-red-600">
                {estadisticas?.programacionesCanceladas || 0}
              </div>
              {getEstadoBadge(
                "canceladas",
                estadisticas?.programacionesCanceladas || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Actividades canceladas con motivo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-blue-600">
                {(estadisticas?.programacionesTotales || 0) -
                  (estadisticas?.programacionesCompletadas || 0) -
                  (estadisticas?.programacionesCanceladas || 0) -
                  (estadisticas?.programacionesPendientes || 0)}
              </div>
              {getEstadoBadge(
                "proceso",
                (estadisticas?.programacionesTotales || 0) -
                  (estadisticas?.programacionesCompletadas || 0) -
                  (estadisticas?.programacionesCanceladas || 0) -
                  (estadisticas?.programacionesPendientes || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Brigadistas en campo trabajando
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfica de progreso diario (placeholder - se puede implementar con una librería de gráficas) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Progreso Diario de la Semana</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingGrafica ? (
            <div className="h-32 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {(datosGrafica || []).map((dato, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="font-medium">{dato.dia}</div>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-blue-600">
                      Programadas: {dato.programadas}
                    </span>
                    <span className="text-green-600">
                      Completadas: {dato.completadas}
                    </span>
                    <span className="text-yellow-600">
                      Pendientes: {dato.pendientes}
                    </span>
                    <span className="text-red-600">
                      Canceladas: {dato.canceladas}
                    </span>
                  </div>
                </div>
              )) || (
                <div className="text-center text-gray-500 py-8">
                  {errorGrafica
                    ? `Error al cargar datos: ${errorGrafica.message}`
                    : "No hay datos disponibles para esta semana"}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertas automáticas */}
      {estadisticas && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span>Alertas y Notificaciones</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {estadisticas.rendimientoSemanal < 60 && (
                <div className="flex items-center space-x-2 p-2 bg-red-50 text-red-800 rounded">
                  <AlertTriangle className="h-4 w-4" />
                  <span>
                    Rendimiento semanal bajo (
                    {estadisticas.rendimientoSemanal.toFixed(1)}%)
                  </span>
                </div>
              )}

              {estadisticas.programacionesPendientes > 5 && (
                <div className="flex items-center space-x-2 p-2 bg-yellow-50 text-yellow-800 rounded">
                  <AlertTriangle className="h-4 w-4" />
                  <span>
                    Muchas programaciones pendientes (
                    {estadisticas.programacionesPendientes})
                  </span>
                </div>
              )}

              {estadisticas.programacionesCanceladas > 3 && (
                <div className="flex items-center space-x-2 p-2 bg-orange-50 text-orange-800 rounded">
                  <AlertTriangle className="h-4 w-4" />
                  <span>
                    Alto número de cancelaciones (
                    {estadisticas.programacionesCanceladas})
                  </span>
                </div>
              )}

              {estadisticas.rendimientoSemanal >= 80 &&
                estadisticas.programacionesPendientes <= 2 && (
                  <div className="flex items-center space-x-2 p-2 bg-green-50 text-green-800 rounded">
                    <Activity className="h-4 w-4" />
                    <span>Excelente rendimiento semanal - Sin alertas</span>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
