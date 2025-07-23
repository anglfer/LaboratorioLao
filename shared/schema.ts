import { z } from "zod";

const img = "../assets/img/versionPresupuesto.png"; // Placeholder for the logo URL

// Enums
export const presupuestoEstadoEnum = z.enum([
  "borrador",
  "enviado",
  "aprobado",
  "rechazado",
  "finalizado",
]);
export const detalleEstadoEnum = z.enum(["en_proceso", "hecho"]);

// Regex patterns
const phoneRegex = /^(?:\+52|52)?[0-9]{10}$/;
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Insert schemas for validation
export const insertClienteSchema = z.object({
  nombre: z.string().min(2, "El nombre del cliente es requerido"),
  direccion: z.string().optional(),
  activo: z.boolean().default(true),
  telefonos: z.array(z.object({
    telefono: z.string().regex(
      phoneRegex,
      "El teléfono debe tener 10 dígitos (ej: 4771234567 o +524771234567)",
    ),
  })).optional().default([]),
  correos: z.array(z.object({
    correo: z.string().regex(
      emailRegex,
      "Debe ser un correo electrónico válido",
    ),
  })).optional().default([]),
});

export const insertTelefonoSchema = z.object({
  clienteId: z.number({ required_error: "El cliente es requerido" }),
  telefono: z
    .string()
    .regex(
      phoneRegex,
      "El teléfono debe tener 10 dígitos (ej: 4771234567 o +524771234567)",
    ),
});

export const insertCorreoSchema = z.object({
  clienteId: z.number({ required_error: "El cliente es requerido" }),
  correo: z
    .string()
    .email("El correo electrónico debe tener un formato válido"),
});

export const insertAreaSchema = z.object({
  codigo: z.string().min(1, "El código del área es requerido").max(50),
  nombre: z.string().min(2, "El nombre del área es requerido").max(255),
});

export const insertSubareaSchema = z.object({
  nombre: z.string().min(2, "El nombre de la subárea es requerido").max(255),
  areaCodigo: z.string().min(1, "El código del área es requerido").max(50),
});

export const insertConceptoSchema = z.object({
  codigo: z.string().min(1, "El código del concepto es requerido").max(50),
  subareaId: z.number({ required_error: "La subárea es requerida" }),
  descripcion: z.string().max(1000).optional(),
  unidad: z.string().min(1, "La unidad es requerida").max(50),
  p_u: z
    .number({ required_error: "El precio unitario es requerido" })
    .positive("El precio unitario debe ser mayor a cero"),
});

export const insertObraSchema = z.object({
  areaCodigo: z.string().min(1, "El código del área es requerido").max(50),
  contratista: z.string().max(50).optional(),
  estado: z.number().int().min(0).max(2).optional(),
});

export const insertPresupuestoSchema = z.object({
  claveObra: z.string().max(20).optional(),
  clienteId: z.number({ required_error: "El cliente es requerido" }),
  iva: z.number().min(0).max(1).default(0.16),
  estado: presupuestoEstadoEnum.default("borrador"),
  fechaInicio: z.coerce.date().optional(),
});

export const insertPresupuestoDetalleSchema = z.object({
  presupuestoId: z.number({ required_error: "El presupuesto es requerido" }),
  conceptoCodigo: z
    .string()
    .min(1, "El código del concepto es requerido")
    .max(50),
  precioUnitario: z
    .number({ required_error: "El precio unitario es requerido" })
    .positive("El precio unitario debe ser mayor a cero"),
  estado: detalleEstadoEnum.default("en_proceso"),
});

// Types derived from schemas
export type InsertCliente = z.infer<typeof insertClienteSchema>;
export type InsertTelefono = z.infer<typeof insertTelefonoSchema>;
export type InsertCorreo = z.infer<typeof insertCorreoSchema>;
export type InsertArea = z.infer<typeof insertAreaSchema>;
export type InsertSubarea = z.infer<typeof insertSubareaSchema>;
export type InsertConcepto = z.infer<typeof insertConceptoSchema>;
export type InsertObra = z.infer<typeof insertObraSchema>;
export type InsertPresupuesto = z.infer<typeof insertPresupuestoSchema>;
export type InsertPresupuestoDetalle = z.infer<
  typeof insertPresupuestoDetalleSchema
>;

// Constantes del sistema
export const SYSTEM_CONSTANTS = {
  IVA_RATE: 0.16,
  COMPANY_INFO: {
    name: "Laboratorio y Consultoría Loa S.A. de C.V.",
    manager: "Ing. Luis Recendis Martínez",
    position: "Gerente General",
    fiscalId: "LAC123456789",
    phone: "TEL. 01 (477)210-2263. CEL:477-724-6999",
    email: "controldecalidad@loalaboratorio.com",
    address: "Av. la Presa 519-511, 37677 Ibarrilla, Gto.",
    website: "https://loalaboratorio.com/",
  },
  TERMS_AND_CONDITIONS: [
    "Las cantidades en presupuesto pueden sufrir variación en función de las pruebas elaboradas, por lo que el presente presupuesto es una referencia de los costos. En la realización de visitas a obra para actividades de muestreo se deberá considerar el costo de viáticos de traslado (CC.060) por actividad.",
    "El horario de servicio es de 08:00 a 17:00 hrs de lunes a viernes, sábados de 08:00 a 14:00 hrs. Trabajos fuera del horario se tomarán como tiempo extraordinario con un costo de $394.70 más IVA por hora.",
    "Una vez finalizados los trabajos y entregados los informes correspondientes, se dará un período de 30 días para mantener los materiales en laboratorio; posteriormente se desecharán los mismos.",
    "Los accesos al lugar de la obra, la ubicación de las exploraciones y los permisos necesarios para su realización correrán por cuenta del contratante.",
    "Para iniciar los trabajos se requiere la aceptación del presupuesto firmando la orden de servicio correspondiente, preferentemente por el representante legal. La entrega de información final con los resultados se realizará una vez liquidado el monto de los trabajos ejecutados.",
    "En caso de requerir cualquier tipo de modificación en el alcance de este presupuesto después de su firma, se realizará un nuevo presupuesto.",
    "Anexo I. Métodos de prueba, Frecuencia de muestreo, Criterios de aceptación y Rechazo, Políticas de Laboratorio, Imparcialidad y Confidencialidad.",
  ],
};
