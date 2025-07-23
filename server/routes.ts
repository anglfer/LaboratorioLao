
import type { Express } from "express";
import { createServer, type Server } from "http";
import storage from "./storage";
import { z } from "zod";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "./prisma";
import rutasAreas from './routes-areas.js';
import rutasConceptos from './routes-conceptos.js';
import {
  insertClienteSchema,
  insertTelefonoSchema,
  insertCorreoSchema,
  insertAreaSchema,
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

  const estadoActual = presupuesto.estado || "borrador";
  const colorEstado = estadoColors[estadoActual as keyof typeof estadoColors] || estadoColors.borrador;

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Presupuesto ${presupuesto.id}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                font-size: 12px;
                line-height: 1.4;
                color: #333;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
            }
            .company-name {
                font-size: 24px;
                font-weight: bold;
                color: #2563eb;
                margin-bottom: 5px;
            }
            .document-title {
                font-size: 18px;
                font-weight: bold;
                margin: 10px 0;
            }
            .status-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 15px;
                font-size: 10px;
                font-weight: bold;
                text-transform: uppercase;
                background-color: ${colorEstado.bg};
                color: ${colorEstado.text};
                border: 1px solid ${colorEstado.border};
                margin: 10px 0;
            }
            .info-section {
                margin-bottom: 20px;
            }
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
            }
            .info-block h3 {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 8px;
                color: #2563eb;
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 4px;
            }
            .info-block p {
                margin: 4px 0;
                font-size: 11px;
            }
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                font-size: 10px;
            }
            .items-table th {
                background-color: #f8fafc;
                border: 1px solid #e5e7eb;
                padding: 8px;
                text-align: left;
                font-weight: bold;
                font-size: 10px;
            }
            .items-table td {
                border: 1px solid #e5e7eb;
                padding: 8px;
                vertical-align: top;
            }
            .items-table tr:nth-child(even) {
                background-color: #f9fafb;
            }
            .totals-section {
                margin-top: 20px;
                text-align: right;
            }
            .totals-table {
                display: inline-block;
                border: 1px solid #e5e7eb;
            }
            .totals-table tr td {
                padding: 8px 15px;
                border-bottom: 1px solid #e5e7eb;
            }
            .totals-table tr:last-child td {
                border-bottom: none;
                font-weight: bold;
                background-color: #f8fafc;
            }
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 10px;
                color: #6b7280;
                text-align: center;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-name">Laboratorio Lao</div>
            <div class="document-title">PRESUPUESTO</div>
            <div class="status-badge">${estadoActual}</div>
        </div>

        <div class="info-grid">
            <div class="info-block">
                <h3>Información del Presupuesto</h3>
                <p><strong>Número:</strong> ${presupuesto.id}</p>
                <p><strong>Fecha:</strong> ${new Date(presupuesto.fechaSolicitud || new Date()).toLocaleDateString('es-MX')}</p>
                <p><strong>Clave de Obra:</strong> ${presupuesto.claveObra || 'Por asignar'}</p>
                <p><strong>Estado:</strong> ${estadoActual}</p>
            </div>
            
            <div class="info-block">
                <h3>Información del Cliente</h3>
                <p><strong>Cliente:</strong> ${presupuesto.cliente?.nombre || 'Cliente no especificado'}</p>
                <p><strong>Contratista:</strong> ${presupuesto.nombreContratista || 'No especificado'}</p>
                <p><strong>Contacto:</strong> ${presupuesto.contactoResponsable || 'No especificado'}</p>
                <p><strong>Dirección:</strong> ${presupuesto.direccion || 'No especificada'}</p>
            </div>
        </div>

        ${presupuesto.descripcionObra ? `
        <div class="info-section">
            <h3>Descripción de la Obra</h3>
            <p>${presupuesto.descripcionObra}</p>
        </div>
        ` : ''}

        ${presupuesto.alcance ? `
        <div class="info-section">
            <h3>Alcance del Trabajo</h3>
            <p>${presupuesto.alcance}</p>
        </div>
        ` : ''}

        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 15%">Código</th>
                    <th style="width: 40%">Descripción</th>
                    <th style="width: 10%">Unidad</th>
                    <th style="width: 10%" class="text-center">Cantidad</th>
                    <th style="width: 12%" class="text-right">Precio Unit.</th>
                    <th style="width: 13%" class="text-right">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                ${detalles.map(detalle => `
                    <tr>
                        <td>${detalle.concepto?.codigo || detalle.conceptoCodigo}</td>
                        <td>${detalle.concepto?.descripcion || 'Descripción no disponible'}</td>
                        <td class="text-center">${detalle.concepto?.unidad || '-'}</td>
                        <td class="text-center">${Number(detalle.cantidad).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td class="text-right">$${Number(detalle.precioUnitario).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td class="text-right">$${(Number(detalle.cantidad) * Number(detalle.precioUnitario)).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="totals-section">
            <table class="totals-table">
                <tr>
                    <td><strong>Subtotal:</strong></td>
                    <td class="text-right">$${Number(subtotal).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                    <td><strong>IVA (${((presupuesto.iva || 0.16) * 100).toFixed(0)}%):</strong></td>
                    <td class="text-right">$${Number(iva).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                    <td><strong>TOTAL:</strong></td>
                    <td class="text-right">$${Number(total).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
            </table>
        </div>

        ${presupuesto.manejaAnticipo && presupuesto.porcentajeAnticipo ? `
        <div class="info-section">
            <h3>Condiciones de Pago</h3>
            <p><strong>Anticipo requerido:</strong> ${presupuesto.porcentajeAnticipo}% del total = $${(Number(total) * Number(presupuesto.porcentajeAnticipo) / 100).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        ` : ''}

        <div class="footer">
            <p>Documento generado el ${fechaGeneracion}</p>
            <p>Este presupuesto tiene una vigencia de 30 días a partir de la fecha de emisión</p>
        </div>
    </body>
    </html>
  `;
}

// HTML validation function to prevent PDF corruption
function validateHTML(html: string): boolean {
  try {
    // Basic validation - check for malformed HTML that could break PDF generation
    const suspiciousPatterns = [
      /<script[^>]*>/i,
      /<iframe[^>]*>/i,
      /javascript:/i,
      /data:text\/html/i,
      /<object[^>]*>/i,
      /<embed[^>]*>/i,
    ];

    return !suspiciousPatterns.some(pattern => pattern.test(html));
  } catch (error) {
    console.error("HTML validation error:", error);
    return false;
  }
}

export function registerRoutes(app: Express): Promise<Server> {
  const server = createServer(app);
  
  // Registrar las nuevas rutas jerárquicas
  app.use('/api', rutasAreas);
  app.use('/api', rutasConceptos);
  
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

  // Cliente routes
  app.get("/api/clientes", async (req, res) => {
    try {
      const clientes = await storage.getAllClientes();
      res.json(clientes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Nuevo endpoint para clientes con contactos completos
  app.get("/api/clientes/full", async (req, res) => {
    try {
      const clientes = await storage.getAllClientesFull();
      res.json(clientes);
    } catch (error: any) {
      console.error("[API] Error getting full clientes:", error);
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
      console.log("[API] Creando cliente:", req.body);
      const result = insertClienteSchema.safeParse(req.body);
      if (!result.success) {
        console.log("[API] Error de validación:", result.error.errors);
        return res
          .status(400)
          .json({ message: "Validation error", errors: result.error.errors });
      }
      const cliente = await storage.createCliente(result.data);
      console.log("[API] Cliente creado exitosamente:", cliente);
      res.status(201).json(cliente);
    } catch (error: any) {
      console.error("[API] Error al crear cliente:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/clientes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertClienteSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .json({ message: "Validation error", errors: result.error.errors });
      }
      const cliente = await storage.updateCliente(id, result.data);
      res.json(cliente);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });



  
  app.delete("/api/clientes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCliente(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Teléfonos routes
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

  // Correos routes
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
      if (presupuestoData.subtotal && presupuestoData.subtotal > 9999999999.99) {
        return res.status(400).json({
          message: "El subtotal excede el límite permitido ($9,999,999,999.99)",
        });
      }

      if (presupuestoData.total) {
        const totalConIva = Number(presupuestoData.total);
        if (totalConIva > 9999999999.99) {
          return res.status(400).json({
            message:
              "El total del presupuesto (incluyendo IVA) excede el límite permitido ($9,999,999,999.99)",
          });
        }
      }

      // Si se proporciona areaCodigo, necesitamos crear o encontrar una obra
      let claveObra = presupuestoData.claveObra;

      if (areaCodigo) {
        try {
          // Si no hay claveObra, generar una nueva
          if (!claveObra) {
            claveObra = await storage.generateClaveObra(areaCodigo);
            console.log(
              "[POST /api/presupuestos] Generated claveObra:",
              claveObra,
            );
          }

          // Verificar si la obra existe y crearla si no existe
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
          } else {
            console.log(
              "[POST /api/presupuestos] Obra already exists:",
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

        // Recalcular totales si hay conceptos
        const detalles = await storage.getPresupuestoDetalles(id);
        const subtotal = detalles.reduce(
          (total: number, detalle: any) =>
            total +
            Number(detalle.precioUnitario) * Number(detalle.cantidad),
          0,
        );
        const iva = Number(presupuesto.iva) || 0.16;
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
  });

  // PDF generation route
  app.get("/api/presupuestos/:id/pdf", async (req, res) => {
    let browser;
    try {
      const id = parseInt(req.params.id);
      
      // Obtener presupuesto con detalles
      const presupuesto = await storage.getPresupuestoById(id);
      if (!presupuesto) {
        return res.status(404).json({ message: "Presupuesto not found" });
      }

      const detalles = await storage.getPresupuestoDetalles(id);

      // Generar HTML
      const html = generatePresupuestoHTML(presupuesto, detalles, true);
      
      // Validar HTML
      if (!validateHTML(html)) {
        return res.status(400).json({ 
          message: "Invalid HTML content detected" 
        });
      }

      // Configurar Puppeteer
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      
      // Configurar el contenido HTML
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      // Generar PDF
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });

      // Configurar headers de respuesta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="presupuesto-${id}.pdf"`);
      res.setHeader('Content-Length', pdf.length.toString());
      
      res.send(pdf);

    } catch (error: any) {
      console.error("[PDF] Error generating PDF:", error);
      res.status(500).json({ 
        message: "Error generating PDF", 
        error: error.message 
      });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  });

  // Rutas de autenticación básicas
  app.post("/api/auth/login", async (req, res) => {
    try {
      // TEMPORAL: Retornar usuario mock para pruebas
      const mockUser = {
        id: 1,
        nombre: "Administrador",
        apellidos: "Sistema",
        rol: "admin"
      };
      
      console.log('[AUTH] Login temporal exitoso');
      
      return res.status(200).json({ 
        success: true, 
        user: mockUser 
      });
      
    } catch (error: any) {
      console.error('[AUTH] Error en login:', error);
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

  // Estadísticas simplificadas para empleados
  app.get("/api/empleado/stats", async (_req, res) => {
    try {
      const [totalClientes, totalPresupuestos, totalObras, presupuestosAprobados] = await Promise.all([
        prisma.cliente.count(),
        prisma.presupuesto.count(),
        prisma.obra.count(),
        prisma.presupuesto.count({ where: { estado: "aprobado" } }),
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
        totalClientes,
        totalPresupuestos,
        totalObras,
        presupuestosPendientes: await prisma.presupuesto.count({ where: { estado: "enviado" } }),
        facturacionPendiente: facturacionPendiente._sum.total || 0,
        ventasMes: ventasMes._sum.total || 0,
        presupuestosAprobados,
      });
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
          cliente: {
            select: {
              nombre: true
            }
          },
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
      const ventasPorMes = presupuestosAprobados.reduce((acc: any[], presupuesto) => {
        const fecha = new Date(presupuesto.fechaSolicitud!);
        const mesAno = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
        
        const existente = acc.find(item => item.mes === mesAno);
        if (existente) {
          existente.ventas += Number(presupuesto.total) || 0;
        } else {
          acc.push({
            mes: mesAno,
            ventas: Number(presupuesto.total) || 0
          });
        }
        return acc;
      }, []);

      // Ordenar por mes
      ventasPorMes.sort((a, b) => a.mes.localeCompare(b.mes));

      res.json(ventasPorMes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/empleado/charts/estado-presupuestos", async (_req, res) => {
    try {
      const estadosPresupuestos = await prisma.presupuesto.groupBy({
        by: ['estado'],
        _count: {
          id: true
        }
      });

      const chartData = estadosPresupuestos.map(item => ({
        estado: item.estado || 'Sin estado',
        cantidad: item._count.id
      }));

      res.json(chartData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/empleado/charts/areas-trabajo", async (_req, res) => {
    try {
      const areasData = await prisma.area.findMany({
        include: {
          obras: {
            include: {
              presupuestos: {
                include: {
                  detalles: true
                }
              }
            }
          }
        }
      });

      const chartData = areasData.map(area => {
        const totalPresupuestos = area.obras.reduce((sum, obra) => sum + obra.presupuestos.length, 0);
        const totalMonto = area.obras.reduce((sum, obra) => 
          sum + obra.presupuestos.reduce((presSum, pres) => 
            presSum + Number(pres.total || 0), 0
          ), 0
        );

        return {
          nombre: area.nombre || area.codigo,
          totalPresupuestos,
          totalMonto
        };
      });

      res.json(chartData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Cliente routes - serve static files from client/dist
  app.use("*", (req, res, next) => {
    // Let vite handle client-side routing
    next();
  });

  return Promise.resolve(server);
}
