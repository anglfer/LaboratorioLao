import { useState } from "react";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../shared/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import { Badge } from "../../../shared/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../shared/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../shared/components/ui/dialog";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Play,
  CheckCircle,
  XCircle,
  Calendar,
  RefreshCw,
  Plus,
} from "lucide-react";
import {
  useProgramaciones,
  useBrigadistas,
  useIniciarActividad,
  useCompletarActividad,
  useCancelarActividad,
  useReprogramarActividad,
  useDeleteProgramacion,
} from "../hooks/useProgramming";
import {
  EstadoProgramacion,
  ProgramacionFilters,
  Programacion,
} from "../types/programming";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ProgramacionListProps {
  onCreateNew?: () => void;
  onEdit?: (programacion: Programacion) => void;
  onView?: (programacion: Programacion) => void;
}

export default function ProgramacionList({
  onCreateNew,
  onEdit,
  onView,
}: ProgramacionListProps) {
  const [filtros, setFiltros] = useState<ProgramacionFilters>({});
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [programacionSeleccionada, setProgramacionSeleccionada] =
    useState<Programacion | null>(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [muestrasCompletadas, setMuestrasCompletadas] = useState(0);
  const [observacionesCompletar, setObservacionesCompletar] = useState("");
  const [dialogoAbierto, setDialogoAbierto] = useState<
    "cancelar" | "completar" | null
  >(null);

  // Queries
  const { data: programaciones, isLoading } = useProgramaciones(filtros);
  const { data: brigadistas } = useBrigadistas();

  // Mutations
  const iniciarMutation = useIniciarActividad();
  const completarMutation = useCompletarActividad();
  const cancelarMutation = useCancelarActividad();
  const reprogramarMutation = useReprogramarActividad();
  const eliminarMutation = useDeleteProgramacion();

  // Filtrar programaciones por búsqueda
  const programacionesFiltradas =
    programaciones?.filter((programacion) => {
      if (!busqueda) return true;

      const termino = busqueda.toLowerCase();
      return (
        programacion.claveObra.toLowerCase().includes(termino) ||
        programacion.obra?.area.nombre.toLowerCase().includes(termino) ||
        programacion.brigadista?.nombre.toLowerCase().includes(termino) ||
        programacion.concepto?.descripcion.toLowerCase().includes(termino)
      );
    }) || [];

  const getEstadoBadge = (estado: EstadoProgramacion) => {
    const config = {
      [EstadoProgramacion.PROGRAMADA]: {
        variant: "secondary" as const,
        color: "bg-blue-100 text-blue-800",
        label: "Programada",
      },
      [EstadoProgramacion.EN_PROCESO]: {
        variant: "default" as const,
        color: "bg-yellow-100 text-yellow-800",
        label: "En Proceso",
      },
      [EstadoProgramacion.COMPLETADA]: {
        variant: "default" as const,
        color: "bg-green-100 text-green-800",
        label: "Completada",
      },
      [EstadoProgramacion.CANCELADA]: {
        variant: "destructive" as const,
        color: "bg-red-100 text-red-800",
        label: "Cancelada",
      },
      [EstadoProgramacion.REPROGRAMADA]: {
        variant: "outline" as const,
        color: "bg-purple-100 text-purple-800",
        label: "Reprogramada",
      },
    };

    const { color, label } = config[estado];
    return <Badge className={color}>{label}</Badge>;
  };

  const handleIniciarActividad = (programacion: Programacion) => {
    iniciarMutation.mutate(programacion.id);
  };

  const handleCompletarActividad = () => {
    if (!programacionSeleccionada) return;

    completarMutation.mutate({
      id: programacionSeleccionada.id,
      muestrasObtenidas: muestrasCompletadas,
      observaciones: observacionesCompletar,
    });

    setDialogoAbierto(null);
    setProgramacionSeleccionada(null);
    setMuestrasCompletadas(0);
    setObservacionesCompletar("");
  };

  const handleCancelarActividad = () => {
    if (!programacionSeleccionada) return;

    cancelarMutation.mutate({
      id: programacionSeleccionada.id,
      motivo: motivoCancelacion,
    });

    setDialogoAbierto(null);
    setProgramacionSeleccionada(null);
    setMotivoCancelacion("");
  };

  const handleEliminar = (programacion: Programacion) => {
    if (
      confirm(
        `¿Está seguro de eliminar la programación ${programacion.claveObra}?`
      )
    ) {
      eliminarMutation.mutate(programacion.id);
    }
  };

  const abrirDialogoCompletar = (programacion: Programacion) => {
    setProgramacionSeleccionada(programacion);
    setMuestrasCompletadas(programacion.cantidadMuestras);
    setDialogoAbierto("completar");
  };

  const abrirDialogoCancelar = (programacion: Programacion) => {
    setProgramacionSeleccionada(programacion);
    setDialogoAbierto("cancelar");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando programaciones...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-16 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de crear nueva programación */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Listado de Programaciones</h2>
          <p className="text-gray-600">
            Gestión y seguimiento de actividades de campo
          </p>
        </div>
        {onCreateNew && (
          <Button onClick={onCreateNew} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nueva Programación</span>
          </Button>
        )}
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros y Búsqueda</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="busqueda">Búsqueda General</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="busqueda"
                  placeholder="Buscar por obra, brigadista..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fecha Desde</Label>
              <Input
                type="date"
                value={filtros.fechaDesde || ""}
                onChange={(e) =>
                  setFiltros({ ...filtros, fechaDesde: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha Hasta</Label>
              <Input
                type="date"
                value={filtros.fechaHasta || ""}
                onChange={(e) =>
                  setFiltros({ ...filtros, fechaHasta: e.target.value })
                }
              />
            </div>{" "}
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={filtros.estado}
                onValueChange={(value) =>
                  setFiltros({
                    ...filtros,
                    estado:
                      value === "TODOS"
                        ? undefined
                        : (value as EstadoProgramacion),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos los estados</SelectItem>
                  <SelectItem value={EstadoProgramacion.PROGRAMADA}>
                    Programada
                  </SelectItem>
                  <SelectItem value={EstadoProgramacion.EN_PROCESO}>
                    En Proceso
                  </SelectItem>
                  <SelectItem value={EstadoProgramacion.COMPLETADA}>
                    Completada
                  </SelectItem>
                  <SelectItem value={EstadoProgramacion.CANCELADA}>
                    Cancelada
                  </SelectItem>
                  <SelectItem value={EstadoProgramacion.REPROGRAMADA}>
                    Reprogramada
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>{" "}
            <div className="space-y-2">
              <Label>Brigadista</Label>
              <Select
                value={filtros.brigadistaId?.toString()}
                onValueChange={(value) =>
                  setFiltros({
                    ...filtros,
                    brigadistaId:
                      value === "TODOS" ? undefined : parseInt(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los brigadistas" />
                </SelectTrigger>{" "}
                <SelectContent>
                  <SelectItem value="TODOS">Todos los brigadistas</SelectItem>
                  {brigadistas?.map((brigadista) => (
                    <SelectItem
                      key={brigadista.id}
                      value={brigadista.id.toString()}
                    >
                      {brigadista.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFiltros({});
                  setBusqueda("");
                }}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de programaciones */}
      <Card>
        <CardHeader>
          <CardTitle>
            Programaciones ({programacionesFiltradas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clave de Obra</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Actividad</TableHead>
                  <TableHead>Brigadista</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Muestras</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programacionesFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-8 text-gray-500"
                    >
                      No se encontraron programaciones
                    </TableCell>
                  </TableRow>
                ) : (
                  programacionesFiltradas.map((programacion) => (
                    <TableRow key={programacion.id}>
                      <TableCell className="font-medium">
                        {programacion.claveObra}
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(programacion.fechaProgramada),
                          "dd/MM/yyyy",
                          { locale: es }
                        )}
                      </TableCell>
                      <TableCell>{programacion.horaProgramada}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {programacion.concepto?.descripcion}
                      </TableCell>
                      <TableCell>{programacion.brigadista?.nombre}</TableCell>
                      <TableCell>
                        {getEstadoBadge(programacion.estado)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {programacion.muestrasObtenidas || 0} /{" "}
                          {programacion.cantidadMuestras}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {programacion.obra?.area.nombre}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menú</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            {onView && (
                              <DropdownMenuItem
                                onClick={() => onView(programacion)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Detalles
                              </DropdownMenuItem>
                            )}

                            {programacion.estado ===
                              EstadoProgramacion.PROGRAMADA && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleIniciarActividad(programacion)
                                  }
                                >
                                  <Play className="mr-2 h-4 w-4" />
                                  Iniciar Actividad
                                </DropdownMenuItem>
                                {onEdit && (
                                  <DropdownMenuItem
                                    onClick={() => onEdit(programacion)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}

                            {programacion.estado ===
                              EstadoProgramacion.EN_PROCESO && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    abrirDialogoCompletar(programacion)
                                  }
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Completar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    abrirDialogoCancelar(programacion)
                                  }
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancelar
                                </DropdownMenuItem>
                              </>
                            )}

                            {(programacion.estado ===
                              EstadoProgramacion.PROGRAMADA ||
                              programacion.estado ===
                                EstadoProgramacion.CANCELADA) && (
                              <DropdownMenuItem
                                onClick={() => handleEliminar(programacion)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para completar actividad */}
      <Dialog
        open={dialogoAbierto === "completar"}
        onOpenChange={() => setDialogoAbierto(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Completar Actividad</DialogTitle>
            <DialogDescription>
              Registre los datos de finalización de la actividad.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="muestrasCompletadas">Muestras Obtenidas</Label>
              <Input
                id="muestrasCompletadas"
                type="number"
                min="0"
                max={programacionSeleccionada?.cantidadMuestras}
                value={muestrasCompletadas}
                onChange={(e) =>
                  setMuestrasCompletadas(parseInt(e.target.value) || 0)
                }
              />
              <p className="text-sm text-gray-500">
                Máximo: {programacionSeleccionada?.cantidadMuestras} muestras
                programadas
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacionesCompletar">Observaciones</Label>
              <textarea
                id="observacionesCompletar"
                className="w-full p-2 border border-gray-300 rounded"
                rows={3}
                value={observacionesCompletar}
                onChange={(e) => setObservacionesCompletar(e.target.value)}
                placeholder="Observaciones sobre la ejecución..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoAbierto(null)}>
              Cancelar
            </Button>
            <Button onClick={handleCompletarActividad}>
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
              Indique el motivo de la cancelación de esta actividad.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="motivoCancelacion">Motivo de Cancelación *</Label>
              <textarea
                id="motivoCancelacion"
                className="w-full p-2 border border-gray-300 rounded"
                rows={4}
                value={motivoCancelacion}
                onChange={(e) => setMotivoCancelacion(e.target.value)}
                placeholder="Describa el motivo de la cancelación..."
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoAbierto(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCancelarActividad}
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
