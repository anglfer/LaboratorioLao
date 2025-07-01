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
import { Programacion, EstadoProgramacion } from "../types/programming";

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
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const { data: programaciones = [], isLoading } = useProgramaciones({
    fechaDesde: weekStart.toISOString().split("T")[0],
    fechaHasta: weekEnd.toISOString().split("T")[0],
  });

  const goToPreviousWeek = () => {
    setCurrentWeek((prev) => subWeeks(prev, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek((prev) => addWeeks(prev, 1));
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  const getProgramacionesForDay = (day: Date) => {
    return programaciones.filter((prog) =>
      isSameDay(new Date(prog.fechaProgramada), day)
    );
  };

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
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-extrabold tracking-tight text-blue-900 flex items-center gap-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            Vista de Calendario
          </CardTitle>
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
          </div>
        </div>
        <p className="text-md text-blue-700 mt-2">
          Semana del {format(weekStart, "d 'de' MMMM", { locale: es })} al{" "}
          {format(weekEnd, "d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </CardHeader>
      <CardContent>
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
        {/* Legend */}
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
