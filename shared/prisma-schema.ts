import { z } from "zod";

// Enums
export const budgetStatusEnum = z.enum([
  "draft",
  "pending",
  "approved",
  "rejected",
  "active",
  "completed",
]);
export const serviceOrderStatusEnum = z.enum([
  "scheduled",
  "in_field",
  "in_lab",
  "completed",
  "cancelled",
]);
export const sampleStatusEnum = z.enum([
  "collected",
  "in_lab",
  "tested",
  "completed",
]);
export const reportStatusEnum = z.enum([
  "draft",
  "in_review",
  "completed",
  "signed",
]);
export const priorityEnum = z.enum(["low", "medium", "high", "critical"]);
export const testTypeEnum = z.enum([
  // Control de Calidad (PCC)
  "PCC_CONCRETO",
  "PCC_ACERO",
  "PCC_SOLDADURA",
  "PCC_COMPACTACION",
  // Mecánica de Suelos (PMS)
  "PMS_CLASIFICACION",
  "PMS_COMPACTACION",
  "PMS_CBR",
  "PMS_PROCTOR",
  // Diseño de Pavimentos (PDP)
  "PDP_ASFALTO",
  "PDP_BASES",
  "PDP_SUBBASES",
  // Otros
  "OTRO",
]);
export const serviceTypeEnum = z.enum([
  "PCC",
  "PMS",
  "PDP",
  "ASFALTO",
  "ACERO",
  "COMPACTACION",
]);

// Regex patterns
const phoneRegex = /^(?:\+52|52)?[1-9][0-9]{9}$/;
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Insert schemas for validation
export const insertClientSchema = z.object({
  name: z.string().min(2, "El nombre del cliente es requerido"),
  contact: z
    .string()
    .min(2, "El nombre del responsable es requerido")
    .optional(),
  phone: z
    .string()
    .regex(
      phoneRegex,
      "El teléfono debe tener 10 dígitos y ser un número válido de México",
    )
    .optional(),
  email: z
    .string()
    .email("El correo electrónico debe tener un formato válido")
    .optional(),
  address: z.string().optional(),
});

export const insertProjectSchema = z.object({
  projectCode: z.string().min(2, "La clave de obra es requerida"),
  name: z.string().min(2, "El nombre del proyecto es requerido"),
  clientId: z.number({ required_error: "El cliente es requerido" }),
  location: z.string().min(2, "La ubicación es requerida"),
  description: z.string().optional(),
});

export const insertTestConceptSchema = z.object({
  conceptCode: z
    .string({ required_error: "El código del concepto es requerido" })
    .min(1, "El código del concepto no puede estar vacío"),
  name: z
    .string({ required_error: "El nombre del concepto es requerido" })
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  unit: z.string({ required_error: "La unidad de medida es requerida" }),
  basePrice: z
    .number({ required_error: "El precio base es requerido" })
    .positive("El precio base debe ser mayor a cero"),
  serviceType: serviceTypeEnum,
  subarea: z.string({ required_error: "La subárea es requerida" }),
  isActive: z.boolean().default(true),
});

const baseBudgetSchema = z.object({
  budgetCode: z
    .string({ required_error: "El código de presupuesto es requerido" })
    .min(1, "El código de presupuesto no puede estar vacío"),
  clientId: z.number({ required_error: "El cliente es requerido" }),
  contractorName: z.string().optional(),
  contractorContact: z.string().optional(),
  contractorPhone: z
    .string()
    .regex(
      phoneRegex,
      "El teléfono debe tener 10 dígitos y ser un número válido de México",
    )
    .optional(),
  contractorEmail: z
    .string()
    .email("El correo electrónico debe tener un formato válido")
    .optional(),
  projectName: z
    .string({ required_error: "El nombre del proyecto es requerido" })
    .min(2, "El nombre del proyecto debe tener al menos 2 caracteres"),
  projectDescription: z
    .string({ required_error: "La descripción del proyecto es requerida" })
    .min(10, "La descripción debe ser más específica"),
  projectScope: z
    .string()
    .min(10, "El alcance debe ser más específico")
    .optional(),
  projectResponsible: z.string().optional(),
  projectAddress: z
    .string({ required_error: "La dirección es requerida" })
    .min(5, "La dirección debe ser más específica"),
  location: z
    .string({ required_error: "La ubicación es requerida" })
    .min(5, "La ubicación debe ser más específica"),
  requestDate: z.coerce
    .date({ required_error: "La fecha de solicitud es requerida" })
    .refine((date) => date <= new Date(), {
      message: "La fecha de solicitud no puede ser futura",
    }),
  subtotalAmount: z
    .number({
      required_error: "El subtotal es requerido",
      invalid_type_error: "El subtotal debe ser un número",
    })
    .positive("El subtotal debe ser mayor a cero"),
  ivaAmount: z
    .number({
      required_error: "El monto de IVA es requerido",
      invalid_type_error: "El IVA debe ser un número",
    })
    .min(0, "El IVA no puede ser negativo"),
  totalAmount: z
    .number({
      required_error: "El monto total es requerido",
      invalid_type_error: "El monto total debe ser un número",
    })
    .positive("El monto total debe ser mayor a cero"),
  paymentPolicies: z.string().optional(),
  hasAdvancePayment: z.boolean().default(false),
  advancePaymentPercentage: z
    .number()
    .min(0, "El porcentaje de anticipo no puede ser negativo")
    .max(100, "El porcentaje de anticipo no puede ser mayor a 100")
    .optional(),
  status: budgetStatusEnum.default("draft"),
});

export const PresupuestoSchema = z.object({
  id: z.number().int(),
  fechaSolicitud: z.coerce.date(),
  claveObra: z.string().optional(),
  clienteId: z.number().int().optional(),
  nombreContratista: z.string().optional(),
  descripcionObra: z.string().optional(),
  alcance: z.string().optional(),
  direccion: z.string().optional(),
  contactoResponsable: z.string().optional(),
  manejaAnticipo: z.boolean().optional(),
  porcentajeAnticipo: z.number().optional(),
  iva: z.number().optional(),
  subtotal: z.number().optional(),
  ivaMonto: z.number().optional(),
  total: z.number().optional(),
  estado: z.any().optional(),
  razonRechazo: z.string().optional(),
});

const baseBudgetItemSchema = z.object({
  budgetId: z.number({ required_error: "El presupuesto es requerido" }),
  conceptId: z.number({ required_error: "El concepto es requerido" }),
  itemNumber: z.number({
    required_error: "El número de concepto es requerido",
  }),
  quantity: z
    .number({ required_error: "La cantidad es requerida" })
    .positive("La cantidad debe ser mayor a cero"),
  unitPrice: z
    .number({ required_error: "El precio unitario es requerido" })
    .positive("El precio unitario debe ser mayor a cero"),
  totalPrice: z
    .number({ required_error: "El precio total es requerido" })
    .positive("El precio total debe ser mayor a cero"),
});

export const insertBudgetItemSchema = baseBudgetItemSchema.refine(
  (data) => {
    if (
      typeof data.quantity !== "number" ||
      typeof data.unitPrice !== "number" ||
      typeof data.totalPrice !== "number"
    ) {
      return true; // Let individual field validations catch type errors
    }
    const calculatedTotal = Number((data.quantity * data.unitPrice).toFixed(2));
    return Math.abs(data.totalPrice - calculatedTotal) < 0.01;
  },
  {
    message:
      "El precio total no coincide con el cálculo cantidad × precio unitario",
    path: ["totalPrice"],
  },
);

export const insertServiceOrderSchema = z.object({
  orderCode: z.string().min(1, "El código de orden es requerido"),
  budgetId: z.number({ required_error: "El presupuesto es requerido" }),
  testType: z.string().min(1, "El tipo de prueba es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  location: z.string().min(1, "La ubicación es requerida"),
  priority: priorityEnum.default("medium"),
  status: serviceOrderStatusEnum.default("scheduled"),
  fieldManager: z.string().optional(),
  assignedTechnician: z.string().optional(),
  scheduledDate: z.coerce
    .date()
    .refine((date) => date >= new Date(), {
      message: "La fecha programada debe ser futura",
    })
    .optional(),
  dueDate: z.coerce
    .date()
    .refine((date) => date > new Date(), {
      message: "La fecha de vencimiento debe ser futura",
    })
    .optional(),
});

export const insertSampleSchema = z.object({
  sampleCode: z.string().min(1, "El código de muestra es requerido"),
  serviceOrderId: z.number({
    required_error: "La orden de servicio es requerida",
  }),
  description: z.string().min(1, "La descripción es requerida"),
  collectionDate: z.coerce.date().optional(),
  collectionLocation: z.string().optional(),
  collectedBy: z.string().optional(),
  status: sampleStatusEnum.default("collected"),
  testResults: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
});

export const insertFieldReportSchema = z.object({
  reportCode: z.string().min(1, "El código de reporte es requerido"),
  serviceOrderId: z.number({
    required_error: "La orden de servicio es requerida",
  }),
  reportType: z.string().min(1, "El tipo de reporte es requerido"),
  title: z.string().min(1, "El título es requerido"),
  reportDate: z.coerce.date(),
  technician: z.string().min(1, "El técnico es requerido"),
  fieldData: z.record(z.unknown()),
  validations: z.record(z.unknown()).optional(),
  signatures: z.record(z.unknown()).optional(),
  status: reportStatusEnum.default("draft"),
  pdfPath: z.string().optional(),
});

export const insertTestCatalogSchema = z.object({
  testCode: z.string().min(1, "El código de prueba es requerido"),
  testName: z.string().min(1, "El nombre de la prueba es requerido"),
  testType: z.string().min(1, "El tipo de prueba es requerido"),
  description: z.string().optional(),
  unit: z.string().min(1, "La unidad es requerida"),
  standardPrice: z
    .number()
    .positive("El precio estándar debe ser mayor a cero")
    .optional(),
  duration: z.number().positive("La duración debe ser mayor a cero").optional(),
  equipment: z.string().optional(),
  standards: z.string().optional(),
  isActive: z.boolean().default(true),
});

// Types derived from schemas
export type InsertClient = z.infer<typeof insertClientSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertTestConcept = z.infer<typeof insertTestConceptSchema>;
export type InsertBudget = z.infer<typeof baseBudgetSchema>;
export type InsertBudgetItem = z.infer<typeof insertBudgetItemSchema>;
export type InsertServiceOrder = z.infer<typeof insertServiceOrderSchema>;
export type InsertSample = z.infer<typeof insertSampleSchema>;
export type InsertFieldReport = z.infer<typeof insertFieldReportSchema>;
export type InsertTestCatalog = z.infer<typeof insertTestCatalogSchema>;

// Constantes del sistema
export const SYSTEM_CONSTANTS = {
  IVA_RATE: 0.16,
  EXTRA_HOUR_RATE: 394.7,
  BUSINESS_HOURS: {
    weekday: {
      start: "08:00",
      end: "17:00",
    },
    saturday: {
      start: "08:00",
      end: "14:00",
    },
  },
  SAMPLE_RETENTION_DAYS: 30,
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
