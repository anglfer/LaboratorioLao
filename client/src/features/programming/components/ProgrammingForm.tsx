import React, { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
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
import { Textarea } from "../../../shared/components/ui/textarea";
import { Checkbox } from "../../../shared/components/ui/checkbox";
import { Badge } from "../../../shared/components/ui/badge";
import {
  Plus,
  Minus,
  Search,
  Clock,
  User,
  Truck,
  FileText,
  MapPin,
  Phone,
} from "lucide-react";

import { usePresupuestosAprobados } from "../hooks/useProgramming";
import { useBrigadistaOptions } from "../hooks/useBrigadistas";
import { useVehiculoOptions } from "../hooks/useVehiculos";
import ConceptoSelector from "./ConceptoSelector";
import {
  TIPOS_RECOLECCION,
  TIPOS_PROGRAMACION,
  type ProgramacionFormData,
  type TipoRecoleccion,
  type TipoProgramacion,
} from "../types/programming";

// Schema de validación
const programacionSchema = z.object({
  presupuestoId: z.number().min(1, "Debe seleccionar un presupuesto"),
  claveObra: z.string().min(1, "La clave de obra es requerida"),
  fechaProgramada: z.string().min(1, "La fecha es requerida"),
  horaProgramada: z.string().min(1, "La hora es requerida"),
  tipoProgramacion: z.enum(["obra_por_visita", "obra_por_estancia"]),
  nombreResidente: z.string().optional(),
  telefonoResidente: z.string().optional(),
  observacionesIniciales: z.string().optional(),
  brigadistaPrincipalId: z
    .number()
    .min(1, "Debe seleccionar un brigadista principal"),
  brigadistaApoyoId: z.number().optional(),
  vehiculoId: z.number().min(1, "Debe seleccionar un vehículo"),
  claveEquipo: z.string().optional(),
  herramientasEspeciales: z.string().optional(),
  observacionesProgramacion: z.string().optional(),
  instruccionesBrigadista: z.string().optional(),
  condicionesEspeciales: z.string().optional(),
  detalles: z
    .array(
      z.object({
        conceptoCodigo: z.string().min(1, "Debe seleccionar un concepto"),
        cantidadMuestras: z.number().min(1, "La cantidad debe ser mayor a 0"),
        tipoRecoleccion: z.enum([
          "metros_cuadrados",
          "metros_cubicos",
          "metros_lineales",
          "sondeo",
          "piezas",
          "condensacion",
        ]),
        distribucionMuestras: z.string().optional(),
        esNoPresupuestado: z.boolean().optional(),
        descripcionConcepto: z.string().optional(),
        unidadMedida: z.string().optional(),
      })
    )
    .min(1, "Debe agregar al menos una actividad"),
});

interface ProgrammingFormProps {
  onSubmit: (data: ProgramacionFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<ProgramacionFormData>;
}

export default function ProgrammingForm({
  onSubmit,
  isLoading,
  initialData,
}: ProgrammingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPresupuesto, setSelectedPresupuesto] = useState<any>(null);
  const [showConceptosNoPresupuestados, setShowConceptosNoPresupuestados] =
    useState(false);

  // Queries
  const { data: presupuestosAprobados } = usePresupuestosAprobados();
  const brigadistaOptions = useBrigadistaOptions();
  const vehiculoOptions = useVehiculoOptions();

  // Debug logging
  console.log("Presupuestos aprobados:", presupuestosAprobados);

  // Form setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ProgramacionFormData>({
    resolver: zodResolver(programacionSchema),
    defaultValues: {
      tipoProgramacion: "obra_por_visita",
      detalles: [],
      ...initialData,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "detalles",
  });

  const presupuestoId = watch("presupuestoId");

  // Effect para cargar datos del presupuesto seleccionado
  useEffect(() => {
    if (presupuestoId && presupuestosAprobados) {
      const presupuesto = presupuestosAprobados.find(
        (p) => p.id === presupuestoId
      );
      if (presupuesto) {
        console.log("Presupuesto seleccionado:", presupuesto);
        console.log("Conceptos disponibles:", presupuesto.conceptos);
        setSelectedPresupuesto(presupuesto);
        setValue(
          "claveObra",
          presupuesto.claveObra || presupuesto.obra?.clave || ""
        );

        // Auto-llenar información de contacto si existe
        if (presupuesto.obra?.contratista) {
          setValue("nombreResidente", presupuesto.obra.contratista);
        }
      }
    }
  }, [presupuestoId, presupuestosAprobados, setValue]);

  const handleFormSubmit = (data: ProgramacionFormData) => {
    onSubmit(data);
  };

  const addConcepto = (esNoPresupuestado = false) => {
    append({
      conceptoCodigo: "",
      cantidadMuestras: 1,
      tipoRecoleccion: "metros_cuadrados",
      distribucionMuestras: "",
      esNoPresupuestado,
      descripcionConcepto: esNoPresupuestado ? "" : undefined,
      unidadMedida: esNoPresupuestado ? "" : undefined,
    });
  };

  const steps = [
    { number: 1, title: "Selección de Obra", icon: Search },
    { number: 2, title: "Programación", icon: Clock },
    { number: 3, title: "Recursos", icon: User },
    { number: 4, title: "Actividades", icon: FileText },
    { number: 5, title: "Observaciones", icon: MapPin },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div
              className={`flex items-center space-x-2 cursor-pointer ${
                currentStep === step.number
                  ? "text-blue-600"
                  : currentStep > step.number
                  ? "text-green-600"
                  : "text-gray-400"
              }`}
              onClick={() => setCurrentStep(step.number)}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step.number
                    ? "bg-blue-600 text-white"
                    : currentStep > step.number
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {currentStep > step.number ? "✓" : step.number}
              </div>
              <span className="text-sm font-medium hidden sm:block">
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 ${
                  currentStep > step.number ? "bg-green-600" : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Paso 1: Selección de Obra */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Selección de Obra Base
              </CardTitle>
              <CardDescription>
                Seleccione el presupuesto aprobado para crear la programación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="presupuestoId">Presupuesto Aprobado</Label>
                <Controller
                  name="presupuestoId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString() || ""}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Seleccionar presupuesto..." />
                      </SelectTrigger>
                      <SelectContent>
                        {presupuestosAprobados?.map((presupuesto) => (
                          <SelectItem
                            key={presupuesto.id}
                            value={presupuesto.id.toString()}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {presupuesto.claveObra ||
                                  presupuesto.obra?.clave}{" "}
                                - {presupuesto.cliente.nombre}
                              </span>
                              <span className="text-sm text-gray-500">
                                {presupuesto.obra?.descripcion}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.presupuestoId && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.presupuestoId.message}
                  </p>
                )}
              </div>

              {selectedPresupuesto && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Información de la Obra</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Cliente:</strong>{" "}
                      {selectedPresupuesto.cliente.nombre}
                    </div>
                    <div>
                      <strong>Clave:</strong>{" "}
                      {selectedPresupuesto.claveObra ||
                        selectedPresupuesto.obra?.clave}
                    </div>
                    <div>
                      <strong>Descripción:</strong>{" "}
                      {selectedPresupuesto.obra?.descripcion}
                    </div>
                    <div>
                      <strong>Contratista:</strong>{" "}
                      {selectedPresupuesto.obra?.contratista}
                    </div>
                    {selectedPresupuesto.obra?.direccion && (
                      <div className="md:col-span-2">
                        <strong>Dirección:</strong>{" "}
                        {selectedPresupuesto.obra.direccion}
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <strong>Conceptos disponibles:</strong>{" "}
                      {selectedPresupuesto.conceptos?.length || 0}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Paso 2: Información de Programación */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Datos de Programación
              </CardTitle>
              <CardDescription>
                Configure la fecha, hora y tipo de programación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fechaProgramada">Fecha de Programación</Label>
                  <Controller
                    name="fechaProgramada"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="date"
                        {...field}
                        className="mt-1"
                        min={new Date().toISOString().split("T")[0]}
                      />
                    )}
                  />
                  {errors.fechaProgramada && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.fechaProgramada.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="horaProgramada">Hora Programada</Label>
                  <Controller
                    name="horaProgramada"
                    control={control}
                    render={({ field }) => (
                      <Input type="time" {...field} className="mt-1" />
                    )}
                  />
                  {errors.horaProgramada && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.horaProgramada.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="tipoProgramacion">Tipo de Programación</Label>
                <Controller
                  name="tipoProgramacion"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TIPOS_PROGRAMACION).map(
                          ([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombreResidente">Nombre del Residente</Label>
                  <Controller
                    name="nombreResidente"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        className="mt-1"
                        placeholder="Nombre del responsable en obra"
                      />
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="telefonoResidente">
                    Teléfono del Residente
                  </Label>
                  <Controller
                    name="telefonoResidente"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        className="mt-1"
                        placeholder="Teléfono de contacto"
                      />
                    )}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="observacionesIniciales">
                  Observaciones Iniciales
                </Label>
                <Controller
                  name="observacionesIniciales"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      className="mt-1"
                      rows={3}
                      placeholder="Notas especiales sobre la programación"
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Paso 3: Asignación de Recursos */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Asignación de Recursos
              </CardTitle>
              <CardDescription>
                Asigne personal y equipos para la actividad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brigadistaPrincipalId">
                    Brigadista Principal *
                  </Label>
                  <Controller
                    name="brigadistaPrincipalId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value?.toString() || ""}
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Seleccionar brigadista principal..." />
                        </SelectTrigger>
                        <SelectContent>
                          {brigadistaOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.brigadistaPrincipalId && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.brigadistaPrincipalId.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="brigadistaApoyoId">Brigadista de Apoyo</Label>
                  <Controller
                    name="brigadistaApoyoId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value?.toString() || "0"}
                        onValueChange={(value) =>
                          field.onChange(
                            value === "0" ? undefined : parseInt(value)
                          )
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Seleccionar brigadista de apoyo..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">
                            Sin brigadista de apoyo
                          </SelectItem>
                          {brigadistaOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="vehiculoId">Vehículo Asignado *</Label>
                <Controller
                  name="vehiculoId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString() || ""}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Seleccionar vehículo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {vehiculoOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.vehiculoId && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.vehiculoId.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="claveEquipo">Clave del Equipo</Label>
                  <Controller
                    name="claveEquipo"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        className="mt-1"
                        placeholder="Identificador del equipo de trabajo"
                      />
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="herramientasEspeciales">
                    Herramientas Especiales
                  </Label>
                  <Controller
                    name="herramientasEspeciales"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        className="mt-1"
                        placeholder="Equipos adicionales requeridos"
                      />
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Paso 4: Definición de Actividades */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Definición de Actividades y Conceptos
              </CardTitle>
              <CardDescription>
                Configure las actividades a realizar y muestras a recolectar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Conceptos y Actividades</h4>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addConcepto(false)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Concepto Presupuestado
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addConcepto(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Concepto No Presupuestado
                  </Button>
                </div>
              </div>

              {fields.map((field, index) => (
                <ConceptoFormField
                  key={field.id}
                  control={control}
                  watch={watch}
                  setValue={setValue}
                  index={index}
                  onRemove={() => remove(index)}
                  conceptosPresupuestados={selectedPresupuesto?.conceptos || []}
                  errors={errors.detalles?.[index]}
                />
              ))}

              {fields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay actividades configuradas</p>
                  <p className="text-sm">
                    Agregue al menos una actividad para continuar
                  </p>
                  {selectedPresupuesto && (
                    <div className="mt-4 space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addConcepto(false)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar Concepto Presupuestado
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addConcepto(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar Concepto No Presupuestado
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {errors.detalles && (
                <p className="text-sm text-red-600">
                  {errors.detalles.message}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Paso 5: Observaciones y Notas */}
        {currentStep === 5 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Observaciones y Notas
              </CardTitle>
              <CardDescription>
                Agregue observaciones e instrucciones especiales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="observacionesProgramacion">
                  Observaciones de Programación
                </Label>
                <Controller
                  name="observacionesProgramacion"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      className="mt-1"
                      rows={3}
                      placeholder="Notas especiales sobre la programación"
                    />
                  )}
                />
              </div>

              <div>
                <Label htmlFor="instruccionesBrigadista">
                  Instrucciones para el Brigadista
                </Label>
                <Controller
                  name="instruccionesBrigadista"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      className="mt-1"
                      rows={3}
                      placeholder="Información específica sobre la actividad"
                    />
                  )}
                />
              </div>

              <div>
                <Label htmlFor="condicionesEspeciales">
                  Condiciones Especiales
                </Label>
                <Controller
                  name="condicionesEspeciales"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      className="mt-1"
                      rows={3}
                      placeholder="Requisitos particulares del cliente o la obra"
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Anterior
              </Button>
            )}
          </div>

          <div className="flex space-x-2">
            {currentStep < 5 && (
              <Button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={currentStep === 1 && !presupuestoId}
              >
                Siguiente
              </Button>
            )}

            {currentStep === 5 && (
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? "Guardando..." : "Crear Programación"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

// Componente para cada concepto/actividad
interface ConceptoFormFieldProps {
  control: any;
  watch: any;
  setValue: any;
  index: number;
  onRemove: () => void;
  conceptosPresupuestados: any[];
  errors?: any;
}

function ConceptoFormField({
  control,
  watch,
  setValue,
  index,
  onRemove,
  conceptosPresupuestados,
  errors,
}: ConceptoFormFieldProps) {
  const esNoPresupuestado = watch(`detalles.${index}.esNoPresupuestado`);

  console.log(`Concepto ${index}:`, {
    esNoPresupuestado,
    conceptosPresupuestados: conceptosPresupuestados.length,
    conceptos: conceptosPresupuestados,
  });

  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant={esNoPresupuestado ? "destructive" : "default"}>
            {esNoPresupuestado ? "No Presupuestado" : "Presupuestado"}
          </Badge>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!esNoPresupuestado ? (
          <div>
            <Label>Concepto Presupuestado</Label>
            <Controller
              name={`detalles.${index}.conceptoCodigo`}
              control={control}
              render={({ field }) => {
                const selectedConcepto = conceptosPresupuestados.find(
                  (c) => c.codigo === field.value
                );
                return (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1 h-auto min-h-[2.5rem] p-3">
                      {selectedConcepto ? (
                        <div className="w-full text-left">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {selectedConcepto.codigo}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {selectedConcepto.unidad}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-700">
                            {selectedConcepto.descripcion.length > 80
                              ? selectedConcepto.descripcion.substring(0, 80) +
                                "..."
                              : selectedConcepto.descripcion}
                          </div>
                        </div>
                      ) : (
                        <SelectValue placeholder="Seleccionar concepto..." />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {conceptosPresupuestados.length === 0 ? (
                        <SelectItem value="no-conceptos" disabled>
                          No hay conceptos en este presupuesto
                        </SelectItem>
                      ) : (
                        conceptosPresupuestados.map((concepto) => (
                          <SelectItem
                            key={concepto.codigo}
                            value={concepto.codigo}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {concepto.descripcion}
                              </span>
                              <span className="text-sm text-gray-500">
                                {concepto.codigo} - {concepto.unidad}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                );
              }}
            />
          </div>
        ) : (
          <div className="md:col-span-2">
            <Label>Concepto Jerárquico</Label>
            <div className="mt-1">
              <Controller
                name={`detalles.${index}.conceptoCodigo`}
                control={control}
                render={({ field }) => (
                  <ConceptoSelector
                    onSelect={(concepto) => {
                      field.onChange(concepto.codigo);
                      setValue(
                        `detalles.${index}.descripcionConcepto`,
                        concepto.descripcion
                      );
                      setValue(
                        `detalles.${index}.unidadMedida`,
                        concepto.unidad
                      );
                    }}
                    selectedConcepto={
                      field.value
                        ? {
                            id: 0,
                            codigo: field.value,
                            descripcion:
                              watch(`detalles.${index}.descripcionConcepto`) ||
                              "",
                            unidad:
                              watch(`detalles.${index}.unidadMedida`) || "",
                            precioUnitario: "0",
                            areaId: 0,
                          }
                        : undefined
                    }
                  />
                )}
              />
            </div>

            {/* Campos ocultos que se auto-llenan desde el selector */}
            <div className="hidden">
              <Controller
                name={`detalles.${index}.descripcionConcepto`}
                control={control}
                render={({ field }) => <input type="hidden" {...field} />}
              />
              <Controller
                name={`detalles.${index}.unidadMedida`}
                control={control}
                render={({ field }) => <input type="hidden" {...field} />}
              />
            </div>
          </div>
        )}{" "}
        <div>
          <Label>Cantidad de Muestras</Label>
          <Controller
            name={`detalles.${index}.cantidadMuestras`}
            control={control}
            render={({ field }) => (
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                className="mt-1"
                min={1}
              />
            )}
          />
        </div>
        <div>
          <Label>Tipo de Recolección</Label>
          <Controller
            name={`detalles.${index}.tipoRecoleccion`}
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPOS_RECOLECCION).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div>
        <Label>Distribución de Muestras</Label>
        <Controller
          name={`detalles.${index}.distribucionMuestras`}
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              className="mt-1"
              placeholder="Especificar si es en una sola toma o múltiples proyecciones"
            />
          )}
        />
      </div>

      {errors && (
        <div className="text-sm text-red-600">
          {Object.values(errors).map((error: any, i) => (
            <p key={i}>{error?.message}</p>
          ))}
        </div>
      )}
    </div>
  );
}
