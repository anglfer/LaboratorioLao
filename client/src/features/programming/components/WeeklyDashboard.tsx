import React, { useState } from "react";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { es } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import { Button } from "../../../shared/components/ui/button";
import { Badge } from "../../../shared/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  Truck,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useWeeklyStats } from "../hooks/useProgramming";
import { ESTADOS_PROGRAMACION } from "../types/programming";
import type { WeeklyProgramming } from "../types/programming";

interface WeeklyDashboardProps {
  onProgramacionClick?: (programacionId: number) => void;
  onCreateClick?: () => void;
}

export default function WeeklyDashboard({
  onProgramacionClick,
  onCreateClick,
}: WeeklyDashboardProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const {
    data: weeklyData,
    isLoading,
    error,
  } = useWeeklyStats(format(currentWeek, "yyyy-MM-dd"));

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeek((prev) =>
      direction === "prev" ? subWeeks(prev, 1) : addWeeks(prev, 1)
    );
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  const isCurrentWeek = () => {
    const now = new Date();
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });
    return now >= weekStart && now <= weekEnd;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error al cargar las estadísticas semanales
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = weeklyData?.stats;
  const programacionesDiarias = weeklyData?.programacionesDiarias || [];

  return (
    <div className="space-y-6">
      {/* Header con navegación de semana */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-slate-900">
            Panel de Control de Programación
          </h1>
          <Badge variant="outline" className="text-sm">
            {format(startOfWeek(currentWeek, { weekStartsOn: 0 }), "dd MMM", {
              locale: es,
            })}{" "}
            -{" "}
            {format(
              endOfWeek(currentWeek, { weekStartsOn: 0 }),
              "dd MMM yyyy",
              { locale: es }
            )}
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {!isCurrentWeek() && (
            <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
              <Calendar className="h-4 w-4 mr-2" />
              Semana Actual
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {onCreateClick && (
            <Button onClick={onCreateClick} className="ml-4">
              Nueva Programación
            </Button>
          )}
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Programaciones Totales"
            value={stats.programacionesTotales}
            icon={Calendar}
            color="blue"
            subtitle="Esta semana"
          />

          <StatsCard
            title="Completadas"
            value={stats.programacionesCompletadas}
            icon={CheckCircle}
            color="green"
            subtitle={`${stats.rendimientoSemanal}% de eficiencia`}
          />

          <StatsCard
            title="Pendientes"
            value={stats.programacionesPendientes}
            icon={Clock}
            color="yellow"
            subtitle="Por ejecutar"
          />

          <StatsCard
            title="Canceladas"
            value={stats.programacionesCanceladas}
            icon={XCircle}
            color="red"
            subtitle="Con motivo registrado"
          />
        </div>
      )}

      {/* Estadísticas de recursos */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-2 text-blue-600" />
                Brigadistas Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.brigadistasActivos}
              </div>
              <p className="text-xs text-muted-foreground">
                Brigadistas con asignaciones
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Truck className="h-4 w-4 mr-2 text-green-600" />
                Vehículos en Uso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.vehiculosEnUso}</div>
              <p className="text-xs text-muted-foreground">
                Equipos de transporte
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <BarChart3 className="h-4 w-4 mr-2 text-purple-600" />
                Rendimiento Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.rendimientoSemanal}%
              </div>
              <p className="text-xs text-muted-foreground">
                Completadas vs Totales
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Vista diaria de programaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Programaciones de la Semana</CardTitle>
          <CardDescription>
            Vista diaria de todas las actividades programadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            {programacionesDiarias.map((dia, index) => (
              <DayCard
                key={index}
                fecha={new Date(dia.fecha)}
                programaciones={dia.programaciones}
                onProgramacionClick={onProgramacionClick}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: "blue" | "green" | "yellow" | "red" | "purple";
  subtitle?: string;
}

function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: StatsCardProps) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    yellow: "text-yellow-600 bg-yellow-100",
    red: "text-red-600 bg-red-100",
    purple: "text-purple-600 bg-purple-100",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div
          className={`h-8 w-8 rounded-full flex items-center justify-center ${colorClasses[color]}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface DayCardProps {
  fecha: Date;
  programaciones: any[];
  onProgramacionClick?: (id: number) => void;
}

function DayCard({ fecha, programaciones, onProgramacionClick }: DayCardProps) {
  const isToday =
    format(fecha, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  return (
    <div
      className={`p-4 rounded-lg border ${
        isToday ? "border-blue-500 bg-blue-50" : "border-gray-200"
      }`}
    >
      <div className="text-center mb-3">
        <div
          className={`text-lg font-semibold ${
            isToday ? "text-blue-900" : "text-gray-900"
          }`}
        >
          {format(fecha, "dd")}
        </div>
        <div
          className={`text-xs ${isToday ? "text-blue-700" : "text-gray-600"}`}
        >
          {format(fecha, "EEE", { locale: es })}
        </div>
      </div>

      <div className="space-y-2">
        {programaciones.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-2">
            Sin programaciones
          </p>
        ) : (
          programaciones.map((prog) => (
            <div
              key={prog.id}
              className={`p-2 rounded text-xs cursor-pointer hover:opacity-80 ${
                ESTADOS_PROGRAMACION[
                  prog.estado as keyof typeof ESTADOS_PROGRAMACION
                ]?.bgColor || "bg-gray-100"
              }`}
              onClick={() => onProgramacionClick?.(prog.id)}
            >
              <div className="font-medium truncate">{prog.claveObra}</div>
              <div className="text-gray-600 truncate">
                {prog.horaProgramada}
              </div>
              <Badge
                variant="outline"
                className={`text-xs mt-1 ${
                  ESTADOS_PROGRAMACION[
                    prog.estado as keyof typeof ESTADOS_PROGRAMACION
                  ]?.color || "text-gray-600"
                }`}
              >
                {ESTADOS_PROGRAMACION[
                  prog.estado as keyof typeof ESTADOS_PROGRAMACION
                ]?.label || prog.estado}
              </Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
