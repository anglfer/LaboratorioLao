// Script de prueba para validar el schema
import { z } from 'zod';

// Recrear el schema para probar
const budgetSchema = z.object({
  clienteId: z.number().optional(),
  clienteNuevo: z.object({
    nombre: z.string().optional(),
    direccion: z.string().optional(),
    telefonos: z.array(z.string()).optional().transform((arr) => 
      arr ? arr.filter(tel => tel && tel.trim().length > 0) : []
    ),
    correos: z.array(z.string()).optional()
      .transform((arr) => arr ? arr.filter(email => email && email.trim().length > 0) : [])
      .refine((arr) => {
        if (arr.length === 0) return true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return arr.every(email => emailRegex.test(email));
      }, { message: "Uno o más correos tienen formato inválido" }),
  }).optional(),
  nombreContratista: z.string().min(1, "El nombre del contratista es requerido"),
  descripcionObra: z.string().min(1, "La descripción de la obra es requerida"),
  areaCodigo: z.string().min(1, "Debe seleccionar un área"),
  conceptos: z.array(z.object({
    conceptoCodigo: z.string().min(1, "Debe seleccionar un concepto"),
    cantidad: z.number().min(0.01, "La cantidad debe ser mayor a 0"),
    precioUnitario: z.number().min(0.01, "El precio debe ser mayor a 0"),
  })).min(1, "Debe agregar al menos un concepto"),
  iva: z.number().min(0).max(1, "El IVA debe ser entre 0 y 1"),
}).refine((data) => {
  if (data.clienteId) return true;
  if (data.clienteNuevo && data.clienteNuevo.nombre && data.clienteNuevo.nombre.trim().length > 0) {
    return true;
  }
  return false;
}, {
  message: "Debe seleccionar un cliente existente o crear uno nuevo con nombre",
  path: ["clienteId"]
});

// Casos de prueba
const testCases = [
  {
    name: "Cliente nuevo con teléfonos vacíos",
    data: {
      clienteNuevo: {
        nombre: "Test Cliente",
        telefonos: ["", ""],
        correos: [""]
      },
      nombreContratista: "Test Contratista",
      descripcionObra: "Test Obra",
      areaCodigo: "LAB",
      conceptos: [{ conceptoCodigo: "LAB001", cantidad: 1, precioUnitario: 100 }],
      iva: 0.16
    }
  },
  {
    name: "Cliente nuevo con correos inválidos",
    data: {
      clienteNuevo: {
        nombre: "Test Cliente",
        telefonos: ["4771234567"],
        correos: ["invalid-email"]
      },
      nombreContratista: "Test Contratista", 
      descripcionObra: "Test Obra",
      areaCodigo: "LAB",
      conceptos: [{ conceptoCodigo: "LAB001", cantidad: 1, precioUnitario: 100 }],
      iva: 0.16
    }
  }
];

testCases.forEach((testCase) => {
  console.log(`\nTesting: ${testCase.name}`);
  const result = budgetSchema.safeParse(testCase.data);
  if (result.success) {
    console.log('✅ Validation passed');
    console.log('Transformed data:', JSON.stringify(result.data.clienteNuevo, null, 2));
  } else {
    console.log('❌ Validation failed');
    console.log('Errors:', result.error.errors);
  }
});
