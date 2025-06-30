import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Separator } from "../../../shared/components/ui/separator";
import { Checkbox } from "../../../shared/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { SYSTEM_CONSTANTS } from "../../../../../shared/schema";
import {
  User,
  Building,
  MapPin,
  FileText,
  Plus,
  Trash2,
  Calculator,
  Phone,
  Mail,
  Search,
  X,
} from "lucide-react";

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

interface Subarea {
  id: number;
  nombre: string;
  areaCodigo: string;
}

interface Concepto {
  codigo: string;
  descripcion: string;
  unidad: string;
  p_u: number;
  subarea: {
    id: number;
    nombre: string;
    area: {
      codigo: string;
      nombre: string;
    };
  };
}

export default function AdvancedBudgetForm({
  onSubmit,
  isLoading,
  initialData,
}: AdvancedBudgetFormProps) {
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(
    null
  );
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [selectedSubarea, setSelectedSubarea] = useState<number | null>(null);
  const [conceptosSeleccionados, setConceptosSeleccionados] = useState<
    string[]
  >([]);
  const [busquedaConcepto, setBusquedaConcepto] = useState<string>("");
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
  // Queries
  const { data: clientes, error: clientesError } = useQuery<Cliente[]>({
    queryKey: ["clientes"],
    queryFn: async () => {
      const response = await fetch("/api/clientes");
      if (!response.ok) {
        throw new Error(`Error fetching clientes: ${response.statusText}`);
      }
      const data = await response.json();
      // Verificar que sea un array
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
  const { data: areas, error: areasError } = useQuery<Area[]>({
    queryKey: ["areas"],
    queryFn: async () => {
      const response = await fetch("/api/areas");
      if (!response.ok) {
        throw new Error(`Error fetching areas: ${response.statusText}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        console.error(
          "[AdvancedBudgetForm] Areas response is not an array:",
          data
        );
        return [];
      }
      return data;
    },
  });
  const { data: subareas, error: subareasError } = useQuery<Subarea[]>({
    queryKey: ["subareas", selectedArea],
    queryFn: async () => {
      if (!selectedArea) return [];
      const response = await fetch(`/api/subareas?area=${selectedArea}`);
      if (!response.ok) {
        throw new Error(`Error fetching subareas: ${response.statusText}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        console.error(
          "[AdvancedBudgetForm] Subareas response is not an array:",
          data
        );
        return [];
      }
      return data;
    },
    enabled: !!selectedArea,
  });
  const { data: conceptos, error: conceptosError } = useQuery<Concepto[]>({
    queryKey: ["conceptos", selectedSubarea],
    queryFn: async () => {
      if (!selectedSubarea) return [];
      const response = await fetch(`/api/conceptos?subarea=${selectedSubarea}`);
      if (!response.ok) {
        throw new Error(`Error fetching conceptos: ${response.statusText}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        console.error(
          "[AdvancedBudgetForm] Conceptos response is not an array:",
          data
        );
        return [];
      }
      return data;
    },
    enabled: !!selectedSubarea,
  });

  // Efecto para inicializar campos cuando se selecciona cliente nuevo
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
      if (initialData.obra?.areaCodigo && areas) {
        console.log(
          "[AdvancedBudgetForm] Setting areaCodigo:",
          initialData.obra.areaCodigo
        );
        console.log("[AdvancedBudgetForm] Available areas:", areas);
        const areaExists = areas.find(
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

        // Primero, obtener la subárea del primer concepto para establecer el contexto
        const primerDetalle = initialData.detalles[0];
        if (primerDetalle?.concepto?.subarea) {
          const subareaId = primerDetalle.concepto.subarea.id;
          console.log(
            "[AdvancedBudgetForm] Setting selectedSubarea from first concepto:",
            subareaId
          );
          setSelectedSubarea(subareaId);
        }

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
  }, [initialData, setValue, setSelectedArea, clientes, areas]);

  // useEffect adicional para manejar la carga cuando todos los datos estén disponibles
  useEffect(() => {
    if (initialData && clientes && areas && subareas && !isEditMode) {
      console.log("[AdvancedBudgetForm] All data ready, setting edit mode");
      setIsEditMode(true);
    }
  }, [initialData, clientes, areas, subareas, isEditMode]);

  // Debug: Log de valores actuales de los selects
  useEffect(() => {
    if (isEditMode) {
      console.log("[DEBUG] Current form values:");
      console.log("- selectedClienteId:", selectedClienteId);
      console.log("- selectedArea:", selectedArea);
      console.log("- selectedSubarea:", selectedSubarea);
      console.log("- formaPago:", watch("formaPago"));
      console.log("- conceptos:", watch("conceptos"));
    }
  }, [selectedClienteId, selectedArea, selectedSubarea, watch, isEditMode]);
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
      setSelectedSubarea(null);
      setConceptosSeleccionados([]);
      setBusquedaCliente("");
      setClienteNuevo(false);
      setCopiarDeCliente(false);
    }
  }, [initialData, reset]);
  // Efecto para limpiar conceptos seleccionados cuando cambia la subárea
  useEffect(() => {
    setConceptosSeleccionados([]);
    setValue("conceptosSeleccionados", []);
    setValue("conceptos", []);
    setBusquedaConcepto(""); // Limpiar búsqueda al cambiar subárea
  }, [selectedSubarea, setValue]);

  // Calcular totales
  const subtotal = watchedConceptos.reduce((sum, concepto) => {
    return sum + concepto.cantidad * concepto.precioUnitario;
  }, 0);

  const ivaMonto = subtotal * SYSTEM_CONSTANTS.IVA_RATE;
  const total = subtotal + ivaMonto;

  // Funciones para manejar selección múltiple de conceptos
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
      const concepto = conceptos?.find((c) => c.codigo === conceptoCodigo);
      if (concepto) {
        const newConcepto = {
          conceptoCodigo: concepto.codigo,
          cantidad: 1,
          precioUnitario: Number(concepto.p_u),
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

  // Función para filtrar conceptos por búsqueda
  const conceptosFiltrados =
    conceptos?.filter((concepto) => {
      if (!busquedaConcepto.trim()) return true;

      const terminoBusqueda = busquedaConcepto.toLowerCase();
      return (
        concepto.descripcion.toLowerCase().includes(terminoBusqueda) ||
        concepto.codigo.toLowerCase().includes(terminoBusqueda) ||
        concepto.unidad.toLowerCase().includes(terminoBusqueda)
      );
    }) || [];

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
            const response = await fetch(
              `/api/clientes/${clienteId}/telefonos`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ telefono: telefono.trim() }),
              }
            );
            if (!response.ok) {
              const errorData = await response.json();
              console.error("Error al agregar teléfono:", errorData);
              throw new Error(
                `Error al agregar teléfono: ${
                  errorData.message || "Error desconocido"
                }`
              );
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
    <div className="space-y-6">
      {/* Debug indicator */}
      {isEditMode && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong>MODO EDICIÓN ACTIVO</strong> - ID: {initialData?.id}
          {initialData?.detalles && (
            <span> | Conceptos: {initialData.detalles.length}</span>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* Sección Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-green-600" />
              <span>Información del Cliente</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={!clienteNuevo}
                  onChange={() => {
                    setClienteNuevo(false);
                    setValue("clienteId", undefined);
                    setBusquedaCliente(""); // Limpiar búsqueda al cambiar modo
                  }}
                />
                <span>Cliente existente</span>
              </Label>
              <Label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={clienteNuevo}
                  onChange={() => {
                    setClienteNuevo(true);
                    setSelectedClienteId(null);
                    setBusquedaCliente(""); // Limpiar búsqueda al cambiar modo
                  }}
                />
                <span>Cliente nuevo</span>
              </Label>
            </div>{" "}
            {!clienteNuevo ? (
              <div className="space-y-4">
                <Label htmlFor="clienteId">Seleccionar Cliente</Label>

                {/* Campo de búsqueda */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por ID, nombre, correo o teléfono..."
                    value={busquedaCliente}
                    onChange={(e) => setBusquedaCliente(e.target.value)}
                    className="pl-10 pr-8"
                  />
                  {busquedaCliente && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setBusquedaCliente("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Selector de cliente */}
                <Select
                  value={selectedClienteId?.toString()}
                  onValueChange={(value) => {
                    const id = parseInt(value);
                    setValue("clienteId", id);
                    setSelectedClienteId(id);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {Array.isArray(clientesFiltrados) &&
                    clientesFiltrados.length > 0 ? (
                      clientesFiltrados.map((cliente) => (
                        <SelectItem
                          key={cliente.id}
                          value={cliente.id.toString()}
                        >
                          <div className="flex flex-col w-full">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                {cliente.nombre}
                              </span>
                              <span className="text-xs text-gray-400 ml-2">
                                ID: {cliente.id}
                              </span>
                            </div>
                            {cliente.direccion && (
                              <span className="text-xs text-gray-500">
                                📍 {cliente.direccion}
                              </span>
                            )}
                            {cliente.telefonos &&
                              cliente.telefonos.length > 0 && (
                                <span className="text-xs text-gray-500">
                                  📞{" "}
                                  {cliente.telefonos
                                    .map((t) => t.telefono)
                                    .join(", ")}
                                </span>
                              )}
                            {cliente.correos && cliente.correos.length > 0 && (
                              <span className="text-xs text-gray-500">
                                ✉️{" "}
                                {cliente.correos
                                  .map((c) => c.correo)
                                  .join(", ")}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    ) : busquedaCliente ? (
                      <SelectItem value="__no_results__" disabled>
                        No se encontraron clientes que coincidan con "
                        {busquedaCliente}"
                      </SelectItem>
                    ) : (
                      <SelectItem value="__no_clientes__" disabled>
                        {clientesError
                          ? "Error cargando clientes"
                          : "No hay clientes disponibles"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>

                {/* Mostrar resultados de búsqueda */}
                {busquedaCliente && (
                  <div className="text-sm text-gray-600">
                    {clientesFiltrados.length > 0
                      ? `${clientesFiltrados.length} cliente(s) encontrado(s)`
                      : "No se encontraron clientes"}
                  </div>
                )}

                {errors.clienteId && (
                  <p className="text-sm text-red-600">
                    {errors.clienteId.message}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clienteNombre">Nombre del Cliente</Label>
                    <Input
                      id="clienteNombre"
                      placeholder="Nombre completo"
                      {...register("clienteNuevo.nombre")}
                    />
                    {errors.clienteNuevo?.nombre && (
                      <p className="text-sm text-red-600">
                        {errors.clienteNuevo.nombre.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clienteDireccion">Dirección</Label>
                    <Input
                      id="clienteDireccion"
                      placeholder="Dirección completa"
                      {...register("clienteNuevo.direccion")}
                    />
                  </div>
                </div>

                {/* Teléfonos */}
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>Teléfonos</span>
                  </Label>{" "}
                  <div className="space-y-2">
                    {watch("clienteNuevo.telefonos")?.map((_, index) => (
                      <div key={index} className="flex space-x-2">
                        <Input
                          placeholder="Número de teléfono"
                          {...register(`clienteNuevo.telefonos.${index}`)}
                        />
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const telefonos =
                                watch("clienteNuevo.telefonos") || [];
                              telefonos.splice(index, 1);
                              setValue("clienteNuevo.telefonos", telefonos);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {errors.clienteNuevo?.telefonos && (
                      <p className="text-sm text-red-600">
                        {errors.clienteNuevo.telefonos.message}
                      </p>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const telefonos = watch("clienteNuevo.telefonos") || [];
                        setValue("clienteNuevo.telefonos", [...telefonos, ""]);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar teléfono
                    </Button>
                  </div>
                </div>

                {/* Correos */}
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Correos electrónicos</span>
                  </Label>{" "}
                  <div className="space-y-2">
                    {watch("clienteNuevo.correos")?.map((_, index) => (
                      <div key={index} className="flex space-x-2">
                        <Input
                          type="email"
                          placeholder="correo@ejemplo.com"
                          {...register(`clienteNuevo.correos.${index}`)}
                        />
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
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
                      <p className="text-sm text-red-600">
                        {errors.clienteNuevo.correos.message}
                      </p>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const correos = watch("clienteNuevo.correos") || [];
                        setValue("clienteNuevo.correos", [...correos, ""]);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar correo
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Sección Contratista */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-green-600" />
              <span>Información del Contratista</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={copiarDeCliente}
                  onChange={(e) => setCopiarDeCliente(e.target.checked)}
                />
                <span>Copiar nombre del cliente</span>
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nombreContratista">Nombre del Contratista</Label>
              <Input
                id="nombreContratista"
                placeholder="Nombre del contratista"
                {...register("nombreContratista")}
                disabled={copiarDeCliente}
              />
              {errors.nombreContratista && (
                <p className="text-sm text-red-600">
                  {errors.nombreContratista.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Sección Detalles de Obra */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-green-600" />
              <span>Detalles de la Obra</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="descripcionObra">Descripción de la Obra</Label>
              <Textarea
                id="descripcionObra"
                placeholder="Describe detalladamente la obra a realizar..."
                rows={3}
                {...register("descripcionObra")}
              />
              {errors.descripcionObra && (
                <p className="text-sm text-red-600">
                  {errors.descripcionObra.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tramo">Tramo</Label>
                <Input
                  id="tramo"
                  placeholder="Ej: Km 0+000 - Km 5+000"
                  {...register("tramo")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="colonia">Colonia</Label>
                <Input
                  id="colonia"
                  placeholder="Nombre de la colonia"
                  {...register("colonia")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="calle">Calle</Label>
                <Input
                  id="calle"
                  placeholder="Nombre de la calle"
                  {...register("calle")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactoResponsable">
                  Contacto Responsable
                </Label>
                <Input
                  id="contactoResponsable"
                  placeholder="Nombre del responsable en obra"
                  {...register("contactoResponsable")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  {...register("fechaInicio")}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Sección Conceptos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5 text-green-600" />
              <span>Conceptos del Presupuesto</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {" "}
            {/* Selección de área */}
            <div className="space-y-2">
              <Label htmlFor="areaCodigo">Área de Trabajo</Label>{" "}
              <Select
                value={selectedArea}
                onValueChange={(value) => {
                  setSelectedArea(value);
                  setValue("areaCodigo", value);
                  setSelectedSubarea(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar área" />
                </SelectTrigger>{" "}
                <SelectContent>
                  {Array.isArray(areas) && areas.length > 0 ? (
                    areas.map((area) => (
                      <SelectItem key={area.codigo} value={area.codigo}>
                        {" "}
                        {area.nombre}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__no_areas__" disabled>
                      {areasError
                        ? "Error cargando áreas"
                        : "No hay áreas disponibles"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.areaCodigo && (
                <p className="text-sm text-red-600">
                  {errors.areaCodigo.message}
                </p>
              )}
            </div>
            {/* Selección de subárea */}
            {selectedArea && (
              <div className="space-y-2">
                <Label htmlFor="subarea">Subárea</Label>{" "}
                <Select
                  value={selectedSubarea?.toString()}
                  onValueChange={(value) => {
                    setSelectedSubarea(parseInt(value));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar subárea" />
                  </SelectTrigger>{" "}
                  <SelectContent>
                    {Array.isArray(subareas) && subareas.length > 0 ? (
                      subareas.map((subarea) => (
                        <SelectItem
                          key={subarea.id}
                          value={subarea.id.toString()}
                        >
                          {subarea.nombre}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__no_subareas__" disabled>
                        {subareasError
                          ? "Error cargando subáreas"
                          : "No hay subáreas disponibles"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}{" "}
            <Separator /> {/* Lista de conceptos disponibles */}
            <div className="space-y-4">
              {" "}
              <div className="flex justify-between items-center">
                <h4 className="font-medium ">Conceptos Disponibles</h4>
                <div className="text-sm text-gray-600">
                  {conceptosSeleccionados.length} seleccionado(s) de{" "}
                  {conceptosFiltrados.length} mostrado(s)
                  {busquedaConcepto && ` (${conceptos?.length || 0} total)`}
                </div>
              </div>{" "}
              {/* Campo de búsqueda */}
              {conceptos && conceptos.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Buscar conceptos por descripción, código o unidad..."
                    value={busquedaConcepto}
                    onChange={(e) => setBusquedaConcepto(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {busquedaConcepto && (
                    <button
                      type="button"
                      onClick={() => setBusquedaConcepto("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      title="Limpiar búsqueda"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
              {/* Lista de conceptos con checkboxes */}
              {conceptos && conceptos.length > 0 ? (
                conceptosFiltrados.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto border rounded-md p-4 space-y-2">
                    {conceptosFiltrados.map((concepto) => (
                      <div
                        key={concepto.codigo}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
                      >
                        <Checkbox
                          id={`concepto-${concepto.codigo}`}
                          checked={conceptosSeleccionados.includes(
                            concepto.codigo
                          )}
                          onCheckedChange={() =>
                            handleConceptoToggle(concepto.codigo)
                          }
                        />
                        <label
                          htmlFor={`concepto-${concepto.codigo}`}
                          className="flex-1 cursor-pointer text-sm"
                        >
                          {" "}
                          <div className="font-medium">
                            {concepto.descripcion}
                          </div>
                          <div className="text-gray-500">
                            Unidad: {concepto.unidad} | Precio: $
                            {(Number(concepto.p_u) || 0).toFixed(2)}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>
                      No se encontraron conceptos que coincidan con "
                      {busquedaConcepto}"
                    </p>
                    <p className="text-sm mt-1">
                      Intenta con otros términos de búsqueda
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {!selectedSubarea
                    ? "Selecciona un área y subárea para ver los conceptos disponibles"
                    : "No hay conceptos disponibles para esta subárea"}
                </div>
              )}
              {errors.conceptosSeleccionados && (
                <p className="text-sm text-red-600">
                  {errors.conceptosSeleccionados.message}
                </p>
              )}
            </div>
            {/* Conceptos seleccionados con cantidades */}
            {conceptosSeleccionados.length > 0 && (
              <div className="space-y-4">
                <Separator />
                <h4 className="font-medium">
                  Configurar Conceptos Seleccionados
                </h4>

                {conceptosSeleccionados.map((conceptoCodigo) => {
                  const concepto = conceptos?.find(
                    (c) => c.codigo === conceptoCodigo
                  );
                  const conceptoEnForm = watch("conceptos")?.find(
                    (c) => c.conceptoCodigo === conceptoCodigo
                  );

                  if (!concepto) return null;

                  return (
                    <Card key={conceptoCodigo} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Concepto</Label>
                          <div className="p-2 border rounded-md bg-gray-50">
                            <div className="font-medium text-sm">
                              {concepto.descripcion}
                            </div>
                            <div className="text-xs text-gray-500">
                              ({concepto.unidad})
                            </div>
                          </div>
                        </div>{" "}
                        <div className="space-y-2">
                          <Label>Cantidad</Label>
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
                            className={
                              (conceptoEnForm?.cantidad || 1) > 999999
                                ? "border-red-500 focus:border-red-500"
                                : ""
                            }
                          />
                          {(conceptoEnForm?.cantidad || 1) > 999999 && (
                            <p className="text-sm text-red-600">
                              La cantidad no puede exceder 999,999
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Precio Unitario</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            max="9999999.99"
                            placeholder="0.00"
                            value={
                              conceptoEnForm?.precioUnitario ||
                              Number(concepto.p_u) ||
                              0
                            }
                            onChange={(e) =>
                              updateConceptoInForm(
                                conceptoCodigo,
                                "precioUnitario",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className={
                              (conceptoEnForm?.precioUnitario ||
                                Number(concepto.p_u) ||
                                0) > 9999999.99
                                ? "border-red-500 focus:border-red-500"
                                : ""
                            }
                          />
                          {(conceptoEnForm?.precioUnitario ||
                            Number(concepto.p_u) ||
                            0) > 9999999.99 && (
                            <p className="text-sm text-red-600">
                              El precio no puede exceder $9,999,999.99
                            </p>
                          )}
                        </div>
                        <div className="flex items-end space-x-2">
                          <div className="flex-1">
                            <Label>Subtotal</Label>
                            <div className="px-3 py-2 border rounded-md bg-gray-50">
                              $
                              {(
                                (conceptoEnForm?.cantidad || 1) *
                                  (conceptoEnForm?.precioUnitario ||
                                    Number(concepto.p_u) ||
                                    0) || 0
                              ).toFixed(2)}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleConceptoToggle(conceptoCodigo)}
                            title="Remover concepto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
            {errors.conceptos && (
              <p className="text-sm text-red-600">{errors.conceptos.message}</p>
            )}
          </CardContent>
        </Card>{" "}
        {/* Sección Totales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-green-600" />
              <span>Totales y Forma de Pago</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Validaciones y advertencias */}
            {subtotal > 5000000000 && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                <strong>Advertencia:</strong> El subtotal se acerca al límite
                permitido ($9,999,999,999.99).
              </div>
            )}
            {subtotal > 9999999999.99 && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <strong>Error:</strong> El subtotal excede el límite permitido.
                Reduzca las cantidades o precios.
              </div>
            )}

            {/* Totales */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Subtotal:</span>
                <span className="text-lg font-semibold">
                  $
                  {subtotal.toLocaleString("es-MX", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">IVA (16%):</span>
                <span className="text-lg font-semibold">
                  $
                  {ivaMonto.toLocaleString("es-MX", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Total:</span>
                <span className="text-xl font-bold text-green-600">
                  $
                  {total.toLocaleString("es-MX", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="formaPago">Forma de Pago</Label>{" "}
                <Select
                  value={watch("formaPago")}
                  onValueChange={(value) => setValue("formaPago", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar forma de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="credito">Crédito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Resumen de totales */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium mb-3">Resumen del Presupuesto</h4>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>{" "}
              <div className="flex justify-between">
                <span>
                  IVA ({(SYSTEM_CONSTANTS.IVA_RATE * 100).toFixed(0)}%):
                </span>
                <span className="font-medium">${ivaMonto.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Botones */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => reset()}>
            Limpiar
          </Button>{" "}
          <Button
            type="submit"
            disabled={isLoading}
            onClick={() =>
              console.log("[AdvancedBudgetForm] Submit button clicked")
            }
          >
            {isLoading
              ? isEditMode
                ? "Actualizando..."
                : "Creando..."
              : isEditMode
              ? "Actualizar Presupuesto"
              : "Crear Presupuesto"}
          </Button>
        </div>
      </form>
    </div>
  );
}
