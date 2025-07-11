import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Textarea } from "../../../shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shared/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import {
  Building2,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  FileText,
  Users,
  Truck,
  Wrench,
  AlertCircle,
} from "lucide-react";
import {
  useObrasAprobadas,
  useBrigadistas,
  useVehiculos,
  useBrigadistasDisponibles,
  useVehiculosDisponibles,
  useCreateProgramacion,
  useProgramaciones,
} from "../hooks/useProgramming";
import {
  TipoProgramacion,
  TipoRecoleccion,
  CreateProgramacionData,
} from "../types/programming";

// Mapeo de unidades de concepto a TipoRecoleccion
const mapUnidadToTipoRecoleccion = (
  unidad: string
): TipoRecoleccion | undefined => {
  const lowerUnidad = unidad.toLowerCase().trim();
  switch (lowerUnidad) {
    case "m2":
    case "m²":
      return TipoRecoleccion.METROS_CUADRADOS;
    case "m3":
    case "m³":
      return TipoRecoleccion.METROS_CUBICOS;
    case "ml":
    case "m lineal":
      return TipoRecoleccion.METROS_LINEALES;
    case "sondeo":
      return TipoRecoleccion.SONDEO;
    case "pza":
    case "piezas":
      return TipoRecoleccion.PIEZAS;
    case "condensacion":
      return TipoRecoleccion.CONDENSACION;
    default:
      return undefined;
  }
};

// Schema de validación
const programacionSchema = z.object({
  claveObra: z.string().min(1, "Debe seleccionar una obra"),
  fechaProgramada: z.string().min(1, "La fecha es requerida"),
  horaProgramada: z.string().min(1, "La hora es requerida"),
  tipoProgramacion: z.nativeEnum(TipoProgramacion, {
    errorMap: () => ({ message: "Debe seleccionar un tipo de programación" }),
  }),
  nombreResidente: z.string().optional(),
  telefonoResidente: z
    .string()
    .regex(
      /^\d{10,15}$/,
      "Debe ser un teléfono válido (solo números, 10-15 dígitos)"
    )
    .optional(),
  conceptoCodigo: z.string().min(1, "Debe seleccionar una actividad"),
  cantidadMuestras: z.number().min(1, "La cantidad debe ser mayor a 0"),
  tipoRecoleccion: z.nativeEnum(TipoRecoleccion, {
    errorMap: () => ({ message: "Debe seleccionar un tipo de recolección" }),
  }),
  brigadistaId: z.number().min(1, "Debe seleccionar un brigadista"),
  brigadistaApoyoId: z.number().optional(),
  vehiculoId: z.number().min(1, "Debe seleccionar un vehículo"),
  claveEquipo: z.string().optional(),
  observaciones: z.string().optional(),
  instrucciones: z.string().optional(),
  condicionesEspeciales: z.string().optional(),
  herramientasEspeciales: z.array(z.string()).optional(),
});

type ProgramacionFormData = z.infer<typeof programacionSchema>;

interface ProgramacionFormProps {
  onSubmit?: (data: CreateProgramacionData) => void;
  onCancel?: () => void;
  onSuccess?: () => void;
  isLoading?: boolean;
}

export default function ProgramacionForm({
  onSubmit,
  onCancel,
  onSuccess,
  isLoading: externalLoading,
}: ProgramacionFormProps) {
  const [obraSeleccionada, setObraSeleccionada] = useState<string>("");
  const [obraSearch, setObraSearch] = useState<string>("");
  const [conceptoSeleccionado, setConceptoSeleccionado] = useState<any>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>("");
  const [horaSeleccionada, setHoraSeleccionada] = useState<string>("");

  const form = useForm<ProgramacionFormData>({
    resolver: zodResolver(programacionSchema),
    defaultValues: {
      fechaProgramada: new Date().toISOString().split("T")[0],
      horaProgramada: "08:00",
      tipoProgramacion: TipoProgramacion.OBRA_POR_VISITA,
      cantidadMuestras: 1,
      tipoRecoleccion: TipoRecoleccion.METROS_CUADRADOS,
      herramientasEspeciales: [],
    },
  });

  const createMutation = useCreateProgramacion();

  // Obtener programaciones existentes de la obra seleccionada
  const { data: programacionesObra = [] } = useProgramaciones(
    obraSeleccionada ? { claveObra: obraSeleccionada } : undefined
  );

  // Calcular muestras ya asignadas por concepto
  const muestrasAsignadasPorConcepto = useMemo(() => {
    const map: Record<string, number> = {};
    programacionesObra.forEach((prog) => {
      // Solo contar programaciones no canceladas
      if (prog.estado !== "cancelada") {
        map[prog.conceptoCodigo] =
          (map[prog.conceptoCodigo] || 0) + (prog.cantidadMuestras || 0);
      }
    });
    return map;
  }, [programacionesObra]);

  // Queries
  const { data: obrasAprobadas, isLoading: loadingObras } = useObrasAprobadas();
  const { data: brigadistas, isLoading: loadingBrigadistas } = useBrigadistas();
  const { data: vehiculos, isLoading: loadingVehiculos } = useVehiculos();

  // Queries condicionales para disponibilidad
  const { data: brigadistasDisponibles } = useBrigadistasDisponibles(
    fechaSeleccionada,
    horaSeleccionada
  );
  const { data: vehiculosDisponibles } = useVehiculosDisponibles(
    fechaSeleccionada,
    horaSeleccionada
  );

  // Encontrar la obra seleccionada para mostrar detalles
  const obraDetalles = obrasAprobadas?.find(
    (obra) => obra.clave === obraSeleccionada
  );

  // Watch para fecha y hora para actualizar disponibilidad
  const watchedFecha = form.watch("fechaProgramada");
  const watchedHora = form.watch("horaProgramada");

  useEffect(() => {
    setFechaSeleccionada(watchedFecha);
    setHoraSeleccionada(watchedHora);
  }, [watchedFecha, watchedHora]);

  const handleSubmit = (data: ProgramacionFormData) => {
    // Validar que no se asignen más muestras de las permitidas
    const concepto = obraDetalles?.conceptos.find(
      (c) => c.codigo === data.conceptoCodigo
    );
    if (concepto) {
      const total = concepto.cantidad || 0;
      const asignadas = muestrasAsignadasPorConcepto[data.conceptoCodigo] || 0;
      const disponibles = total - asignadas;
      if (data.cantidadMuestras > disponibles) {
        form.setError("cantidadMuestras", {
          type: "manual",
          message: `Solo puedes asignar hasta ${disponibles} muestra(s) para este concepto.`,
        });
        return;
      }
    }
    // Eliminar herramientasEspeciales antes de enviar al backend
    const { herramientasEspeciales, ...rest } = data;
    const submitData: CreateProgramacionData & { estado?: string } = {
      ...rest,
      brigadistaApoyoId: data.brigadistaApoyoId || undefined,
      estado: "en_proceso",
    };
    if (onSubmit) {
      onSubmit(submitData);
    } else {
      createMutation.mutate(submitData, {
        onSuccess: () => {
          form.reset();
          onSuccess?.();
        },
      });
    }
  };
  const handleConceptoChange = (codigoConcepto: string) => {
    form.setValue("conceptoCodigo", codigoConcepto);
    const concepto = obraDetalles?.conceptos.find(
      (c) => c.codigo === codigoConcepto
    );
    setConceptoSeleccionado(concepto || null);
    if (concepto) {
      form.setValue("cantidadMuestras", concepto.cantidad);
      const tipoRecoleccion = mapUnidadToTipoRecoleccion(concepto.unidad);
      if (tipoRecoleccion) {
        form.setValue("tipoRecoleccion", tipoRecoleccion);
      }
    }
  };
  const isLoading = externalLoading || createMutation.isPending;

  // Generar opciones de hora (cada 30 minutos)
  const horasDisponibles = Array.from({ length: 20 }, (_, i) => {
    const hora = Math.floor(i / 2) + 6; // Empezar a las 6:00
    const minutos = (i % 2) * 30;
    return `${hora.toString().padStart(2, "0")}:${minutos
      .toString()
      .padStart(2, "0")}`;
  });

  // Filtrado inteligente de obras
  const obrasFiltradas = useMemo(() => {
    if (!obraSearch) return obrasAprobadas;
    const search = obraSearch.toLowerCase();
    return obrasAprobadas?.filter(
      (obra) =>
        obra.clave.toLowerCase().includes(search) ||
        obra.clienteNombre.toLowerCase().includes(search)
    );
  }, [obraSearch, obrasAprobadas]);

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* SECCIÓN 1: SELECCIÓN DE OBRA BASE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Selección de Obra Base</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="claveObra">Obra Aprobada *</Label>
            {/* Búsqueda inteligente de obras */}
            <Input
              placeholder="Buscar por clave o cliente..."
              value={obraSearch}
              onChange={(e) => setObraSearch(e.target.value)}
              className="mb-2"
            />
            <Select
              value={form.watch("claveObra")}
              onValueChange={(value) => {
                form.setValue("claveObra", value);
                setObraSeleccionada(value);
                // Limpiar concepto cuando cambia la obra
                form.setValue("conceptoCodigo", "");
                setConceptoSeleccionado(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una obra aprobada" />
              </SelectTrigger>
              <SelectContent>
                {loadingObras ? (
                  <SelectItem value="loading" disabled>
                    Cargando obras...
                  </SelectItem>
                ) : (
                  obrasFiltradas?.map((obra) => (
                    <SelectItem key={obra.clave} value={obra.clave}>
                      {obra.clave} - {obra.clienteNombre}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {form.formState.errors.claveObra && (
              <p className="text-sm text-red-600">
                {form.formState.errors.claveObra.message}
              </p>
            )}
          </div>

          {obraDetalles && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Cliente:</span>{" "}
                  {obraDetalles.clienteNombre}
                </div>
                <div>
                  <span className="font-medium">Contratista:</span>{" "}
                  {obraDetalles.contratista}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Descripción:</span>{" "}
                  {obraDetalles.descripcionObra}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Ubicación:</span>{" "}
                  {obraDetalles.ubicacion}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECCIÓN 2: DATOS DE PROGRAMACIÓN */}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Datos de Programación</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaProgramada">Fecha de Programación *</Label>
              <Input
                type="date"
                {...form.register("fechaProgramada")}
                min={new Date().toISOString().split("T")[0]}
              />
              {form.formState.errors.fechaProgramada && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.fechaProgramada.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="horaProgramada">
                Hora Programada aproximada *
              </Label>
              <Select
                value={form.watch("horaProgramada")}
                onValueChange={(value) =>
                  form.setValue("horaProgramada", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una hora" />
                </SelectTrigger>
                <SelectContent>
                  {horasDisponibles.map((hora) => (
                    <SelectItem key={hora} value={hora}>
                      {hora}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.horaProgramada && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.horaProgramada.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipoProgramacion">Tipo de Programación *</Label>
            <Select
              value={form.watch("tipoProgramacion")}
              onValueChange={(value) =>
                form.setValue("tipoProgramacion", value as TipoProgramacion)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TipoProgramacion.OBRA_POR_VISITA}>
                  Obra por Visita - Contratación específica por actividad
                </SelectItem>
                <SelectItem value={TipoProgramacion.OBRA_POR_ESTANCIA}>
                  Obra por Estancia - Contratación continua
                  (semanal/mensual/anual)
                </SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.tipoProgramacion && (
              <p className="text-sm text-red-600">
                {form.formState.errors.tipoProgramacion.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombreResidente">Nombre del Residente</Label>
              <Input
                {...form.register("nombreResidente")}
                placeholder="Persona encargada de la obra"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefonoResidente">Teléfono del Residente</Label>
              <Input
                {...form.register("telefonoResidente")}
                placeholder="Teléfono de contacto directo"
                type="tel"
                pattern="[0-9]{10,15}"
                inputMode="numeric"
              />
              {form.formState.errors.telefonoResidente && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.telefonoResidente.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECCIÓN 3: DEFINICIÓN DE ACTIVIDADES */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Definición de Actividades</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="conceptoCodigo">Actividad a Realizar *</Label>
            <Select
              value={form.watch("conceptoCodigo")}
              onValueChange={handleConceptoChange}
              disabled={!obraDetalles}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una actividad" />
              </SelectTrigger>
              <SelectContent>
                {obraDetalles?.conceptos.map((concepto) => {
                  const total = concepto.cantidad || 0;
                  const asignadas =
                    muestrasAsignadasPorConcepto[concepto.codigo] || 0;
                  const disponibles = total - asignadas;
                  let label = `${concepto.codigo} - ${concepto.descripcion}`;
                  let disabled = false;
                  let extra = "";
                  if (disponibles <= 0) {
                    disabled = true;
                    extra = " (Completado)";
                  } else if (disponibles < total) {
                    extra = ` (Faltan ${disponibles})`;
                  }
                  return (
                    <SelectItem
                      key={concepto.codigo}
                      value={concepto.codigo}
                      disabled={disabled}
                    >
                      {label}
                      <span
                        style={{
                          color: disabled ? "#888" : "#2d7d46",
                          marginLeft: 4,
                          fontSize: 12,
                        }}
                      >
                        {extra}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {form.formState.errors.conceptoCodigo && (
              <p className="text-sm text-red-600">
                {form.formState.errors.conceptoCodigo.message}
              </p>
            )}
            {/* Vista previa de la actividad seleccionada */}
            {conceptoSeleccionado && (
              <div className="p-2 bg-gray-50 rounded text-sm mt-2">
                <div>
                  <span className="font-medium">Descripción:</span>{" "}
                  {conceptoSeleccionado.descripcion}
                </div>
                <div>
                  <span className="font-medium">Unidad:</span>{" "}
                  {conceptoSeleccionado.unidad}
                </div>
                <div>
                  <span className="font-medium">Cantidad:</span>{" "}
                  {conceptoSeleccionado.cantidad}
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cantidadMuestras">Cantidad de Muestras *</Label>
              <Input
                type="number"
                min="1"
                {...form.register("cantidadMuestras", { valueAsNumber: true })}
              />
              {form.formState.errors.cantidadMuestras && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.cantidadMuestras.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipoRecoleccion">Tipo de Recolección *</Label>
              <Select
                value={form.watch("tipoRecoleccion")}
                onValueChange={(value) =>
                  form.setValue("tipoRecoleccion", value as TipoRecoleccion)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TipoRecoleccion.METROS_CUADRADOS}>
                    m² (metros cuadrados)
                  </SelectItem>
                  <SelectItem value={TipoRecoleccion.METROS_CUBICOS}>
                    m³ (metros cúbicos)
                  </SelectItem>
                  <SelectItem value={TipoRecoleccion.METROS_LINEALES}>
                    m lineal (metros lineales)
                  </SelectItem>
                  <SelectItem value={TipoRecoleccion.SONDEO}>Sondeo</SelectItem>
                  <SelectItem value={TipoRecoleccion.PIEZAS}>
                    Pza (piezas)
                  </SelectItem>
                  <SelectItem value={TipoRecoleccion.CONDENSACION}>
                    Condensación
                  </SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.tipoRecoleccion && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.tipoRecoleccion.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="distribucionMuestras">
                Distribución de muestras
              </Label>
              <Select
                value={form.watch("distribucionMuestras" as any) || "unica"}
                onValueChange={(value) =>
                  form.setValue(
                    "distribucionMuestras" as any,
                    value as "unica" | "multiple"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione distribución" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unica">Única toma</SelectItem>
                  <SelectItem value="multiple">
                    Múltiples proyecciones
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECCIÓN 4: ASIGNACIÓN DE RECURSOS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Asignación de Recursos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brigadistaId">Brigadista Principal *</Label>
              <Select
                value={form.watch("brigadistaId")?.toString()}
                onValueChange={(value) =>
                  form.setValue("brigadistaId", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un brigadista" />
                </SelectTrigger>
                <SelectContent>
                  {loadingBrigadistas ? (
                    <SelectItem value="loading" disabled>
                      Cargando brigadistas...
                    </SelectItem>
                  ) : (
                    brigadistas?.map((brigadista) => {
                      const disponible = brigadistasDisponibles?.find(
                        (b) => b.id === brigadista.id
                      );
                      return (
                        <SelectItem
                          key={brigadista.id}
                          value={brigadista.id.toString()}
                          disabled={!disponible}
                        >
                          {brigadista.nombre} {!disponible && "(No disponible)"}
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.brigadistaId && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.brigadistaId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brigadistaApoyoId">
                Brigadista de Apoyo (Opcional)
              </Label>
              <Select
                value={form.watch("brigadistaApoyoId")?.toString() || "none"}
                onValueChange={(value) =>
                  form.setValue(
                    "brigadistaApoyoId",
                    value === "none" ? undefined : parseInt(value)
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un brigadista de apoyo" />
                </SelectTrigger>{" "}
                <SelectContent>
                  <SelectItem value="none">Sin brigadista de apoyo</SelectItem>
                  {brigadistas
                    ?.filter((b) => b.id !== form.watch("brigadistaId"))
                    .map((brigadista) => {
                      const disponible = brigadistasDisponibles?.find(
                        (b) => b.id === brigadista.id
                      );
                      return (
                        <SelectItem
                          key={brigadista.id}
                          value={brigadista.id.toString()}
                          disabled={!disponible}
                        >
                          {brigadista.nombre} {!disponible && "(No disponible)"}
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehiculoId">Vehículo Asignado *</Label>
              <Select
                value={form.watch("vehiculoId")?.toString()}
                onValueChange={(value) =>
                  form.setValue("vehiculoId", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un vehículo" />
                </SelectTrigger>
                <SelectContent>
                  {loadingVehiculos ? (
                    <SelectItem value="loading" disabled>
                      Cargando vehículos...
                    </SelectItem>
                  ) : (
                    vehiculos?.map((vehiculo) => {
                      const disponible = vehiculosDisponibles?.find(
                        (v) => v.id === vehiculo.id
                      );
                      return (
                        <SelectItem
                          key={vehiculo.id}
                          value={vehiculo.id.toString()}
                          disabled={!disponible}
                        >
                          {vehiculo.clave} - {vehiculo.descripcion}{" "}
                          {!disponible && "(No disponible)"}
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.vehiculoId && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.vehiculoId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="claveEquipo">Clave del Equipo (Opcional)</Label>
              <Input
                {...form.register("claveEquipo")}
                placeholder="Identificador único del equipo de trabajo"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECCIÓN 5: OBSERVACIONES Y NOTAS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>Observaciones y Notas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones de Programación</Label>
            <Textarea
              {...form.register("observaciones")}
              placeholder="Notas especiales sobre la programación..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instrucciones">
              Instrucciones para el Brigadista
            </Label>
            <Textarea
              {...form.register("instrucciones")}
              placeholder="Información específica sobre la actividad..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="condicionesEspeciales">
              Condiciones Especiales
            </Label>
            <Textarea
              {...form.register("condicionesEspeciales")}
              placeholder="Requisitos particulares del cliente o la obra..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creando..." : "Crear Programación"}
        </Button>
      </div>
    </form>
  );
}
