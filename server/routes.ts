import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "./prisma";

import {
  insertClienteSchema,
  insertTelefonoSchema,
  insertCorreoSchema,
  insertAreaSchema,
  insertSubareaSchema,
  insertConceptoSchema,
  insertObraSchema,
  insertPresupuestoSchema,
  insertPresupuestoDetalleSchema,
  SYSTEM_CONSTANTS,
} from "@shared/schema";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generatePresupuestoHTML(
  presupuesto: any,
  detalles: any[],
  forPDF = false,
) {
  const subtotal = presupuesto.subtotal || 0;
  const iva = presupuesto.ivaMonto || 0;
  const total = presupuesto.total || 0;
  const fechaGeneracion = new Date().toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Obtener el estado del presupuesto con color apropiado
  const estadoColors = {
    borrador: { bg: "#fef3c7", text: "#92400e", border: "#f59e0b" },
    enviado: { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6" },
    aprobado: { bg: "#dcfce7", text: "#166534", border: "#22c55e" },
    rechazado: { bg: "#fee2e2", text: "#dc2626", border: "#ef4444" },
    finalizado: { bg: "#f3f4f6", text: "#374151", border: "#6b7280" },
  };

  const estadoConfig =
    estadoColors[presupuesto.estado] || estadoColors["borrador"];

  // Agrupar conceptos por área y subárea para el resumen ejecutivo
  const conceptosPorArea = detalles.reduce((acc, detalle) => {
    const area = detalle.concepto?.subarea?.area?.nombre || "Sin área";
    const subarea = detalle.concepto?.subarea?.nombre || "Sin subárea";

    if (!acc[area]) {
      acc[area] = new Set();
    }
    acc[area].add(subarea);
    return acc;
  }, {});

  return `
<!DOCTYPE html>
<html lang="es">;
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presupuesto ${presupuesto.claveObra} - Laboratorio LOA</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            font-size: 11px;
            line-height: 1.4;
            color: #333;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #0066cc;
        }
        
        .logo-section {
            flex: 1;
        }
        
        .logo {
            max-width: 200px;
            height: auto;
        }
        
        .company-info {
            margin-top: 10px;
            font-size: 10px;
            color: #666;
        }
        
        .document-info {
            text-align: right;
            flex: 1;
        }
        
        .budget-code {
            font-size: 18px;
            font-weight: bold;
            color: #0066cc;
            margin-bottom: 10px;
        }
        
        .status-badge {
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 10px;
            font-weight: bold;
            background-color: ${estadoConfig.bg};
            color: ${estadoConfig.text};
            border: 1px solid ${estadoConfig.border};
            text-transform: uppercase;
        }
        
        .client-section {
            background-color: #f8f9fa;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #0066cc;
        }
        
        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #0066cc;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        
        .section-title::before {
            content: '';
            width: 20px;
            height: 2px;
            background-color: #0066cc;
            margin-right: 10px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .info-item {
            margin-bottom: 8px;
        }
        
        .info-label {
            font-weight: bold;
            color: #555;
        }
        
        .concepts-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 10px;
        }
        
        .concepts-table th {
            background-color: #0066cc;
            color: white;
            padding: 10px 8px;
            text-align: left;
            font-weight: bold;
        }
        
        .concepts-table td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
        }
        
        .concepts-table tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
        
        .totals-section {
            background-color: #f8f9fa;
            padding: 20px;
            margin: 20px 0;
            border: 1px solid #ddd;
        }
        
        .totals-table {
            width: 100%;
            font-size: 12px;
        }
        
        .totals-table td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
        }
        
        .total-final {
            font-size: 16px;
            font-weight: bold;
            color: #0066cc;
        }
        
        .executive-summary {
            margin: 30px 0;
            padding: 20px;
            background-color: #fff;
            border: 1px solid #ddd;
        }
        
        .areas-list {
            columns: 2;
            column-gap: 30px;
            margin-top: 15px;
        }
        
        .area-item {
            break-inside: avoid;
            margin-bottom: 15px;
        }
        
        .area-name {
            font-weight: bold;
            color: #0066cc;
            margin-bottom: 5px;
        }
        
        .subarea-list {
            margin-left: 15px;
        }
        
        .subarea-item {
            margin-bottom: 3px;
            display: flex;
            align-items: center;
        }
        
        .subarea-included {
            color: #22c55e;
            font-weight: bold;
        }
        
        .subarea-not-included {
            color: #6b7280;
        }
        
        .terms-section {
            margin: 30px 0;
            font-size: 10px;
            line-height: 1.5;
        }
        
        .terms-list {
            list-style: decimal;
            margin-left: 20px;
        }
        
        .terms-list li {
            margin-bottom: 10px;
        }
        
        .legal-clause {
            background-color: #fef3c7;
            padding: 15px;
            margin: 20px 0;
            border-left: 4px solid #f59e0b;
            font-style: italic;
            font-size: 11px;
        }
        
        .signatures-section {
            margin-top: 50px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 50px;
        }
        
        .signature-box {
            text-align: center;
            padding: 20px;
            border: 1px solid #ddd;
        }
        
        .signature-line {
            border-top: 2px solid #333;
            margin: 40px 0 10px 0;
            height: 1px;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        @media print {
            body {
                margin: 0;
                padding: 15px;
            }
            
            .page-break {
                page-break-before: always;
            }
        }
    </style>
</head>
<body>
    <!-- PÁGINA 1: INFORMACIÓN PRINCIPAL -->
    <div class="header">
        <div class="logo-section">
            <img src="/img/versionPresupuesto.png" alt="Laboratorio LOA" class="logo" />
            <div class="company-info">
                <strong>Laboratorio LOA</strong><br>
                Control de Calidad | Mecánica de Suelos | Diseño de Pavimentos<br>
                Av. la Presa 519-511, 37677 Ibarrilla, Gto.<br>
                Tel: (477) 123-4567 | Email: controldecalidad@loalaboratorio.com<br>
                www.loalaboratorio.com
            </div>
        </div>
        <div class="document-info">
            <div class="budget-code">PRESUPUESTO ${presupuesto.claveObra || "SIN-ASIGNAR"}</div>
            <div class="status-badge">${presupuesto.estado || "borrador"}</div>
            <div style="margin-top: 15px; font-size: 10px;">
                <strong>Fecha de Generación:</strong><br>
                ${fechaGeneracion}<br><br>
                <strong>Folio:</strong> ${presupuesto.id || "N/A"}
            </div>
        </div>
    </div>

    <!-- INFORMACIÓN DEL CLIENTE Y PROYECTO -->
    <div class="client-section">
        <div class="section-title">INFORMACIÓN DEL CLIENTE Y PROYECTO</div>
        
        <div class="info-grid">
            <div>
                <div class="info-item">
                    <span class="info-label">Dirigido a:</span> ${presupuesto.cliente?.nombre || "Cliente no especificado"}
                </div>
                <div class="info-item">
                    <span class="info-label">Dirección:</span> ${presupuesto.cliente?.direccion || "No especificada"}
                </div>
                <div class="info-item">
                    <span class="info-label">Atención:</span> ${presupuesto.contactoResponsable || "No especificado"}
                </div>
            </div>
            <div>
                <div class="info-item">
                    <span class="info-label">Contratista:</span> ${presupuesto.nombreContratista || "No especificado"}
                </div>
                <div class="info-item">
                    <span class="info-label">Fecha de Solicitud:</span> ${presupuesto.fechaSolicitud ? new Date(presupuesto.fechaSolicitud).toLocaleDateString("es-MX") : "No especificada"}
                </div>
                <div class="info-item">
                    <span class="info-label">Fecha Propuesta de Inicio:</span> ${presupuesto.fechaInicio ? new Date(presupuesto.fechaInicio).toLocaleDateString("es-MX") : "Por definir"}
                </div>
            </div>
        </div>
        
        <div class="info-item">
            <span class="info-label">Descripción de la Obra:</span><br>
            ${presupuesto.descripcionObra || "No especificada"}
        </div>
        
        ${
          presupuesto.tramo || presupuesto.colonia || presupuesto.calle
            ? `
        <div class="info-item" style="margin-top: 15px;">
            <span class="info-label">Ubicación:</span><br>
            ${[presupuesto.tramo, presupuesto.colonia, presupuesto.calle].filter(Boolean).join(", ")}
        </div>
        `
            : ""
        }
    </div>

    <!-- DESGLOSE DE SERVICIOS -->
    <div class="section-title">DESGLOSE DETALLADO DE SERVICIOS</div>
    
    <table class="concepts-table">
        <thead>
            <tr>
                <th style="width: 8%;">No.</th>
                <th style="width: 50%;">Descripción del Servicio</th>
                <th style="width: 10%;">Unidad</th>
                <th style="width: 10%;">Cantidad</th>
                <th style="width: 11%;">Precio Unitario</th>
                <th style="width: 11%;">Importe</th>
            </tr>
        </thead>
        <tbody>
            ${detalles
              .map(
                (detalle, index) => `
                <tr>
                    <td class="text-center">${index + 1}</td>
                    <td>
                        <strong>${detalle.concepto?.codigo || "N/A"}</strong><br>
                        ${detalle.concepto?.descripcion || "Descripción no disponible"}
                    </td>
                    <td class="text-center">${detalle.concepto?.unidad || "N/A"}</td>
                    <td class="text-center">${Number(detalle.cantidad || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>
                    <td class="text-right">$${Number(detalle.precioUnitario || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>
                    <td class="text-right">$${Number(detalle.subtotal || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>
                </tr>
            `,
              )
              .join("")}
        </tbody>
    </table>

    <!-- TOTALES -->
    <div class="totals-section">
        <table class="totals-table">
            <tr>
                <td style="width: 70%; text-align: right; font-weight: bold;">SUBTOTAL:</td>
                <td style="width: 30%; text-align: right; font-weight: bold;">$${Number(subtotal).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
                <td style="text-align: right; font-weight: bold;">IVA (16%):</td>
                <td style="text-align: right; font-weight: bold;">$${Number(iva).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr style="border-top: 2px solid #0066cc;">
                <td style="text-align: right;" class="total-final">TOTAL:</td>
                <td style="text-align: right;" class="total-final">$${Number(total).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>
            </tr>
        </table>
        
        ${
          presupuesto.formaPago
            ? `
        <div style="margin-top: 15px;">
            <span class="info-label">Forma de Pago:</span> ${presupuesto.formaPago}
        </div>
        `
            : ""
        }
    </div>

    <!-- PÁGINA 2: RESUMEN EJECUTIVO Y TÉRMINOS -->
    <div class="page-break"></div>
    
    <div class="executive-summary">
        <div class="section-title">RESUMEN EJECUTIVO POR ÁREAS DE SERVICIO</div>
        <p style="margin-bottom: 15px; color: #666;">
            A continuación se presenta un resumen de todas las áreas de servicio disponibles, 
            resaltando aquellas incluidas en este presupuesto:
        </p>
        
        <div class="areas-list">
            ${Object.entries(conceptosPorArea)
              .map(
                ([area, subareas]) => `
                <div class="area-item">
                    <div class="area-name">${area}</div>
                    <div class="subarea-list">
                        ${Array.from(subareas)
                          .map(
                            (subarea) => `
                            <div class="subarea-item">
                                <span class="subarea-included">✓ ${subarea}</span>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>
            `,
              )
              .join("")}
        </div>
    </div>

    <!-- TÉRMINOS Y CONDICIONES -->
    <div class="terms-section">
        <div class="section-title">TÉRMINOS Y CONDICIONES COMERCIALES</div>
        
        <ol class="terms-list">
            <li>Las cantidades en presupuesto pueden sufrir variación en función de las pruebas elaboradas, por lo que el presente presupuesto es una referencia de los costos. En la realización de visitas a obra para actividades de muestreo se deberá considerar el costo de viáticos de traslado (CC.060) por actividad.</li>
            
            <li>El horario de servicio es de 08:00 a 17:00 hrs de lunes a viernes, sábados de 08:00 a 14:00 hrs. Trabajos fuera del horario se tomarán como tiempo extraordinario con un costo de $394.70 más IVA por hora.</li>
            
            <li>Una vez finalizados los trabajos y entregados los informes correspondientes, se dará un período de 30 días para mantener los materiales en laboratorio; posteriormente se desecharán los mismos.</li>
            
            <li>Los accesos al lugar de la obra, la ubicación de las exploraciones y los permisos necesarios para su realización correrán por cuenta del contratante.</li>
            
            <li>Para iniciar los trabajos se requiere la aceptación del presupuesto firmando la orden de servicio correspondiente, preferentemente por el representante legal. La entrega de información final con los resultados se realizará una vez liquidado el monto de los trabajos ejecutados.</li>
            
            <li>En caso de requerir cualquier tipo de modificación en el alcance de este presupuesto después de su firma, se realizará un nuevo presupuesto.</li>
            
            <li>Anexo I. Métodos de prueba, Frecuencia de muestreo, Criterios de aceptación y Rechazo, Políticas de Laboratorio, Imparcialidad y Confidencialidad.</li>
        </ol>
    </div>

    <!-- CLÁUSULA LEGAL -->
    <div class="legal-clause">
        <strong>CLÁUSULA DE ACEPTACIÓN:</strong> 
        La firma de este documento por parte del cliente implica la aceptación total de los términos y condiciones aquí establecidos, 
        así como la autorización para la ejecución de los servicios descritos, constituyendo este presupuesto un acuerdo vinculante entre las partes.
    </div>

    <!-- SECCIÓN DE FIRMAS -->
    <div class="signatures-section">
        <div class="signature-box">
            <div style="margin-bottom: 20px;">
                <strong>LABORATORIO LOA</strong>
            </div>
            <div class="signature-line"></div>
            <div style="margin-top: 10px;">
                <div><strong>Nombre:</strong> _________________________</div>
                <div style="margin-top: 5px;"><strong>Cargo:</strong> _________________________</div>
                <div style="margin-top: 5px;"><strong>Fecha:</strong> _________________________</div>
            </div>
        </div>
        
        <div class="signature-box">
            <div style="margin-bottom: 20px;">
                <strong>CLIENTE</strong><br>
                <small>${presupuesto.cliente?.nombre || "Nombre del Cliente"}</small>
            </div>
            <div class="signature-line"></div>
            <div style="margin-top: 10px;">
                <div><strong>Nombre:</strong> _________________________</div>
                <div style="margin-top: 5px;"><strong>Cargo:</strong> _________________________</div>
                <div style="margin-top: 5px;"><strong>Fecha:</strong> _________________________</div>
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

// HTML validation function to prevent PDF corruption
function validateHTML(html: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for basic HTML structure
  if (!html.includes("<!DOCTYPE html>")) {
    errors.push("Missing DOCTYPE declaration");
  }
  if (!html.includes("<html") || !html.includes("</html>")) {
    errors.push("Missing html tags");
  }

  if (!html.includes("<head>") || !html.includes("</head>")) {
    errors.push("Missing head tags");
  }

  if (!html.includes("<body>") || !html.includes("</body>")) {
    errors.push("Missing body tags");
  }

  // Check for unclosed tags that can cause rendering issues
  const openTags = html.match(/<[^/][^>]*>/g) || [];
  const closeTags = html.match(/<\/[^>]*>/g) || [];

  if (openTags.length === 0) {
    errors.push("No opening tags found");
  }

  // Check for problematic characters that might cause encoding issues
  const problematicChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;
  if (problematicChars.test(html)) {
    errors.push("Contains control characters that may cause corruption");
  }

  // Check minimum length
  if (html.length < 1000) {
    errors.push("HTML content seems tooshort");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function registerRoutes(app: Express): Promise<Server> {
  const server = createServer(app);
  // Dashboard routes
  app.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const [totalClientes, totalPresupuestos, totalObras] = await Promise.all([
        storage.getAllClientes(),
        storage.getAllPresupuestos(),
        storage.getAllObras(),
      ]);

      const stats = {
        totalClientes: totalClientes.length,
        totalPresupuestos: totalPresupuestos.length,
        totalObras: totalObras.length,
      };
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Areas routes
  app.get("/api/areas", async (_req, res) => {
    try {
      const areas = await storage.getAllAreas();
      res.json(areas);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/areas", async (req, res) => {
    try {
      const result = insertAreaSchema.safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .json({ message: "Validation error", errors: result.error.errors });
      }
      const area = await storage.createArea(result.data);
      res.status(201).json(area);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Subareas routes
  app.get("/api/subareas", async (req, res) => {
    try {
      const areaCodigo = req.query.area as string;
      const subareas = areaCodigo
        ? await storage.getSubareasByArea(areaCodigo)
        : await storage.getAllSubareas();
      res.json(subareas);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/subareas", async (req, res) => {
    try {
      const result = insertSubareaSchema.safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .json({ message: "Validation error", errors: result.error.errors });
      }
      const subarea = await storage.createSubarea(result.data);
      res.status(201).json(subarea);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Conceptos routes
  app.get("/api/conceptos", async (req, res) => {
    try {
      const subareaId = req.query.subarea
        ? parseInt(req.query.subarea as string)
        : undefined;
      const conceptos = subareaId
        ? await storage.getConceptosBySubarea(subareaId)
        : await storage.getAllConceptos();
      res.json(conceptos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/conceptos", async (req, res) => {
    try {
      const result = insertConceptoSchema.safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .json({ message: "Validation error", errors: result.error.errors });
      }
      const concepto = await storage.createConcepto(result.data);
      res.status(201).json(concepto);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Rutas específicas para el feature de conceptos
  app.get("/api/areas/:codigo/subareas", async (req, res) => {
    try {
      const areaCodigo = req.params.codigo;
      const subareas = await storage.getSubareasByArea(areaCodigo);
      res.json(subareas);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/subareas/:id/conceptos", async (req, res) => {
    try {
      const subareaId = parseInt(req.params.id);
      if (isNaN(subareaId)) {
        return res.status(400).json({ message: "ID de subárea inválido" });
      }
      const conceptos = await storage.getConceptosBySubarea(subareaId);
      res.json(conceptos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Cliente routes
  app.get("/api/clientes", async (req, res) => {
    try {
      const clientes = await storage.getAllClientes();
      res.json(clientes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/clientes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const cliente = await storage.getClienteById(id);
      if (!cliente) {
        return res.status(404).json({ message: "Cliente not found" });
      }
      res.json(cliente);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/clientes", async (req, res) => {
    try {
      const result = insertClienteSchema.safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .json({ message: "Validation error", errors: result.error.errors });
      }
      const cliente = await storage.createCliente(result.data);
      res.status(201).json(cliente);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  app.post("/api/clientes/:id/telefonos", async (req, res) => {
    try {
      const clienteId = parseInt(req.params.id);
      console.log(
        "[API] Agregando teléfono para cliente:",
        clienteId,
        "Datos:",
        req.body,
      );

      // Agregar clienteId al body antes de validar
      const dataToValidate = { ...req.body, clienteId };
      const result = insertTelefonoSchema.safeParse(dataToValidate);

      if (!result.success) {
        console.log("[API] Error de validación teléfono:", result.error.errors);
        return res
          .status(400)
          .json({ message: "Validation error", errors: result.error.errors });
      }
      const telefono = await storage.createTelefono(result.data);
      console.log("[API] Teléfono creado exitosamente:", telefono);
      res.status(201).json(telefono);
    } catch (error: any) {
      console.error("[API] Error al crear teléfono:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app.post("/api/clientes/:id/correos", async (req, res) => {
    try {
      const clienteId = parseInt(req.params.id);
      console.log(
        "[API] Agregando correo para cliente:",
        clienteId,
        "Datos:",
        req.body,
      );

      // Agregar clienteId al body antes de validar
      const dataToValidate = { ...req.body, clienteId };
      const result = insertCorreoSchema.safeParse(dataToValidate);

      if (!result.success) {
        console.log("[API] Error de validación correo:", result.error.errors);
        return res
          .status(400)
          .json({ message: "Validation error", errors: result.error.errors });
      }
      const correo = await storage.createCorreo(result.data);
      console.log("[API] Correo creado exitosamente:", correo);
      res.status(201).json(correo);
    } catch (error: any) {
      console.error("[API] Error al crear correo:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Obras routes
  app.get("/api/obras", async (req, res) => {
    try {
      const areaCodigo = req.query.area as string;
      const obras = areaCodigo
        ? await storage.getObrasByArea(areaCodigo)
        : await storage.getAllObras();
      res.json(obras);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/obras/:clave", async (req, res) => {
    try {
      const clave = req.params.clave;
      const obra = await storage.getObraById(clave);
      if (!obra) {
        return res.status(404).json({ message: "Obra not found" });
      }
      res.json(obra);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/obras", async (req, res) => {
    try {
      const result = insertObraSchema.safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .json({ message: "Validation error", errors: result.error.errors });
      }

      // Generate clave for obra based on area and year
      const year = new Date().getFullYear();
      const obras = await storage.getObrasByArea(result.data.areaCodigo);
      const nextNumber = obras.length + 1;
      const clave = `${result.data.areaCodigo}-${year}-${nextNumber.toString().padStart(4, "0")}`;

      const obra = await storage.createObra({ ...result.data, clave });
      res.status(201).json(obra);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Ruta para generar clave de obra automáticamente
  app.post("/api/obras/generate-clave", async (req, res) => {
    try {
      const { areaCodigo } = req.body;
      if (!areaCodigo) {
        return res.status(400).json({ message: "areaCodigo is required" });
      }
      const claveObra = await storage.generateClaveObra(areaCodigo);
      res.json({ claveObra });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Presupuesto routes
  app.get("/api/presupuestos", async (req, res) => {
    try {
      const presupuestos = await storage.getAllPresupuestos();
      res.json(presupuestos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/presupuestos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const presupuesto = await storage.getPresupuestoById(id);
      if (!presupuesto) {
        return res.status(404).json({ message: "Presupuesto not found" });
      }
      res.json(presupuesto);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  app.post("/api/presupuestos", async (req, res) => {
    try {
      const { conceptos, areaCodigo, ...presupuestoData } = req.body;
      console.log("[POST /api/presupuestos] Request body:", req.body);

      // Validar límites de valores antes de procesamiento
      if (conceptos && conceptos.length > 0) {
        for (const concepto of conceptos) {
          // Validar cantidad
          if (concepto.cantidad > 999999) {
            return res.status(400).json({
              message: `La cantidad para el concepto ${concepto.conceptoCodigo} excede el límite permitido (999,999)`,
            });
          }

          // Validar precio unitario
          if (concepto.precioUnitario > 9999999.99) {
            return res.status(400).json({
              message: `El precio unitario para el concepto ${concepto.conceptoCodigo} excede el límite permitido ($9,999,999.99)`,
            });
          }

          // Validar subtotal individual
          const subtotalConcepto = concepto.cantidad * concepto.precioUnitario;
          if (subtotalConcepto > 9999999999.99) {
            return res.status(400).json({
              message: `El subtotal para el concepto ${concepto.conceptoCodigo} excede el límite permitido ($9,999,999,999.99)`,
            });
          }
        }

        // Validar subtotal total
        const subtotalTotal = conceptos.reduce(
          (sum: number, concepto: any) =>
            sum + concepto.cantidad * concepto.precioUnitario,
          0,
        );

        if (subtotalTotal > 9999999999.99) {
          return res.status(400).json({
            message:
              "El subtotal total del presupuesto excede el límite permitido ($9,999,999,999.99)",
          });
        }

        // Validar total con IVA
        const ivaMonto =
          subtotalTotal * (presupuestoData.iva || SYSTEM_CONSTANTS.IVA_RATE);
        const totalConIva = subtotalTotal + ivaMonto;

        if (totalConIva > 9999999999.99) {
          return res.status(400).json({
            message:
              "El total del presupuesto (incluyendo IVA) excede el límite permitido ($9,999,999,999.99)",
          });
        }
      }

      // Si se proporciona areaCodigo, necesitamos crear o encontrar una obra
      let claveObra = presupuestoData.claveObra;

      if (areaCodigo && !claveObra) {
        // Generar clave de obra automáticamente
        try {
          claveObra = await storage.generateClaveObra(areaCodigo);
          console.log(
            "[POST /api/presupuestos] Generated claveObra:",
            claveObra,
          );

          // Crear la obra si no existe
          const existingObra = await storage.getObraById(claveObra);
          if (!existingObra) {
            await storage.createObra({
              clave: claveObra,
              areaCodigo: areaCodigo,
              contratista: presupuestoData.nombreContratista,
              estado: 1,
            });
            console.log(
              "[POST /api/presupuestos] Created new obra:",
              claveObra,
            );
          }
        } catch (error) {
          console.error("[POST /api/presupuestos] Error creating obra:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          return res
            .status(500)
            .json({ message: "Error creating obra: " + errorMessage });
        }
      }

      // Preparar datos del presupuesto (sin areaCodigo que no existe en el modelo)
      const finalPresupuestoData = {
        ...presupuestoData,
        claveObra: claveObra,
      };

      console.log(
        "[POST /api/presupuestos] Final presupuesto data:",
        finalPresupuestoData,
      );

      // Crear el presupuesto principal
      const presupuesto = await storage.createPresupuesto(finalPresupuestoData);
      console.log(
        "[POST /api/presupuestos] Created presupuesto:",
        presupuesto.id,
      );

      // Crear los detalles del presupuesto
      if (conceptos && conceptos.length > 0) {
        console.log(
          "[POST /api/presupuestos] Creating",
          conceptos.length,
          "detalles",
        );
        for (const concepto of conceptos) {
          await storage.createPresupuestoDetalle({
            presupuestoId: presupuesto.id,
            conceptoCodigo: concepto.conceptoCodigo,
            cantidad: concepto.cantidad,
            precioUnitario: concepto.precioUnitario,
            subtotal:
              concepto.subtotal || concepto.cantidad * concepto.precioUnitario,
            estado: "en_proceso",
          });
        }

        // Recalcular totales
        await storage.recalcularTotalesPresupuesto(presupuesto.id);
        console.log("[POST /api/presupuestos] Recalculated totals");
      }

      // Obtener el presupuesto completo con detalles
      const presupuestoCompleto = await storage.getPresupuestoById(
        presupuesto.id,
      );

      console.log(
        "[POST /api/presupuestos] Success, returning presupuesto:",
        presupuestoCompleto?.id,
      );
      res.status(201).json(presupuestoCompleto);
    } catch (error: any) {
      console.error("[POST /api/presupuestos] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app.put("/api/presupuestos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { conceptos, areaCodigo, ...presupuestoData } = req.body;
      console.log("[PUT /api/presupuestos/:id] Request body:", req.body);

      // Validar datos del presupuesto (sin conceptos)
      const result = insertPresupuestoSchema
        .partial()
        .safeParse(presupuestoData);
      if (!result.success) {
        return res
          .status(400)
          .json({ message: "Validation error", errors: result.error.errors });
      }

      // Actualizar el presupuesto principal
      const presupuesto = await storage.updatePresupuesto(id, result.data);
      console.log(
        "[PUT /api/presupuestos/:id] Updated presupuesto:",
        presupuesto.id,
      );

      // Si hay conceptos, actualizar los detalles
      if (conceptos && conceptos.length > 0) {
        console.log(
          "[PUT /api/presupuestos/:id] Updating conceptos, count:",
          conceptos.length,
        );

        // Eliminar todos los detalles existentes
        await storage.deletePresupuestoDetallesByPresupuestoId(id);

        // Crear los nuevos detalles
        for (const concepto of conceptos) {
          await storage.createPresupuestoDetalle({
            presupuestoId: id,
            conceptoCodigo: concepto.conceptoCodigo,
            cantidad: concepto.cantidad,
            precioUnitario: concepto.precioUnitario,
            subtotal:
              concepto.subtotal || concepto.cantidad * concepto.precioUnitario,
            estado: "en_proceso",
          });
        }
        // Recalcular totales
        const detalles = await storage.getPresupuestoDetalles(id);
        const subtotal = detalles.reduce((sum, detalle) => {
          const cantidad = Number(detalle.cantidad);
          const precio = Number(detalle.precioUnitario);
          return sum + cantidad * precio;
        }, 0);
        const iva = Number(presupuesto.iva) || 0;
        const ivaMonto = subtotal * iva;
        const total = subtotal + ivaMonto;

        // Actualizar totales del presupuesto
        await storage.updatePresupuesto(id, {
          subtotal,
          ivaMonto,
          total,
        });
      }

      // Obtener el presupuesto actualizado con todos los datos
      const updatedPresupuesto = await storage.getPresupuestoById(id);
      res.json(updatedPresupuesto);
    } catch (error: any) {
      console.error("[PUT /api/presupuestos/:id] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/presupuestos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePresupuesto(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Presupuesto Detalles routes
  app.get("/api/presupuestos/:id/detalles", async (req, res) => {
    try {
      const presupuestoId = parseInt(req.params.id);
      const detalles = await storage.getPresupuestoDetalles(presupuestoId);
      res.json(detalles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  app.post("/api/presupuestos/:id/detalles", async (req, res) => {
    try {
      const presupuestoId = parseInt(req.params.id);

      // Agregar presupuestoId al body antes de validar
      const dataToValidate = { ...req.body, presupuestoId };
      const result = insertPresupuestoDetalleSchema.safeParse(dataToValidate);

      if (!result.success) {
        return res
          .status(400)
          .json({ message: "Validation error", errors: result.error.errors });
      }
      const detalle = await storage.createPresupuestoDetalle(result.data);

      // Recalcular totales después de agregar detalle
      await storage.recalcularTotalesPresupuesto(presupuestoId);

      res.status(201).json(detalle);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/presupuestos/:id/detalles/:detalleId", async (req, res) => {
    try {
      const presupuestoId = parseInt(req.params.id);
      const detalleId = parseInt(req.params.detalleId);
      const result = insertPresupuestoDetalleSchema
        .partial()
        .safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .json({ message: "Validation error", errors: result.error.errors });
      }
      const detalle = await storage.updatePresupuestoDetalle(
        detalleId,
        result.data,
      );

      // Recalcular totales después de actualizar detalle
      await storage.recalcularTotalesPresupuesto(presupuestoId);

      res.json(detalle);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/presupuestos/:id/detalles/:detalleId", async (req, res) => {
    try {
      const presupuestoId = parseInt(req.params.id);
      const detalleId = parseInt(req.params.detalleId);
      await storage.deletePresupuestoDetalle(detalleId);

      // Recalcular totales después de eliminar detalle
      await storage.recalcularTotalesPresupuesto(presupuestoId);

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }); // PDF generation route
  app.get("/api/presupuestos/:id/pdf", async (req, res) => {
    let browser;
    try {
      const id = parseInt(req.params.id);
      console.log(`[PDF] Generating PDF for presupuesto ${id}`);

      const presupuesto = await storage.getPresupuestoById(id);
      if (!presupuesto) {
        return res.status(404).json({ message: "Presupuesto not found" });
      }

      const detalles = presupuesto.detalles || [];
      console.log(`[PDF] Found ${detalles.length} detalles`);
      const html = generatePresupuestoHTML(presupuesto, detalles, true);
      console.log(`[PDF] Generated HTML, length: ${html.length}`);

      // Validate HTML before processing
      const validation = validateHTML(html);
      if (!validation.isValid) {
        console.error("[PDF] HTML validation failed:", validation.errors);
        throw new Error(
          `HTML validation failed: ${validation.errors.join(", ")}`,
        );
      }
      console.log("[PDF] HTML validation passed");

      // Validate HTML before generating PDF
      const { isValid, errors } = validateHTML(html);
      if (!isValid) {
        return res
          .status(500)
          .json({ message: "Invalid HTML generated", errors });
      }

      // Improved puppeteer configuration for PDF corruption issues
      browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
        ],
      });

      const page = await browser.newPage();

      // Set viewport and user agent to ensure consistent rendering
      await page.setViewport({ width: 1280, height: 720 });
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      );

      console.log(`[PDF] Setting page content...`);
      await page.setContent(html, {
        waitUntil: ["load", "domcontentloaded", "networkidle0"],
        timeout: 60000,
      });
      // Wait for fonts and styles to load
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log(`[PDF] Generating PDF...`);
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: false,
        displayHeaderFooter: false,
        margin: {
          top: "20mm",
          right: "20mm",
          bottom: "20mm",
          left: "20mm",
        },
        timeout: 60000,
      });

      console.log(
        `[PDF] Generated PDF successfully, size: ${pdf.length} bytes`,
      );

      // Verify PDF is not empty or corrupted
      if (!pdf || pdf.length === 0) {
        throw new Error("Generated PDF is empty");
      } // Check if PDF starts with valid PDF header
      if (
        !(
          pdf[0] === 0x25 &&
          pdf[1] === 0x50 &&
          pdf[2] === 0x44 &&
          pdf[3] === 0x46
        )
      ) {
        throw new Error("Generated PDF has invalid header");
      }

      // Set proper headers for PDF download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="presupuesto-${presupuesto.claveObra || presupuesto.id}.pdf"`,
      );
      res.setHeader("Content-Length", pdf.length.toString());
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      // Send PDF as binary data
      res.end(pdf, "binary");
    } catch (error: any) {
      console.error("[PDF] Error generating PDF:", error);
      res
        .status(500)
        .json({ message: `Error generating PDF: ${error.message}` });
    } finally {
      if (browser) {
        try {
          await browser.close();
          console.log("[PDF] Browser closed successfully");
        } catch (closeError) {
          console.error("[PDF] Error closing browser:", closeError);
        }
      }
    }
  });

  // Debug route to see HTML content
  app.get("/api/presupuestos/:id/html", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const presupuesto = await storage.getPresupuestoById(id);
      if (!presupuesto) {
        return res.status(404).json({ message: "Presupuesto not found" });
      }

      const detalles = presupuesto.detalles || [];
      const html = generatePresupuestoHTML(presupuesto, detalles);

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // PDF test endpoint - generates PDF and returns metadata for debugging
  app.get("/api/presupuestos/:id/pdf-test", async (req, res) => {
    let browser;
    try {
      const id = parseInt(req.params.id);
      console.log(`[PDF-TEST] Testing PDF generation for presupuesto ${id}`);

      const presupuesto = await storage.getPresupuestoById(id);
      if (!presupuesto) {
        return res.status(404).json({ message: "Presupuesto not found" });
      }

      const detalles = presupuesto.detalles || [];
      const html = generatePresupuestoHTML(presupuesto, detalles, true);

      // Validate HTML
      const validation = validateHTML(html);

      browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
        ],
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 720 });
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      );

      await page.setContent(html, {
        waitUntil: ["load", "domcontentloaded", "networkidle0"],
        timeout: 60000,
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: false,
        displayHeaderFooter: false,
        margin: {
          top: "20mm",
          right: "20mm",
          bottom: "20mm",
          left: "20mm",
        },
        timeout: 60000,
      }); // PDF integrity checks
      const pdfHeader = pdf.slice(0, 5).toString();
      const pdfFooter = pdf.slice(-5).toString();

      const result = {
        success: true,
        htmlValidation: validation,
        pdfMetadata: {
          size: pdf.length,
          header: pdfHeader,
          footer: pdfFooter,
          hasValidHeader:
            pdf[0] === 0x25 &&
            pdf[1] === 0x50 &&
            pdf[2] === 0x44 &&
            pdf[3] === 0x46, // %PDF
          isEmpty: pdf.length === 0,
          firstBytes: Array.from(pdf.slice(0, 20))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join(" "),
          lastBytes: Array.from(pdf.slice(-20))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join(" "),
        },
        presupuestoData: {
          id: presupuesto.id,
          claveObra: presupuesto.claveObra,
          detallesCount: detalles.length,
          estado: presupuesto.estado,
          subtotal: presupuesto.subtotal,
          total: presupuesto.total,
        },
      };

      res.json(result);
    } catch (error: any) {
      console.error("[PDF-TEST] Error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
        stack: error.stack,
      });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  });

  // ============ ENDPOINTS DE PROGRAMACIONES ============

  // Obtener programaciones con filtros
  app.get("/api/programming/programaciones", async (req, res) => {
    try {
      const filters = {
        fechaDesde: req.query.fechaDesde as string,
        fechaHasta: req.query.fechaHasta as string,
        brigadistaId: req.query.brigadistaId
          ? parseInt(req.query.brigadistaId as string)
          : undefined,
        estado: req.query.estado as string,
        claveObra: req.query.claveObra as string,
      };

      const programaciones = await storage.getAllProgramaciones(filters);
      res.json(programaciones);
    } catch (error: any) {
      console.error("Error obteniendo programaciones:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Obtener programación por ID
  app.get("/api/programming/programaciones/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const programacion = await storage.getProgramacionById(id);

      if (!programacion) {
        return res.status(404).json({ message: "Programación no encontrada" });
      }

      res.json(programacion);
    } catch (error: any) {
      console.error("Error obteniendo programación:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Crear nueva programación
  app.post("/api/programming/programaciones", async (req, res) => {
    try {
      const programacion = await storage.createProgramacion({
        ...req.body,
        fechaProgramada: new Date(req.body.fechaProgramada),
      });
      res.status(201).json(programacion);
    } catch (error: any) {
      console.error("Error creando programación:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Actualizar programación
  app.put("/api/programming/programaciones/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = { ...req.body };

      if (data.fechaProgramada) {
        data.fechaProgramada = new Date(data.fechaProgramada);
      }

      const programacion = await storage.updateProgramacion(id, data);
      res.json(programacion);
    } catch (error: any) {
      console.error("Error actualizando programación:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Eliminar programación
  app.delete("/api/programming/programaciones/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProgramacion(id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error eliminando programación:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Obtener programaciones por brigadista
  app.get("/api/programming/programaciones/brigadista", async (req, res) => {
    try {
      const brigadistaId = parseInt(req.query.brigadistaId as string);
      const fecha = req.query.fecha as string;

      // Construir filtros según la fecha proporcionada
      const filters = fecha
        ? { fechaDesde: fecha, fechaHasta: fecha }
        : undefined;

      const programaciones = await storage.getProgramacionesByBrigadista(
        brigadistaId,
        filters,
      );
      res.json(programaciones);
    } catch (error: any) {
      console.error("Error obteniendo programaciones del brigadista:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Obtener información del brigadista actual (mock - en producción vendría del token de sesión)
  app.get("/api/programming/brigadista/perfil", async (req, res) => {
    try {
      // Por ahora devolvemos el primer brigadista como ejemplo
      const brigadista = await storage.getBrigadistaById(1);
      if (!brigadista) {
        return res.status(404).json({ message: "Brigadista no encontrado" });
      }
      res.json(brigadista);
    } catch (error: any) {
      console.error("Error obteniendo perfil del brigadista:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Obtener programaciones del brigadista actual
  app.get("/api/programming/brigadista/programaciones", async (req, res) => {
    try {
      const { fechaDesde, fechaHasta, estado, brigadistaId } = req.query;
      // Validar que brigadistaId esté presente y sea número
      const brigadistaIdNum = parseInt(brigadistaId as string);
      if (!brigadistaIdNum || isNaN(brigadistaIdNum)) {
        return res.status(400).json({ message: "brigadistaId es requerido y debe ser numérico" });
      }
      const programaciones = await storage.getProgramacionesByBrigadista(brigadistaIdNum, {
        fechaDesde: fechaDesde as string,
        fechaHasta: fechaHasta as string,
        estado: estado as string,
      });
      res.json(programaciones);
    } catch (error: any) {
      console.error("Error obteniendo programaciones del brigadista:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // ============ ACCIONES DE PROGRAMACIONES ============

  // Iniciar actividad
  app.post("/api/programming/programaciones/:id/iniciar", async (req, res) => {
    try {
      const { id } = req.params;
      const { muestrasObtenidas, fechaInicio } = req.body;

      const programacion = await storage.iniciarProgramacion(Number(id), {
        muestrasObtenidas,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
      });

      res.json(programacion);
    } catch (error: any) {
      console.error("Error iniciando programación:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Completar actividad
  app.post(
    "/api/programming/programaciones/:id/completar",
    async (req, res) => {
      try {
        const { id } = req.params;
        const { muestrasObtenidas, fechaCompletado, observaciones } = req.body;

        const programacion = await storage.completarProgramacion(Number(id), {
          muestrasObtenidas,
          fechaCompletado: fechaCompletado
            ? new Date(fechaCompletado)
            : undefined,
          observaciones,
        });

        res.json(programacion);
      } catch (error: any) {
        console.error("Error completando programación:", error);
        res.status(500).json({ message: error.message });
      }
    },
  );

  // Cancelar actividad
  app.post("/api/programming/programaciones/:id/cancelar", async (req, res) => {
    try {
      const { id } = req.params;
      const { motivoCancelacion } = req.body;

      const programacion = await storage.cancelarProgramacion(Number(id), {
        motivoCancelacion,
      });

      res.json(programacion);
    } catch (error: any) {
      console.error("Error cancelando programación:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Reprogramar actividad
  app.post(
    "/api/programming/programaciones/:id/reprogramar",
    async (req, res) => {
      try {
        const { id } = req.params;
        const {
          fechaProgramada,
          horaProgramada,
          brigadistaId,
          vehiculoId,
          motivoCancelacion,
        } = req.body;

        const programacion = await storage.reprogramarProgramacion(Number(id), {
          fechaProgramada: new Date(fechaProgramada),
          horaProgramada,
          brigadistaId,
          vehiculoId,
          motivoCancelacion,
        });

        res.json(programacion);
      } catch (error: any) {
        console.error("Error reprogramando:", error);
        res.status(500).json({ message: error.message });
      }
    },
  );

  // ============ ENDPOINTS DE BRIGADISTAS Y VEHÍCULOS ============

  // Obtener brigadistas
  app.get("/api/programming/brigadistas", async (_req, res) => {
    try {
      const brigadistas = await storage.getAllBrigadistas();
      res.json(brigadistas);
    } catch (error: any) {
      console.error("Error obteniendo brigadistas:", error);
      res.status(500).json({ message: error.message });
    }
  });
  // Obtener brigadistas disponibles
  app.get("/api/programming/brigadistas/disponibles", async (req, res) => {
    try {
      const { fecha, hora } = req.query;
      const brigadistas = await storage.getBrigadistasDisponibles(
        fecha as string,
        hora as string,
      );
      res.json(brigadistas);
    } catch (error: any) {
      console.error("Error obteniendo brigadistas disponibles:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Obtener vehículos
  app.get("/api/programming/vehiculos", async (_req, res) => {
    try {
      const vehiculos = await storage.getAllVehiculos();
      res.json(vehiculos);
    } catch (error: any) {
      console.error("Error obteniendo vehículos:", error);
      res.status(500).json({ message: error.message });
    }
  });
  // Obtener vehículos disponibles
  app.get("/api/programming/vehiculos/disponibles", async (req, res) => {
    try {
      const { fecha, hora } = req.query;
      const vehiculos = await storage.getVehiculosDisponibles(
        fecha as string,
        hora as string,
      );
      res.json(vehiculos);
    } catch (error: any) {
      console.error("Error obteniendo vehículos disponibles:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Obtener obras aprobadas para programación
  app.get("/api/programming/obras-aprobadas", async (_req, res) => {
    try {
      const presupuestosAprobados = await storage.getPresupuestosAprobados();

      // Agrupar presupuestos por clave de obra para consolidar conceptos
      const obrasMap = new Map();

      presupuestosAprobados.forEach((presupuesto) => {
        const claveObra = presupuesto.claveObra || `OBRA-${presupuesto.id}`;

        if (!obrasMap.has(claveObra)) {
          const ubicacion = [
            presupuesto.tramo,
            presupuesto.colonia,
            presupuesto.calle,
          ]
            .filter(Boolean)
            .join(" ");

          obrasMap.set(claveObra, {
            clave: claveObra,
            clienteNombre:
              presupuesto.cliente?.nombre || "Cliente no especificado",
            descripcionObra:
              presupuesto.descripcionObra || "Descripción no disponible",
            ubicacion: ubicacion || "Ubicación no especificada",
            contratista:
              presupuesto.nombreContratista ||
              presupuesto.cliente?.nombre ||
              "Contratista no especificado",
            conceptos: [],
          });
        }

        // Agregar conceptos de este presupuesto a la obra
        const obra = obrasMap.get(claveObra);
        if (presupuesto.detalles) {
          presupuesto.detalles.forEach((detalle) => {
            // Verificar que el concepto no esté ya agregado
            const conceptoExiste = obra.conceptos.some(
              (c: any) => c.codigo === detalle.concepto.codigo,
            );
            if (!conceptoExiste) {
              obra.conceptos.push({
                codigo: detalle.concepto.codigo,
                descripcion:
                  detalle.concepto.descripcion || "Descripción no disponible",
                unidad: detalle.concepto.unidad || "pza",
                cantidad: detalle.cantidad || 1,
              });
            }
          });
        }
      });

      // Convertir el Map a array
      const obrasAprobadas = Array.from(obrasMap.values());

      res.json(obrasAprobadas);
    } catch (error: any) {
      console.error("Error obteniendo obras aprobadas:", error);
      res.status(500).json({ message: error.message });
    }
  });
  // Obtener estadísticas del dashboard de programming
  app.get("/api/programming/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      console.error("Error obteniendo estadísticas:", error);
      res.status(500).json({ message: error.message });
    }
  }); // Obtener datos de gráfica del dashboard de programming
  app.get("/api/programming/dashboard/grafica", async (req, res) => {
    try {
      const { fechaInicio } = req.query;
      const graficaData = await storage.getDashboardGrafica(
        fechaInicio as string,
      );
      res.json(graficaData);
    } catch (error: any) {
      console.error("Error obteniendo datos de gráfica:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Obtener estadísticas rápidas para la página principal
  app.get("/api/programming/quick-stats", async (req, res) => {
    try {
      const stats = await storage.getQuickStats();
      res.json(stats);
    } catch (error: any) {
      console.error("Error obteniendo estadísticas rápidas:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Cliente routes - serve static files from client/dist
  app.use("*", (req, res, next) => {
    // Let vite handle client-side routing
    next();
  });

  app.get("/api/empleado/stats", async (_req, res) => {
    try {
      const [
        obrasEnProceso,
        programacionesHoy,
        presupuestosPendientes,
        presupuestosAprobados,
        totalConceptos,
      ] = await Promise.all([
        prisma.obra.count(),
        prisma.programacion.count({ 
          where: { 
            fechaProgramada: {
              gte: new Date(new Date().toDateString()),
              lt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
            }
          } 
        }),
        prisma.presupuesto.count({ where: { estado: "enviado" } }),
        prisma.presupuesto.count({ where: { estado: "aprobado" } }),
        prisma.concepto.count(),
      ]);

      // Calcular el total de ventas del mes actual
      const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const finMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
      
      const ventasMes = await prisma.presupuesto.aggregate({
        _sum: { total: true },
        where: {
          estado: "aprobado",
          fechaSolicitud: {
            gte: inicioMes,
            lte: finMes,
          },
        },
      });

      // Calcular facturación pendiente (presupuestos aprobados pero no finalizados)
      const facturacionPendiente = await prisma.presupuesto.aggregate({
        _sum: { total: true },
        where: { estado: "aprobado" }
      });

      res.json({
        obrasEnProceso,
        muestrasEnLaboratorio: programacionesHoy, // Usamos programaciones de hoy como muestras
        presupuestosPendientes,
        informesPorGenerar: totalConceptos, // Total de conceptos como informes
        facturacionPendiente: facturacionPendiente._sum.total || 0,
        tiempoPromedioEnsayo: 24, // Valor simulado
        eficienciaLaboratorio: 85, // Valor simulado
        ventasMes: ventasMes._sum.total || 0,
        presupuestosAprobados,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/empleado/alertas", async (_req, res) => {
    try {
      // Simulamos alertas basadas en datos reales
      const alertas = [];
      
      // Verificar presupuestos vencidos
      const presupuestosVencidos = await prisma.presupuesto.count({
        where: {
          estado: "enviado",
          fechaSolicitud: {
            lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Más de 7 días
          }
        }
      });

      if (presupuestosVencidos > 0) {
        alertas.push({
          id: 1,
          tipo: "importante",
          mensaje: `${presupuestosVencidos} presupuestos enviados hace más de 7 días sin respuesta`,
          fecha: new Date().toLocaleString()
        });
      }

      // Verificar programaciones de hoy
      const programacionesHoy = await prisma.programacion.count({
        where: {
          fechaProgramada: {
            gte: new Date(new Date().toDateString()),
            lt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
          }
        }
      });

      if (programacionesHoy > 5) {
        alertas.push({
          id: 2,
          tipo: "info",
          mensaje: `${programacionesHoy} programaciones de muestreo programadas para hoy`,
          fecha: new Date().toLocaleString()
        });
      }

      // Si no hay alertas, mostrar mensaje positivo
      if (alertas.length === 0) {
        alertas.push({
          id: 0,
          tipo: "info",
          mensaje: "Todas las operaciones funcionando correctamente",
          fecha: new Date().toLocaleString()
        });
      }

      res.json(alertas);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/empleado/presupuestos-recientes", async (_req, res) => {
    try {
      const presupuestos = await prisma.presupuesto.findMany({
        orderBy: { fechaSolicitud: "desc" },
        take: 10,
        select: {
          id: true,
          claveObra: true,
          cliente: true,
          estado: true,
          total: true,
          fechaSolicitud: true,
        },
      });
      res.json(presupuestos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Endpoint para datos de gráficas del dashboard
  app.get("/api/empleado/charts/ventas-mensuales", async (_req, res) => {
    try {
      // Obtener presupuestos aprobados de los últimos 12 meses
      const presupuestosAprobados = await prisma.presupuesto.findMany({
        where: {
          estado: "aprobado",
          fechaSolicitud: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        },
        select: {
          total: true,
          fechaSolicitud: true
        }
      });

      // Agrupar por mes
      const ventasMensuales = presupuestosAprobados.reduce((acc: any[], presupuesto) => {
        const fecha = new Date(presupuesto.fechaSolicitud!);
        const mes = fecha.getMonth() + 1;
        const año = fecha.getFullYear();
        const clave = `${año}-${mes.toString().padStart(2, '0')}`;
        
        const existing = acc.find(item => item.periodo === clave);
        if (existing) {
          existing.total += Number(presupuesto.total || 0);
          existing.cantidad += 1;
        } else {
          acc.push({
            periodo: clave,
            mes,
            año,
            total: Number(presupuesto.total || 0),
            cantidad: 1
          });
        }
        return acc;
      }, []);

      res.json(ventasMensuales.sort((a, b) => `${a.año}-${a.mes}`.localeCompare(`${b.año}-${b.mes}`)));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/empleado/charts/estado-presupuestos", async (_req, res) => {
    try {
      const estadoPresupuestos = await prisma.presupuesto.groupBy({
        by: ['estado'],
        _count: { id: true },
        _sum: { total: true }
      });
      res.json(estadoPresupuestos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/empleado/charts/rendimiento-laboratorio", async (_req, res) => {
    try {
      // Simular datos de rendimiento basados en programaciones
      const programaciones = await prisma.programacion.findMany({
        where: {
          fechaProgramada: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30))
          }
        },
        select: {
          fechaProgramada: true,
          cantidadMuestras: true,
          estado: true
        }
      });

      const rendimiento = programaciones.reduce((acc: any[], prog) => {
        const fecha = prog.fechaProgramada.toISOString().split('T')[0];
        const existing = acc.find(item => item.fecha === fecha);
        
        if (existing) {
          existing.muestras_procesadas += prog.cantidadMuestras;
          existing.programaciones += 1;
        } else {
          acc.push({
            fecha,
            muestras_procesadas: prog.cantidadMuestras,
            programaciones: 1,
            tiempo_promedio: Math.floor(Math.random() * 8) + 4 // Simulado entre 4-12 horas
          });
        }
        return acc;
      }, []);

      res.json(rendimiento);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/empleado/charts/areas-trabajo", async (_req, res) => {
    try {
      const areas = await prisma.area.findMany({
        include: {
          subareas: {
            include: {
              conceptos: {
                include: {
                  detalles: {
                    include: {
                      presupuesto: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      const areasData = areas.map(area => {
        const totalConceptos = area.subareas.reduce((sum, subarea) => 
          sum + subarea.conceptos.length, 0
        );
        const totalPresupuestos = area.subareas.reduce((sum, subarea) => 
          sum + subarea.conceptos.reduce((conceptSum, concepto) => 
            conceptSum + concepto.detalles.length, 0
          ), 0
        );
        const totalMonto = area.subareas.reduce((sum, subarea) => 
          sum + subarea.conceptos.reduce((conceptSum, concepto) => 
            conceptSum + concepto.detalles.reduce((detalleSum, detalle) => 
              detalleSum + Number(detalle.precioUnitario) * Number(detalle.cantidad), 0
            ), 0
          ), 0
        );

        return {
          nombre: area.nombre,
          totalConceptos,
          totalPresupuestos,
          totalMonto
        };
      });

      res.json(areasData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Rutas de autenticación con integración real a base de datos
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email y contraseña son requeridos" });
      }

      // Buscar usuario en la base de datos
      const usuario = await prisma.usuario.findUnique({
        where: { email }
      });

      if (!usuario) {
        return res.status(401).json({ message: "Credenciales incorrectas" });
      }

      // En producción usar bcrypt para comparar passwords
      // const isValidPassword = await bcrypt.compare(password, usuario.password);
      const isValidPassword = password === usuario.password; // Temporal: comparación directa

      if (!isValidPassword) {
        return res.status(401).json({ message: "Credenciales incorrectas" });
      }

      if (!usuario.activo) {
        return res.status(401).json({ message: "Usuario inactivo" });
      }

      // Preparar datos del usuario para la respuesta
      const usuarioResponse = {
        id: usuario.id,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        activo: usuario.activo,
        rol: usuario.rol
      };
      // Actualizar último acceso (si el campo existe en el modelo)
      // NOTA: No se puede actualizar 'ultimoAcceso' directamente por un problema de tipos Prisma.
      // Si se requiere registrar el último acceso, revisar el schema y los tipos generados.
      console.log(`[AUTH] Login exitoso para usuario: ${usuario.email} (rol: ${usuario.rol})`);
      res.json(usuarioResponse);
    } catch (error: any) {
      console.error("[AUTH] Error en login:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      res.json({ message: "Sesión cerrada correctamente" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Rutas para brigadistas - obtener actividades asignadas desde la base de datos
  app.get("/api/brigadista/:id/actividades", async (req, res) => {
    try {
      const brigadistaId = parseInt(req.params.id);
      const fecha = req.query.fecha as string || new Date().toISOString().split('T')[0];
      
      // Buscar programaciones asignadas al brigadista para la fecha especificada
      const programaciones = await prisma.programacion.findMany({
        where: {
          OR: [
            { brigadistaId },
            { brigadistaApoyoId: brigadistaId }
          ],
          fechaProgramada: {
            gte: new Date(fecha + 'T00:00:00.000Z'),
            lt: new Date(fecha + 'T23:59:59.999Z')
          }
        },
        include: {
          obra: true,
          concepto: true,
          vehiculo: true,
          brigadista: true,
          brigadistaApoyo: true
        },
        orderBy: {
          horaProgramada: 'asc'
        }
      });

      // Formatear datos para el frontend
      const actividades = programaciones.map(prog => ({
        id: prog.id,
        obra: { 
          clave: prog.claveObra,
          nombreObra: prog.obra?.contratista || 'Obra sin nombre'
        },
        concepto: { 
          codigo: prog.conceptoCodigo,
          descripcion: prog.concepto?.descripcion || 'Concepto sin descripción'
        },
        vehiculo: { 
          clave: prog.vehiculo?.clave || 'N/A',
          descripcion: prog.vehiculo?.descripcion || 'Vehículo no asignado'
        },
        cantidadMuestras: prog.cantidadMuestras,
        horaProgramada: prog.horaProgramada,
        estado: prog.estado,
        tipoProgramacion: prog.tipoProgramacion,
        nombreResidente: prog.nombreResidente,
        telefonoResidente: prog.telefonoResidente,
        observaciones: prog.observaciones,
        fechaInicio: prog.fechaInicio,
        fechaCompletado: prog.fechaCompletado,
        muestrasObtenidas: prog.muestrasObtenidas
      }));

      console.log(`[BRIGADISTA] Encontradas ${actividades.length} actividades para brigadista ${brigadistaId} en fecha ${fecha}`);
      res.json(actividades);
    } catch (error: any) {
      console.error("[BRIGADISTA] Error obteniendo actividades:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Actualizar estado de programación con base de datos real
  app.patch("/api/programacion/:id/estado", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { estado, datos } = req.body;
      
      // Preparar datos de actualización
      const updateData: any = { estado };
      
      if (estado === 'en_proceso') {
        updateData.fechaInicio = new Date();
      } else if (estado === 'completada') {
        updateData.fechaCompletado = new Date();
        if (datos?.muestrasObtenidas) {
          updateData.muestrasObtenidas = parseInt(datos.muestrasObtenidas);
        }
      } else if (estado === 'cancelada' && datos?.motivoCancelacion) {
        updateData.motivoCancelacion = datos.motivoCancelacion;
      }

      // Actualizar en la base de datos
      const programacionActualizada = await prisma.programacion.update({
        where: { id },
        data: updateData,
        include: {
          obra: true,
          concepto: true,
          vehiculo: true,
          brigadista: true
        }
      });

      // Formatear respuesta
      const response = {
        id: programacionActualizada.id,
        estado: programacionActualizada.estado,
        fechaInicio: programacionActualizada.fechaInicio,
        fechaCompletado: programacionActualizada.fechaCompletado,
        muestrasObtenidas: programacionActualizada.muestrasObtenidas,
        motivoCancelacion: programacionActualizada.motivoCancelacion,
        obra: { clave: programacionActualizada.claveObra },
        concepto: { descripcion: programacionActualizada.concepto?.descripcion },
        vehiculo: { descripcion: programacionActualizada.vehiculo?.descripcion },
        brigadista: { nombre: programacionActualizada.brigadista?.nombre }
      };

      console.log(`[PROGRAMACION] Estado actualizado para programación ${id}: ${estado}`);
      res.json(response);
    } catch (error: any) {
      console.error("[PROGRAMACION] Error actualizando estado:", error);
      res.status(500).json({ message: error.message });
    }
  });

  return Promise.resolve(server);
}

export default registerRoutes;
