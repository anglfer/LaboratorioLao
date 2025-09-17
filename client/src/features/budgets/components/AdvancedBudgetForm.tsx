import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
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
} from "lucide-react";
import { SYSTEM_CONSTANTS } from "../../../../../shared/schema";
import {
  AreaJerarquica,
  ConceptoJerarquico,
  areasJerarquicasService,
  conceptosJerarquicosService,
} from "../../concepts";
import {
  MetodoPago,
  RegimenFiscal,
  UsoCFDI,
  TipoPago,
} from "../../clientes/lib/types";
import { useToast } from "../../dashboard/hooks/use-toast";

// Tipos para áreas de presupuesto
interface AreaPresupuesto {
  codigo: string;
  nombre: string;
}

// Servicio para obtener áreas de presupuesto
const obtenerAreasPresupuesto = async (): Promise<AreaPresupuesto[]> => {
  const response = await fetch("/api/areas");
  if (!response.ok) {
    throw new Error("Error al obtener áreas de presupuesto");
  }
  return response.json();
};

// Schemas - simplified for debugging
const budgetSchema = z
  .object({
    // Cliente
    clienteId: z.number().optional(),
    clienteNuevo: z
      .object({
        // Información básica
        nombre: z.string().optional(), // Cambiar a opcional
        direccion: z.string().optional(),

        // Representante legal (opcional)
        representanteLegal: z.string().optional(),

        // Contacto para pagos (opcional)
        contactoPagos: z.string().optional(),
        telefonoPagos: z
          .string()
          .regex(/^[0-9]{10}$/, "Teléfono inválido. Debe tener 10 dígitos")
          .optional()
          .or(z.literal("")),
        metodoPago: z.enum(["EFECTIVO", "TRANSFERENCIA", "CHEQUE"]).optional(),
        correoFacturacion: z
          .string()
          .email("Correo de facturación inválido")
          .optional()
          .or(z.literal("")),

        // Teléfonos y correos adicionales
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
              if (arr.length === 0) return true; // No hay correos para validar
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              return arr.every((email) => emailRegex.test(email));
            },
            { message: "Uno o más correos tienen formato inválido" }
          ),

        // Datos de facturación (opcionales)
        datosFacturacion: z
          .object({
            rfc: z
              .string()
              .regex(
                /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/,
                "RFC inválido. Formato: ABC123456789"
              )
              .optional()
              .or(z.literal("")),
            regimenFiscal: z
              .enum([
                "PERSONAS_FISICAS_CON_ACTIVIDADES_EMPRESARIALES",
                "PERSONAS_MORALES",
                "REGIMEN_SIMPLIFICADO_DE_CONFIANZA",
                "PERSONAS_FISICAS_CON_ACTIVIDADES_PROFESIONALES",
                "REGIMEN_DE_INCORPORACION_FISCAL",
                "OTROS",
              ])
              .optional(),
            usoCfdi: z
              .enum([
                "GASTOS_EN_GENERAL",
                "EQUIPOS_DE_COMPUTO",
                "HONORARIOS_MEDICOS",
                "GASTOS_MEDICOS",
                "INTERESES_REALES",
                "DONACIONES",
                "OTROS",
              ])
              .optional(),
            tipoPago: z.enum(["PUE", "PPD"]).optional(),
          })
          .optional(),
      })
      .optional(),

    // Contratista
    nombreContratista: z
      .string()
      .min(1, "El nombre del contratista es requerido"),
    copiarDeCliente: z.boolean().optional(),

    // Detalles de obra
    descripcionObra: z
      .string()
      .min(1, "La descripción de la obra es requerida"),
    alcance: z
      .string()
      .min(10, "El alcance debe ser más específico (mínimo 10 caracteres)"),
    direccion: z
      .string()
      .min(5, "La dirección de la obra es requerida (mínimo 5 caracteres)"),
    contactoResponsable: z
      .string()
      .min(1, "El contacto responsable es requerido"),
    // Conceptos
    areaCodigo: z.string().min(1, "Debe seleccionar un área"),
    conceptosSeleccionados: z
      .array(z.string())
      .min(1, "Debe seleccionar al menos un concepto"),
    conceptos: z
      .array(
        z.object({
          conceptoCodigo: z.string().min(1, "Debe seleccionar un concepto"),
          cantidad: z
            .number()
            .min(0.01, "La cantidad debe ser mayor a 0")
            .max(999999, "La cantidad no puede exceder 999,999"),
          precioUnitario: z
            .number()
            .min(0.01, "El precio debe ser mayor a 0")
            .max(9999999.99, "El precio no puede exceder $9,999,999.99"),
        })
      )
      .min(1, "Debe agregar al menos un concepto")
      .refine(
        (conceptos) => {
          // Validar que el subtotal total no exceda el límite de DB
          const subtotalTotal = conceptos.reduce(
            (sum, concepto) =>
              sum + concepto.cantidad * concepto.precioUnitario,
            0
          );
          return subtotalTotal <= 9999999999.99; // Límite para Decimal(12,2)
        },
        {
          message:
            "El subtotal total del presupuesto excede el límite permitido ($9,999,999,999.99)",
        }
      ),

    // Anticipo
    manejaAnticipo: z.boolean().optional(),
    porcentajeAnticipo: z
      .number()
      .min(0, "El porcentaje no puede ser negativo")
      .max(100, "El porcentaje no puede ser mayor a 100")
      .optional(),
  })
  .refine(
    (data) => {
      // Validación condicional: debe tener clienteId O clienteNuevo.nombre
      const hasClienteId = !!data.clienteId;
      const hasClienteNuevo = !!(
        data.clienteNuevo?.nombre && data.clienteNuevo.nombre.trim().length > 0
      );

      return hasClienteId || hasClienteNuevo;
    },
    {
      message:
        "Debe seleccionar un cliente existente o proporcionar datos del cliente nuevo",
      path: ["clienteNuevo", "nombre"], // Esto hará que el error aparezca en el campo nombre
    }
  );

type BudgetFormData = z.infer<typeof budgetSchema>;

interface AdvancedBudgetFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  initialData?: any; // Presupuesto a editar
}

interface Cliente {
  id: number;
  nombre: string;
  direccion: string;
  telefonos: Array<{ telefono: string }>;
  correos: Array<{ correo: string }>;
}

interface Area {
  codigo: string;
  nombre: string;
}

// Mapeo de códigos de área predefinidos - función para generar códigos automáticamente
const generateAreaCode = (areaName: string): string => {
  // Convertir nombre a código de 2-3 letras
  const words = areaName.toLowerCase().split(" ");
  if (words.length === 1) {
    // Una palabra: tomar las primeras 2-3 letras
    return words[0].substring(0, 3);
  } else {
    // Múltiples palabras: tomar la primera letra de cada palabra
    return words
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 3);
  }
};

// Función para validar cada paso antes de avanzar
const validateStep = async (step: number, getValues: any, trigger: any) => {
  const values = getValues();
  console.log(`[validateStep] Validating step ${step}, values:`, values);

  switch (step) {
    case 1: // Cliente - debe tener clienteId O clienteNuevo.nombre
      console.log(
        `[validateStep] Step 1 - clienteId: ${values.clienteId}, clienteNuevo.nombre: ${values.clienteNuevo?.nombre}`
      );
      if (values.clienteId) {
        console.log(
          "[validateStep] Cliente existente seleccionado, returning true"
        );
        return true; // Cliente existente seleccionado
      } else if (values.clienteNuevo?.nombre) {
        console.log(
          "[validateStep] Cliente nuevo detectado, validating clienteNuevo fields"
        );
        // Validar solo los campos requeridos del cliente nuevo
        const clienteNuevoValid = await trigger("clienteNuevo.nombre");
        return clienteNuevoValid;
      } else {
        console.log("[validateStep] No cliente seleccionado, returning false");
        return false; // No hay cliente seleccionado ni datos del nuevo
      }
    case 2: // Contratista
      return await trigger(["nombreContratista"]);
    case 3: // Obra
      return await trigger([
        "descripcionObra",
        "alcance",
        "direccion",
        "contactoResponsable",
      ]);
    case 4: // Conceptos
      return await trigger(["areaId", "conceptosSeleccionados"]);
    default:
      return true;
  }
};

export default function AdvancedBudgetForm({
  onSubmit,
  isLoading,
  initialData,
}: AdvancedBudgetFormProps) {
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(
    null
  );
  const [selectedArea, setSelectedArea] = useState<string>(""); // Para código de obra
  const [navegacionJerarquica, setNavegacionJerarquica] = useState<number[]>(
    []
  ); // Para navegación por niveles
  const [areaActualConceptos, setAreaActualConceptos] = useState<number | null>(
    null
  ); // Área final con conceptos
  const [currentStep, setCurrentStep] = useState<number>(1); // Control de pasos del formulario
  const [conceptosSeleccionados, setConceptosSeleccionados] = useState<
    string[]
  >([]);
  const [busquedaConcepto, setBusquedaConcepto] = useState<string>("");
  const [modoVisualizacion, setModoVisualizacion] = useState<
    "navegacion" | "busqueda" | "todos"
  >("navegacion"); // Modo de ver conceptos
  const [areasConConceptos, setAreasConConceptos] = useState<number[]>([]); // Áreas que tienen conceptos
  const [busquedaCliente, setBusquedaCliente] = useState<string>("");
  const [clienteNuevo, setClienteNuevo] = useState(false);
  const [copiarDeCliente, setCopiarDeCliente] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();

  // Debug: mostrar si estamos en modo edición
  useEffect(() => {
    if (initialData) {
      console.log(
        "[AdvancedBudgetForm] EDIT MODE ACTIVATED with data:",
        initialData
      );
      setIsEditMode(true);
    } else {
      console.log("[AdvancedBudgetForm] CREATE MODE - no initial data");
      setIsEditMode(false);
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
    getValues,
    trigger,
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      conceptos: [],
      conceptosSeleccionados: [],
      clienteNuevo: {
        nombre: "",
        direccion: "",
        representanteLegal: "",
        contactoPagos: "",
        telefonoPagos: "",
        metodoPago: "EFECTIVO",
        correoFacturacion: "",
        telefonos: [],
        correos: [],
        datosFacturacion: {
          rfc: "",
          regimenFiscal: "PERSONAS_MORALES",
          usoCfdi: "GASTOS_EN_GENERAL",
          tipoPago: "PUE",
        },
      },
    },
  });

  const {
    fields: conceptosFields,
    append: appendConcepto,
    remove: removeConcepto,
  } = useFieldArray({
    control,
    name: "conceptos",
  });
  // Queries - Ahora usando el sistema jerárquico
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
          "[AdvancedBudgetForm] Clientes response is not an array:",
          data
        );
        return [];
      }
      return data;
    },
  });

  // Query para obtener áreas de presupuesto
  const { data: areasPresupuesto } = useQuery<AreaPresupuesto[]>({
    queryKey: ["areas-presupuesto"],
    queryFn: obtenerAreasPresupuesto,
  });

  const { data: areasJerarquicas, error: areasError } = useQuery<
    AreaJerarquica[]
  >({
    queryKey: ["areas-jerarquicas"],
    queryFn: async () => {
      try {
        // Obtener todas las áreas jerárquicas con estructura recursiva
        return await areasJerarquicasService.obtenerLista();
      } catch (error) {
        console.error("[AdvancedBudgetForm] Error fetching areas:", error);
        return [];
      }
    },
  });

  // Query para obtener TODOS los conceptos jerárquicos (para búsqueda y selección múltiple)
  const {
    data: todosLosConceptos,
    error: conceptosError,
    isLoading: conceptosLoading,
    isFetching: conceptosFetching,
  } = useQuery<ConceptoJerarquico[]>({
    queryKey: ["todos-conceptos-jerarquicos"],
    queryFn: async () => {
      try {
        const data = await conceptosJerarquicosService.obtenerLista();
        if (!Array.isArray(data)) {
          throw new Error("Respuesta inesperada al cargar conceptos");
        }
        return data;
      } catch (error: any) {
        console.error(
          "[AdvancedBudgetForm] Error fetching all conceptos:",
          error
        );
        // Re-lanzamos para que React Query marque el error y podamos mostrarlo
        throw error instanceof Error
          ? error
          : new Error("No se pudieron cargar los conceptos jerárquicos");
      }
    },
    retry: 1,
  });

  // Query para obtener conceptos del área actual (para mostrar solo los de esta área)
  const { data: conceptosAreaActual } = useQuery<ConceptoJerarquico[]>({
    queryKey: ["conceptos-area-actual", areaActualConceptos],
    queryFn: async () => {
      if (!areaActualConceptos) return [];
      try {
        return await conceptosJerarquicosService.obtenerPorArea(
          areaActualConceptos
        );
      } catch (error) {
        console.error(
          "[AdvancedBudgetForm] Error fetching conceptos by area:",
          error
        );
        return [];
      }
    },
    enabled: !!areaActualConceptos,
  });

  // Funciones para navegación jerárquica
  const obtenerAreasDeNivel = (
    nivel: number,
    padreId?: number | null
  ): AreaJerarquica[] => {
    if (!areasJerarquicas) return [];

    if (nivel === 0) {
      // Nivel raíz: áreas sin padre
      return areasJerarquicas.filter(
        (area) => area.nivel === 1 && !area.padreId
      );
    } else {
      // Niveles hijos: áreas que tienen el padreId especificado
      return areasJerarquicas.filter((area) => area.padreId === padreId);
    }
  };

  const navegarANivel = (areaId: number, nivel: number) => {
    // Actualizar la navegación hasta el nivel seleccionado
    const nuevaNavegacion = [...navegacionJerarquica.slice(0, nivel), areaId];
    setNavegacionJerarquica(nuevaNavegacion);

    // Verificar si esta área tiene hijos
    const areaSeleccionada = areasJerarquicas?.find((a) => a.id === areaId);
    const tieneHijos = areasJerarquicas?.some((a) => a.padreId === areaId);

    if (!tieneHijos) {
      // Es un nodo hoja, cargar conceptos
      setAreaActualConceptos(areaId);
    } else {
      // Tiene hijos, limpiar conceptos
      setAreaActualConceptos(null);
    }
  };

  // Función para verificar si un área tiene conceptos disponibles
  const areaConceptos = useMemo(() => {
    if (!todosLosConceptos || !areasJerarquicas) return new Map();

    const conceptosPorArea = new Map<number, number>();

    // Contar conceptos por área
    todosLosConceptos.forEach((concepto) => {
      const areaId = concepto.areaId;
      conceptosPorArea.set(areaId, (conceptosPorArea.get(areaId) || 0) + 1);
    });

    return conceptosPorArea;
  }, [todosLosConceptos, areasJerarquicas]);

  // Función para cargar conceptos de un área específica
  const cargarConceptosDeArea = (areaId: number) => {
    setAreaActualConceptos(areaId);
    setModoVisualizacion("navegacion");
  };

  const retrocederNivel = (nivel: number) => {
    const nuevaNavegacion = navegacionJerarquica.slice(0, nivel);
    setNavegacionJerarquica(nuevaNavegacion);
    setAreaActualConceptos(null);
  };
  useEffect(() => {
    if (clienteNuevo) {
      const currentTelefonos = watch("clienteNuevo.telefonos") || [];
      const currentCorreos = watch("clienteNuevo.correos") || [];

      if (currentTelefonos.length === 0) {
        setValue("clienteNuevo.telefonos", [""]);
      }
      if (currentCorreos.length === 0) {
        setValue("clienteNuevo.correos", [""]);
      }
    }
  }, [clienteNuevo, setValue, watch]);
  // Watch values
  const watchedConceptos = watch("conceptos");
  const watchedClienteId = watch("clienteId");
  const watchedClienteNombre = watch("clienteNuevo.nombre");
  const allFormValues = watch();

  // Efectos
  useEffect(() => {
    console.log("[AdvancedBudgetForm] All form values:", allFormValues);
  }, [allFormValues]);
  useEffect(() => {
    console.log("[AdvancedBudgetForm] Form errors:", errors);
    if (errors.clienteNuevo) {
      console.log(
        "[AdvancedBudgetForm] Cliente nuevo errors:",
        errors.clienteNuevo
      );
      if (errors.clienteNuevo.telefonos) {
        console.log(
          "[AdvancedBudgetForm] Telefonos errors:",
          errors.clienteNuevo.telefonos
        );
      }
      if (errors.clienteNuevo.correos) {
        console.log(
          "[AdvancedBudgetForm] Correos errors:",
          errors.clienteNuevo.correos
        );
      }
    }
  }, [errors]);
  useEffect(() => {
    if (copiarDeCliente && selectedClienteId && clientes) {
      const cliente = clientes.find((c) => c.id === selectedClienteId);
      if (cliente) {
        setValue("nombreContratista", cliente.nombre);
        // Copiar también direccion si está disponible
        if (cliente.direccion && clienteNuevo) {
          setValue("clienteNuevo.nombre", cliente.nombre);
          setValue("clienteNuevo.direccion", cliente.direccion);

          // Copiar teléfonos
          if (cliente.telefonos && cliente.telefonos.length > 0) {
            const telefonos = cliente.telefonos.map((t) => t.telefono);
            setValue("clienteNuevo.telefonos", telefonos);
          }

          // Copiar correos
          if (cliente.correos && cliente.correos.length > 0) {
            const correos = cliente.correos.map((c) => c.correo);
            setValue("clienteNuevo.correos", correos);
          }
        }
      }
    } else if (copiarDeCliente && clienteNuevo && watchedClienteNombre) {
      setValue("nombreContratista", watchedClienteNombre);
    }
  }, [
    copiarDeCliente,
    selectedClienteId,
    clientes,
    clienteNuevo,
    watchedClienteNombre,
    setValue,
  ]); // useEffect para cargar datos iniciales cuando se está editando
  useEffect(() => {
    if (initialData && clientes) {
      // Asegurar que los clientes estén cargados
      console.log(
        "[AdvancedBudgetForm] Loading initial data for editing:",
        initialData
      );
      console.log("[AdvancedBudgetForm] Available clientes:", clientes);
      console.log(
        "[AdvancedBudgetForm] initialData.detalles:",
        initialData.detalles
      );

      // Cargar datos del cliente
      if (initialData.clienteId) {
        console.log(
          "[AdvancedBudgetForm] Setting clienteId:",
          initialData.clienteId
        );
        const clienteExists = clientes.find(
          (c) => c.id === initialData.clienteId
        );
        if (clienteExists) {
          setSelectedClienteId(initialData.clienteId);
          setValue("clienteId", initialData.clienteId);
          setClienteNuevo(false);
        } else {
          console.warn(
            "[AdvancedBudgetForm] Cliente not found in list:",
            initialData.clienteId
          );
        }
      }
      // Cargar datos del contratista de la obra
      if (initialData.nombreContratista) {
        console.log(
          "[AdvancedBudgetForm] Setting nombreContratista from main field:",
          initialData.nombreContratista
        );
        setValue("nombreContratista", initialData.nombreContratista);
      } else if (initialData.obra?.contratista) {
        console.log(
          "[AdvancedBudgetForm] Setting nombreContratista from obra.contratista:",
          initialData.obra.contratista
        );
        setValue("nombreContratista", initialData.obra.contratista);
      }

      // Cargar datos de la obra
      if (initialData.descripcionObra) {
        console.log(
          "[AdvancedBudgetForm] Setting descripcionObra:",
          initialData.descripcionObra
        );
        setValue("descripcionObra", initialData.descripcionObra);
      }
      // Cargar alcance y dirección
      if (initialData.alcance) {
        console.log(
          "[AdvancedBudgetForm] Setting alcance:",
          initialData.alcance
        );
        setValue("alcance", initialData.alcance);
      }
      if (initialData.direccion) {
        console.log(
          "[AdvancedBudgetForm] Setting direccion:",
          initialData.direccion
        );
        setValue("direccion", initialData.direccion);
      }
      if (initialData.contactoResponsable) {
        console.log(
          "[AdvancedBudgetForm] Setting contactoResponsable:",
          initialData.contactoResponsable
        );
        setValue("contactoResponsable", initialData.contactoResponsable);
      }

      // Cargar área de la obra
      if (initialData.obra?.areaCodigo && areasJerarquicas) {
        console.log(
          "[AdvancedBudgetForm] Setting areaCodigo:",
          initialData.obra.areaCodigo
        );
        console.log("[AdvancedBudgetForm] Available areas:", areasJerarquicas);
        const areaExists = areasJerarquicas.find(
          (a) => a.codigo === initialData.obra.areaCodigo
        );
        if (areaExists) {
          setValue("areaCodigo", initialData.obra.areaCodigo);
          setSelectedArea(initialData.obra.areaCodigo);
        } else {
          console.warn(
            "[AdvancedBudgetForm] Area not found in list:",
            initialData.obra.areaCodigo
          );
        }
      }

      // Cargar anticipo
      if (initialData.manejaAnticipo !== undefined) {
        console.log(
          "[AdvancedBudgetForm] Setting manejaAnticipo:",
          initialData.manejaAnticipo
        );
        setValue("manejaAnticipo", initialData.manejaAnticipo);
      }

      // Cargar configuración de anticipo
      if (initialData.manejaAnticipo !== undefined) {
        setValue("manejaAnticipo", initialData.manejaAnticipo);
      }
      if (initialData.porcentajeAnticipo) {
        setValue("porcentajeAnticipo", initialData.porcentajeAnticipo);
      } // Cargar conceptos desde detalles
      if (initialData.detalles && initialData.detalles.length > 0) {
        console.log(
          "[AdvancedBudgetForm] Loading conceptos from detalles:",
          initialData.detalles
        );

        const conceptos = initialData.detalles.map((detalle: any) => {
          console.log("[AdvancedBudgetForm] Processing detalle:", detalle);
          const conceptoCodigo =
            detalle.concepto?.codigo || detalle.conceptoCodigo;
          console.log(
            "[AdvancedBudgetForm] Extracted conceptoCodigo:",
            conceptoCodigo
          );
          return {
            conceptoCodigo,
            cantidad: Number(detalle.cantidad) || 1,
            precioUnitario: Number(detalle.precioUnitario) || 0,
          };
        });
        // Extraer códigos de conceptos para la selección múltiple
        const codigosConceptos = conceptos
          .map((c: any) => c.conceptoCodigo)
          .filter((codigo: string) => codigo);
        console.log(
          "[AdvancedBudgetForm] Setting conceptosSeleccionados:",
          codigosConceptos
        );
        setConceptosSeleccionados(codigosConceptos);
        setValue("conceptosSeleccionados", codigosConceptos);

        console.log("[AdvancedBudgetForm] Setting conceptos:", conceptos);
        setValue("conceptos", conceptos);
      } else {
        console.log("[AdvancedBudgetForm] No detalles found or empty");
      }
    } else {
      console.log(
        "[AdvancedBudgetForm] No initialData provided or waiting for data"
      );
    }
  }, [initialData, setValue, setSelectedArea, clientes, areasJerarquicas]);

  // useEffect adicional para manejar la carga cuando todos los datos estén disponibles
  useEffect(() => {
    if (initialData && clientes && areasJerarquicas && !isEditMode) {
      console.log("[AdvancedBudgetForm] All data ready, setting edit mode");
      setIsEditMode(true);
    }
  }, [initialData, clientes, areasJerarquicas, isEditMode]);

  // Debug: Log de valores actuales de los selects
  useEffect(() => {
    if (isEditMode) {
      console.log("[DEBUG] Current form values:");
      console.log("- selectedClienteId:", selectedClienteId);
      console.log("- selectedArea:", selectedArea);
      console.log("- manejaAnticipo:", watch("manejaAnticipo"));
      console.log("- conceptos:", watch("conceptos"));
    }
  }, [selectedClienteId, selectedArea, watch, isEditMode]);
  // useEffect para limpiar el formulario cuando se sale del modo de edición
  useEffect(() => {
    if (!initialData) {
      console.log(
        "[AdvancedBudgetForm] No initialData - resetting form to defaults"
      );
      reset({
        conceptos: [],
        conceptosSeleccionados: [],
        clienteNuevo: {
          nombre: "",
          direccion: "",
          representanteLegal: "",
          contactoPagos: "",
          telefonoPagos: "",
          metodoPago: "EFECTIVO",
          correoFacturacion: "",
          telefonos: [],
          correos: [],
          datosFacturacion: {
            rfc: "",
            regimenFiscal: "PERSONAS_MORALES",
            usoCfdi: "GASTOS_EN_GENERAL",
            tipoPago: "PUE",
          },
        },
      });
      setSelectedClienteId(null);
      setSelectedArea("");
      setNavegacionJerarquica([]);
      setAreaActualConceptos(null);
      setConceptosSeleccionados([]);
      setBusquedaCliente("");
      setClienteNuevo(false);
      setCopiarDeCliente(false);
    }
  }, [initialData, reset]);

  // COMENTADO: Este efecto limpiaba los conceptos seleccionados cuando cambias de área
  // Ahora los conceptos se mantienen al navegar entre áreas
  /*
  // Efecto para limpiar conceptos cuando cambia la navegación jerárquica
  useEffect(() => {
    setConceptosSeleccionados([]);
    setValue("conceptosSeleccionados", []);
    setValue("conceptos", []);
    setBusquedaConcepto(""); // Limpiar búsqueda al cambiar navegación
  }, [areaActualConceptos, setValue]);
  */

  // Calcular totales
  const subtotal = watchedConceptos.reduce((sum, concepto) => {
    return sum + concepto.cantidad * concepto.precioUnitario;
  }, 0);

  const ivaMonto = subtotal * SYSTEM_CONSTANTS.IVA_RATE;
  const total = subtotal + ivaMonto;

  // Funciones para manejar selección múltiple de conceptos - Actualizadas para sistema jerárquico
  const handleConceptoToggle = (conceptoCodigo: string) => {
    const newSelection = conceptosSeleccionados.includes(conceptoCodigo)
      ? conceptosSeleccionados.filter((codigo) => codigo !== conceptoCodigo)
      : [...conceptosSeleccionados, conceptoCodigo];

    setConceptosSeleccionados(newSelection);
    setValue("conceptosSeleccionados", newSelection);

    // Actualizar la lista de conceptos en el formulario
    const currentConceptos = watch("conceptos") || [];

    if (conceptosSeleccionados.includes(conceptoCodigo)) {
      // Remover concepto
      const newConceptos = currentConceptos.filter(
        (c) => c.conceptoCodigo !== conceptoCodigo
      );
      setValue("conceptos", newConceptos);
    } else {
      // Agregar concepto
      const concepto = todosLosConceptos?.find(
        (c) => c.codigo === conceptoCodigo
      );
      if (concepto) {
        const newConcepto = {
          conceptoCodigo: concepto.codigo,
          cantidad: 1,
          precioUnitario: Number(concepto.precioUnitario),
        };
        setValue("conceptos", [...currentConceptos, newConcepto]);
      }
    }
  };

  const updateConceptoInForm = (
    conceptoCodigo: string,
    field: "cantidad" | "precioUnitario",
    value: number
  ) => {
    const currentConceptos = watch("conceptos") || [];
    const conceptoIndex = currentConceptos.findIndex(
      (c) => c.conceptoCodigo === conceptoCodigo
    );

    if (conceptoIndex !== -1) {
      const updatedConceptos = [...currentConceptos];
      updatedConceptos[conceptoIndex] = {
        ...updatedConceptos[conceptoIndex],
        [field]: value,
      };
      setValue("conceptos", updatedConceptos);
    }
  };

  // Función para filtrar conceptos según el modo de visualización y búsqueda
  const conceptosFiltrados = useMemo(() => {
    let conceptosBase: ConceptoJerarquico[] = [];

    // Determinar qué conceptos mostrar según el modo
    switch (modoVisualizacion) {
      case "navegacion":
        // Mostrar conceptos del área actual si hay una seleccionada
        conceptosBase = conceptosAreaActual || [];
        break;
      case "busqueda":
      case "todos":
        // Mostrar todos los conceptos disponibles
        conceptosBase = todosLosConceptos || [];
        break;
    }

    // Obtener conceptos ya seleccionados que no están en conceptosBase
    const conceptosSeleccionadosData = conceptosSeleccionados
      .map((codigo) => todosLosConceptos?.find((c) => c.codigo === codigo))
      .filter(Boolean) as ConceptoJerarquico[];

    // Combinar conceptos base con conceptos seleccionados (evitar duplicados)
    const conceptosCombinados = [...conceptosBase];
    conceptosSeleccionadosData.forEach((concepto) => {
      if (!conceptosCombinados.find((c) => c.codigo === concepto.codigo)) {
        conceptosCombinados.push(concepto);
      }
    });

    // Aplicar filtro de búsqueda si existe
    if (!busquedaConcepto.trim()) {
      return conceptosCombinados;
    }

    const terminoBusqueda = busquedaConcepto.toLowerCase();
    return conceptosCombinados.filter(
      (concepto) =>
        concepto.descripcion.toLowerCase().includes(terminoBusqueda) ||
        concepto.codigo.toLowerCase().includes(terminoBusqueda) ||
        concepto.unidad.toLowerCase().includes(terminoBusqueda)
    );
  }, [
    modoVisualizacion,
    conceptosAreaActual,
    todosLosConceptos,
    busquedaConcepto,
    conceptosSeleccionados,
  ]);

  // Función para filtrar clientes por búsqueda (ID, nombre, correo, teléfono)
  const clientesFiltrados =
    clientes?.filter((cliente) => {
      if (!busquedaCliente.trim()) return true;

      const terminoBusqueda = busquedaCliente.toLowerCase();

      // Buscar por ID
      if (cliente.id.toString().includes(terminoBusqueda)) return true;

      // Buscar por nombre
      if (cliente.nombre.toLowerCase().includes(terminoBusqueda)) return true;

      // Buscar por dirección
      if (
        cliente.direccion &&
        cliente.direccion.toLowerCase().includes(terminoBusqueda)
      )
        return true;

      // Buscar por teléfonos
      if (
        cliente.telefonos &&
        cliente.telefonos.some((t) =>
          t.telefono.toLowerCase().includes(terminoBusqueda)
        )
      )
        return true;

      // Buscar por correos
      if (
        cliente.correos &&
        cliente.correos.some((c) =>
          c.correo.toLowerCase().includes(terminoBusqueda)
        )
      )
        return true;

      return false;
    }) || [];

  const handleFormSubmit = async (data: BudgetFormData) => {
    console.log("[AdvancedBudgetForm] Submit button clicked");

    // Obtener todos los valores del formulario para debug
    const allFormValues = getValues();
    console.log("[AdvancedBudgetForm] All form values:", allFormValues);

    // Validación especial para el cliente: si hay clienteId, ignorar errores de clienteNuevo
    const hasClienteExistente = allFormValues.clienteId;
    console.log(
      "[AdvancedBudgetForm] Cliente existente ID:",
      hasClienteExistente
    );

    if (hasClienteExistente) {
      console.log(
        "[AdvancedBudgetForm] Has existing client - proceeding with submission ignoring clienteNuevo errors"
      );

      // Hay cliente existente, solo verificar errores que NO sean de clienteNuevo
      const filteredErrors = { ...errors };
      delete filteredErrors.clienteNuevo; // Ignorar errores de cliente nuevo

      const hasRelevantErrors = Object.keys(filteredErrors).length > 0;
      console.log(
        "[AdvancedBudgetForm] Relevant errors (excluding clienteNuevo):",
        filteredErrors
      );

      if (hasRelevantErrors) {
        console.log(
          "[AdvancedBudgetForm] Form has other validation errors, stopping submission"
        );
        toast({
          title: "Errores de validación",
          description:
            "Por favor corrija los errores en el formulario antes de continuar",
          variant: "destructive",
        });
        return;
      }

      // Cliente existente y no hay otros errores, proceder
      console.log(
        "[AdvancedBudgetForm] Proceeding with existing client, no blocking errors"
      );
    } else {
      // No hay cliente existente, verificar que haya datos de cliente nuevo válidos
      const hasClienteNuevo = allFormValues.clienteNuevo?.nombre?.trim();
      if (!hasClienteNuevo) {
        console.log(
          "[AdvancedBudgetForm] No existing client and no new client name - stopping submission"
        );
        toast({
          title: "Error de validación",
          description:
            "Debe seleccionar un cliente existente o crear uno nuevo con nombre",
          variant: "destructive",
        });
        return;
      }

      // Hay datos de cliente nuevo, verificar todos los errores
      const hasErrors = Object.keys(errors).length > 0;
      if (hasErrors) {
        console.log(
          "[AdvancedBudgetForm] Has validation errors - stopping submission:",
          errors
        );
        toast({
          title: "Errores de validación",
          description:
            "Por favor corrija los errores en el formulario antes de continuar",
          variant: "destructive",
        });
        return;
      }
    }

    console.log(
      "[AdvancedBudgetForm] handleFormSubmit proceeding with data:",
      data
    );

    console.log(
      "[AdvancedBudgetForm] Cliente nuevo teléfonos:",
      data.clienteNuevo?.telefonos
    );
    console.log(
      "[AdvancedBudgetForm] Cliente nuevo correos:",
      data.clienteNuevo?.correos
    );
    // Limpieza: remover conceptos sin código o con precios/cantidades inválidas antes de continuar
    const conceptosOriginales = data.conceptos || [];
    const conceptosFiltrados = conceptosOriginales.filter(
      (c) => c.conceptoCodigo && c.conceptoCodigo.trim().length > 0
    );
    if (conceptosFiltrados.length !== conceptosOriginales.length) {
      console.warn(
        "[AdvancedBudgetForm] Removidos conceptos vacíos antes de enviar:",
        conceptosOriginales.length - conceptosFiltrados.length
      );
    }
    // Normalizar valores numéricos mínimos
    const conceptosNormalizados = conceptosFiltrados.map((c) => ({
      ...c,
      cantidad: c.cantidad <= 0 ? 1 : c.cantidad,
      precioUnitario: c.precioUnitario < 0 ? 0 : c.precioUnitario,
    }));
    if (conceptosNormalizados.length !== data.conceptos.length) {
      setValue("conceptos", conceptosNormalizados, { shouldValidate: true });
      data = { ...data, conceptos: conceptosNormalizados };
    }
    // Sincronizar selección con conceptos existentes
    const codigosValidos = conceptosNormalizados.map((c) => c.conceptoCodigo);
    const seleccionDepurada = conceptosSeleccionados.filter((c) =>
      codigosValidos.includes(c)
    );
    if (seleccionDepurada.length !== conceptosSeleccionados.length) {
      console.warn(
        "[AdvancedBudgetForm] Ajustando conceptosSeleccionados para coincidir con conceptos válidos"
      );
      setConceptosSeleccionados(seleccionDepurada);
      setValue("conceptosSeleccionados", seleccionDepurada, {
        shouldValidate: true,
      });
      data = { ...data, conceptosSeleccionados: seleccionDepurada };
    }

    try {
      let clienteId = data.clienteId;

      // Si no hay cliente seleccionado pero hay datos de cliente nuevo, crearlo
      if (!clienteId && data.clienteNuevo?.nombre?.trim()) {
        console.log("[AdvancedBudgetForm] Creando cliente nuevo...");
        // Preparar los datos del cliente nuevo
        const clienteData = {
          nombre: data.clienteNuevo.nombre,
          direccion: data.clienteNuevo.direccion || "",
          representanteLegal: data.clienteNuevo.representanteLegal || "",
          contactoPagos: data.clienteNuevo.contactoPagos || "",
          telefonoPagos: data.clienteNuevo.telefonoPagos || "",
          metodoPago: data.clienteNuevo.metodoPago || "EFECTIVO",
          correoFacturacion: data.clienteNuevo.correoFacturacion || "",
          telefonos: (data.clienteNuevo.telefonos || [])
            .filter((t) => t && t.trim())
            .map((t) => ({ telefono: t.trim() })),
          correos: (data.clienteNuevo.correos || [])
            .filter((c) => c && c.trim())
            .map((c) => ({ correo: c.trim() })),
          datosFacturacion: data.clienteNuevo.datosFacturacion?.rfc
            ? {
                rfc: data.clienteNuevo.datosFacturacion.rfc,
                regimenFiscal:
                  data.clienteNuevo.datosFacturacion.regimenFiscal ||
                  "PERSONAS_MORALES",
                usoCfdi:
                  data.clienteNuevo.datosFacturacion.usoCfdi ||
                  "GASTOS_EN_GENERAL",
                tipoPago: data.clienteNuevo.datosFacturacion.tipoPago || "PUE",
              }
            : undefined,
        };

        const clienteResponse = await fetch("/api/clientes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(clienteData),
        });

        if (!clienteResponse.ok) {
          const errorData = await clienteResponse.json();
          console.error("Error al crear cliente:", errorData);

          // Extraer mensajes de error específicos
          let errorMessage = "Error al crear cliente";
          if (errorData.errors && errorData.errors.length > 0) {
            errorMessage = errorData.errors
              .map((err: any) => err.message)
              .join(", ");
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }

          throw new Error(errorMessage);
        }

        const nuevoCliente = await clienteResponse.json();
        clienteId = nuevoCliente.id;
      }

      // Crear presupuesto con estructura normalizada
      const presupuestoData = {
        clienteId,
        // Solo enviar areaCodigo si se quiere crear una obra automáticamente
        ...(data.areaCodigo && { areaCodigo: data.areaCodigo }),

        // Campos de presupuesto (estructura normalizada)
        iva: SYSTEM_CONSTANTS.IVA_RATE / 100, // Convertir a decimal (0.16)
        subtotal,
        ivaMonto,
        total,
        manejaAnticipo: data.manejaAnticipo,
        porcentajeAnticipo: data.porcentajeAnticipo,
        estado: "borrador",

        // Campos que van a la obra (si se crea automáticamente)
        descripcionObra: data.descripcionObra,
        nombreContratista: data.nombreContratista,
        alcance: data.alcance,
        direccion: data.direccion,
        contactoResponsable: data.contactoResponsable,

        // Conceptos en el formato que espera el backend
        conceptos: data.conceptos.map((concepto) => ({
          conceptoCodigo: concepto.conceptoCodigo, // Mantener coherencia con el backend
          cantidad: concepto.cantidad,
          precioUnitario: concepto.precioUnitario,
          subtotal: concepto.cantidad * concepto.precioUnitario,
        })),
      };

      console.log(
        "[AdvancedBudgetForm] Enviando presupuesto:",
        presupuestoData
      );
      onSubmit(presupuestoData);

      // Mostrar mensaje de éxito
      toast({
        title: "Presupuesto creado",
        description: "El presupuesto se ha creado correctamente.",
      });
    } catch (error: any) {
      console.error("Error al procesar formulario:", error);

      // Mostrar mensaje de error específico
      let errorMessage = "Error al crear el presupuesto";
      if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  return (
    <>
      <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
        {/* Header compacto y fijo */}
        <div
          className="sticky top-0 z-50 border-b"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#E7F2E0",
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold"
                  style={{ backgroundColor: "#E7F2E0", color: "#68A53B" }}
                >
                  📄
                </div>
                <div>
                  <h1
                    className="text-xl font-bold"
                    style={{ color: "#2C3E50" }}
                  >
                    {isEditMode ? "Editar Presupuesto" : "Nuevo Presupuesto"}
                  </h1>
                  {isEditMode && (
                    <p className="text-sm" style={{ color: "#6C757D" }}>
                      ID: {initialData?.id}
                    </p>
                  )}
                </div>
              </div>
              {!isEditMode && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm" style={{ color: "#6C757D" }}>
                    Paso {currentStep} de 5
                  </span>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: "#68A53B" }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          {/* Navegación horizontal más compacta */}
          {!isEditMode && (
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-8">
                {[
                  { step: 1, title: "Cliente" },
                  { step: 2, title: "Contratista" },
                  { step: 3, title: "Obra" },
                  { step: 4, title: "Conceptos" },
                  { step: 5, title: "Finalizar" },
                ].map(({ step, title }, index) => (
                  <div key={step} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(step)}
                      className={`flex flex-col items-center space-y-2 p-3 rounded-lg transition-all duration-200 ${
                        currentStep === step ? "transform scale-105" : ""
                      }`}
                      style={{
                        backgroundColor:
                          currentStep === step ? "#E7F2E0" : "transparent",
                      }}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                          currentStep === step
                            ? "border-[#68A53B] shadow-md"
                            : currentStep > step
                            ? "border-[#68A53B]"
                            : "border-[#6C757D]"
                        }`}
                        style={{
                          backgroundColor:
                            currentStep === step
                              ? "#68A53B"
                              : currentStep > step
                              ? "#E7F2E0"
                              : "#FFFFFF",
                          color:
                            currentStep === step
                              ? "#FFFFFF"
                              : currentStep > step
                              ? "#68A53B"
                              : "#6C757D",
                        }}
                      >
                        {step}
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          currentStep === step
                            ? "text-[#68A53B]"
                            : "text-[#6C757D]"
                        }`}
                      >
                        {title}
                      </span>
                    </button>
                    {index < 4 && (
                      <div
                        className="w-12 h-0.5 mx-2"
                        style={{
                          backgroundColor:
                            currentStep > step ? "#68A53B" : "#E7F2E0",
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Sección Cliente - diseño horizontal */}
            {(isEditMode || currentStep === 1) && (
              <div
                className="rounded-xl border"
                style={{
                  borderColor: "#E7F2E0",
                  backgroundColor: "#FFFFFF",
                }}
              >
                {/* Header de sección más compacto */}
                <div
                  className="flex items-center justify-between px-6 py-4 border-b"
                  style={{ borderColor: "#F8F9FA" }}
                >
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: "#2C3E50" }}
                  >
                    Cliente
                  </h3>
                  {!isEditMode && (
                    <span className="text-sm" style={{ color: "#6C757D" }}>
                      1/5
                    </span>
                  )}
                </div>

                <div className="p-6">
                  {/* Tabs horizontales en lugar de radio buttons */}
                  <div
                    className="flex rounded-lg p-1 mb-6"
                    style={{ backgroundColor: "#F8F9FA" }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setClienteNuevo(false);
                        setBusquedaCliente("");
                      }}
                      className={`flex-1 py-2 px-4 rounded-md transition-all font-medium ${
                        !clienteNuevo ? "shadow-sm" : ""
                      }`}
                      style={{
                        backgroundColor: !clienteNuevo
                          ? "#FFFFFF"
                          : "transparent",
                        color: !clienteNuevo ? "#2C3E50" : "#6C757D",
                      }}
                    >
                      Cliente Existente
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setClienteNuevo(true);
                        setSelectedClienteId(null);
                        setBusquedaCliente("");
                      }}
                      className={`flex-1 py-2 px-4 rounded-md transition-all font-medium ${
                        clienteNuevo ? "shadow-sm" : ""
                      }`}
                      style={{
                        backgroundColor: clienteNuevo
                          ? "#FFFFFF"
                          : "transparent",
                        color: clienteNuevo ? "#2C3E50" : "#6C757D",
                      }}
                    >
                      Cliente Nuevo
                    </button>
                  </div>

                  {!clienteNuevo ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Columna izquierda - Búsqueda */}
                      <div className="space-y-4">
                        <label
                          className="text-sm font-medium"
                          style={{ color: "#2C3E50" }}
                        >
                          Buscar Cliente
                        </label>
                        <div className="relative">
                          <Input
                            placeholder="ID, nombre, correo o teléfono..."
                            value={busquedaCliente}
                            onChange={(e) => setBusquedaCliente(e.target.value)}
                            className="h-10 border rounded-lg"
                            style={{
                              borderColor: "#E7F2E0",
                              backgroundColor: "#FFFFFF",
                            }}
                          />
                        </div>

                        {busquedaCliente && (
                          <div
                            className="text-xs p-2 rounded"
                            style={{
                              backgroundColor: "#E7F2E0",
                              color: "#4F7D2C",
                            }}
                          >
                            {clientesFiltrados.length > 0
                              ? `${clientesFiltrados.length} encontrado(s)`
                              : "Sin resultados"}
                          </div>
                        )}
                      </div>

                      {/* Columna derecha - Selector */}
                      <div className="space-y-4">
                        <label
                          className="text-sm font-medium"
                          style={{ color: "#2C3E50" }}
                        >
                          Seleccionar Cliente
                        </label>
                        <Controller
                          name="clienteId"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value?.toString() || ""}
                              onValueChange={(value) => {
                                const id = parseInt(value);
                                field.onChange(id);
                                setSelectedClienteId(id);
                              }}
                            >
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Elegir cliente..." />
                              </SelectTrigger>
                              <SelectContent className="max-h-60">
                                {clientesFiltrados.length > 0 ? (
                                  clientesFiltrados.map((cliente) => (
                                    <SelectItem
                                      key={cliente.id}
                                      value={cliente.id.toString()}
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <span className="font-medium">
                                          {cliente.nombre}
                                        </span>
                                        <span
                                          className="text-xs px-2 py-1 rounded ml-2"
                                          style={{
                                            backgroundColor: "#E7F2E0",
                                            color: "#4F7D2C",
                                          }}
                                        >
                                          {cliente.id}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="none" disabled>
                                    Sin clientes disponibles
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          )}
                        />

                        {errors.clienteId && (
                          <p className="text-xs" style={{ color: "#C0392B" }}>
                            {errors.clienteId.message}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Formulario de nuevo cliente */}
                      <div className="text-center">
                        <h3
                          className="text-lg font-semibold"
                          style={{ color: "#2C3E50" }}
                        >
                          Registrar Nuevo Cliente
                        </h3>
                        <p className="text-sm" style={{ color: "#6C757D" }}>
                          Complete la información básica del cliente
                        </p>
                      </div>

                      {/* Información Básica */}
                      <div className="space-y-4">
                        <h4 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-2">
                          Información Básica
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label
                              className="text-sm font-medium"
                              style={{ color: "#2C3E50" }}
                            >
                              Nombre o Razón Social *
                            </label>
                            <Input
                              placeholder="Nombre del cliente o empresa"
                              {...register("clienteNuevo.nombre")}
                              className="h-10"
                              style={{ borderColor: "#E7F2E0" }}
                            />
                            {errors.clienteNuevo?.nombre && (
                              <p
                                className="text-xs"
                                style={{ color: "#C0392B" }}
                              >
                                {errors.clienteNuevo.nombre.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label
                              className="text-sm font-medium"
                              style={{ color: "#2C3E50" }}
                            >
                              Dirección Fiscal o de Contacto
                            </label>
                            <Input
                              placeholder="Dirección completa (opcional)"
                              {...register("clienteNuevo.direccion")}
                              className="h-10"
                              style={{ borderColor: "#E7F2E0" }}
                            />
                          </div>

                          <div className="space-y-2">
                            <label
                              className="text-sm font-medium"
                              style={{ color: "#2C3E50" }}
                            >
                              Representante Legal
                            </label>
                            <Input
                              placeholder="Solo si es empresa (opcional)"
                              {...register("clienteNuevo.representanteLegal")}
                              className="h-10"
                              style={{ borderColor: "#E7F2E0" }}
                            />
                          </div>

                          <div className="space-y-2">
                            <label
                              className="text-sm font-medium"
                              style={{ color: "#2C3E50" }}
                            >
                              Método de Pago
                            </label>
                            <Select
                              value={
                                watch("clienteNuevo.metodoPago") || "EFECTIVO"
                              }
                              onValueChange={(value: any) =>
                                setValue("clienteNuevo.metodoPago", value)
                              }
                            >
                              <SelectTrigger
                                className="h-10"
                                style={{ borderColor: "#E7F2E0" }}
                              >
                                <SelectValue placeholder="Seleccionar método de pago" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="EFECTIVO">
                                  Efectivo
                                </SelectItem>
                                <SelectItem value="TRANSFERENCIA">
                                  Transferencia
                                </SelectItem>
                                <SelectItem value="CHEQUE">Cheque</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Contacto para Pagos */}
                      <div className="space-y-4">
                        <h4 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-2">
                          Contacto para Seguimiento de Pagos
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label
                              className="text-sm font-medium"
                              style={{ color: "#2C3E50" }}
                            >
                              Nombre de Contacto
                            </label>
                            <Input
                              placeholder="Persona responsable de pagos (opcional)"
                              {...register("clienteNuevo.contactoPagos")}
                              className="h-10"
                              style={{ borderColor: "#E7F2E0" }}
                            />
                          </div>

                          <div className="space-y-2">
                            <label
                              className="text-sm font-medium"
                              style={{ color: "#2C3E50" }}
                            >
                              Teléfono de Contacto
                            </label>
                            <Input
                              placeholder="4771234567 (10 dígitos, opcional)"
                              {...register("clienteNuevo.telefonoPagos")}
                              className="h-10"
                              style={{ borderColor: "#E7F2E0" }}
                              maxLength={10}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                setValue("clienteNuevo.telefonoPagos", value);
                              }}
                            />
                            {errors.clienteNuevo?.telefonoPagos && (
                              <p
                                className="text-xs"
                                style={{ color: "#C0392B" }}
                              >
                                {errors.clienteNuevo.telefonoPagos.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <label
                              className="text-sm font-medium"
                              style={{ color: "#2C3E50" }}
                            >
                              Correo para Facturas
                            </label>
                            <Input
                              type="email"
                              placeholder="facturacion@ejemplo.com (opcional)"
                              {...register("clienteNuevo.correoFacturacion")}
                              className="h-10"
                              style={{ borderColor: "#E7F2E0" }}
                            />
                            {errors.clienteNuevo?.correoFacturacion && (
                              <p
                                className="text-xs"
                                style={{ color: "#C0392B" }}
                              >
                                {errors.clienteNuevo.correoFacturacion.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Teléfonos y Correos Adicionales */}
                      <div className="space-y-4">
                        <h4 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-2">
                          Contactos Adicionales (Opcional)
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label
                              className="text-sm font-medium"
                              style={{ color: "#2C3E50" }}
                            >
                              Teléfono Adicional
                            </label>
                            <Input
                              placeholder="4771234567 (10 dígitos, opcional)"
                              {...register("clienteNuevo.telefonos.0")}
                              className="h-10"
                              style={{ borderColor: "#E7F2E0" }}
                              maxLength={10}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                setValue("clienteNuevo.telefonos.0", value);
                              }}
                            />
                          </div>

                          <div className="space-y-2">
                            <label
                              className="text-sm font-medium"
                              style={{ color: "#2C3E50" }}
                            >
                              Correo Adicional
                            </label>
                            <Input
                              type="email"
                              placeholder="contacto@ejemplo.com (opcional)"
                              {...register("clienteNuevo.correos.0")}
                              className="h-10"
                              style={{ borderColor: "#E7F2E0" }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Datos de Facturación */}
                      <div className="space-y-4">
                        <h4 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-2">
                          Datos de Facturación (Opcional)
                        </h4>
                        <p className="text-xs text-gray-600">
                          Solo complete si requiere facturar este presupuesto
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label
                              className="text-sm font-medium"
                              style={{ color: "#2C3E50" }}
                            >
                              RFC
                            </label>
                            <Input
                              placeholder="ABC123456789 (opcional)"
                              {...register("clienteNuevo.datosFacturacion.rfc")}
                              className="h-10"
                              style={{ borderColor: "#E7F2E0" }}
                              maxLength={13}
                              onChange={(e) => {
                                const value = e.target.value.toUpperCase();
                                setValue(
                                  "clienteNuevo.datosFacturacion.rfc",
                                  value
                                );
                              }}
                            />
                            {errors.clienteNuevo?.datosFacturacion?.rfc && (
                              <p
                                className="text-xs"
                                style={{ color: "#C0392B" }}
                              >
                                {
                                  errors.clienteNuevo.datosFacturacion.rfc
                                    .message
                                }
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label
                              className="text-sm font-medium"
                              style={{ color: "#2C3E50" }}
                            >
                              Régimen Fiscal
                            </label>
                            <Select
                              value={
                                watch(
                                  "clienteNuevo.datosFacturacion.regimenFiscal"
                                ) || "PERSONAS_MORALES"
                              }
                              onValueChange={(value: any) =>
                                setValue(
                                  "clienteNuevo.datosFacturacion.regimenFiscal",
                                  value
                                )
                              }
                            >
                              <SelectTrigger
                                className="h-10"
                                style={{ borderColor: "#E7F2E0" }}
                              >
                                <SelectValue placeholder="Seleccionar régimen fiscal" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PERSONAS_FISICAS_CON_ACTIVIDADES_EMPRESARIALES">
                                  Personas Físicas con Actividades Empresariales
                                </SelectItem>
                                <SelectItem value="PERSONAS_MORALES">
                                  Personas Morales
                                </SelectItem>
                                <SelectItem value="REGIMEN_SIMPLIFICADO_DE_CONFIANZA">
                                  Régimen Simplificado de Confianza
                                </SelectItem>
                                <SelectItem value="PERSONAS_FISICAS_CON_ACTIVIDADES_PROFESIONALES">
                                  Personas Físicas con Actividades Profesionales
                                </SelectItem>
                                <SelectItem value="REGIMEN_DE_INCORPORACION_FISCAL">
                                  Régimen de Incorporación Fiscal
                                </SelectItem>
                                <SelectItem value="OTROS">Otros</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label
                              className="text-sm font-medium"
                              style={{ color: "#2C3E50" }}
                            >
                              Uso de CFDI
                            </label>
                            <Select
                              value={
                                watch(
                                  "clienteNuevo.datosFacturacion.usoCfdi"
                                ) || "GASTOS_EN_GENERAL"
                              }
                              onValueChange={(value: any) =>
                                setValue(
                                  "clienteNuevo.datosFacturacion.usoCfdi",
                                  value
                                )
                              }
                            >
                              <SelectTrigger
                                className="h-10"
                                style={{ borderColor: "#E7F2E0" }}
                              >
                                <SelectValue placeholder="Seleccionar uso de CFDI" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="GASTOS_EN_GENERAL">
                                  Gastos en General
                                </SelectItem>
                                <SelectItem value="EQUIPOS_DE_COMPUTO">
                                  Equipos de Cómputo
                                </SelectItem>
                                <SelectItem value="HONORARIOS_MEDICOS">
                                  Honorarios Médicos
                                </SelectItem>
                                <SelectItem value="GASTOS_MEDICOS">
                                  Gastos Médicos
                                </SelectItem>
                                <SelectItem value="INTERESES_REALES">
                                  Intereses Reales
                                </SelectItem>
                                <SelectItem value="DONACIONES">
                                  Donaciones
                                </SelectItem>
                                <SelectItem value="OTROS">Otros</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label
                              className="text-sm font-medium"
                              style={{ color: "#2C3E50" }}
                            >
                              Tipo de Pago
                            </label>
                            <Select
                              value={
                                watch(
                                  "clienteNuevo.datosFacturacion.tipoPago"
                                ) || "PUE"
                              }
                              onValueChange={(value: any) =>
                                setValue(
                                  "clienteNuevo.datosFacturacion.tipoPago",
                                  value
                                )
                              }
                            >
                              <SelectTrigger
                                className="h-10"
                                style={{ borderColor: "#E7F2E0" }}
                              >
                                <SelectValue placeholder="Seleccionar tipo de pago" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PUE">
                                  PUE - Pago en Una Sola Exhibición
                                </SelectItem>
                                <SelectItem value="PPD">
                                  PPD - Pago en Parcialidades o Diferido
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sección Contratista */}
            {(isEditMode || currentStep === 2) && (
              <Card
                className="border shadow-sm"
                style={{
                  borderColor: "#F8F9FA",
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
                }}
              >
                <CardHeader
                  className="border-b"
                  style={{
                    borderColor: "#F8F9FA",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <CardTitle className="flex items-center justify-between text-xl">
                    <span style={{ color: "#2C3E50" }}>Contratista</span>
                    {!isEditMode && (
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#6C757D" }}
                      >
                        Paso 2 de 5
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  {/* Opción de copiar del cliente - empresarial */}
                  <div
                    className="p-6 rounded-lg border"
                    style={{
                      backgroundColor: "#E7F2E0",
                      borderColor: "#68A53B",
                    }}
                  >
                    <Label className="flex items-center space-x-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={copiarDeCliente}
                        onChange={(e) => setCopiarDeCliente(e.target.checked)}
                        className="w-5 h-5 rounded focus:ring-2 focus:ring-[#68A53B] focus:ring-offset-2"
                        style={{
                          accentColor: "#68A53B",
                        }}
                      />
                      <div className="flex items-center space-x-3">
                        <span
                          className="text-lg font-semibold"
                          style={{ color: "#2C3E50" }}
                        >
                          Copiar nombre del cliente
                        </span>
                        <span
                          className="text-sm px-3 py-1 rounded-full font-medium"
                          style={{
                            color: "#4F7D2C",
                            backgroundColor: "#FFFFFF",
                          }}
                        >
                          Automático
                        </span>
                      </div>
                    </Label>
                  </div>

                  <div className="space-y-4">
                    <Label
                      htmlFor="nombreContratista"
                      className="text-base font-semibold"
                      style={{ color: "#2C3E50" }}
                    >
                      Nombre del Contratista *
                    </Label>
                    <Input
                      id="nombreContratista"
                      placeholder="Nombre completo del contratista"
                      {...register("nombreContratista")}
                      disabled={copiarDeCliente}
                      className={`h-12 text-base border-2 rounded-lg transition-all duration-200 ${
                        copiarDeCliente ? "cursor-not-allowed" : ""
                      }`}
                      style={{
                        borderColor: copiarDeCliente ? "#F8F9FA" : "#F8F9FA",
                        backgroundColor: copiarDeCliente
                          ? "#F8F9FA"
                          : "#FFFFFF",
                        color: copiarDeCliente ? "#6C757D" : "#2C3E50",
                      }}
                      onFocus={(e) => {
                        if (!copiarDeCliente) {
                          e.target.style.borderColor = "#68A53B";
                          e.target.style.boxShadow =
                            "0 0 0 3px rgba(104, 165, 59, 0.1)";
                        }
                      }}
                      onBlur={(e) => {
                        if (!copiarDeCliente) {
                          e.target.style.borderColor = "#F8F9FA";
                          e.target.style.boxShadow = "none";
                        }
                      }}
                    />
                    {errors.nombreContratista && (
                      <p className="text-sm" style={{ color: "#C0392B" }}>
                        {errors.nombreContratista.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sección Detalles de Obra */}
            {(isEditMode || currentStep === 3) && (
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-white">
                  <CardTitle className="flex items-center justify-between text-lg text-gray-900">
                    <span>Detalles de la Obra</span>
                    {!isEditMode && (
                      <span className="text-sm text-gray-500">Paso 3 de 5</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="descripcionObra"
                      className="text-sm font-medium text-gray-700"
                    >
                      Descripción de la Obra *
                    </Label>
                    <Textarea
                      id="descripcionObra"
                      placeholder="Describe detalladamente la obra a realizar..."
                      rows={4}
                      {...register("descripcionObra")}
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500 resize-none"
                    />
                    {errors.descripcionObra && (
                      <p className="text-sm text-red-600">
                        {errors.descripcionObra.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="alcance"
                      className="text-sm font-medium text-gray-700"
                    >
                      Alcance del Proyecto *
                    </Label>
                    <Textarea
                      id="alcance"
                      placeholder="Detalla el alcance específico del proyecto, incluye todos los trabajos que se realizarán..."
                      rows={3}
                      {...register("alcance")}
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500 resize-none"
                    />
                    {errors.alcance && (
                      <p className="text-sm text-red-600">
                        {errors.alcance.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="direccion"
                        className="text-sm font-medium text-gray-700"
                      >
                        Ubicación de la obra *
                      </Label>
                      <Input
                        id="direccion"
                        placeholder="Dirección completa donde se realizará la obra"
                        {...register("direccion")}
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                      {errors.direccion && (
                        <p className="text-sm text-red-600">
                          {errors.direccion.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="contactoResponsable"
                        className="text-sm font-medium text-gray-700"
                      >
                        Contacto Responsable *
                      </Label>
                      <Input
                        id="contactoResponsable"
                        placeholder="Nombre del responsable en obra"
                        {...register("contactoResponsable")}
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sección Conceptos */}
            {(isEditMode || currentStep === 4) && (
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-white">
                  <CardTitle className="flex items-center space-x-2 text-lg text-gray-900">
                    <span>Conceptos del Presupuesto</span>
                    {!isEditMode && (
                      <span className="ml-auto text-sm text-gray-500">
                        Paso 4 de 5
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  {" "}
                  {/* Selección de área */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="areaCodigo"
                      className="text-lg font-semibold flex items-center space-x-2"
                      style={{ color: "#2C3E50" }}
                    >
                      <Building
                        className="h-5 w-5"
                        style={{ color: "#F39C12" }}
                      />
                      <span>Área de Obra *</span>
                    </Label>
                    <Select
                      value={selectedArea}
                      onValueChange={(value) => {
                        setSelectedArea(value);
                        setValue("areaCodigo", value);
                      }}
                    >
                      <SelectTrigger
                        className="h-12 border-2 rounded-xl shadow-sm transition-all"
                        style={{
                          borderColor: "#6C757D",
                          backgroundColor: "#FFFFFF",
                        }}
                      >
                        <SelectValue placeholder="Seleccionar área para código de obra..." />
                      </SelectTrigger>
                      <SelectContent
                        className="rounded-xl border-2 shadow-xl"
                        style={{ backgroundColor: "#FFFFFF" }}
                      >
                        {/* Mostrar las áreas de presupuesto */}
                        {areasPresupuesto?.map((area) => (
                          <SelectItem
                            key={area.codigo}
                            value={area.codigo}
                            className="py-3 px-4 hover:bg-amber-50 focus:bg-amber-50 rounded-lg m-1 transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: "#F39C12" }}
                              ></div>
                              <span
                                className="font-medium"
                                style={{ color: "#2C3E50" }}
                              >
                                {area.nombre}
                              </span>
                              <span
                                className="text-xs px-2 py-1 rounded"
                                style={{
                                  backgroundColor: "#E7F2E0",
                                  color: "#4F7D2C",
                                }}
                              >
                                {area.codigo}
                              </span>
                            </div>
                          </SelectItem>
                        )) || (
                          <SelectItem value="loading" disabled>
                            Cargando áreas...
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.areaCodigo && (
                      <div
                        className="flex items-center space-x-2 p-3 rounded-lg border"
                        style={{
                          backgroundColor: "#FEE2E2",
                          borderColor: "#F87171",
                        }}
                      >
                        <span className="text-lg" style={{ color: "#C0392B" }}>
                          ⚠️
                        </span>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "#C0392B" }}
                        >
                          {errors.areaCodigo.message ||
                            "Debe seleccionar un área válida"}
                        </p>
                      </div>
                    )}
                  </div>
                  <Separator
                    style={{ backgroundColor: "#E7F2E0", height: "2px" }}
                  />
                  {/* Navegación Jerárquica para Selección de Conceptos */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <h4
                          className="text-lg font-semibold"
                          style={{ color: "#2C3E50" }}
                        >
                          Navegación por Especialidades
                        </h4>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Haga clic en ⚡ para cargar conceptos directamente
                        </span>
                      </div>
                      {/* Botón para resetear navegación */}
                      {navegacionJerarquica.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setNavegacionJerarquica([]);
                            setAreaActualConceptos(null);
                            setBusquedaConcepto(""); // Solo limpiar búsqueda, mantener conceptos seleccionados
                          }}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          🏠 Inicio
                        </Button>
                      )}
                    </div>
                    {/* Breadcrumb de navegación */}
                    {navegacionJerarquica.length > 0 && (
                      <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <span className="text-sm font-medium text-blue-700">
                          Ruta:
                        </span>
                        {navegacionJerarquica.map((areaId, index) => {
                          const area = areasJerarquicas?.find(
                            (a) => a.id === areaId
                          );
                          return (
                            <div
                              key={areaId}
                              className="flex items-center space-x-2"
                            >
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-blue-600 hover:bg-blue-100"
                                onClick={() => retrocederNivel(index)}
                              >
                                {area?.nombre}
                              </Button>
                              {index < navegacionJerarquica.length - 1 && (
                                <span className="text-blue-400">›</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Niveles de navegación */}
                    {(() => {
                      const nivelActual = navegacionJerarquica.length;
                      const padreId =
                        navegacionJerarquica[nivelActual - 1] || null;
                      const areasDisponibles = obtenerAreasDeNivel(
                        nivelActual,
                        padreId
                      );
                      if (areasDisponibles.length === 0 && nivelActual === 0) {
                        return (
                          <div className="text-center p-8 text-gray-500">
                            <Building className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p>No hay áreas jerárquicas disponibles</p>
                          </div>
                        );
                      }
                      if (
                        areasDisponibles.length === 0 &&
                        areaActualConceptos
                      ) {
                        return (
                          <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
                            <div className="text-green-700">
                              <Building className="h-8 w-8 mx-auto mb-2" />
                              <p className="font-medium">
                                Área seleccionada para conceptos
                              </p>
                              <p className="text-sm text-green-600">
                                {
                                  areasJerarquicas?.find(
                                    (a) => a.id === areaActualConceptos
                                  )?.nombre
                                }
                              </p>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {areasDisponibles.map((area) => {
                              const numConceptos =
                                areaConceptos.get(area.id) || 0;
                              const tieneConceptos = numConceptos > 0;
                              const tieneHijos = areasJerarquicas?.some(
                                (a) => a.padreId === area.id
                              );

                              return (
                                <div key={area.id} className="relative">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="h-auto p-4 border-2 hover:border-blue-300 hover:bg-blue-50 text-left w-full"
                                    onClick={() =>
                                      navegarANivel(area.id, nivelActual)
                                    }
                                  >
                                    <div className="w-full">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <div
                                          className="w-3 h-3 rounded-full"
                                          style={{
                                            backgroundColor:
                                              area.nivel === 1
                                                ? "#F39C12"
                                                : "#3498DB",
                                          }}
                                        ></div>
                                        <span className="font-medium text-gray-900">
                                          {area.nombre}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">
                                          Nivel {area.nivel}
                                        </span>
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                          {area.codigo}
                                        </span>
                                      </div>
                                      {tieneConceptos && (
                                        <div className="mt-2 text-xs text-green-600 font-medium">
                                          📋 {numConceptos} concepto
                                          {numConceptos !== 1 ? "s" : ""}
                                        </div>
                                      )}
                                      {tieneHijos && (
                                        <div className="mt-1 text-xs text-blue-600">
                                          📁 Tiene subcategorías
                                        </div>
                                      )}
                                    </div>
                                  </Button>

                                  {/* Botón para cargar conceptos si el área tiene conceptos */}
                                  {tieneConceptos && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      className="absolute top-2 right-2 h-6 w-6 p-0 bg-green-500 hover:bg-green-600 text-white"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        cargarConceptosDeArea(area.id);
                                      }}
                                      title={`Cargar ${numConceptos} concepto${
                                        numConceptos !== 1 ? "s" : ""
                                      }`}
                                    >
                                      ⚡
                                    </Button>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Información adicional */}
                          {areaActualConceptos && (
                            <div className="space-y-2">
                              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="text-green-700 text-sm">
                                  📋 <strong>Conceptos cargados de:</strong>{" "}
                                  {
                                    areasJerarquicas?.find(
                                      (a) => a.id === areaActualConceptos
                                    )?.nombre
                                  }
                                </div>
                              </div>

                              {/* Información sobre conceptos de otras áreas */}
                              {conceptosSeleccionados.length > 0 && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                  <div className="text-blue-700 text-sm">
                                    💡 <strong>Tip:</strong> Los conceptos
                                    marcados con "📍 Otra área" fueron
                                    seleccionados de especialidades diferentes y
                                    se mantienen visibles aunque cambies de
                                    área.
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  <Separator
                    style={{ backgroundColor: "#E7F2E0", height: "2px" }}
                  />
                  {/* Lista de conceptos disponibles */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4
                        className="font-semibold text-lg"
                        style={{ color: "#2C3E50" }}
                      >
                        Conceptos Disponibles
                      </h4>
                      <div className="flex items-center space-x-2">
                        <div
                          className="px-3 py-1 rounded-full text-sm font-medium text-white"
                          style={{ backgroundColor: "#68A53B" }}
                        >
                          {conceptosSeleccionados.length} seleccionados
                        </div>
                        {(() => {
                          const conceptosDeOtrasAreas =
                            conceptosSeleccionados.filter(
                              (codigo) =>
                                !conceptosAreaActual?.some(
                                  (c) => c.codigo === codigo
                                )
                            ).length;

                          return (
                            conceptosDeOtrasAreas > 0 && (
                              <div
                                className="px-2 py-1 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: "#3498DB" }}
                                title="Conceptos seleccionados de otras áreas"
                              >
                                📍 {conceptosDeOtrasAreas} de otras áreas
                              </div>
                            )
                          );
                        })()}

                        {/* Botón para limpiar conceptos seleccionados */}
                        {conceptosSeleccionados.length > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setConceptosSeleccionados([]);
                              setValue("conceptosSeleccionados", []);
                              setValue("conceptos", []);
                            }}
                            className="h-7 px-2 text-xs border border-red-300 hover:bg-red-50 text-red-600"
                            title="Limpiar todos los conceptos seleccionados"
                          >
                            🗑️ Limpiar
                          </Button>
                        )}

                        <span className="text-sm" style={{ color: "#6C757D" }}>
                          de {conceptosFiltrados.length} mostrados
                          {busquedaConcepto &&
                            ` (${todosLosConceptos?.length || 0} total)`}
                        </span>
                      </div>
                    </div>

                    {/* Controles de modo de visualización */}
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        Ver:
                      </span>
                      <div className="flex space-x-1">
                        <Button
                          type="button"
                          variant={
                            modoVisualizacion === "navegacion"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setModoVisualizacion("navegacion")}
                          className="h-8 px-3"
                        >
                          Por Área
                        </Button>
                        <Button
                          type="button"
                          variant={
                            modoVisualizacion === "busqueda"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => {
                            setModoVisualizacion("busqueda");
                            setBusquedaConcepto(""); // Limpiar búsqueda al cambiar modo
                          }}
                          className="h-8 px-3"
                        >
                          Búsqueda
                        </Button>
                        <Button
                          type="button"
                          variant={
                            modoVisualizacion === "todos"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setModoVisualizacion("todos")}
                          className="h-8 px-3"
                        >
                          Todos
                        </Button>
                      </div>
                    </div>

                    {/* Campo de búsqueda */}
                    {(modoVisualizacion === "busqueda" ||
                      modoVisualizacion === "todos") &&
                      todosLosConceptos &&
                      todosLosConceptos.length > 0 && (
                        <div className="relative">
                          <div
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lg transition-colors"
                            style={{
                              color: busquedaConcepto ? "#F39C12" : "#6C757D",
                            }}
                          >
                            🔍
                          </div>
                          <Input
                            type="text"
                            placeholder="Buscar conceptos por descripción, código o unidad..."
                            value={busquedaConcepto}
                            onChange={(e) =>
                              setBusquedaConcepto(e.target.value)
                            }
                            className="pl-12 pr-12 h-12 text-lg border-2 rounded-xl shadow-sm transition-all"
                            style={{
                              borderColor: busquedaConcepto
                                ? "#F39C12"
                                : "#6C757D",
                              backgroundColor: "#FFFFFF",
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = "#F39C12";
                              e.target.style.boxShadow =
                                "0 0 0 3px rgba(243, 156, 18, 0.1)";
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = busquedaConcepto
                                ? "#F39C12"
                                : "#6C757D";
                              e.target.style.boxShadow = "none";
                            }}
                          />
                          {busquedaConcepto && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full transition-colors"
                              style={{ backgroundColor: "transparent" }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#FEE2E2";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                              }}
                              onClick={() => setBusquedaConcepto("")}
                            >
                              <span
                                className="text-lg"
                                style={{ color: "#C0392B" }}
                              >
                                ❌
                              </span>
                            </Button>
                          )}
                        </div>
                      )}
                    {/* Lista de conceptos con checkboxes */}
                    {conceptosFiltrados && conceptosFiltrados.length > 0 ? (
                      conceptosFiltrados.length > 0 ? (
                        <div
                          className="max-h-64 overflow-y-auto border-2 rounded-xl p-4 space-y-3"
                          style={{
                            backgroundColor: "#FFFFFF",
                            borderColor: "#E7F2E0",
                          }}
                        >
                          {conceptosFiltrados.map((concepto) => {
                            // Verificar si el concepto pertenece al área actual
                            const perteneceAreaActual =
                              conceptosAreaActual?.some(
                                (c) => c.codigo === concepto.codigo
                              ) ?? false;
                            const esSeleccionadoDeOtraArea =
                              conceptosSeleccionados.includes(
                                concepto.codigo
                              ) && !perteneceAreaActual;

                            return (
                              <div
                                key={concepto.codigo}
                                className="flex items-start space-x-4 p-4 rounded-xl border transition-all hover:shadow-md"
                                style={{
                                  backgroundColor:
                                    conceptosSeleccionados.includes(
                                      concepto.codigo
                                    )
                                      ? "#E7F2E0"
                                      : "#F8F9FA",
                                  borderColor: conceptosSeleccionados.includes(
                                    concepto.codigo
                                  )
                                    ? "#68A53B"
                                    : "#E5E7EB",
                                }}
                              >
                                <div className="flex items-center justify-center mt-1">
                                  <input
                                    type="checkbox"
                                    id={`concepto-${concepto.codigo}`}
                                    checked={conceptosSeleccionados.includes(
                                      concepto.codigo
                                    )}
                                    onChange={() =>
                                      handleConceptoToggle(concepto.codigo)
                                    }
                                    className="sr-only"
                                  />
                                  <div
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer`}
                                    style={{
                                      borderColor:
                                        conceptosSeleccionados.includes(
                                          concepto.codigo
                                        )
                                          ? "#68A53B"
                                          : "#6C757D",
                                      backgroundColor:
                                        conceptosSeleccionados.includes(
                                          concepto.codigo
                                        )
                                          ? "#68A53B"
                                          : "#FFFFFF",
                                    }}
                                    onClick={() =>
                                      handleConceptoToggle(concepto.codigo)
                                    }
                                  >
                                    {conceptosSeleccionados.includes(
                                      concepto.codigo
                                    ) && (
                                      <svg
                                        className="w-3 h-3 text-white"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                                <label
                                  htmlFor={`concepto-${concepto.codigo}`}
                                  className="flex-1 cursor-pointer"
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <div
                                      className="font-semibold text-base"
                                      style={{ color: "#2C3E50" }}
                                    >
                                      {concepto.descripcion}
                                    </div>
                                    {esSeleccionadoDeOtraArea && (
                                      <span
                                        className="text-xs px-2 py-1 rounded-full text-white font-medium"
                                        style={{ backgroundColor: "#3498DB" }}
                                        title="Concepto seleccionado de otra área"
                                      >
                                        📍 Otra área
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-4 text-sm">
                                    <span
                                      className="px-2 py-1 rounded-md text-white"
                                      style={{ backgroundColor: "#F39C12" }}
                                    >
                                      {concepto.unidad}
                                    </span>
                                    <span
                                      className="font-semibold"
                                      style={{ color: "#68A53B" }}
                                    >
                                      $
                                      {(
                                        Number(concepto.precioUnitario) || 0
                                      ).toFixed(2)}
                                    </span>
                                    <span
                                      className="text-xs px-2 py-1 rounded-md"
                                      style={{
                                        backgroundColor: "#E7F2E0",
                                        color: "#4F7D2C",
                                      }}
                                    >
                                      {concepto.codigo}
                                    </span>
                                  </div>
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div
                          className="text-center py-12 rounded-xl border-2 border-dashed"
                          style={{
                            borderColor: "#E5E7EB",
                            backgroundColor: "#F8F9FA",
                          }}
                        >
                          <div
                            className="text-6xl mx-auto mb-4 opacity-50"
                            style={{ color: "#6C757D" }}
                          >
                            🔍
                          </div>
                          <p
                            className="text-lg font-medium mb-2"
                            style={{ color: "#2C3E50" }}
                          >
                            No se encontraron conceptos
                          </p>
                          <p className="text-sm" style={{ color: "#6C757D" }}>
                            No hay conceptos que coincidan con "
                            {busquedaConcepto}"
                          </p>
                          <p
                            className="text-sm mt-1"
                            style={{ color: "#6C757D" }}
                          >
                            Intenta con otros términos de búsqueda
                          </p>
                        </div>
                      )
                    ) : (
                      <div
                        className="text-center py-12 rounded-xl border-2 border-dashed"
                        style={{
                          borderColor: "#E5E7EB",
                          backgroundColor: "#F8F9FA",
                        }}
                      >
                        <p
                          className="text-lg font-medium mb-2"
                          style={{ color: "#2C3E50" }}
                        >
                          {!areaActualConceptos
                            ? "Navega por las especialidades"
                            : "No hay conceptos disponibles"}
                        </p>
                        <p className="text-sm" style={{ color: "#6C757D" }}>
                          {!areaActualConceptos
                            ? "Usa la navegación jerárquica para llegar a un área con conceptos"
                            : "No hay conceptos disponibles para esta especialidad"}
                        </p>
                      </div>
                    )}
                    {errors.conceptosSeleccionados && (
                      <div
                        className="flex items-center space-x-2 p-3 rounded-lg border"
                        style={{
                          backgroundColor: "#FEE2E2",
                          borderColor: "#F87171",
                        }}
                      >
                        <span className="text-lg" style={{ color: "#C0392B" }}>
                          ⚠️
                        </span>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "#C0392B" }}
                        >
                          {errors.conceptosSeleccionados.message ||
                            "Debe seleccionar al menos un concepto"}
                        </p>
                      </div>
                    )}
                  </div>
                  {/* Estado de carga / error de conceptos jerárquicos globales */}
                  {conceptosLoading && (
                    <div
                      className="p-3 rounded-lg border text-sm"
                      style={{
                        backgroundColor: "#FFF8E1",
                        borderColor: "#F39C12",
                        color: "#8C6D1F",
                      }}
                    >
                      ⏳ Cargando conceptos jerárquicos...
                    </div>
                  )}
                  {conceptosFetching && !conceptosLoading && (
                    <div
                      className="p-2 rounded-md border text-xs inline-block"
                      style={{
                        backgroundColor: "#F8F9FA",
                        borderColor: "#E5E7EB",
                        color: "#6C757D",
                      }}
                    >
                      Actualizando conceptos...
                    </div>
                  )}
                  {conceptosError && (
                    <div
                      className="flex items-start space-x-2 p-3 rounded-lg border"
                      style={{
                        backgroundColor: "#FEE2E2",
                        borderColor: "#F87171",
                      }}
                    >
                      <span className="text-lg" style={{ color: "#C0392B" }}>
                        ⚠️
                      </span>
                      <div
                        className="flex-1 text-sm"
                        style={{ color: "#C0392B" }}
                      >
                        <p className="font-medium mb-1">
                          No se pudieron cargar los conceptos jerárquicos.
                        </p>
                        <p>
                          {(conceptosError as Error).message ||
                            "Error desconocido."}
                        </p>
                        <p className="mt-1 text-xs opacity-80">
                          Intenta recargar la página o verifica la API
                          /api/conceptos-jerarquicos.
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Conceptos seleccionados con cantidades */}
                  {conceptosSeleccionados.length > 0 && (
                    <div className="space-y-6">
                      <Separator
                        style={{ backgroundColor: "#E7F2E0", height: "2px" }}
                      />
                      <div className="flex items-center justify-between">
                        <h4
                          className="font-semibold text-lg"
                          style={{ color: "#2C3E50" }}
                        >
                          Configurar Conceptos Seleccionados
                        </h4>
                        <div
                          className="px-3 py-1 rounded-full text-sm font-medium text-white"
                          style={{ backgroundColor: "#F39C12" }}
                        >
                          {conceptosSeleccionados.length} conceptos
                        </div>
                      </div>

                      {conceptosSeleccionados.map((conceptoCodigo) => {
                        const concepto = todosLosConceptos?.find(
                          (c: ConceptoJerarquico) => c.codigo === conceptoCodigo
                        );
                        const conceptoEnForm = watch("conceptos")?.find(
                          (c) => c.conceptoCodigo === conceptoCodigo
                        );
                        if (!concepto) return null;
                        return (
                          <Card
                            key={conceptoCodigo}
                            className="border-2 shadow-md"
                            style={{
                              borderColor: "#E7F2E0",
                              backgroundColor: "#FFFFFF",
                            }}
                          >
                            <CardContent className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="space-y-3">
                                  <Label
                                    className="font-semibold"
                                    style={{ color: "#2C3E50" }}
                                  >
                                    Concepto
                                  </Label>
                                  <div
                                    className="p-4 border-2 rounded-xl"
                                    style={{
                                      backgroundColor: "#F8F9FA",
                                      borderColor: "#E7F2E0",
                                    }}
                                  >
                                    <div
                                      className="font-semibold text-sm mb-2"
                                      style={{ color: "#2C3E50" }}
                                    >
                                      {concepto.descripcion}
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span
                                        className="text-xs px-2 py-1 rounded-md text-white"
                                        style={{ backgroundColor: "#68A53B" }}
                                      >
                                        {concepto.unidad}
                                      </span>
                                      <span
                                        className="text-xs px-2 py-1 rounded-md"
                                        style={{
                                          backgroundColor: "#E7F2E0",
                                          color: "#4F7D2C",
                                        }}
                                      >
                                        {concepto.codigo}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <Label
                                    className="font-semibold"
                                    style={{ color: "#2C3E50" }}
                                  >
                                    Cantidad *
                                  </Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max="999999"
                                    placeholder="1.00"
                                    value={conceptoEnForm?.cantidad || 1}
                                    onChange={(e) =>
                                      updateConceptoInForm(
                                        conceptoCodigo,
                                        "cantidad",
                                        parseFloat(e.target.value) || 1
                                      )
                                    }
                                    className={`h-11 border-2 rounded-xl transition-all ${
                                      (conceptoEnForm?.cantidad || 1) > 999999
                                        ? "border-red-500 focus:border-red-500"
                                        : ""
                                    }`}
                                    style={{
                                      borderColor:
                                        (conceptoEnForm?.cantidad || 1) > 999999
                                          ? "#C0392B"
                                          : "#6C757D",
                                    }}
                                    onFocus={(e) => {
                                      if (
                                        (conceptoEnForm?.cantidad || 1) <=
                                        999999
                                      ) {
                                        e.target.style.borderColor = "#68A53B";
                                        e.target.style.boxShadow =
                                          "0 0 0 3px rgba(104, 165, 59, 0.1)";
                                      }
                                    }}
                                    onBlur={(e) => {
                                      e.target.style.borderColor =
                                        (conceptoEnForm?.cantidad || 1) > 999999
                                          ? "#C0392B"
                                          : "#6C757D";
                                      e.target.style.boxShadow = "none";
                                    }}
                                  />
                                  {(conceptoEnForm?.cantidad || 1) > 999999 && (
                                    <div
                                      className="flex items-center space-x-2 p-2 rounded-lg border"
                                      style={{
                                        backgroundColor: "#FEE2E2",
                                        borderColor: "#F87171",
                                      }}
                                    >
                                      <span
                                        className="text-lg"
                                        style={{ color: "#C0392B" }}
                                      >
                                        ⚠️
                                      </span>
                                      <p
                                        className="text-sm font-medium"
                                        style={{ color: "#C0392B" }}
                                      >
                                        La cantidad no puede exceder 999,999
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-3">
                                  <Label
                                    className="font-semibold"
                                    style={{ color: "#2C3E50" }}
                                  >
                                    Precio Unitario *
                                  </Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max="9999999.99"
                                    placeholder="0.00"
                                    value={
                                      conceptoEnForm?.precioUnitario ||
                                      Number(concepto.precioUnitario) ||
                                      0
                                    }
                                    onChange={(e) =>
                                      updateConceptoInForm(
                                        conceptoCodigo,
                                        "precioUnitario",
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    className={`h-11 border-2 rounded-xl transition-all ${
                                      (conceptoEnForm?.precioUnitario ||
                                        Number(concepto.precioUnitario) ||
                                        0) > 9999999.99
                                        ? "border-red-500 focus:border-red-500"
                                        : ""
                                    }`}
                                    style={{
                                      borderColor:
                                        (conceptoEnForm?.precioUnitario ||
                                          Number(concepto.precioUnitario) ||
                                          0) > 9999999.99
                                          ? "#C0392B"
                                          : "#6C757D",
                                    }}
                                    onFocus={(e) => {
                                      if (
                                        (conceptoEnForm?.precioUnitario ||
                                          Number(concepto.precioUnitario) ||
                                          0) <= 9999999.99
                                      ) {
                                        e.target.style.borderColor = "#68A53B";
                                        e.target.style.boxShadow =
                                          "0 0 0 3px rgba(104, 165, 59, 0.1)";
                                      }
                                    }}
                                    onBlur={(e) => {
                                      e.target.style.borderColor =
                                        (conceptoEnForm?.precioUnitario ||
                                          Number(concepto.precioUnitario) ||
                                          0) > 9999999.99
                                          ? "#C0392B"
                                          : "#6C757D";
                                      e.target.style.boxShadow = "none";
                                    }}
                                  />
                                  {(conceptoEnForm?.precioUnitario ||
                                    Number(concepto.precioUnitario) ||
                                    0) > 9999999.99 && (
                                    <div
                                      className="flex items-center space-x-2 p-2 rounded-lg border"
                                      style={{
                                        backgroundColor: "#FEE2E2",
                                        borderColor: "#F87171",
                                      }}
                                    >
                                      <span
                                        className="text-lg"
                                        style={{ color: "#C0392B" }}
                                      >
                                        ⚠️
                                      </span>
                                      <p
                                        className="text-sm font-medium"
                                        style={{ color: "#C0392B" }}
                                      >
                                        El precio no puede exceder $9,999,999.99
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-end space-x-2">
                                  <div className="flex-1">
                                    <Label
                                      className="font-semibold"
                                      style={{ color: "#2C3E50" }}
                                    >
                                      Subtotal
                                    </Label>
                                    <div
                                      className="px-4 py-3 border-2 rounded-xl text-lg font-bold"
                                      style={{
                                        backgroundColor: "#E7F2E0",
                                        borderColor: "#68A53B",
                                        color: "#4F7D2C",
                                      }}
                                    >
                                      $
                                      {(
                                        (conceptoEnForm?.cantidad || 1) *
                                          (conceptoEnForm?.precioUnitario ||
                                            Number(concepto.precioUnitario) ||
                                            0) || 0
                                      ).toFixed(2)}
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-11 w-11 p-0 border-2 rounded-xl transition-all"
                                    style={{
                                      borderColor: "#C0392B",
                                      backgroundColor: "transparent",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        "#FEE2E2";
                                      e.currentTarget.style.borderColor =
                                        "#EF4444";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        "transparent";
                                      e.currentTarget.style.borderColor =
                                        "#C0392B";
                                    }}
                                    onClick={() =>
                                      handleConceptoToggle(conceptoCodigo)
                                    }
                                    title="Remover concepto"
                                  >
                                    <Trash2
                                      className="h-5 w-5"
                                      style={{ color: "#C0392B" }}
                                    />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                  {errors.conceptos && (
                    <div
                      className="p-4 rounded-lg border space-y-2"
                      style={{
                        backgroundColor: "#FEE2E2",
                        borderColor: "#F87171",
                        color: "#C0392B",
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">⚠️</span>
                        <p className="text-sm font-semibold">
                          {errors.conceptos.message ||
                            "Revise los conceptos agregados"}
                        </p>
                      </div>
                      {Array.isArray(errors.conceptos) && (
                        <ul className="text-xs list-disc pl-6 space-y-1">
                          {errors.conceptos.map((err: any, idx: number) => {
                            if (!err) return null;
                            const codigo =
                              watch("conceptos")?.[idx]?.conceptoCodigo ||
                              `#${idx + 1}`;
                            return (
                              <li key={idx}>
                                <strong>{codigo}:</strong>{" "}
                                {err.conceptoCodigo?.message ||
                                  err.cantidad?.message ||
                                  err.precioUnitario?.message ||
                                  "Error desconocido en este concepto"}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Sección Totales y Finalización */}
            {(isEditMode || currentStep === 5) && (
              <>
                {/* Sección Totales */}
                <Card
                  className="shadow-lg border-0"
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <CardHeader
                    className="text-white rounded-t-lg"
                    style={{ backgroundColor: "#2C3E50" }}
                  >
                    <CardTitle className="flex items-center space-x-3 text-xl">
                      <div className="p-2 bg-white/20 rounded-lg text-white text-xl">
                        💰
                      </div>
                      <span className="font-semibold">Anticipo</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    {/* Validaciones y advertencias */}
                    {subtotal > 5000000000 && (
                      <div
                        className="p-4 rounded-xl border-2 flex items-center space-x-3"
                        style={{
                          backgroundColor: "#FEF3C7",
                          borderColor: "#F59E0B",
                        }}
                      >
                        <div
                          className="p-2 rounded-full"
                          style={{ backgroundColor: "#F39C12" }}
                        >
                          <svg
                            className="h-5 w-5 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <p
                            className="font-semibold"
                            style={{ color: "#92400E" }}
                          >
                            Advertencia: Límite próximo
                          </p>
                          <p className="text-sm" style={{ color: "#92400E" }}>
                            El subtotal se acerca al límite permitido
                            ($9,999,999,999.99).
                          </p>
                        </div>
                      </div>
                    )}
                    {subtotal > 9999999999.99 && (
                      <div
                        className="p-4 rounded-xl border-2 flex items-center space-x-3"
                        style={{
                          backgroundColor: "#FEE2E2",
                          borderColor: "#F87171",
                        }}
                      >
                        <div
                          className="p-2 rounded-full text-white text-xl font-bold"
                          style={{ backgroundColor: "#C0392B" }}
                        >
                          ❌
                        </div>
                        <div>
                          <p
                            className="font-semibold"
                            style={{ color: "#C0392B" }}
                          >
                            Error: Límite excedido
                          </p>
                          <p className="text-sm" style={{ color: "#C0392B" }}>
                            El subtotal excede el límite permitido. Reduzca las
                            cantidades o precios.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Totales */}
                    <div
                      className="space-y-4 p-6 rounded-xl border-2"
                      style={{
                        backgroundColor: "#F8F9FA",
                        borderColor: "#E7F2E0",
                      }}
                    >
                      <div className="flex justify-between items-center py-2">
                        <span
                          className="font-semibold text-lg"
                          style={{ color: "#2C3E50" }}
                        >
                          Subtotal:
                        </span>
                        <span
                          className="text-xl font-bold"
                          style={{ color: "#2C3E50" }}
                        >
                          $
                          {subtotal.toLocaleString("es-MX", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span
                          className="font-semibold text-lg"
                          style={{ color: "#2C3E50" }}
                        >
                          IVA (16%):
                        </span>
                        <span
                          className="text-xl font-bold"
                          style={{ color: "#E67E22" }}
                        >
                          $
                          {ivaMonto.toLocaleString("es-MX", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <Separator
                        style={{ backgroundColor: "#68A53B", height: "2px" }}
                      />
                      <div
                        className="flex justify-between items-center py-3 px-4 rounded-xl"
                        style={{ backgroundColor: "#E7F2E0" }}
                      >
                        <span
                          className="font-bold text-2xl"
                          style={{ color: "#4F7D2C" }}
                        >
                          Total:
                        </span>
                        <span
                          className="text-3xl font-bold"
                          style={{ color: "#68A53B" }}
                        >
                          $
                          {total.toLocaleString("es-MX", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-6">
                      {/* Manejo de Anticipo */}
                      <div className="space-y-4">
                        <Label
                          className="text-lg font-semibold flex items-center space-x-2"
                          style={{ color: "#2C3E50" }}
                        >
                          <svg
                            className="h-5 w-5"
                            style={{ color: "#68A53B" }}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                            <path
                              fillRule="evenodd"
                              d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Anticipo</span>
                        </Label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="manejaAnticipo"
                            {...register("manejaAnticipo")}
                            className="w-4 h-4 rounded focus:ring-2 focus:ring-[#68A53B]"
                            style={{ accentColor: "#68A53B" }}
                          />
                          <Label
                            htmlFor="manejaAnticipo"
                            className="text-base font-medium cursor-pointer"
                            style={{ color: "#2C3E50" }}
                          >
                            ¿Se requiere anticipo?
                          </Label>
                        </div>
                        {watch("manejaAnticipo") && (
                          <div className="ml-7 space-y-3">
                            <Label
                              htmlFor="porcentajeAnticipo"
                              className="text-sm font-medium"
                              style={{ color: "#2C3E50" }}
                            >
                              Porcentaje de anticipo (%)
                            </Label>
                            <div className="flex items-center space-x-3">
                              <Input
                                id="porcentajeAnticipo"
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                placeholder="0"
                                {...register("porcentajeAnticipo", {
                                  valueAsNumber: true,
                                })}
                                className="w-24 border-2 rounded-lg"
                                style={{
                                  borderColor: "#6C757D",
                                  backgroundColor: "#FFFFFF",
                                }}
                              />
                              <span
                                className="text-2xl font-bold"
                                style={{ color: "#68A53B" }}
                              >
                                %
                              </span>
                              {watch("porcentajeAnticipo") && (
                                <span
                                  className="text-lg font-semibold"
                                  style={{ color: "#2C3E50" }}
                                >
                                  = $
                                  {(
                                    (total *
                                      (watch("porcentajeAnticipo") || 0)) /
                                    100
                                  ).toFixed(2)}
                                </span>
                              )}
                            </div>
                            {errors.porcentajeAnticipo && (
                              <p
                                className="text-sm"
                                style={{ color: "#C0392B" }}
                              >
                                {errors.porcentajeAnticipo.message}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <Separator
                      style={{ backgroundColor: "#E7F2E0", height: "2px" }}
                    />
                    {/* Resumen de totales */}
                    <div
                      className="p-6 rounded-xl border-2"
                      style={{
                        backgroundColor: "#E7F2E0",
                        borderColor: "#68A53B",
                      }}
                    >
                      <h4
                        className="font-bold text-lg mb-4"
                        style={{ color: "#4F7D2C" }}
                      >
                        Resumen del Presupuesto
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span
                            className="font-medium"
                            style={{ color: "#2C3E50" }}
                          >
                            Subtotal:
                          </span>
                          <span
                            className="font-bold text-lg"
                            style={{ color: "#2C3E50" }}
                          >
                            ${subtotal.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span
                            className="font-medium"
                            style={{ color: "#2C3E50" }}
                          >
                            IVA ({(SYSTEM_CONSTANTS.IVA_RATE * 100).toFixed(0)}
                            %):
                          </span>
                          <span
                            className="font-bold text-lg"
                            style={{ color: "#E67E22" }}
                          >
                            ${ivaMonto.toFixed(2)}
                          </span>
                        </div>
                        <Separator
                          style={{ backgroundColor: "#68A53B", height: "2px" }}
                        />
                        <div
                          className="flex justify-between items-center py-2 px-3 rounded-lg"
                          style={{ backgroundColor: "#FFFFFF" }}
                        >
                          <span
                            className="font-bold text-xl"
                            style={{ color: "#4F7D2C" }}
                          >
                            Total:
                          </span>
                          <span
                            className="font-bold text-2xl"
                            style={{ color: "#68A53B" }}
                          >
                            ${total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
            {/* Botones de navegación entre pasos */}
            {!isEditMode && (
              <div className="flex justify-between items-center p-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  className="flex items-center space-x-2 px-6 py-3"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Anterior</span>
                </Button>

                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step === currentStep
                          ? "bg-green-600 text-white"
                          : step < currentStep
                          ? "bg-green-200 text-green-800"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {step}
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  onClick={async () => {
                    // Validar el paso actual antes de avanzar
                    const isStepValid = await validateStep(
                      currentStep,
                      getValues,
                      trigger
                    );
                    if (isStepValid) {
                      setCurrentStep(Math.min(5, currentStep + 1));
                    } else {
                      toast({
                        title: "Campos obligatorios",
                        description:
                          "Por favor, completa todos los campos marcados con asterisco (*) antes de continuar.",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={currentStep === 5}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white hover:bg-green-700"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Botones finales con estilo corporativo */}
            <div
              className="sticky bottom-0 backdrop-blur-sm border-t-2 p-6 rounded-t-xl shadow-xl"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderTopColor: "#E7F2E0",
              }}
            >
              <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      reset();
                      setConceptosSeleccionados([]);
                      setValue("conceptosSeleccionados", []);
                      setValue("conceptos", []);
                    }}
                    className="h-12 px-6 border-2 rounded-xl transition-all font-semibold"
                    style={{
                      borderColor: "#6C757D",
                      backgroundColor: "transparent",
                      color: "#2C3E50",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F8F9FA";
                      e.currentTarget.style.borderColor = "#2C3E50";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.borderColor = "#6C757D";
                    }}
                  >
                    🗑️ Limpiar Formulario
                  </Button>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Indicador de progreso */}
                  <div
                    className="hidden sm:flex items-center space-x-2 text-sm font-medium"
                    style={{ color: "#6C757D" }}
                  >
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: "#68A53B" }}
                    ></div>
                    <span>Formulario {isEditMode ? "cargado" : "listo"}</span>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className={`h-12 px-8 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-white`}
                    style={{
                      backgroundColor: isEditMode ? "#F39C12" : "#68A53B",
                      borderColor: isEditMode ? "#E67E22" : "#4F7D2C",
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.backgroundColor = isEditMode
                          ? "#E67E22"
                          : "#4F7D2C";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.backgroundColor = isEditMode
                          ? "#F39C12"
                          : "#68A53B";
                        e.currentTarget.style.transform = "translateY(0px)";
                      }
                    }}
                    onClick={() =>
                      console.log("[AdvancedBudgetForm] Submit button clicked")
                    }
                  >
                    <div className="flex items-center space-x-2">
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>
                            {isEditMode ? "Actualizando..." : "Creando..."}
                          </span>
                        </>
                      ) : (
                        <>
                          {isEditMode ? (
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          ) : (
                            <Plus className="w-5 h-5" />
                          )}
                          <span>
                            {isEditMode
                              ? "Actualizar Presupuesto"
                              : "Crear Presupuesto"}
                          </span>
                        </>
                      )}
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
