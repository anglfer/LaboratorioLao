
import type { Express } from "express";
import { createServer, type Server } from "http";
import storage from "./storage";
import { z } from "zod";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import rutasAreas from './routes-areas.js';
import rutasConceptos from './routes-conceptos.js';
import { PDFService } from './pdf-service';
import { generatePresupuestoHTML } from './pdf-template';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      // @ts-ignore
      const sessionUser = req.session?.user as { id: number; rol: string } | undefined;
      if (sessionUser && sessionUser.rol !== 'admin') {
        const presupuestos = await storage.getPresupuestosByUsuario(sessionUser.id);
        return res.json(presupuestos);
      }
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

  // Endpoint para previsualizar HTML del presupuesto (útil para debugging)
  app.get("/api/presupuestos/:id/preview", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log(`[GET /api/presupuestos/${id}/preview] Generating HTML preview...`);
      
      // Obtener presupuesto con todos los datos relacionados
      const presupuesto = await storage.getPresupuestoById(id);
      if (!presupuesto) {
        return res.status(404).json({ message: "Presupuesto no encontrado" });
      }

      // Obtener detalles del presupuesto
      const detalles = await storage.getPresupuestoDetalles(id);
      
      // Generar HTML profesional
      const html = generatePresupuestoHTML(presupuesto, detalles);
      
      console.log(`[GET /api/presupuestos/${id}/preview] HTML preview generated successfully`);
      
      // Enviar HTML directamente para previsualización
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
      
    } catch (error: any) {
      console.error("[GET /api/presupuestos/:id/preview] Error:", error);
      res.status(500).json({ 
        message: error.message,
        details: error.stack?.split('\n').slice(0, 3).join('\n')
      });
    }
  });

  // Endpoint para generar PDF profesional con servicio separado
  app.get("/api/presupuestos/:id/pdf", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log(`[GET /api/presupuestos/${id}/pdf] Generating PDF...`);
      
      // Obtener presupuesto con todos los datos relacionados
      const presupuesto = await storage.getPresupuestoById(id);
      if (!presupuesto) {
        return res.status(404).json({ message: "Presupuesto no encontrado" });
      }

      // Obtener detalles del presupuesto
      const detalles = await storage.getPresupuestoDetalles(id);
      
      // Generar HTML profesional
      const html = generatePresupuestoHTML(presupuesto, detalles);
      
      // Validar HTML antes de generar PDF
      if (!PDFService.validateHTML(html)) {
        throw new Error("HTML generado no es válido para conversión a PDF");
      }
      
      // Generar PDF con el servicio separado
      const pdf = await PDFService.generatePDF(html);
      
      // Configurar headers para descarga
      const filename = `Presupuesto_${presupuesto.claveObra || presupuesto.id}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdf.length);
      
      console.log(`[GET /api/presupuestos/${id}/pdf] PDF generated successfully: ${filename}`);
      
      // Enviar PDF
      res.send(pdf);
      
    } catch (error: any) {
      console.error("[GET /api/presupuestos/:id/pdf] Error:", error);
      res.status(500).json({ 
        message: error.message,
        details: error.stack?.split('\n').slice(0, 3).join('\n') // Primeras 3 líneas del stack para debugging
      });
    }
  });

  app.post("/api/presupuestos", async (req, res) => {
    try {
      // Obtener usuario de la sesión
      // @ts-ignore
      const sessionUser = req.session?.user as { id: number; rol: string } | undefined;
      if (!sessionUser) {
        return res.status(401).json({ message: "No autenticado" });
      }
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
        usuarioId: sessionUser.id,
        ultimoUsuarioId: sessionUser.id,
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
      // Obtener usuario de sesión
      // @ts-ignore
      const sessionUser = req.session?.user as { id: number; rol: string } | undefined;
      if (!sessionUser) {
        return res.status(401).json({ message: "No autenticado" });
      }

      // Verificar propiedad
      const existente = await storage.getPresupuestoById(id);
      if (!existente) return res.status(404).json({ message: "Presupuesto no encontrado" });
  const esAdmin = sessionUser.rol === 'admin';
  const ownerId = (existente as any).usuarioId ?? null;
  if (!esAdmin && ownerId !== sessionUser.id) {
        return res.status(403).json({ message: "No tienes permiso para modificar este presupuesto" });
      }
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
  const presupuesto = await storage.updatePresupuesto(id, { ...result.data, ultimoUsuarioId: sessionUser.id });
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
      // Obtener usuario de sesión
      // @ts-ignore
      const sessionUser = req.session?.user as { id: number; rol: string } | undefined;
      if (!sessionUser) {
        return res.status(401).json({ message: "No autenticado" });
      }

      // Verificar propiedad
      const existente = await storage.getPresupuestoById(id);
      if (!existente) return res.status(404).json({ message: "Presupuesto no encontrado" });
  const esAdmin = sessionUser.rol === 'admin';
  const ownerId = (existente as any).usuarioId ?? null;
  if (!esAdmin && ownerId !== sessionUser.id) {
        return res.status(403).json({ message: "No tienes permiso para eliminar este presupuesto" });
      }
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
      // Obtener usuario de sesión
      // @ts-ignore
      const sessionUser = req.session?.user as { id: number; rol: string } | undefined;
      if (!sessionUser) {
        return res.status(401).json({ message: "No autenticado" });
      }

      // Verificar propiedad del presupuesto
      const existente = await storage.getPresupuestoById(presupuestoId);
      if (!existente) return res.status(404).json({ message: "Presupuesto no encontrado" });
  const esAdmin = sessionUser.rol === 'admin';
  const ownerId = (existente as any).usuarioId ?? null;
  if (!esAdmin && ownerId !== sessionUser.id) {
        return res.status(403).json({ message: "No tienes permiso para modificar este presupuesto" });
      }

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
  // Marcar último modificador del presupuesto
  await storage.updatePresupuesto(presupuestoId, { ultimoUsuarioId: sessionUser.id });

      res.status(201).json(detalle);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/presupuestos/:id/detalles/:detalleId", async (req, res) => {
    try {
      const presupuestoId = parseInt(req.params.id);
      const detalleId = parseInt(req.params.detalleId);
      // Obtener usuario de sesión
      // @ts-ignore
      const sessionUser = req.session?.user as { id: number; rol: string } | undefined;
      if (!sessionUser) {
        return res.status(401).json({ message: "No autenticado" });
      }

      // Verificar propiedad del presupuesto
      const existente = await storage.getPresupuestoById(presupuestoId);
      if (!existente) return res.status(404).json({ message: "Presupuesto no encontrado" });
  const esAdmin = sessionUser.rol === 'admin';
  const ownerId = (existente as any).usuarioId ?? null;
  if (!esAdmin && ownerId !== sessionUser.id) {
        return res.status(403).json({ message: "No tienes permiso para modificar este presupuesto" });
      }
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
  // Marcar último modificador del presupuesto
  await storage.updatePresupuesto(presupuestoId, { ultimoUsuarioId: sessionUser.id });

      res.json(detalle);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/presupuestos/:id/detalles/:detalleId", async (req, res) => {
    try {
      const presupuestoId = parseInt(req.params.id);
      const detalleId = parseInt(req.params.detalleId);
      // Obtener usuario de sesión
      // @ts-ignore
      const sessionUser = req.session?.user as { id: number; rol: string } | undefined;
      if (!sessionUser) {
        return res.status(401).json({ message: "No autenticado" });
      }

      // Verificar propiedad del presupuesto
      const existente = await storage.getPresupuestoById(presupuestoId);
      if (!existente) return res.status(404).json({ message: "Presupuesto no encontrado" });
      const esAdmin = sessionUser.rol === 'admin';
      if (!esAdmin && existente && (existente as any).usuarioId && (existente as any).usuarioId !== sessionUser.id) {
        return res.status(403).json({ message: "No tienes permiso para modificar este presupuesto" });
      }
      await storage.deletePresupuestoDetalle(detalleId);

      // Recalcular totales después de eliminar detalle
  await storage.recalcularTotalesPresupuesto(presupuestoId);
  // Marcar último modificador del presupuesto
  await storage.updatePresupuesto(presupuestoId, { ultimoUsuarioId: sessionUser.id });

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });



  // Rutas de autenticación básicas
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: "Email y contraseña son requeridos" 
        });
      }

      // Buscar usuario por email con rol incluido
      const usuario = await prisma.usuario.findUnique({
        where: { email },
        include: { role: true }
      });

      if (!usuario) {
        return res.status(401).json({ 
          success: false, 
          message: "Credenciales incorrectas" 
        });
      }

      // Verificar si el usuario está activo
      if (!usuario.activo) {
        return res.status(401).json({ 
          success: false, 
          message: "Usuario inactivo" 
        });
      }

  // Verificar password con bcrypt
  const passwordMatch = await bcrypt.compare(password, usuario.password);

      if (!passwordMatch) {
        return res.status(401).json({ 
          success: false, 
          message: "Credenciales incorrectas" 
        });
      }

      // Actualizar último acceso
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { ultimoAcceso: new Date() }
      });

  // Preparar datos del usuario para respuesta (sin password)
      const userData = {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        rol: usuario.role.nombre,
        activo: usuario.activo,
        fechaCreacion: usuario.fechaCreacion
      };
      
      console.log(`[AUTH] Login exitoso para: ${email}`);
  // Guardar usuario en sesión para control de propiedad
  // @ts-ignore
  req.session = req.session || {};
  // @ts-ignore
  req.session.user = { id: usuario.id, rol: usuario.role.nombre };
  // Responder con el objeto de usuario directamente (lo espera el frontend)
  return res.status(200).json(userData);
      
    } catch (error: any) {
      console.error('[AUTH] Error en login:', error);
      res.status(500).json({ 
        success: false, 
        message: "Error interno del servidor" 
      });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      // @ts-ignore
      if (req.session) {
        // @ts-ignore
        req.session.destroy(() => {});
      }
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
