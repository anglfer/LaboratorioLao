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
  User,
  Building,
  MapPin,
  FileText,
  Calculator,
  Search,
  X,
  Plus,
  Phone,
  Mail,
  Calendar,
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
              if (arr.length === 0) return true; // No hay correos para validar
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              return arr.every((email) => emailRegex.test(email));
            },
            { message: "Uno o más correos tienen formato inválido" }
          ),
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
    tramo: z.string().optional(),
    colonia: z.string().optional(),
    calle: z.string().optional(),
    contactoResponsable: z.string().optional(),
    fechaInicio: z.string().optional(),
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

    // Forma de pago
    formaPago: z.string().optional(),
  })
  .refine(
    (data) => {
      // Validar que se tenga un cliente seleccionado O un cliente nuevo con nombre
      if (data.clienteId) {
        return true; // Cliente existente seleccionado
      }
      if (
        data.clienteNuevo &&
        data.clienteNuevo.nombre &&
        data.clienteNuevo.nombre.trim().length > 0
      ) {
        return true; // Cliente nuevo con nombre válido
      }
      return false;
    },
    {
      message:
        "Debe seleccionar un cliente existente o crear uno nuevo con nombre",
      path: ["clienteId"], // Asociar el error al campo clienteId
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
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      conceptos: [{ conceptoCodigo: "", cantidad: 1, precioUnitario: 0 }],
      conceptosSeleccionados: [],
      clienteNuevo: {
        telefonos: [],
        correos: [],
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
  const { data: todosLosConceptos, error: conceptosError } = useQuery<
    ConceptoJerarquico[]
  >({
    queryKey: ["todos-conceptos-jerarquicos"],
    queryFn: async () => {
      try {
        // Obtener TODOS los conceptos disponibles
        return await conceptosJerarquicosService.obtenerLista();
      } catch (error) {
        console.error(
          "[AdvancedBudgetForm] Error fetching all conceptos:",
          error
        );
        return [];
      }
    },
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
      if (initialData.tramo) {
        console.log("[AdvancedBudgetForm] Setting tramo:", initialData.tramo);
        setValue("tramo", initialData.tramo);
      }
      if (initialData.colonia) {
        console.log(
          "[AdvancedBudgetForm] Setting colonia:",
          initialData.colonia
        );
        setValue("colonia", initialData.colonia);
      }
      if (initialData.calle) {
        console.log("[AdvancedBudgetForm] Setting calle:", initialData.calle);
        setValue("calle", initialData.calle);
      }
      if (initialData.contactoResponsable) {
        console.log(
          "[AdvancedBudgetForm] Setting contactoResponsable:",
          initialData.contactoResponsable
        );
        setValue("contactoResponsable", initialData.contactoResponsable);
      }
      if (initialData.fechaInicio) {
        // Formatear la fecha para el input tipo date (YYYY-MM-DD)
        const fechaFormatted = new Date(initialData.fechaInicio)
          .toISOString()
          .split("T")[0];
        setValue("fechaInicio", fechaFormatted);
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

      // Cargar forma de pago
      if (initialData.formaPago) {
        console.log(
          "[AdvancedBudgetForm] Setting formaPago:",
          initialData.formaPago
        );
        setValue("formaPago", initialData.formaPago);
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
      console.log("- formaPago:", watch("formaPago"));
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
        conceptos: [{ conceptoCodigo: "", cantidad: 1, precioUnitario: 0 }],
        conceptosSeleccionados: [],
        clienteNuevo: {
          telefonos: [],
          correos: [],
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
  // Efecto para limpiar conceptos cuando cambia la navegación jerárquica
  useEffect(() => {
    setConceptosSeleccionados([]);
    setValue("conceptosSeleccionados", []);
    setValue("conceptos", []);
    setBusquedaConcepto(""); // Limpiar búsqueda al cambiar navegación
  }, [areaActualConceptos, setValue]);

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
        // Mostrar solo conceptos del área actual si hay una seleccionada
        conceptosBase = conceptosAreaActual || [];
        break;
      case "busqueda":
      case "todos":
        // Mostrar todos los conceptos disponibles
        conceptosBase = todosLosConceptos || [];
        break;
    }

    // Aplicar filtro de búsqueda si existe
    if (!busquedaConcepto.trim()) {
      return conceptosBase;
    }

    const terminoBusqueda = busquedaConcepto.toLowerCase();
    return conceptosBase.filter(
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
    console.log(
      "[AdvancedBudgetForm] handleFormSubmit called with data:",
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
    try {
      let clienteId = data.clienteId;

      // Si es cliente nuevo, crearlo primero
      if (clienteNuevo && data.clienteNuevo) {
        const clienteResponse = await fetch("/api/clientes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: data.clienteNuevo.nombre,
            direccion: data.clienteNuevo.direccion,
          }),
        });

        if (!clienteResponse.ok) {
          throw new Error("Error al crear cliente");
        }

        const nuevoCliente = await clienteResponse.json();
        clienteId = nuevoCliente.id; // Agregar teléfonos
        if (data.clienteNuevo.telefonos) {
          for (const telefono of data.clienteNuevo.telefonos.filter(
            (t) => t && t.trim()
          )) {
            // Validar formato antes de enviar
            const telefonoLimpio = telefono.trim();
            const phoneRegex = /^(?:\+52|52)?[0-9]{10}$/;
            if (!phoneRegex.test(telefonoLimpio)) {
              throw new Error(
                `Formato de teléfono inválido: "${telefonoLimpio}". Debe tener 10 dígitos (ej: 4771234567 o +524771234567)`
              );
            }

            const response = await fetch(
              `/api/clientes/${clienteId}/telefonos`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ telefono: telefonoLimpio }),
              }
            );
            if (!response.ok) {
              const errorData = await response.json();
              console.error("Error al agregar teléfono:", errorData);

              // Mostrar mensaje específico si es error de validación
              let errorMessage = "Error desconocido";
              if (errorData.errors && errorData.errors.length > 0) {
                // Tomar el primer error de validación
                errorMessage = errorData.errors[0].message || errorData.message;
              } else if (errorData.message) {
                errorMessage = errorData.message;
              }

              throw new Error(`Error al agregar teléfono: ${errorMessage}`);
            }
          }
        }

        // Agregar correos
        if (data.clienteNuevo.correos) {
          for (const correo of data.clienteNuevo.correos.filter(
            (c) => c && c.trim()
          )) {
            const response = await fetch(`/api/clientes/${clienteId}/correos`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ correo: correo.trim() }),
            });
            if (!response.ok) {
              const errorData = await response.json();
              console.error("Error al agregar correo:", errorData);
              throw new Error(
                `Error al agregar correo: ${
                  errorData.message || "Error desconocido"
                }`
              );
            }
          }
        }
      }

      // Generar clave de obra automáticamente
      const claveResponse = await fetch("/api/obras/generate-clave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ areaCodigo: data.areaCodigo }),
      });

      if (!claveResponse.ok) {
        throw new Error("Error al generar clave de obra");
      }

      const { claveObra } = await claveResponse.json();

      // Crear presupuesto
      const presupuestoData = {
        claveObra,
        clienteId,
        nombreContratista: data.nombreContratista,
        descripcionObra: data.descripcionObra,
        tramo: data.tramo,
        colonia: data.colonia,
        calle: data.calle,
        contactoResponsable: data.contactoResponsable,
        formaPago: data.formaPago,
        iva: SYSTEM_CONSTANTS.IVA_RATE,
        subtotal,
        ivaMonto,
        total,
        estado: "borrador",
        fechaSolicitud: new Date().toISOString(),
        fechaInicio: data.fechaInicio
          ? new Date(data.fechaInicio).toISOString()
          : null,
        conceptos: data.conceptos.map((concepto) => ({
          conceptoCodigo: concepto.conceptoCodigo,
          cantidad: concepto.cantidad,
          precioUnitario: concepto.precioUnitario,
          subtotal: concepto.cantidad * concepto.precioUnitario,
        })),
      };

      onSubmit(presupuestoData);
    } catch (error) {
      console.error("Error al procesar formulario:", error);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Debug indicator - más discreto */}
        {isEditMode && (
          <div className="border-l-4 border-blue-500 bg-blue-50 px-4 py-3 rounded-r">
            <div className="flex items-center space-x-2 text-blue-800">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-medium">Editando presupuesto</span>
              <span className="text-blue-600">•</span>
              <span className="text-sm">ID: {initialData?.id}</span>
            </div>
          </div>
        )}

        {/* Título Principal - más sobrio */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isEditMode ? "Editar Presupuesto" : "Nuevo Presupuesto"}
          </h1>
          <p className="text-gray-600">
            {isEditMode
              ? "Modifica los datos del presupuesto existente"
              : "Complete la información para crear un nuevo presupuesto"}
          </p>
        </div>

        {/* Navegación por pasos */}
        {!isEditMode && (
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              {[
                { step: 1, title: "Cliente", icon: User },
                { step: 2, title: "Contratista", icon: Building },
                { step: 3, title: "Obra", icon: MapPin },
                { step: 4, title: "Conceptos", icon: Calculator },
                { step: 5, title: "Finalizar", icon: FileText },
              ].map(({ step, title, icon: Icon }, index) => (
                <div key={step} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(step)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                      currentStep === step
                        ? "bg-green-500 border-green-500 text-white"
                        : currentStep > step
                        ? "bg-green-100 border-green-300 text-green-600"
                        : "bg-gray-100 border-gray-300 text-gray-400"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                  <div className="ml-3 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        currentStep === step
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      Paso {step}
                    </p>
                    <p
                      className={`text-xs ${
                        currentStep === step
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    >
                      {title}
                    </p>
                  </div>
                  {index < 4 && (
                    <div
                      className={`w-full h-0.5 mx-4 ${
                        currentStep > step ? "bg-green-300" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Sección Cliente */}
          {(isEditMode || currentStep === 1) && (
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100 bg-white">
                <CardTitle className="flex items-center space-x-2 text-lg text-gray-900">
                  <User className="h-5 w-5 text-gray-500" />
                  <span>Información del Cliente</span>
                  {!isEditMode && (
                    <span className="ml-auto text-sm text-gray-500">
                      Paso 1 de 5
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Radio buttons simples */}
                <div className="flex items-center space-x-8">
                  <Label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!clienteNuevo}
                      onChange={() => {
                        setClienteNuevo(false);
                        setValue("clienteId", undefined);
                        setBusquedaCliente("");
                      }}
                      className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                    />
                    <span className="text-gray-900">Cliente existente</span>
                  </Label>
                  <Label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={clienteNuevo}
                      onChange={() => {
                        setClienteNuevo(true);
                        setSelectedClienteId(null);
                        setBusquedaCliente("");
                      }}
                      className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                    />
                    <span className="text-gray-900">Cliente nuevo</span>
                  </Label>
                </div>

                {!clienteNuevo ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="clienteId"
                        className="text-sm font-medium text-gray-700"
                      >
                        Buscar Cliente
                      </Label>
                      {/* Campo de búsqueda simple */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar por ID, nombre, correo o teléfono..."
                          value={busquedaCliente}
                          onChange={(e) => setBusquedaCliente(e.target.value)}
                          className="pl-10 pr-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
                        />
                        {busquedaCliente && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                            onClick={() => setBusquedaCliente("")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Selector de cliente simple */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="clienteSelect"
                        className="text-sm font-medium text-gray-700"
                      >
                        Cliente
                      </Label>
                      <Select
                        value={selectedClienteId?.toString()}
                        onValueChange={(value) => {
                          const id = parseInt(value);
                          setValue("clienteId", id);
                          setSelectedClienteId(id);
                        }}
                      >
                        <SelectTrigger className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500">
                          <SelectValue placeholder="Seleccionar cliente..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                          {Array.isArray(clientesFiltrados) &&
                          clientesFiltrados.length > 0 ? (
                            clientesFiltrados.map((cliente) => (
                              <SelectItem
                                key={cliente.id}
                                value={cliente.id.toString()}
                                className="py-3 hover:bg-gray-50"
                              >
                                <div className="flex flex-col w-full">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-900">
                                      {cliente.nombre}
                                    </span>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                      ID: {cliente.id}
                                    </span>
                                  </div>
                                  {cliente.direccion && (
                                    <div className="flex items-center space-x-1 mt-1">
                                      <MapPin className="h-3 w-3 text-gray-400" />
                                      <span className="text-xs text-gray-600">
                                        {cliente.direccion}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex gap-2 mt-1">
                                    {cliente.telefonos &&
                                      cliente.telefonos.length > 0 && (
                                        <div className="flex items-center space-x-1">
                                          <Phone className="h-3 w-3 text-gray-400" />
                                          <span className="text-xs text-gray-600">
                                            {cliente.telefonos
                                              .map((t) => t.telefono)
                                              .join(", ")}
                                          </span>
                                        </div>
                                      )}
                                    {cliente.correos &&
                                      cliente.correos.length > 0 && (
                                        <div className="flex items-center space-x-1">
                                          <Mail className="h-3 w-3 text-gray-400" />
                                          <span className="text-xs text-gray-600">
                                            {cliente.correos
                                              .map((c) => c.correo)
                                              .join(", ")}
                                          </span>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          ) : busquedaCliente ? (
                            <SelectItem
                              value="__no_results__"
                              disabled
                              className="py-4 text-center"
                            >
                              <div className="flex flex-col items-center space-y-2 text-gray-500">
                                <Search className="h-6 w-6" />
                                <span className="text-sm">
                                  No se encontraron clientes que coincidan con "
                                  {busquedaCliente}"
                                </span>
                              </div>
                            </SelectItem>
                          ) : (
                            <SelectItem
                              value="__no_clientes__"
                              disabled
                              className="py-4 text-center"
                            >
                              <div className="flex flex-col items-center space-y-2 text-gray-500">
                                <User className="h-6 w-6" />
                                <span className="text-sm">
                                  {clientesError
                                    ? "Error cargando clientes"
                                    : "No hay clientes disponibles"}
                                </span>
                              </div>
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>

                      {/* Información de búsqueda simple */}
                      {busquedaCliente && (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-2 text-green-700">
                            <Search className="h-4 w-4" />
                            <span className="text-sm">
                              {clientesFiltrados.length > 0
                                ? `${clientesFiltrados.length} cliente(s) encontrado(s)`
                                : "No se encontraron clientes"}
                            </span>
                          </div>
                          {clientesFiltrados.length > 0 && (
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                              {clientes?.length || 0} totales
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {errors.clienteId && (
                      <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <X className="h-4 w-4 text-red-500" />
                        <p className="text-sm text-red-600 font-medium">
                          {errors.clienteId.message}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="space-y-6 p-6 rounded-xl border-2"
                    style={{
                      backgroundColor: "#E7F2E0",
                      borderColor: "#68A53B",
                    }}
                  >
                    <div className="text-center mb-4">
                      <h3
                        className="text-lg font-semibold mb-1"
                        style={{ color: "#4F7D2C" }}
                      >
                        Registrar Nuevo Cliente
                      </h3>
                      <p className="text-sm" style={{ color: "#68A53B" }}>
                        Complete la información del cliente
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label
                          htmlFor="clienteNombre"
                          className="text-sm font-medium text-gray-700 flex items-center space-x-2"
                        >
                          <User className="h-4 w-4 text-gray-500" />
                          <span>Nombre del Cliente *</span>
                        </Label>
                        <Input
                          id="clienteNombre"
                          placeholder="Nombre completo del cliente"
                          {...register("clienteNuevo.nombre")}
                          className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                        />
                        {errors.clienteNuevo?.nombre && (
                          <p className="text-sm text-red-600 flex items-center space-x-1">
                            <X className="h-4 w-4" />
                            <span>{errors.clienteNuevo.nombre.message}</span>
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="clienteDireccion"
                          className="text-sm font-medium text-gray-700 flex items-center space-x-2"
                        >
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>Dirección</span>
                        </Label>
                        <Input
                          id="clienteDireccion"
                          placeholder="Dirección completa (opcional)"
                          {...register("clienteNuevo.direccion")}
                          className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    {/* Teléfonos - simplificado */}
                    <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-200">
                      <Label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>Teléfonos</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Opcional
                        </span>
                      </Label>
                      <div className="space-y-2">
                        {watch("clienteNuevo.telefonos")?.map((_, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex space-x-2">
                              <Input
                                placeholder="4771234567 o +524771234567"
                                {...register(
                                  `clienteNuevo.telefonos.${index}`,
                                  {
                                    pattern: {
                                      value: /^(?:\+52|52)?[0-9]{10}$/,
                                      message:
                                        "El teléfono debe tener 10 dígitos (ej: 4771234567 o +524771234567)",
                                    },
                                  }
                                )}
                                className="flex-1 border-gray-300 focus:border-green-500 focus:ring-green-500"
                              />
                              {index > 0 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-10 w-10 p-0 text-red-500 border-red-300 hover:bg-red-50"
                                  onClick={() => {
                                    const telefonos =
                                      watch("clienteNuevo.telefonos") || [];
                                    telefonos.splice(index, 1);
                                    setValue(
                                      "clienteNuevo.telefonos",
                                      telefonos
                                    );
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            {errors.clienteNuevo?.telefonos?.[index] && (
                              <div className="flex items-center space-x-1 text-red-600 text-xs">
                                <X className="h-3 w-3" />
                                <span>
                                  {
                                    errors.clienteNuevo.telefonos[index]
                                      ?.message
                                  }
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full h-10 border-dashed border-gray-300 text-gray-600 hover:bg-gray-50"
                          onClick={() => {
                            const telefonos =
                              watch("clienteNuevo.telefonos") || [];
                            setValue("clienteNuevo.telefonos", [
                              ...telefonos,
                              "",
                            ]);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar teléfono
                        </Button>
                        <div className="text-xs text-gray-500 mt-2 flex items-center space-x-1">
                          <span>💡</span>
                          <span>
                            Formato: 10 dígitos (4771234567) o con prefijo
                            (+524771234567)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Correos - simplificado */}
                    <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-200">
                      <Label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>Correos electrónicos</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Opcional
                        </span>
                      </Label>
                      <div className="space-y-2">
                        {watch("clienteNuevo.correos")?.map((_, index) => (
                          <div key={index} className="flex space-x-2">
                            <Input
                              type="email"
                              placeholder={`correo${index + 1}@ejemplo.com`}
                              {...register(`clienteNuevo.correos.${index}`)}
                              className="flex-1 border-gray-300 focus:border-green-500 focus:ring-green-500"
                            />
                            {index > 0 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-10 w-10 p-0 text-red-500 border-red-300 hover:bg-red-50"
                                onClick={() => {
                                  const correos =
                                    watch("clienteNuevo.correos") || [];
                                  correos.splice(index, 1);
                                  setValue("clienteNuevo.correos", correos);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {errors.clienteNuevo?.correos && (
                          <p className="text-sm text-red-600 flex items-center space-x-1">
                            <X className="h-4 w-4" />
                            <span>{errors.clienteNuevo.correos.message}</span>
                          </p>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full h-10 border-dashed border-gray-300 text-gray-600 hover:bg-gray-50"
                          onClick={() => {
                            const correos = watch("clienteNuevo.correos") || [];
                            setValue("clienteNuevo.correos", [...correos, ""]);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar correo
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Sección Contratista */}
          {(isEditMode || currentStep === 2) && (
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100 bg-white">
                <CardTitle className="flex items-center space-x-2 text-lg text-gray-900">
                  <Building className="h-5 w-5 text-gray-500" />
                  <span>Información del Contratista</span>
                  {!isEditMode && (
                    <span className="ml-auto text-sm text-gray-500">
                      Paso 2 de 5
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Opción de copiar del cliente - simplificada */}
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <Label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={copiarDeCliente}
                      onChange={(e) => setCopiarDeCliente(e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        Copiar nombre del cliente
                      </span>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                        Automático
                      </span>
                    </div>
                  </Label>
                  {copiarDeCliente && (
                    <p className="text-sm mt-2 ml-7 text-green-700">
                      ✨ El nombre se copiará automáticamente del cliente
                      seleccionado
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="nombreContratista"
                    className="text-sm font-medium text-gray-700 flex items-center space-x-2"
                  >
                    <Building className="h-4 w-4 text-gray-500" />
                    <span>Nombre del Contratista *</span>
                  </Label>
                  <Input
                    id="nombreContratista"
                    placeholder="Nombre completo del contratista"
                    {...register("nombreContratista")}
                    disabled={copiarDeCliente}
                    className={`${
                      copiarDeCliente
                        ? "bg-gray-50 text-gray-500 border-gray-300"
                        : "border-gray-300 focus:border-green-500 focus:ring-green-500"
                    }`}
                  />
                  {errors.nombreContratista && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <X className="h-4 w-4" />
                      <span>{errors.nombreContratista.message}</span>
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
                <CardTitle className="flex items-center space-x-2 text-lg text-gray-900">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <span>Detalles de la Obra</span>
                  {!isEditMode && (
                    <span className="ml-auto text-sm text-gray-500">
                      Paso 3 de 5
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="descripcionObra"
                    className="text-sm font-medium text-gray-700 flex items-center space-x-2"
                  >
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span>Descripción de la Obra *</span>
                  </Label>
                  <Textarea
                    id="descripcionObra"
                    placeholder="Describe detalladamente la obra a realizar..."
                    rows={4}
                    {...register("descripcionObra")}
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500 resize-none"
                  />
                  {errors.descripcionObra && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <X className="h-4 w-4" />
                      <span>{errors.descripcionObra.message}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="tramo"
                      className="text-sm font-medium text-gray-700"
                    >
                      Tramo
                    </Label>
                    <Input
                      id="tramo"
                      placeholder="Ej: Km 0+000 - Km 5+000"
                      {...register("tramo")}
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="colonia"
                      className="text-sm font-medium text-gray-700"
                    >
                      Colonia
                    </Label>
                    <Input
                      id="colonia"
                      placeholder="Nombre de la colonia"
                      {...register("colonia")}
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="calle"
                      className="text-sm font-medium text-gray-700"
                    >
                      Calle
                    </Label>
                    <Input
                      id="calle"
                      placeholder="Nombre de la calle"
                      {...register("calle")}
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="contactoResponsable"
                      className="text-sm font-medium text-gray-700 flex items-center space-x-2"
                    >
                      <User className="h-4 w-4 text-gray-500" />
                      <span>Contacto Responsable</span>
                    </Label>
                    <Input
                      id="contactoResponsable"
                      placeholder="Nombre del responsable en obra"
                      {...register("contactoResponsable")}
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="fechaInicio"
                      className="text-sm font-medium text-gray-700 flex items-center space-x-2"
                    >
                      <svg
                        className="h-4 w-4 text-gray-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Fecha de Inicio</span>
                    </Label>
                    <Input
                      id="fechaInicio"
                      type="date"
                      {...register("fechaInicio")}
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
                  <Calculator className="h-5 w-5 text-gray-500" />
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
                    <span>Área para Código de Obra *</span>
                    <span className="text-sm font-normal text-gray-500">
                      (El código se generará automáticamente)
                    </span>
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
                      <X className="h-4 w-4" style={{ color: "#C0392B" }} />
                      <p
                        className="text-sm font-medium"
                        style={{ color: "#C0392B" }}
                      >
                        {errors.areaCodigo.message}
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

                    if (areasDisponibles.length === 0 && areaActualConceptos) {
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
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="text-green-700 text-sm">
                              📋 <strong>Conceptos cargados de:</strong>{" "}
                              {
                                areasJerarquicas?.find(
                                  (a) => a.id === areaActualConceptos
                                )?.nombre
                              }
                            </div>
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
                          modoVisualizacion === "todos" ? "default" : "outline"
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
                        <Search
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors"
                          style={{
                            color: busquedaConcepto ? "#F39C12" : "#6C757D",
                          }}
                        />
                        <Input
                          type="text"
                          placeholder="Buscar conceptos por descripción, código o unidad..."
                          value={busquedaConcepto}
                          onChange={(e) => setBusquedaConcepto(e.target.value)}
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
                              e.currentTarget.style.backgroundColor = "#FEE2E2";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                            }}
                            onClick={() => setBusquedaConcepto("")}
                          >
                            <X
                              className="h-4 w-4"
                              style={{ color: "#C0392B" }}
                            />
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
                        {conceptosFiltrados.map((concepto) => (
                          <div
                            key={concepto.codigo}
                            className="flex items-start space-x-4 p-4 rounded-xl border transition-all hover:shadow-md"
                            style={{
                              backgroundColor: conceptosSeleccionados.includes(
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
                                  borderColor: conceptosSeleccionados.includes(
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
                              <div
                                className="font-semibold text-base mb-1"
                                style={{ color: "#2C3E50" }}
                              >
                                {concepto.descripcion}
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
                        ))}
                      </div>
                    ) : (
                      <div
                        className="text-center py-12 rounded-xl border-2 border-dashed"
                        style={{
                          borderColor: "#E5E7EB",
                          backgroundColor: "#F8F9FA",
                        }}
                      >
                        <Search
                          className="h-12 w-12 mx-auto mb-4 opacity-50"
                          style={{ color: "#6C757D" }}
                        />
                        <p
                          className="text-lg font-medium mb-2"
                          style={{ color: "#2C3E50" }}
                        >
                          No se encontraron conceptos
                        </p>
                        <p className="text-sm" style={{ color: "#6C757D" }}>
                          No hay conceptos que coincidan con "{busquedaConcepto}
                          "
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
                      <Calculator
                        className="h-12 w-12 mx-auto mb-4 opacity-50"
                        style={{ color: "#6C757D" }}
                      />
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
                      <X className="h-4 w-4" style={{ color: "#C0392B" }} />
                      <p
                        className="text-sm font-medium"
                        style={{ color: "#C0392B" }}
                      >
                        {errors.conceptosSeleccionados.message}
                      </p>
                    </div>
                  )}
                </div>
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
                                      (conceptoEnForm?.cantidad || 1) <= 999999
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
                                    <X
                                      className="h-4 w-4"
                                      style={{ color: "#C0392B" }}
                                    />
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
                                    <X
                                      className="h-4 w-4"
                                      style={{ color: "#C0392B" }}
                                    />
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
                    className="flex items-center space-x-2 p-3 rounded-lg border"
                    style={{
                      backgroundColor: "#FEE2E2",
                      borderColor: "#F87171",
                    }}
                  >
                    <X className="h-4 w-4" style={{ color: "#C0392B" }} />
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#C0392B" }}
                    >
                      {errors.conceptos.message}
                    </p>
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
                    <div className="p-2 bg-white/20 rounded-lg">
                      <FileText className="h-6 w-6" />
                    </div>
                    <span className="font-semibold">
                      Totales y Forma de Pago
                    </span>
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
                        className="p-2 rounded-full"
                        style={{ backgroundColor: "#C0392B" }}
                      >
                        <X className="h-5 w-5 text-white" />
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

                  <div className="space-y-3">
                    <Label
                      htmlFor="formaPago"
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
                      <span>Forma de Pago</span>
                    </Label>
                    <Select
                      value={watch("formaPago")}
                      onValueChange={(value) => setValue("formaPago", value)}
                    >
                      <SelectTrigger
                        className="h-12 border-2 rounded-xl shadow-sm transition-all"
                        style={{
                          borderColor: "#6C757D",
                          backgroundColor: "#FFFFFF",
                        }}
                      >
                        <SelectValue placeholder="Seleccionar forma de pago..." />
                      </SelectTrigger>
                      <SelectContent
                        className="rounded-xl border-2 shadow-xl"
                        style={{ backgroundColor: "#FFFFFF" }}
                      >
                        <SelectItem
                          value="efectivo"
                          className="py-3 px-4 hover:bg-green-50 focus:bg-green-50 rounded-lg m-1 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: "#68A53B" }}
                            ></div>
                            <span>Efectivo</span>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="transferencia"
                          className="py-3 px-4 hover:bg-blue-50 focus:bg-blue-50 rounded-lg m-1 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: "#2C3E50" }}
                            ></div>
                            <span>Transferencia</span>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="cheque"
                          className="py-3 px-4 hover:bg-orange-50 focus:bg-orange-50 rounded-lg m-1 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: "#E67E22" }}
                            ></div>
                            <span>Cheque</span>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="credito"
                          className="py-3 px-4 hover:bg-yellow-50 focus:bg-yellow-50 rounded-lg m-1 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: "#F39C12" }}
                            ></div>
                            <span>Crédito</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
                          IVA ({(SYSTEM_CONSTANTS.IVA_RATE * 100).toFixed(0)}%):
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
                onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
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
                  onClick={() => reset()}
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
                  <X className="h-4 w-4 mr-2" />
                  Limpiar Formulario
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
  );
}
