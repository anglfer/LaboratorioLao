import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import { Badge } from "../../../shared/components/ui/badge";
import { Button } from "../../../shared/components/ui/button";
import { SafeDisplay } from "../../../shared/components/ui/safe-display";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  MapPin,
  FileText,
  Timer,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { mockBrigadistaStats, mockBrigadistaActividades } from "../mockData";

interface BrigadistaActivity {
  id: number;
  obraClave: string;
  ubicacion: string;
  tipoActividad: string;
  horaInicio: string;
  horaFin?: string;
  estado: "pendiente" | "en_proceso" | "completada";
  prioridad: "baja" | "media" | "alta";
  observaciones?: string;
}

interface BrigadistaStats {
  actividadesHoy: number;
  actividadesCompletadas: number;
  actividadesPendientes: number;
  horasTrabajadasHoy: number;
}

export function BrigadistaDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<BrigadistaStats>({
    queryKey: ["/api/brigadista/stats"],
    queryFn: async () => {
      // En desarrollo, usamos datos mock
      if (process.env.NODE_ENV === "development") {
        return mockBrigadistaStats;
      }

      const response = await fetch("/api/brigadista/stats");
      if (!response.ok) throw new Error("Failed to fetch brigadista stats");
      return response.json();
    },
  });

  const { data: actividades, isLoading: actividadesLoading } = useQuery<
    BrigadistaActivity[]
  >({
    queryKey: ["/api/brigadista/actividades"],
    queryFn: async () => {
      // En desarrollo, usamos datos mock
      if (process.env.NODE_ENV === "development") {
        return mockBrigadistaActividades;
      }

      const response = await fetch("/api/brigadista/actividades");
      if (!response.ok) throw new Error("Failed to fetch actividades");
      return response.json();
    },
  });

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case "alta":
        return "destructive";
      case "media":
        return "default";
      case "baja":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "completada":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "en_proceso":
        return <Timer className="h-4 w-4 text-blue-600" />;
      case "pendiente":
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (statsLoading || actividadesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard Brigadista</h1>
        </div>
        <div className="text-center py-8">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Brigadista</h1>
          <p className="text-muted-foreground">
            Vista de actividades diarias -{" "}
            {new Date().toLocaleDateString("es-MX", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Actividades Hoy
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.actividadesHoy || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.actividadesCompletadas || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.actividadesPendientes || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Horas Trabajadas
            </CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.horasTrabajadasHoy || 0}h
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Actividades */}
      <Card>
        <CardHeader>
          <CardTitle>Actividades del Día</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {actividades?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay actividades programadas para hoy
              </p>
            ) : (
              actividades?.map((actividad) => (
                <div
                  key={actividad.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(actividad.estado)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">
                          {actividad.tipoActividad}
                        </h3>
                        <Badge
                          variant={getPriorityColor(actividad.prioridad) as any}
                        >
                          {actividad.prioridad}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center space-x-1">
                          <FileText className="h-3 w-3" />
                          <span>{actividad.obraClave}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{actividad.ubicacion}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{actividad.horaInicio}</span>
                          {actividad.horaFin && (
                            <span> - {actividad.horaFin}</span>
                          )}
                        </div>
                      </div>
                      {actividad.observaciones && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {actividad.observaciones}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {actividad.estado === "pendiente" && (
                      <Button size="sm" variant="outline">
                        Iniciar
                      </Button>
                    )}
                    {actividad.estado === "en_proceso" && (
                      <Button size="sm">Completar</Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
