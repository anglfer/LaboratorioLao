import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import { Button } from "../../../shared/components/ui/button";
import { Badge } from "../../../shared/components/ui/badge";
import { Textarea } from "../../../shared/components/ui/textarea";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../shared/components/ui/dialog";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Clipboard,
  CheckCircle,
  Play,
  XCircle,
  Camera,
  AlertTriangle,
  Navigation,
  TrendingUp,
} from "lucide-react";
import {
  useProgramacionesBrigadista,
  useIniciarActividad,
  useCompletarActividad,
  useCancelarActividad,
} from "../hooks/useProgramming";
import { EstadoProgramacion, Programacion } from "../types/programming";
import { format, isToday, isTomorrow } from "date-fns";
import { es } from "date-fns/locale";

interface BrigadistaDashboardProps {
  brigadistaId: number; // En el futuro vendrá del contexto de autenticación
  className?: string;
}

export default function BrigadistaDashboard({
  brigadistaId = 1, // ID temporal para demo
  className,
}: BrigadistaDashboardProps) {
  const [dialogoAbierto, setDialogoAbierto] = useState<
    "iniciar" | "completar" | "cancelar" | null
  >(null);
  const [programacionSeleccionada, setProgramacionSeleccionada] =
    useState<Programacion | null>(null);
  const [muestrasObtenidas, setMuestrasObtenidas] = useState(0);
  const [observaciones, setObservaciones] = useState("");
  const [motivoCancelacion, setMotivoCancelacion] = useState("");

  // Queries
  const { data: actividadesHoy, isLoading: loadingHoy } =
    useProgramacionesBrigadista(
      brigadistaId,
      new Date().toISOString().split("T")[0]
    );

  const { data: proximasActividades, isLoading: loadingProximas } =
    useProgramacionesBrigadista(brigadistaId);

  // Mutations
  const iniciarMutation = useIniciarActividad();
  const completarMutation = useCompletarActividad();
  const cancelarMutation = useCancelarActividad();

  // Filtrar actividades
  const actividadesDelDia = actividadesHoy || [];
  const proximas =
    proximasActividades
      ?.filter(
        (p) =>
          !isToday(new Date(p.fechaProgramada)) &&
          new Date(p.fechaProgramada) > new Date()
      )
      .slice(0, 5) || [];

  const actividadesRecientes =
    proximasActividades
      ?.filter(
        (p) =>
          p.estado === EstadoProgramacion.COMPLETADA &&
          new Date(p.fechaCompletado || p.fechaActualizacion) >
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      )
      .slice(0, 3) || [];

  // Estadísticas personales
  const totalActividades = proximasActividades?.length || 0;
  const completadas =
    proximasActividades?.filter(
      (p) => p.estado === EstadoProgramacion.COMPLETADA
    ).length || 0;
  const enProceso =
    proximasActividades?.filter(
      (p) => p.estado === EstadoProgramacion.EN_PROCESO
    ).length || 0;
  const rendimiento =
    totalActividades > 0 ? (completadas / totalActividades) * 100 : 0;

  const getEstadoBadge = (estado: EstadoProgramacion) => {
    const config = {
      [EstadoProgramacion.PROGRAMADA]: {
        color: "bg-blue-100 text-blue-800",
        label: "Programada",
      },
      [EstadoProgramacion.EN_PROCESO]: {
        color: "bg-yellow-100 text-yellow-800",
        label: "En Proceso",
      },
      [EstadoProgramacion.COMPLETADA]: {
        color: "bg-green-100 text-green-800",
        label: "Completada",
      },
      [EstadoProgramacion.CANCELADA]: {
        color: "bg-red-100 text-red-800",
        label: "Cancelada",
      },
      [EstadoProgramacion.REPROGRAMADA]: {
        color: "bg-purple-100 text-purple-800",
        label: "Reprogramada",
      },
    };

    const { color, label } = config[estado];
    return <Badge className={color}>{label}</Badge>;
  };

  const getFechaLabel = (fecha: string) => {
    const fechaObj = new Date(fecha);
    if (isToday(fechaObj)) return "Hoy";
    if (isTomorrow(fechaObj)) return "Mañana";
    return format(fechaObj, "dd/MM/yyyy", { locale: es });
  };

  const handleIniciarActividad = (programacion: Programacion) => {
    setProgramacionSeleccionada(programacion);
    setDialogoAbierto("iniciar");
  };

  const handleCompletarActividad = (programacion: Programacion) => {
    setProgramacionSeleccionada(programacion);
    setMuestrasObtenidas(programacion.cantidadMuestras);
    setDialogoAbierto("completar");
  };

  const handleCancelarActividad = (programacion: Programacion) => {
    setProgramacionSeleccionada(programacion);
    setDialogoAbierto("cancelar");
  };

  const confirmarIniciarActividad = () => {
    if (!programacionSeleccionada) return;
    iniciarMutation.mutate(programacionSeleccionada.id);
    setDialogoAbierto(null);
    setProgramacionSeleccionada(null);
  };

  const confirmarCompletarActividad = () => {
    if (!programacionSeleccionada) return;
    completarMutation.mutate({
      id: programacionSeleccionada.id,
      muestrasObtenidas,
      observaciones,
    });
    setDialogoAbierto(null);
    setProgramacionSeleccionada(null);
    setMuestrasObtenidas(0);
    setObservaciones("");
  };

  const confirmarCancelarActividad = () => {
    if (!programacionSeleccionada) return;
    cancelarMutation.mutate({
      id: programacionSeleccionada.id,
      motivo: motivoCancelacion,
    });
    setDialogoAbierto(null);
    setProgramacionSeleccionada(null);
    setMotivoCancelacion("");
  };

  if (loadingHoy) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header del dashboard del brigadista */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mi Dashboard - Brigadista</h2>
          <p className="text-gray-600">
            Panel personal de actividades y rendimiento
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            {format(new Date(), "EEEE, dd MMMM yyyy", { locale: es })}
          </p>
          <p className="text-lg font-medium">{format(new Date(), "HH:mm")}</p>
        </div>
      </div>

      {/* Tarjetas de estadísticas personales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Actividades del Día
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actividadesDelDia.length}</div>
            <p className="text-xs text-muted-foreground">
              {
                actividadesDelDia.filter(
                  (a) => a.estado === EstadoProgramacion.COMPLETADA
                ).length
              }{" "}
              completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
            <Play className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {enProceso}
            </div>
            <p className="text-xs text-muted-foreground">
              Actividades iniciadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rendimiento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                rendimiento >= 80
                  ? "text-green-600"
                  : rendimiento >= 60
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {rendimiento.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {completadas} de {totalActividades} completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proximas.length}</div>
            <p className="text-xs text-muted-foreground">
              Actividades programadas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Mis Actividades del Día */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Mis Actividades del Día</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {actividadesDelDia.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No hay actividades programadas para hoy</p>
              </div>
            ) : (
              <div className="space-y-4">
                {actividadesDelDia.map((actividad) => (
                  <div
                    key={actividad.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {actividad.claveObra}
                        </span>
                        {getEstadoBadge(actividad.estado)}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{actividad.horaProgramada}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{actividad.obra?.area.nombre}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clipboard className="h-4 w-4 text-gray-400" />
                          <span className="truncate">
                            {actividad.concepto?.descripcion}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {actividad.nombreResidente && (
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>{actividad.nombreResidente}</span>
                          </div>
                        )}
                        {actividad.telefonoResidente && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{actividad.telefonoResidente}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {actividad.instrucciones && (
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-blue-800">
                          <strong>Instrucciones:</strong>{" "}
                          {actividad.instrucciones}
                        </p>
                      </div>
                    )}

                    {actividad.condicionesEspeciales && (
                      <div className="bg-yellow-50 p-3 rounded">
                        <p className="text-sm text-yellow-800">
                          <strong>Condiciones Especiales:</strong>{" "}
                          {actividad.condicionesEspeciales}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end space-x-2">
                      {actividad.estado === EstadoProgramacion.PROGRAMADA && (
                        <Button
                          size="sm"
                          onClick={() => handleIniciarActividad(actividad)}
                          className="flex items-center space-x-1"
                        >
                          <Play className="h-4 w-4" />
                          <span>Iniciar</span>
                        </Button>
                      )}

                      {actividad.estado === EstadoProgramacion.EN_PROCESO && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleCompletarActividad(actividad)}
                            className="flex items-center space-x-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Completar</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelarActividad(actividad)}
                            className="flex items-center space-x-1"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Cancelar</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próximas Actividades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Próximas Actividades</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {proximas.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p>No hay actividades próximas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {proximas.map((actividad) => (
                  <div key={actividad.id} className="border rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        {actividad.claveObra}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getFechaLabel(actividad.fechaProgramada)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {actividad.concepto?.descripcion}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {actividad.horaProgramada}
                      </span>
                      {getEstadoBadge(actividad.estado)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Historial Reciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Historial Reciente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {actividadesRecientes.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p>No hay actividades recientes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {actividadesRecientes.map((actividad) => (
                  <div key={actividad.id} className="border rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        {actividad.claveObra}
                      </span>
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Completada
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {actividad.concepto?.descripcion}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {actividad.muestrasObtenidas} muestras obtenidas
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog para iniciar actividad */}
      <Dialog
        open={dialogoAbierto === "iniciar"}
        onOpenChange={() => setDialogoAbierto(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iniciar Actividad</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea iniciar esta actividad? Se registrará la
              hora de inicio.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {programacionSeleccionada && (
              <div className="bg-gray-50 p-3 rounded">
                <p>
                  <strong>Obra:</strong> {programacionSeleccionada.claveObra}
                </p>
                <p>
                  <strong>Actividad:</strong>{" "}
                  {programacionSeleccionada.concepto?.descripcion}
                </p>
                <p>
                  <strong>Muestras:</strong>{" "}
                  {programacionSeleccionada.cantidadMuestras}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoAbierto(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmarIniciarActividad}>
              Iniciar Actividad
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para completar actividad */}
      <Dialog
        open={dialogoAbierto === "completar"}
        onOpenChange={() => setDialogoAbierto(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Completar Actividad</DialogTitle>
            <DialogDescription>
              Registre los resultados de la actividad completada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="muestrasObtenidas">Muestras Obtenidas</Label>
              <Input
                id="muestrasObtenidas"
                type="number"
                min="0"
                max={programacionSeleccionada?.cantidadMuestras}
                value={muestrasObtenidas}
                onChange={(e) =>
                  setMuestrasObtenidas(parseInt(e.target.value) || 0)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Descripción de lo realizado, condiciones encontradas, etc."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoAbierto(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmarCompletarActividad}>
              Completar Actividad
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para cancelar actividad */}
      <Dialog
        open={dialogoAbierto === "cancelar"}
        onOpenChange={() => setDialogoAbierto(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Actividad</DialogTitle>
            <DialogDescription>
              Indique el motivo por el cual debe cancelar esta actividad.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="motivoCancelacion">Motivo de Cancelación *</Label>
              <Textarea
                id="motivoCancelacion"
                value={motivoCancelacion}
                onChange={(e) => setMotivoCancelacion(e.target.value)}
                placeholder="Describa el motivo de la cancelación..."
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoAbierto(null)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmarCancelarActividad}
              disabled={!motivoCancelacion.trim()}
              variant="destructive"
            >
              Cancelar Actividad
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
