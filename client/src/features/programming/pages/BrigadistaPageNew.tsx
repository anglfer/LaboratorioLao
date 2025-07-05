import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import { Button } from "../../../shared/components/ui/button";
import { Badge } from "../../../shared/components/ui/badge";
// import BrigadistaDashboard from "../components/BrigadistaDashboard";
import { User, Calendar, Clock, CheckCircle, Phone, Mail } from "lucide-react";
import {
  useBrigadistaPerfil,
  useBrigadistaProgramaciones,
} from "../hooks/useProgramming";
import { format, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { EstadoProgramacion } from "../types/programming";

export default function BrigadistaPage() {
  const [currentTime, setCurrentTime] = useState(new Date());

  const { data: brigadista, isLoading: loadingPerfil } = useBrigadistaPerfil();

  // Obtener programaciones de hoy y en proceso SOLO si ya se cargó el perfil
  const hoy = new Date();
  const brigadistaId = brigadista?.id;
  const { data: programacionesHoy = [], isLoading: loadingHoy } =
    useBrigadistaProgramaciones(
      brigadistaId
        ? {
            fechaDesde: format(startOfDay(hoy), "yyyy-MM-dd"),
            fechaHasta: format(endOfDay(hoy), "yyyy-MM-dd"),
            brigadistaId,
          }
        : undefined
    );

  const { data: programacionesEnProceso = [], isLoading: loadingProceso } =
    useBrigadistaProgramaciones(
      brigadistaId
        ? {
            estado: EstadoProgramacion.EN_PROCESO,
            brigadistaId,
          }
        : undefined
    );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (loadingPerfil) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Cargando información del brigadista...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con información del brigadista */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {brigadista?.nombre || "Brigadista"}
            </h1>
            <p className="text-muted-foreground">Panel de Control Personal</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Phone className="w-4 h-4" />
                <span>{brigadista?.telefono || "No disponible"}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Mail className="w-4 h-4" />
                <span>{brigadista?.email || "No disponible"}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Hora actual</div>
          <div className="text-2xl font-mono font-bold">
            {format(currentTime, "HH:mm:ss")}
          </div>
          <div className="text-sm text-muted-foreground">
            {format(currentTime, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingHoy ? "..." : programacionesHoy.length}
            </div>
            <p className="text-xs text-muted-foreground">Programadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingProceso ? "..." : programacionesEnProceso.length}
            </div>
            <p className="text-xs text-muted-foreground">Actividades activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingHoy
                ? "..."
                : programacionesHoy.filter(
                    (p) => p.estado === EstadoProgramacion.COMPLETADA
                  ).length}
            </div>
            <p className="text-xs text-muted-foreground">Hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rendimiento</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingHoy
                ? "..."
                : programacionesHoy.length > 0
                ? `${Math.round(
                    (programacionesHoy.filter(
                      (p) => p.estado === EstadoProgramacion.COMPLETADA
                    ).length /
                      programacionesHoy.length) *
                      100
                  )}%`
                : "0%"}
            </div>
            <p className="text-xs text-muted-foreground">Eficiencia</p>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard principal */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Personal</CardTitle>
          <CardDescription>
            Vista detallada de tus actividades y rendimiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* <BrigadistaDashboard brigadistaId={brigadista?.id || 1} /> */}
        </CardContent>
      </Card>
    </div>
  );
}
