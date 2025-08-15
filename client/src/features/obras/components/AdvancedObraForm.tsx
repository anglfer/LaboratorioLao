import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Textarea } from "../../../shared/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import { Separator } from "../../../shared/components/ui/separator";
import { Checkbox } from "../../../shared/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shared/components/ui/select";
import {
  Building,
  Plus,
  Phone,
  Mail,
  Wrench,
  AlertCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Calendar,
  FileText,
  Target,
} from "lucide-react";

// Schemas para obras - adaptados del schema de presupuestos
const obraSchema = z
  .object({
    // Cliente
    clienteId: z.number().optional(),
    clienteNuevo: z
      .object({
        nombre: z.string().optional(),
        direccion: z.string().optional(),
        telefonos: z
          .array(z.string())
          .optional()
          .transform((arr) =>
            arr ? arr.filter((tel) => tel && tel.trim().length > 0) : []
          ),
        correos: z
          .array(z.string())
          .optional()
          .transform((arr) =>
            arr ? arr.filter((email) => email && email.trim().length > 0) : []
          )
          .refine(
            (arr) => {
              if (arr.length === 0) return true;
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              return arr.every((email) => emailRegex.test(email));
            },
            { message: "Uno o más correos tienen formato inválido" }
          ),
      })
      .optional(),

    // Datos principales de la obra
    clave: z.string().optional(), // Se genera automáticamente
    nombre: z
      .string()
      .min(1, "El nombre de la obra es requerido")
      .max(200, "El nombre no puede exceder 200 caracteres"),
    descripcion: z
      .string()
      .min(10, "La descripción debe ser más específica")
      .max(1000, "La descripción no puede exceder 1000 caracteres"),

    // Responsables y contactos
    responsable: z
      .string()
      .min(1, "El responsable de la obra es requerido")
      .max(100, "El nombre del responsable no puede exceder 100 caracteres"),
    contacto: z.string().optional(),

    // Ubicación y fechas
    direccion: z
      .string()
      .min(5, "La dirección debe ser más específica")
      .max(300, "La dirección no puede exceder 300 caracteres"),
    fechaInicio: z.coerce.date().optional(),
    fechaFinPrevista: z.coerce.date().optional(),

    // Presupuesto estimado
    presupuestoEstimado: z
      .number()
      .min(0, "El presupuesto no puede ser negativo")
      .max(9999999999.99, "El presupuesto excede el límite permitido")
      .optional(),

    // Estado inicial
    estado: z.string().optional().default("planificacion"),

    // Notas adicionales
    notas: z.string().optional(),
    alcance: z.string().optional(),
    objetivos: z.string().optional(),
  })
  .refine(
    (data) => {
      // Validar que se tenga un cliente seleccionado O un cliente nuevo con nombre
      if (data.clienteId) {
        return true;
      }
      if (
        data.clienteNuevo &&
        data.clienteNuevo.nombre &&
        data.clienteNuevo.nombre.trim().length > 0
      ) {
        return true;
      }
      return false;
    },
    {
      message:
        "Debe seleccionar un cliente existente o crear uno nuevo con nombre",
      path: ["clienteId"],
    }
  )
  .refine(
    (data) => {
      // Validar que la fecha de fin sea posterior a la fecha de inicio
      if (data.fechaInicio && data.fechaFinPrevista) {
        return data.fechaFinPrevista > data.fechaInicio;
      }
      return true;
    },
    {
      message:
        "La fecha de finalización debe ser posterior a la fecha de inicio",
      path: ["fechaFinPrevista"],
    }
  );

type ObraFormData = z.infer<typeof obraSchema>;

interface AdvancedObraFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  initialData?: any;
}

interface Cliente {
  id: number;
  nombre: string;
  direccion: string;
  telefonos: Array<{ telefono: string }>;
  correos: Array<{ correo: string }>;
}

// Función para generar clave automática de obra
const generateObraClave = (
  nombreObra: string,
  clienteNombre?: string
): string => {
  // Tomar las primeras 3 letras del nombre de la obra
  const obraPrefix = nombreObra
    .replace(/[^a-zA-Z\s]/g, "") // Eliminar caracteres especiales
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .substring(0, 3);

  // Tomar las primeras 2 letras del cliente si existe
  const clientePrefix = clienteNombre
    ? clienteNombre
        .replace(/[^a-zA-Z\s]/g, "")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase())
        .join("")
        .substring(0, 2)
    : "XX";

  // Generar número aleatorio de 3 dígitos
  const randomNum = Math.floor(Math.random() * 900) + 100;

  return `${obraPrefix}${clientePrefix}${randomNum}`;
};

export function AdvancedObraForm({
  onSubmit,
  isLoading,
  initialData,
}: AdvancedObraFormProps) {
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(
    null
  );
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [busquedaCliente, setBusquedaCliente] = useState<string>("");
  const [clienteNuevo, setClienteNuevo] = useState(false);
  const [copiarDeCliente, setCopiarDeCliente] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [claveGenerada, setClaveGenerada] = useState<string>("");

  // Debug: mostrar si estamos en modo edición
  useEffect(() => {
    if (initialData) {
      console.log(
        "[AdvancedObraForm] EDIT MODE ACTIVATED with data:",
        initialData
      );
      setIsEditMode(true);
      setClaveGenerada(initialData.clave || "");
    } else {
      console.log("[AdvancedObraForm] CREATE MODE - no initial data");
      setIsEditMode(false);
      setClaveGenerada("");
    }
  }, [initialData]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    reset,
  } = useForm<ObraFormData>({
    resolver: zodResolver(obraSchema),
    defaultValues: {
      clienteNuevo: {
        telefonos: [],
        correos: [],
      },
      estado: "planificacion",
    },
  });

  // Queries para obtener clientes
  const { data: clientes, error: clientesError } = useQuery<Cliente[]>({
    queryKey: ["clientes"],
    queryFn: async () => {
      const response = await fetch("/api/clientes");
      if (!response.ok) {
        throw new Error(`Error fetching clientes: ${response.statusText}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        console.error(
          "[AdvancedObraForm] Clientes response is not an array:",
          data
        );
        return [];
      }
      return data;
    },
  });

  // Watchers para formulario
  const watchedClienteId = watch("clienteId");
  const watchedNombreObra = watch("nombre");
  const watchedClienteNuevo = watch("clienteNuevo");

  // Efecto para cargar datos iniciales en modo edición
  useEffect(() => {
    if (initialData && isEditMode) {
      console.log("[AdvancedObraForm] Loading initial data:", initialData);

      // Cargar datos básicos
      setValue("nombre", initialData.nombre || "");
      setValue("descripcion", initialData.descripcion || "");
      setValue("responsable", initialData.responsable || "");
      setValue("contacto", initialData.contacto || "");
      setValue("direccion", initialData.direccion || "");
      setValue("presupuestoEstimado", initialData.presupuestoEstimado || 0);
      setValue("notas", initialData.notas || "");
      setValue("alcance", initialData.alcance || "");
      setValue("objetivos", initialData.objetivos || "");
      setValue("estado", initialData.estado || "planificacion");

      // Cargar fechas
      if (initialData.fechaInicio) {
        setValue("fechaInicio", new Date(initialData.fechaInicio));
      }
      if (initialData.fechaFinPrevista) {
        setValue("fechaFinPrevista", new Date(initialData.fechaFinPrevista));
      }

      // Cargar cliente
      if (initialData.clienteId) {
        setValue("clienteId", initialData.clienteId);
        setSelectedClienteId(initialData.clienteId);
      }

      setClaveGenerada(initialData.clave || "");
    }
  }, [initialData, isEditMode, setValue]);

  // Función para generar clave automática
  const handleGenerarClave = () => {
    const nombreObra = watchedNombreObra;
    let clienteNombre = "";

    if (watchedClienteId && clientes) {
      const cliente = clientes.find((c) => c.id === watchedClienteId);
      clienteNombre = cliente?.nombre || "";
    } else if (watchedClienteNuevo?.nombre) {
      clienteNombre = watchedClienteNuevo.nombre;
    }

    if (nombreObra) {
      const nuevaClave = generateObraClave(nombreObra, clienteNombre);
      setClaveGenerada(nuevaClave);
      setValue("clave", nuevaClave);
    }
  };

  // Función para auto-generar clave cuando cambia el nombre o cliente
  useEffect(() => {
    if (
      !isEditMode &&
      watchedNombreObra &&
      (watchedClienteId || watchedClienteNuevo?.nombre)
    ) {
      handleGenerarClave();
    }
  }, [
    watchedNombreObra,
    watchedClienteId,
    watchedClienteNuevo?.nombre,
    isEditMode,
  ]);

  // Función para copiar datos del cliente seleccionado
  useEffect(() => {
    if (copiarDeCliente && watchedClienteId && clientes) {
      const clienteSeleccionado = clientes.find(
        (c) => c.id === watchedClienteId
      );
      if (clienteSeleccionado && clienteSeleccionado.direccion) {
        setValue("direccion", clienteSeleccionado.direccion);
      }
    }
  }, [copiarDeCliente, watchedClienteId, clientes, setValue]);

  // Filtrar clientes para búsqueda
  const clientesFiltrados = useMemo(() => {
    if (!clientes) return [];
    if (!busquedaCliente) return clientes;

    return clientes.filter(
      (cliente) =>
        cliente.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
        cliente.direccion?.toLowerCase().includes(busquedaCliente.toLowerCase())
    );
  }, [clientes, busquedaCliente]);

  // Función para manejar envío del formulario
  const onSubmitForm = (data: ObraFormData) => {
    // Agregar la clave generada si no está en modo edición
    if (!isEditMode && claveGenerada) {
      data.clave = claveGenerada;
    }

    console.log("[AdvancedObraForm] Submitting data:", data);
    onSubmit(data);
  };

  // Función para avanzar/retroceder pasos
  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Renderizar indicador de pasos
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {step}
          </div>
          {step < 3 && (
            <div
              className={`w-16 h-1 mx-2 ${
                currentStep > step ? "bg-blue-600" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {renderStepIndicator()}

      {/* Paso 1: Información Básica */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-600" />
              <span>Información Básica de la Obra</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Clave de obra */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="clave">Clave de la Obra</Label>
                <Input
                  {...register("clave")}
                  value={claveGenerada}
                  onChange={(e) => setClaveGenerada(e.target.value)}
                  placeholder="Se generará automáticamente"
                  disabled={isEditMode}
                />
                {errors.clave && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.clave.message}
                  </p>
                )}
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerarClave}
                  disabled={!watchedNombreObra || isEditMode}
                  className="w-full"
                >
                  Generar Clave
                </Button>
              </div>
            </div>

            {/* Nombre de la obra */}
            <div>
              <Label htmlFor="nombre">Nombre de la Obra *</Label>
              <Input
                {...register("nombre")}
                placeholder="Ej: Construcción de laboratorio de suelos"
                className={errors.nombre ? "border-red-500" : ""}
              />
              {errors.nombre && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.nombre.message}
                </p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <Label htmlFor="descripcion">Descripción de la Obra *</Label>
              <Textarea
                {...register("descripcion")}
                placeholder="Descripción detallada de la obra, incluyendo especificaciones técnicas y alcance general..."
                rows={4}
                className={errors.descripcion ? "border-red-500" : ""}
              />
              {errors.descripcion && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.descripcion.message}
                </p>
              )}
            </div>

            {/* Responsable y Contacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="responsable">Responsable de la Obra *</Label>
                <Input
                  {...register("responsable")}
                  placeholder="Nombre del responsable técnico"
                  className={errors.responsable ? "border-red-500" : ""}
                />
                {errors.responsable && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.responsable.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="contacto">Contacto</Label>
                <Input
                  {...register("contacto")}
                  placeholder="Teléfono o email del responsable"
                />
              </div>
            </div>

            {/* Presupuesto estimado */}
            <div>
              <Label htmlFor="presupuestoEstimado">Presupuesto Estimado</Label>
              <Input
                {...register("presupuestoEstimado", { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="0.00"
                className={errors.presupuestoEstimado ? "border-red-500" : ""}
              />
              {errors.presupuestoEstimado && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.presupuestoEstimado.message}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="button" onClick={nextStep}>
                Siguiente
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paso 2: Cliente y Ubicación */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <span>Cliente y Ubicación</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selección de cliente */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Checkbox
                  checked={clienteNuevo}
                  onCheckedChange={(checked) => {
                    setClienteNuevo(checked as boolean);
                    if (checked) {
                      setValue("clienteId", undefined);
                      setSelectedClienteId(null);
                    }
                  }}
                />
                <Label>Crear nuevo cliente</Label>
              </div>

              {!clienteNuevo ? (
                <div className="space-y-2">
                  <Label>Cliente Existente *</Label>
                  <Input
                    placeholder="Buscar cliente por nombre..."
                    value={busquedaCliente}
                    onChange={(e) => setBusquedaCliente(e.target.value)}
                  />
                  <Select
                    value={selectedClienteId?.toString() || ""}
                    onValueChange={(value) => {
                      const id = parseInt(value);
                      setSelectedClienteId(id);
                      setValue("clienteId", id);
                    }}
                  >
                    <SelectTrigger
                      className={errors.clienteId ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientesFiltrados.map((cliente) => (
                        <SelectItem
                          key={cliente.id}
                          value={cliente.id.toString()}
                        >
                          {cliente.nombre} - {cliente.direccion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <Card className="p-4 border-dashed">
                  <h4 className="font-medium mb-3">Datos del Nuevo Cliente</h4>
                  <div className="space-y-3">
                    <div>
                      <Label>Nombre del Cliente *</Label>
                      <Input
                        {...register("clienteNuevo.nombre")}
                        placeholder="Nombre completo o razón social"
                      />
                    </div>
                    <div>
                      <Label>Dirección del Cliente</Label>
                      <Input
                        {...register("clienteNuevo.direccion")}
                        placeholder="Dirección completa"
                      />
                    </div>
                  </div>
                </Card>
              )}

              {errors.clienteId && (
                <p className="text-red-500 text-sm">
                  {errors.clienteId.message}
                </p>
              )}
            </div>

            {/* Dirección de la obra */}
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <Label htmlFor="direccion">Dirección de la Obra *</Label>
                {selectedClienteId && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={copiarDeCliente}
                      onCheckedChange={(checked) =>
                        setCopiarDeCliente(checked as boolean)
                      }
                    />
                    <Label className="text-sm text-gray-600">
                      Copiar dirección del cliente
                    </Label>
                  </div>
                )}
              </div>
              <Textarea
                {...register("direccion")}
                placeholder="Dirección completa donde se realizará la obra"
                rows={3}
                className={errors.direccion ? "border-red-500" : ""}
              />
              {errors.direccion && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.direccion.message}
                </p>
              )}
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                <Input
                  {...register("fechaInicio")}
                  type="date"
                  className={errors.fechaInicio ? "border-red-500" : ""}
                />
                {errors.fechaInicio && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.fechaInicio.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="fechaFinPrevista">
                  Fecha de Finalización Prevista
                </Label>
                <Input
                  {...register("fechaFinPrevista")}
                  type="date"
                  className={errors.fechaFinPrevista ? "border-red-500" : ""}
                />
                {errors.fechaFinPrevista && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.fechaFinPrevista.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={prevStep}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              <Button type="button" onClick={nextStep}>
                Siguiente
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paso 3: Detalles Adicionales */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Detalles Adicionales</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Alcance */}
            <div>
              <Label htmlFor="alcance">Alcance de la Obra</Label>
              <Textarea
                {...register("alcance")}
                placeholder="Definición detallada del alcance y límites de la obra..."
                rows={3}
              />
            </div>

            {/* Objetivos */}
            <div>
              <Label htmlFor="objetivos">Objetivos</Label>
              <Textarea
                {...register("objetivos")}
                placeholder="Objetivos específicos y metas de la obra..."
                rows={3}
              />
            </div>

            {/* Notas */}
            <div>
              <Label htmlFor="notas">Notas Adicionales</Label>
              <Textarea
                {...register("notas")}
                placeholder="Observaciones, restricciones o información adicional relevante..."
                rows={4}
              />
            </div>

            {/* Estado inicial (solo en modo edición) */}
            {isEditMode && (
              <div>
                <Label htmlFor="estado">Estado de la Obra</Label>
                <Select
                  value={watch("estado") || "planificacion"}
                  onValueChange={(value) => setValue("estado", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planificacion">Planificación</SelectItem>
                    <SelectItem value="iniciada">Iniciada</SelectItem>
                    <SelectItem value="en_progreso">En Progreso</SelectItem>
                    <SelectItem value="pausada">Pausada</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Separator />

            {/* Botones finales */}
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={prevStep}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              <div className="flex space-x-3">
                <Button type="button" variant="outline" onClick={() => reset()}>
                  Limpiar Formulario
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
                      {isEditMode ? "Actualizando..." : "Creando..."}
                    </>
                  ) : (
                    <>
                      <Building className="h-4 w-4 mr-2" />
                      {isEditMode ? "Actualizar Obra" : "Crear Obra"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  );
}
