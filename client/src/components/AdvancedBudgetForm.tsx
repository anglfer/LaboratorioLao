import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { SYSTEM_CONSTANTS } from "@/../../shared/schema";
import { 
  User, 
  Building, 
  MapPin, 
  FileText, 
  Plus, 
  Trash2,
  Calculator,
  Phone,
  Mail
} from "lucide-react";

// Schemas - simplified for debugging
const budgetSchema = z.object({
  // Cliente
  clienteId: z.number().optional(),  clienteNuevo: z.object({
    nombre: z.string().optional(),
    direccion: z.string().optional(),
    telefonos: z.array(z.string()).optional().transform((arr) => 
      arr ? arr.filter(tel => tel && tel.trim().length > 0) : []
    ),
    correos: z.array(z.string()).optional()
      .transform((arr) => arr ? arr.filter(email => email && email.trim().length > 0) : [])
      .refine((arr) => {
        if (arr.length === 0) return true; // No hay correos para validar
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return arr.every(email => emailRegex.test(email));
      }, { message: "Uno o más correos tienen formato inválido" }),
  }).optional(),
  
  // Contratista
  nombreContratista: z.string().min(1, "El nombre del contratista es requerido"),
  copiarDeCliente: z.boolean().optional(),
  
  // Detalles de obra
  descripcionObra: z.string().min(1, "La descripción de la obra es requerida"),
  tramo: z.string().optional(),
  colonia: z.string().optional(),
  calle: z.string().optional(),
  contactoResponsable: z.string().optional(),
  fechaInicio: z.string().optional(),
  
  // Conceptos
  areaCodigo: z.string().min(1, "Debe seleccionar un área"),
  conceptos: z.array(z.object({
    conceptoCodigo: z.string().min(1, "Debe seleccionar un concepto"),
    cantidad: z.number().min(0.01, "La cantidad debe ser mayor a 0"),
    precioUnitario: z.number().min(0.01, "El precio debe ser mayor a 0"),  })).min(1, "Debe agregar al menos un concepto"),
  
  // Forma de pago
  formaPago: z.string().optional(),
}).refine((data) => {
  // Validar que se tenga un cliente seleccionado O un cliente nuevo con nombre
  if (data.clienteId) {
    return true; // Cliente existente seleccionado
  }
  if (data.clienteNuevo && data.clienteNuevo.nombre && data.clienteNuevo.nombre.trim().length > 0) {
    return true; // Cliente nuevo con nombre válido
  }
  return false;
}, {
  message: "Debe seleccionar un cliente existente o crear uno nuevo con nombre",
  path: ["clienteId"] // Asociar el error al campo clienteId
});

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

export default function AdvancedBudgetForm({ onSubmit, isLoading, initialData }: AdvancedBudgetFormProps) {
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(null);
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [selectedSubarea, setSelectedSubarea] = useState<number | null>(null);
  const [clienteNuevo, setClienteNuevo] = useState(false);
  const [copiarDeCliente, setCopiarDeCliente] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Debug: mostrar si estamos en modo edición
  useEffect(() => {
    if (initialData) {
      console.log('[AdvancedBudgetForm] EDIT MODE ACTIVATED with data:', initialData);
      setIsEditMode(true);
    } else {
      console.log('[AdvancedBudgetForm] CREATE MODE - no initial data');
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
    reset,  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      conceptos: [{ conceptoCodigo: "", cantidad: 1, precioUnitario: 0 }],
      clienteNuevo: {
        telefonos: [],
        correos: [],
      }
    }
  });

  const { fields: conceptosFields, append: appendConcepto, remove: removeConcepto } = useFieldArray({
    control,
    name: "conceptos"
  });

  // Queries
  const { data: clientes } = useQuery<Cliente[]>({
    queryKey: ["clientes"],
    queryFn: async () => {
      const response = await fetch("/api/clientes");
      return response.json();
    },
  });

  const { data: areas } = useQuery<Area[]>({
    queryKey: ["areas"],
    queryFn: async () => {
      const response = await fetch("/api/areas");
      return response.json();
    },
  });

  const { data: subareas } = useQuery<Subarea[]>({
    queryKey: ["subareas", selectedArea],
    queryFn: async () => {
      if (!selectedArea) return [];
      const response = await fetch(`/api/subareas?area=${selectedArea}`);
      return response.json();
    },
    enabled: !!selectedArea,
  });

  const { data: conceptos } = useQuery<Concepto[]>({
    queryKey: ["conceptos", selectedSubarea],
    queryFn: async () => {
      if (!selectedSubarea) return [];
      const response = await fetch(`/api/conceptos?subarea=${selectedSubarea}`);
      return response.json();
    },
    enabled: !!selectedSubarea,  });
  
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
    console.log('[AdvancedBudgetForm] All form values:', allFormValues);
  }, [allFormValues]);  useEffect(() => {
    console.log('[AdvancedBudgetForm] Form errors:', errors);
    if (errors.clienteNuevo) {
      console.log('[AdvancedBudgetForm] Cliente nuevo errors:', errors.clienteNuevo);
      if (errors.clienteNuevo.telefonos) {
        console.log('[AdvancedBudgetForm] Telefonos errors:', errors.clienteNuevo.telefonos);
      }
      if (errors.clienteNuevo.correos) {
        console.log('[AdvancedBudgetForm] Correos errors:', errors.clienteNuevo.correos);
      }
    }
  }, [errors]);
  useEffect(() => {
    if (copiarDeCliente && selectedClienteId && clientes) {
      const cliente = clientes.find(c => c.id === selectedClienteId);
      if (cliente) {
        setValue("nombreContratista", cliente.nombre);
        // Copiar también direccion si está disponible
        if (cliente.direccion && clienteNuevo) {
          setValue("clienteNuevo.nombre", cliente.nombre);
          setValue("clienteNuevo.direccion", cliente.direccion);
          
          // Copiar teléfonos
          if (cliente.telefonos && cliente.telefonos.length > 0) {
            const telefonos = cliente.telefonos.map(t => t.telefono);
            setValue("clienteNuevo.telefonos", telefonos);
          }
          
          // Copiar correos
          if (cliente.correos && cliente.correos.length > 0) {
            const correos = cliente.correos.map(c => c.correo);
            setValue("clienteNuevo.correos", correos);
          }
        }
      }
    } else if (copiarDeCliente && clienteNuevo && watchedClienteNombre) {
      setValue("nombreContratista", watchedClienteNombre);
    }
  }, [copiarDeCliente, selectedClienteId, clientes, clienteNuevo, watchedClienteNombre, setValue]);  // useEffect para cargar datos iniciales cuando se está editando
  useEffect(() => {
    if (initialData) {
      console.log('[AdvancedBudgetForm] Loading initial data for editing:', initialData);
      console.log('[AdvancedBudgetForm] initialData.detalles:', initialData.detalles);
      
      // Cargar datos del cliente
      if (initialData.clienteId) {
        console.log('[AdvancedBudgetForm] Setting clienteId:', initialData.clienteId);
        setSelectedClienteId(initialData.clienteId);
        setValue("clienteId", initialData.clienteId);
        setClienteNuevo(false);
      }
        // Cargar datos del contratista de la obra
      if (initialData.nombreContratista) {
        console.log('[AdvancedBudgetForm] Setting nombreContratista from main field:', initialData.nombreContratista);
        setValue("nombreContratista", initialData.nombreContratista);
      } else if (initialData.obra?.contratista) {
        console.log('[AdvancedBudgetForm] Setting nombreContratista from obra.contratista:', initialData.obra.contratista);
        setValue("nombreContratista", initialData.obra.contratista);
      }
      
      // Cargar datos de la obra
      if (initialData.descripcionObra) {
        console.log('[AdvancedBudgetForm] Setting descripcionObra:', initialData.descripcionObra);
        setValue("descripcionObra", initialData.descripcionObra);
      }
      if (initialData.tramo) {
        console.log('[AdvancedBudgetForm] Setting tramo:', initialData.tramo);
        setValue("tramo", initialData.tramo);
      }
      if (initialData.colonia) {
        console.log('[AdvancedBudgetForm] Setting colonia:', initialData.colonia);
        setValue("colonia", initialData.colonia);
      }
      if (initialData.calle) {
        console.log('[AdvancedBudgetForm] Setting calle:', initialData.calle);
        setValue("calle", initialData.calle);
      }
      if (initialData.contactoResponsable) {
        console.log('[AdvancedBudgetForm] Setting contactoResponsable:', initialData.contactoResponsable);
        setValue("contactoResponsable", initialData.contactoResponsable);
      }if (initialData.fechaInicio) {
        // Formatear la fecha para el input tipo date (YYYY-MM-DD)
        const fechaFormatted = new Date(initialData.fechaInicio).toISOString().split('T')[0];
        setValue("fechaInicio", fechaFormatted);
      }
      
      // Cargar área de la obra
      if (initialData.obra?.areaCodigo) {
        console.log('[AdvancedBudgetForm] Setting areaCodigo:', initialData.obra.areaCodigo);
        setValue("areaCodigo", initialData.obra.areaCodigo);        setSelectedArea(initialData.obra.areaCodigo);
      }
      
      // Cargar forma de pago
      if (initialData.formaPago) {
        console.log('[AdvancedBudgetForm] Setting formaPago:', initialData.formaPago);
        setValue("formaPago", initialData.formaPago);
      }
      
      // Cargar conceptos desde detalles
      if (initialData.detalles && initialData.detalles.length > 0) {
        console.log('[AdvancedBudgetForm] Loading conceptos from detalles:', initialData.detalles);
          const conceptos = initialData.detalles.map((detalle: any) => {
          console.log('[AdvancedBudgetForm] Processing detalle:', detalle);
          const conceptoCodigo = detalle.concepto?.codigo || detalle.conceptoCodigo || "";
          console.log('[AdvancedBudgetForm] Extracted conceptoCodigo:', conceptoCodigo);
          return {
            conceptoCodigo,
            cantidad: Number(detalle.cantidad) || 1,
            precioUnitario: Number(detalle.precioUnitario) || 0
          };
        });
        
        console.log('[AdvancedBudgetForm] Setting conceptos:', conceptos);
        setValue("conceptos", conceptos);
      } else {
        console.log('[AdvancedBudgetForm] No detalles found or empty');
      }
    } else {
      console.log('[AdvancedBudgetForm] No initialData provided');
    }
  }, [initialData, setValue, setSelectedArea]);

  // useEffect para limpiar el formulario cuando se sale del modo de edición
  useEffect(() => {
    if (!initialData) {      console.log('[AdvancedBudgetForm] No initialData - resetting form to defaults');
      reset({
        conceptos: [{ conceptoCodigo: "", cantidad: 1, precioUnitario: 0 }],
        clienteNuevo: {
          telefonos: [],
          correos: [],
        }
      });
      setSelectedClienteId(null);
      setSelectedArea("");
      setSelectedSubarea(null);
      setClienteNuevo(false);
      setCopiarDeCliente(false);
    }
  }, [initialData, reset]);
  // Calcular totales
  const subtotal = watchedConceptos.reduce((sum, concepto) => {
    return sum + (concepto.cantidad * concepto.precioUnitario);
  }, 0);
  
  const ivaMonto = subtotal * SYSTEM_CONSTANTS.IVA_RATE;
  const total = subtotal + ivaMonto;const handleFormSubmit = async (data: BudgetFormData) => {
    console.log('[AdvancedBudgetForm] handleFormSubmit called with data:', data);
    console.log('[AdvancedBudgetForm] Cliente nuevo teléfonos:', data.clienteNuevo?.telefonos);
    console.log('[AdvancedBudgetForm] Cliente nuevo correos:', data.clienteNuevo?.correos);
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
        clienteId = nuevoCliente.id;        // Agregar teléfonos
        if (data.clienteNuevo.telefonos) {
          for (const telefono of data.clienteNuevo.telefonos.filter(t => t && t.trim())) {
            const response = await fetch(`/api/clientes/${clienteId}/telefonos`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ telefono: telefono.trim() }),
            });
            if (!response.ok) {
              const errorData = await response.json();
              console.error("Error al agregar teléfono:", errorData);
              throw new Error(`Error al agregar teléfono: ${errorData.message || 'Error desconocido'}`);
            }
          }
        }

        // Agregar correos
        if (data.clienteNuevo.correos) {
          for (const correo of data.clienteNuevo.correos.filter(c => c && c.trim())) {
            const response = await fetch(`/api/clientes/${clienteId}/correos`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ correo: correo.trim() }),
            });
            if (!response.ok) {
              const errorData = await response.json();
              console.error("Error al agregar correo:", errorData);
              throw new Error(`Error al agregar correo: ${errorData.message || 'Error desconocido'}`);
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
        calle: data.calle,        contactoResponsable: data.contactoResponsable,
        formaPago: data.formaPago,
        iva: SYSTEM_CONSTANTS.IVA_RATE,
        subtotal,
        ivaMonto,
        total,
        estado: 'borrador',
        fechaSolicitud: new Date().toISOString(),
        fechaInicio: data.fechaInicio ? new Date(data.fechaInicio).toISOString() : null,
        conceptos: data.conceptos.map(concepto => ({
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
              <User className="h-5 w-5 text-blue-600" />
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
                  }}
                />
                <span>Cliente nuevo</span>
              </Label>
            </div>            {!clienteNuevo ? (
              <div className="space-y-2">
                <Label htmlFor="clienteId">Seleccionar Cliente</Label>
                <Select
                  value={selectedClienteId?.toString() || ""}
                  onValueChange={(value) => {
                    const id = parseInt(value);
                    setValue("clienteId", id);
                    setSelectedClienteId(id);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>                  <SelectContent>
                    {clientes?.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{cliente.nombre}</span>
                          {cliente.telefonos && cliente.telefonos.length > 0 && (
                            <span className="text-xs text-gray-500">
                              📞 {cliente.telefonos.map(t => t.telefono).join(', ')}
                            </span>
                          )}
                          {cliente.correos && cliente.correos.length > 0 && (
                            <span className="text-xs text-gray-500">
                              ✉️ {cliente.correos.map(c => c.correo).join(', ')}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.clienteId && (
                  <p className="text-sm text-red-600">{errors.clienteId.message}</p>
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
                      <p className="text-sm text-red-600">{errors.clienteNuevo.nombre.message}</p>
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
                  </Label>                  <div className="space-y-2">
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
                              const telefonos = watch("clienteNuevo.telefonos") || [];
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
                      <p className="text-sm text-red-600">{errors.clienteNuevo.telefonos.message}</p>
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
                  </Label>                  <div className="space-y-2">
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
                              const correos = watch("clienteNuevo.correos") || [];
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
                      <p className="text-sm text-red-600">{errors.clienteNuevo.correos.message}</p>
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
              <Building className="h-5 w-5 text-blue-600" />
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
                <p className="text-sm text-red-600">{errors.nombreContratista.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sección Detalles de Obra */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
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
                <p className="text-sm text-red-600">{errors.descripcionObra.message}</p>
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
                <Label htmlFor="contactoResponsable">Contacto Responsable</Label>
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
              <Calculator className="h-5 w-5 text-blue-600" />
              <span>Conceptos del Presupuesto</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">            {/* Selección de área */}
            <div className="space-y-2">
              <Label htmlFor="areaCodigo">Área de Trabajo</Label>
              <Select
                value={selectedArea || ""}
                onValueChange={(value) => {
                  setSelectedArea(value);
                  setValue("areaCodigo", value);
                  setSelectedSubarea(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar área" />
                </SelectTrigger>
                <SelectContent>
                  {areas?.map((area) => (
                    <SelectItem key={area.codigo} value={area.codigo}>
                      {area.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.areaCodigo && (
                <p className="text-sm text-red-600">{errors.areaCodigo.message}</p>
              )}
            </div>

            {/* Selección de subárea */}
            {selectedArea && (
              <div className="space-y-2">
                <Label htmlFor="subarea">Subárea</Label>
                <Select
                  value={selectedSubarea?.toString() || ""}
                  onValueChange={(value) => {
                    setSelectedSubarea(parseInt(value));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar subárea" />
                  </SelectTrigger>
                  <SelectContent>
                    {subareas?.map((subarea) => (
                      <SelectItem key={subarea.id} value={subarea.id.toString()}>
                        {subarea.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Separator />

            {/* Lista de conceptos */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Conceptos seleccionados</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendConcepto({ conceptoCodigo: "", cantidad: 1, precioUnitario: 0 })}
                  disabled={!selectedSubarea}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar concepto
                </Button>
              </div>

              {conceptosFields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">                    <div className="space-y-2">
                      <Label>Concepto</Label>
                      <Select
                        value={watch(`conceptos.${index}.conceptoCodigo`) || ""}
                        onValueChange={(value) => {
                          setValue(`conceptos.${index}.conceptoCodigo`, value);
                          const concepto = conceptos?.find(c => c.codigo === value);
                          if (concepto) {
                            setValue(`conceptos.${index}.precioUnitario`, Number(concepto.p_u));
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar concepto" />
                        </SelectTrigger>
                        <SelectContent>
                          {conceptos?.map((concepto) => (
                            <SelectItem key={concepto.codigo} value={concepto.codigo}>
                              {concepto.descripcion} ({concepto.unidad})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.conceptos?.[index]?.conceptoCodigo && (
                        <p className="text-xs text-red-600">
                          {errors.conceptos[index]?.conceptoCodigo?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="1.00"
                        {...register(`conceptos.${index}.cantidad`, { valueAsNumber: true })}
                      />
                      {errors.conceptos?.[index]?.cantidad && (
                        <p className="text-xs text-red-600">
                          {errors.conceptos[index]?.cantidad?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Precio Unitario</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        {...register(`conceptos.${index}.precioUnitario`, { valueAsNumber: true })}
                      />
                      {errors.conceptos?.[index]?.precioUnitario && (
                        <p className="text-xs text-red-600">
                          {errors.conceptos[index]?.precioUnitario?.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-end space-x-2">
                      <div className="flex-1">
                        <Label>Subtotal</Label>
                        <div className="px-3 py-2 border rounded-md bg-gray-50">
                          ${((watch(`conceptos.${index}.cantidad`) || 0) * (watch(`conceptos.${index}.precioUnitario`) || 0)).toFixed(2)}
                        </div>
                      </div>
                      {conceptosFields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeConcepto(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {errors.conceptos && (
                <p className="text-sm text-red-600">{errors.conceptos.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sección Totales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Totales y Forma de Pago</span>
            </CardTitle>
          </CardHeader>          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="formaPago">Forma de Pago</Label>
                <Select 
                  value={watch("formaPago") || ""}
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
              </div>              <div className="flex justify-between">
                <span>IVA ({(SYSTEM_CONSTANTS.IVA_RATE * 100).toFixed(0)}%):</span>
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
          </Button>          <Button 
            type="submit" 
            disabled={isLoading}
            onClick={() => console.log('[AdvancedBudgetForm] Submit button clicked')}
          >
            {isLoading ? "Creando..." : "Crear Presupuesto"}
          </Button>
        </div>
      </form>
    </div>
  );
}
