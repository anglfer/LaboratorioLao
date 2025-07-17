import { useState } from "react";
import { Button } from "../../../shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import { Badge } from "../../../shared/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import { useProgramaciones } from "../hooks/useProgramming";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
} from "date-fns";
import { es } from "date-fns/locale";
// Forzar recarga del tipo para evitar problemas de caché o duplicidad
import type { Programacion, EstadoProgramacion } from "../types/programming";

const estadoColors = {
  programada: "bg-blue-100 text-blue-800 border-blue-200",
  en_proceso: "bg-orange-100 text-orange-800 border-orange-200",
  completada: "bg-green-100 text-green-800 border-green-200",
  cancelada: "bg-red-100 text-red-800 border-red-200",
  reprogramada: "bg-purple-100 text-purple-800 border-purple-200",
};

const estadoLabels = {
  programada: "Programada",
  en_proceso: "En Proceso",
  completada: "Completada",
  cancelada: "Cancelada",
  reprogramada: "Reprogramada",
};

export default function CalendarView() {
  // Estado para la semana actual
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Calcular inicio y fin de la semana
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Obtener programaciones de la semana
  const { data: programaciones = [], isLoading } = useProgramaciones({
    fechaDesde: weekStart.toISOString().split("T")[0],
    fechaHasta: weekEnd.toISOString().split("T")[0],
  });

  // Indicadores ejecutivos (ejemplo básico, reemplazar con lógica real)
  const totalActividades = programaciones.length;
  const brigadistasUnicos = new Set(
    programaciones.map((p) => p.brigadista?.nombre)
  ).size;
  const vehiculosUnicos = new Set(programaciones.map((p) => p.vehiculoId)).size;

  // Navegación de semana
  const goToPreviousWeek = () => setCurrentWeek((prev) => subWeeks(prev, 1));
  const goToNextWeek = () => setCurrentWeek((prev) => addWeeks(prev, 1));
  const goToCurrentWeek = () => setCurrentWeek(new Date());

  // Filtrar programaciones por día
  const getProgramacionesForDay = (day: Date) =>
    programaciones.filter((prog) =>
      isSameDay(new Date(prog.fechaProgramada), day)
    );

  // Renderizar una programación
  const renderProgramacion = (programacion: Programacion) => (
    <div
      key={programacion.id}
      className={`p-2 mb-2 rounded-md border text-xs ${
        estadoColors[programacion.estado as EstadoProgramacion]
      }`}
    >
      <div className="flex items-center gap-1 mb-1">
        <Clock className="h-3 w-3" />
        <span className="font-medium">{programacion.horaProgramada}</span>
      </div>
      <div className="mb-1">
        <div className="font-semibold truncate">{programacion.claveObra}</div>
        <div className="text-xs opacity-75 truncate">
          {programacion.nombreResidente}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Users className="h-3 w-3" />
        <span>{programacion.brigadista?.nombre || "Sin asignar"}</span>
      </div>
      <Badge
        variant="outline"
        className={`mt-1 ${
          estadoColors[programacion.estado as EstadoProgramacion]
        }`}
      >
        {estadoLabels[programacion.estado as EstadoProgramacion]}
      </Badge>
    </div>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vista de Calendario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Cargando programaciones...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <div className="flex flex-col gap-4">
          {/* Resumen ejecutivo e indicadores */}
          <div className="flex flex-wrap gap-6 items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              <CardTitle className="text-2xl font-extrabold tracking-tight text-blue-900">
                Vista de Calendario
              </CardTitle>
            </div>
            <div className="flex gap-4">
              <div className="bg-white rounded-lg shadow px-4 py-2 text-center">
                <div className="text-xs text-gray-500">Actividades</div>
                <div className="text-lg font-bold text-blue-800">
                  {totalActividades}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow px-4 py-2 text-center">
                <div className="text-xs text-gray-500">Brigadistas</div>
                <div className="text-lg font-bold text-blue-800">
                  {brigadistasUnicos}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow px-4 py-2 text-center">
                <div className="text-xs text-gray-500">Vehículos</div>
                <div className="text-lg font-bold text-blue-800">
                  {vehiculosUnicos}
                </div>
              </div>
              {/* Aquí puedes agregar más indicadores */}
            </div>
          </div>
          {/* Espacio para gráficas de rendimiento semanal */}
          <div className="w-full mb-2">
            {/* TODO: Agregar gráfica de rendimiento semanal (ejemplo: Chart.js o Recharts) */}
            <div className="bg-white rounded-lg p-4 text-center text-gray-400 border border-dashed">
              [Gráfica de rendimiento semanal aquí]
            </div>
          </div>
          {/* Navegación de semana */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousWeek}
              className="border-blue-200"
            >
              <ChevronLeft className="h-5 w-5 text-blue-600" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToCurrentWeek}
              className="bg-green-100 border-green-200 text-green-800 font-bold"
            >
              Hoy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextWeek}
              className="border-blue-200"
            >
              <ChevronRight className="h-5 w-5 text-blue-600" />
            </Button>
            <span className="ml-4 text-md text-blue-700">
              Semana del {format(weekStart, "d 'de' MMMM", { locale: es })} al{" "}
              {format(weekEnd, "d 'de' MMMM 'de' yyyy", { locale: es })}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Tabla y filtros avanzados */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4 mb-2 items-end">
            {/* Filtro por fecha */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Fecha
              </label>
              <input type="date" className="border rounded px-2 py-1 text-sm" />
              {/* TODO: conectar filtro */}
            </div>
            {/* Filtro por brigadista */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Brigadista
              </label>
              <input
                type="text"
                placeholder="Nombre"
                className="border rounded px-2 py-1 text-sm"
              />
              {/* TODO: conectar filtro */}
            </div>
            {/* Filtro por estado */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select className="border rounded px-2 py-1 text-sm">
                <option value="">Todos</option>
                {Object.entries(estadoLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              {/* TODO: conectar filtro */}
            </div>
            {/* Filtro por tipo de actividad */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tipo de actividad
              </label>
              <input
                type="text"
                placeholder="Tipo"
                className="border rounded px-2 py-1 text-sm"
              />
              {/* TODO: conectar filtro */}
            </div>
            {/* Botón para crear nueva programación */}
            <Button
              className="ml-auto bg-blue-600 text-white font-bold px-4 py-2 rounded shadow" /* TODO: onClick para abrir modal de creación */
            >
              + Nueva Programación
            </Button>
          </div>
          {/* Tabla de programaciones */}
          <div className="overflow-x-auto rounded border">
            <table className="min-w-full text-xs">
              <thead className="bg-blue-100">
                <tr>
                  <th className="px-2 py-2 text-left">Obra</th>
                  <th className="px-2 py-2 text-left">Fecha</th>
                  <th className="px-2 py-2 text-left">Actividad</th>
                  <th className="px-2 py-2 text-left">Brigadista</th>
                  <th className="px-2 py-2 text-left">Estado</th>
                  <th className="px-2 py-2 text-left">Muestras</th>
                  <th className="px-2 py-2 text-left">Ubicación</th>
                </tr>
              </thead>
              <tbody>
                {programaciones.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-400 py-4">
                      Sin programaciones
                    </td>
                  </tr>
                ) : (
                  programaciones.map((prog) => (
                    <tr key={prog.id} className="border-b hover:bg-blue-50">
                      <td className="px-2 py-1">{prog.claveObra}</td>
                      <td className="px-2 py-1">
                        {format(new Date(prog.fechaProgramada), "dd/MM/yyyy")}
                      </td>
                      <td className="px-2 py-1">
                        {/* Mostrar descripción de la actividad si existe */}
                        {prog.concepto?.descripcion ||
                          prog.conceptoCodigo ||
                          "-"}
                      </td>
                      <td className="px-2 py-1">
                        {prog.brigadista?.nombre || "-"}
                      </td>
                      <td className="px-2 py-1">
                        <Badge
                          className={
                            estadoColors[prog.estado as EstadoProgramacion]
                          }
                          variant="outline"
                        >
                          {estadoLabels[prog.estado as EstadoProgramacion]}
                        </Badge>
                      </td>
                      <td className="px-2 py-1">
                        {/* Mostrar cantidad de muestras si existe */}
                        {prog.cantidadMuestras ?? "-"}
                      </td>
                      <td className="px-2 py-1">{prog.ubicacion || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vista semanal tipo calendario */}
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const dayProgramaciones = getProgramacionesForDay(day);
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[200px] border rounded-lg p-3 transition-all duration-200 ${
                  isToday
                    ? "bg-yellow-50 border-yellow-300 shadow-lg"
                    : "bg-white border-blue-100"
                }`}
              >
                <div
                  className={`font-medium mb-2 flex items-center gap-2 ${
                    isToday ? "text-yellow-900" : "text-blue-900"
                  }`}
                >
                  <Calendar
                    className={`h-5 w-5 ${
                      isToday ? "text-yellow-500" : "text-blue-400"
                    }`}
                  />
                  <span className="text-sm">
                    {format(day, "EEEE", { locale: es })}
                  </span>
                  <span className={`text-lg ${isToday ? "font-bold" : ""}`}>
                    {format(day, "d", { locale: es })}
                  </span>
                </div>
                <div className="space-y-1">
                  {dayProgramaciones.length === 0 ? (
                    <div className="text-xs text-gray-400 mt-4">
                      Sin actividades
                    </div>
                  ) : (
                    dayProgramaciones.map(renderProgramacion)
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* Leyenda de estados */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="font-medium mb-2 text-blue-900">Estados:</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(estadoLabels).map(([estado, label]) => (
              <Badge
                key={estado}
                variant="outline"
                className={estadoColors[estado as EstadoProgramacion]}
              >
                {label}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
