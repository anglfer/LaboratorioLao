import { Router } from "express";
import { PrismaClient } from "../generated/prisma";
import type { 
  EstadoProgramacion, 
  TipoRecoleccion, 
  TipoProgramacion 
} from "../generated/prisma";

const router = Router();
const prisma = new PrismaClient();

// ============ BRIGADISTAS ============

// GET /api/brigadistas - Obtener todos los brigadistas activos
router.get("/brigadistas", async (req, res) => {
  try {
    const brigadistas = await prisma.brigadista.findMany({
      where: { activo: true },
      orderBy: [
        { nombre: "asc" },
        { apellidos: "asc" }
      ]
    });
    res.json(brigadistas);
  } catch (error) {
    console.error("Error fetching brigadistas:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// POST /api/brigadistas - Crear nuevo brigadista
router.post("/brigadistas", async (req, res) => {
  try {
    const { nombre, apellidos, telefono, email } = req.body;
    
    const brigadista = await prisma.brigadista.create({
      data: {
        nombre,
        apellidos,
        telefono,
        email,
        activo: true
      }
    });
    
    res.status(201).json(brigadista);
  } catch (error) {
    console.error("Error creating brigadista:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// PUT /api/brigadistas/:id - Actualizar brigadista
router.put("/brigadistas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellidos, telefono, email, activo } = req.body;
    
    const brigadista = await prisma.brigadista.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        apellidos,
        telefono,
        email,
        activo
      }
    });
    
    res.json(brigadista);
  } catch (error) {
    console.error("Error updating brigadista:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ============ VEHICULOS ============

// GET /api/vehiculos - Obtener todos los vehículos activos
router.get("/vehiculos", async (req, res) => {
  try {
    const vehiculos = await prisma.vehiculo.findMany({
      where: { activo: true },
      orderBy: { clave: "asc" }
    });
    res.json(vehiculos);
  } catch (error) {
    console.error("Error fetching vehiculos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// POST /api/vehiculos - Crear nuevo vehículo
router.post("/vehiculos", async (req, res) => {
  try {
    const { clave, marca, modelo, año, placas } = req.body;
    
    const vehiculo = await prisma.vehiculo.create({
      data: {
        clave,
        marca,
        modelo,
        año: año ? parseInt(año) : null,
        placas,
        activo: true
      }
    });
    
    res.status(201).json(vehiculo);
  } catch (error) {
    console.error("Error creating vehiculo:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// PUT /api/vehiculos/:id - Actualizar vehículo
router.put("/vehiculos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { clave, marca, modelo, año, placas, activo } = req.body;
    
    const vehiculo = await prisma.vehiculo.update({
      where: { id: parseInt(id) },
      data: {
        clave,
        marca,
        modelo,
        año: año ? parseInt(año) : null,
        placas,
        activo
      }
    });
    
    res.json(vehiculo);
  } catch (error) {
    console.error("Error updating vehiculo:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ============ PRESUPUESTOS APROBADOS ============

// GET /api/presupuestos-aprobados - Obtener presupuestos aprobados para programación
router.get("/presupuestos-aprobados", async (req, res) => {
  try {
    const presupuestos = await prisma.presupuesto.findMany({
      where: { 
        estado: "aprobado"
      },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true
          }
        },
        obra: {
          select: {
            clave: true,
            nombre: true,
            descripcion: true,
            direccion: true,
            contratista: true
          }
        },
        detalles: {
          include: {
            concepto: {
              select: {
                codigo: true,
                descripcion: true,
                unidad: true,
                precioUnitario: true
              }
            }
          }
        }
      },
      orderBy: { fechaSolicitud: "desc" }
    });
    
    // Transformar para el frontend
    const presupuestosFormatted = presupuestos.map(p => ({
      id: p.id,
      claveObra: p.claveObra,
      cliente: p.cliente,
      obra: p.obra,
      conceptos: p.detalles.map(d => ({
        codigo: d.conceptoCodigo,
        descripcion: d.concepto?.descripcion || "",
        unidad: d.concepto?.unidad || "",
        cantidad: Number(d.cantidad),
        precioUnitario: Number(d.precioUnitario)
      })),
      fechaSolicitud: p.fechaSolicitud
    }));
    
    res.json(presupuestosFormatted);
  } catch (error) {
    console.error("Error fetching presupuestos aprobados:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ============ PROGRAMACIONES ============

// GET /api/programaciones - Obtener programaciones con filtros
router.get("/programaciones", async (req, res) => {
  try {
    const { 
      fechaInicio, 
      fechaFin, 
      brigadistaId, 
      estado, 
      claveObra, 
      clienteId 
    } = req.query;
    
    // Construir filtros dinámicamente
    const where: any = {};
    
    if (fechaInicio && fechaFin) {
      where.fechaProgramada = {
        gte: new Date(fechaInicio as string),
        lte: new Date(fechaFin as string)
      };
    }
    
    if (brigadistaId) {
      where.OR = [
        { brigadistaPrincipalId: parseInt(brigadistaId as string) },
        { brigadistaApoyoId: parseInt(brigadistaId as string) }
      ];
    }
    
    if (estado) {
      where.estado = estado as EstadoProgramacion;
    }
    
    if (claveObra) {
      where.claveObra = claveObra;
    }
    
    if (clienteId) {
      where.presupuesto = {
        clienteId: parseInt(clienteId as string)
      };
    }
    
    const programaciones = await prisma.programacion.findMany({
      where,
      include: {
        presupuesto: {
          include: {
            cliente: {
              select: {
                id: true,
                nombre: true
              }
            }
          }
        },
        obra: {
          select: {
            clave: true,
            nombre: true,
            descripcion: true,
            direccion: true
          }
        },
        brigadistaPrincipal: true,
        brigadistaApoyo: true,
        vehiculo: true,
        usuarioCreador: {
          select: {
            id: true,
            nombre: true,
            apellidos: true
          }
        },
        usuarioActualizador: {
          select: {
            id: true,
            nombre: true,
            apellidos: true
          }
        },
        detalles: {
          include: {
            concepto: {
              select: {
                codigo: true,
                descripcion: true,
                unidad: true,
                precioUnitario: true
              }
            }
          }
        }
      },
      orderBy: { fechaProgramada: "asc" }
    });
    
    res.json(programaciones);
  } catch (error) {
    console.error("Error fetching programaciones:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET /api/programaciones/stats/semanal - Estadísticas semanales
router.get("/programaciones/stats/semanal", async (req, res) => {
  try {
    const { fecha } = req.query;
    const targetDate = fecha ? new Date(fecha as string) : new Date();
    
    // Calcular inicio y fin de la semana
    const startOfWeek = new Date(targetDate);
    startOfWeek.setDate(targetDate.getDate() - targetDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    // Obtener programaciones de la semana
    const programaciones = await prisma.programacion.findMany({
      where: {
        fechaProgramada: {
          gte: startOfWeek,
          lte: endOfWeek
        }
      },
      include: {
        brigadistaPrincipal: true,
        brigadistaApoyo: true,
        vehiculo: true
      }
    });
    
    // Calcular estadísticas
    const programacionesTotales = programaciones.length;
    const programacionesCompletadas = programaciones.filter(p => p.estado === "completada").length;
    const programacionesPendientes = programaciones.filter(p => p.estado === "programada").length;
    const programacionesCanceladas = programaciones.filter(p => p.estado === "cancelada").length;
    
    const rendimientoSemanal = programacionesTotales > 0 
      ? Math.round((programacionesCompletadas / programacionesTotales) * 100) 
      : 0;
    
    // Brigadistas únicos activos
    const brigadistasActivos = new Set([
      ...programaciones.map(p => p.brigadistaPrincipalId),
      ...programaciones.filter(p => p.brigadistaApoyoId).map(p => p.brigadistaApoyoId!)
    ]).size;
    
    // Vehículos únicos en uso
    const vehiculosEnUso = new Set(programaciones.map(p => p.vehiculoId)).size;
    
    // Agrupar por día
    const programacionesDiarias = [];
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(startOfWeek);
      fecha.setDate(startOfWeek.getDate() + i);
      
      const programacionesDelDia = programaciones.filter(p => {
        const fechaProg = new Date(p.fechaProgramada);
        return fechaProg.toDateString() === fecha.toDateString();
      });
      
      programacionesDiarias.push({
        fecha,
        programaciones: programacionesDelDia
      });
    }
    
    const stats = {
      programacionesTotales,
      programacionesCompletadas,
      programacionesPendientes,
      programacionesCanceladas,
      rendimientoSemanal,
      brigadistasActivos,
      vehiculosEnUso
    };
    
    res.json({
      semana: `${targetDate.getFullYear()}-W${Math.ceil(targetDate.getDate() / 7)}`,
      fechaInicio: startOfWeek,
      fechaFin: endOfWeek,
      stats,
      programacionesDiarias
    });
  } catch (error) {
    console.error("Error fetching weekly stats:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET /api/programaciones/:id - Obtener programación por ID
router.get("/programaciones/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const programacion = await prisma.programacion.findUnique({
      where: { id: parseInt(id) },
      include: {
        presupuesto: {
          include: {
            cliente: {
              select: {
                id: true,
                nombre: true
              }
            }
          }
        },
        obra: {
          select: {
            clave: true,
            nombre: true,
            descripcion: true,
            direccion: true
          }
        },
        brigadistaPrincipal: true,
        brigadistaApoyo: true,
        vehiculo: true,
        usuarioCreador: {
          select: {
            id: true,
            nombre: true,
            apellidos: true
          }
        },
        usuarioActualizador: {
          select: {
            id: true,
            nombre: true,
            apellidos: true
          }
        },
        detalles: {
          include: {
            concepto: {
              select: {
                codigo: true,
                descripcion: true,
                unidad: true,
                precioUnitario: true
              }
            }
          }
        }
      }
    });
    
    if (!programacion) {
      return res.status(404).json({ error: "Programación no encontrada" });
    }
    
    res.json(programacion);
  } catch (error) {
    console.error("Error fetching programacion:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// POST /api/programaciones - Crear nueva programación
router.post("/programaciones", async (req, res) => {
  try {
    const {
      presupuestoId,
      claveObra,
      fechaProgramada,
      horaProgramada,
      tipoProgramacion,
      nombreResidente,
      telefonoResidente,
      observacionesIniciales,
      brigadistaPrincipalId,
      brigadistaApoyoId,
      vehiculoId,
      claveEquipo,
      herramientasEspeciales,
      observacionesProgramacion,
      instruccionesBrigadista,
      condicionesEspeciales,
      detalles,
      creadoPor
    } = req.body;
    
    // Crear la programación con sus detalles en una transacción
    const programacion = await prisma.$transaction(async (tx) => {
      // Crear la programación principal
      const nuevaProgramacion = await tx.programacion.create({
        data: {
          presupuestoId,
          claveObra,
          fechaProgramada: new Date(fechaProgramada),
          horaProgramada,
          tipoProgramacion: tipoProgramacion as TipoProgramacion,
          nombreResidente,
          telefonoResidente,
          observacionesIniciales,
          brigadistaPrincipalId,
          brigadistaApoyoId,
          vehiculoId,
          claveEquipo,
          herramientasEspeciales,
          observacionesProgramacion,
          instruccionesBrigadista,
          condicionesEspeciales,
          estado: "programada",
          creadoPor
        }
      });
      
      // Crear los detalles
      if (detalles && detalles.length > 0) {
        await tx.programacionDetalle.createMany({
          data: detalles.map((detalle: any) => ({
            programacionId: nuevaProgramacion.id,
            conceptoCodigo: detalle.conceptoCodigo,
            cantidadMuestras: detalle.cantidadMuestras,
            tipoRecoleccion: detalle.tipoRecoleccion as TipoRecoleccion,
            distribucionMuestras: detalle.distribucionMuestras,
            esNoPresupuestado: detalle.esNoPresupuestado || false,
            descripcionConcepto: detalle.descripcionConcepto,
            unidadMedida: detalle.unidadMedida
          }))
        });
        
        // Si hay conceptos no presupuestados, agregarlos al presupuesto
        const conceptosNoPresupuestados = detalles.filter((d: any) => d.esNoPresupuestado);
        if (conceptosNoPresupuestados.length > 0) {
          for (const concepto of conceptosNoPresupuestados) {
            // Crear detalle en el presupuesto
            await tx.presupuestoDetalle.create({
              data: {
                presupuestoId,
                conceptoCodigo: concepto.conceptoCodigo,
                cantidad: concepto.cantidadMuestras,
                precioUnitario: 0, // Se actualizará después
                estado: "en_proceso"
              }
            });
          }
        }
      }
      
      return nuevaProgramacion;
    });
    
    // Obtener la programación completa para respuesta
    const programacionCompleta = await prisma.programacion.findUnique({
      where: { id: programacion.id },
      include: {
        presupuesto: {
          include: {
            cliente: {
              select: {
                id: true,
                nombre: true
              }
            }
          }
        },
        obra: true,
        brigadistaPrincipal: true,
        brigadistaApoyo: true,
        vehiculo: true,
        detalles: {
          include: {
            concepto: true
          }
        }
      }
    });
    
    res.status(201).json(programacionCompleta);
  } catch (error) {
    console.error("Error creating programacion:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// PUT /api/programaciones/:id - Actualizar programación
router.put("/programaciones/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fechaProgramada,
      horaProgramada,
      tipoProgramacion,
      nombreResidente,
      telefonoResidente,
      observacionesIniciales,
      brigadistaPrincipalId,
      brigadistaApoyoId,
      vehiculoId,
      claveEquipo,
      herramientasEspeciales,
      observacionesProgramacion,
      instruccionesBrigadista,
      condicionesEspeciales,
      actualizadoPor
    } = req.body;
    
    const programacion = await prisma.programacion.update({
      where: { id: parseInt(id) },
      data: {
        fechaProgramada: fechaProgramada ? new Date(fechaProgramada) : undefined,
        horaProgramada,
        tipoProgramacion: tipoProgramacion as TipoProgramacion,
        nombreResidente,
        telefonoResidente,
        observacionesIniciales,
        brigadistaPrincipalId,
        brigadistaApoyoId,
        vehiculoId,
        claveEquipo,
        herramientasEspeciales,
        observacionesProgramacion,
        instruccionesBrigadista,
        condicionesEspeciales,
        actualizadoPor
      },
      include: {
        presupuesto: {
          include: {
            cliente: {
              select: {
                id: true,
                nombre: true
              }
            }
          }
        },
        obra: true,
        brigadistaPrincipal: true,
        brigadistaApoyo: true,
        vehiculo: true,
        detalles: {
          include: {
            concepto: true
          }
        }
      }
    });
    
    res.json(programacion);
  } catch (error) {
    console.error("Error updating programacion:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// PUT /api/programaciones/:id/estado - Actualizar estado de programación
router.put("/programaciones/:id/estado", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      estado,
      motivoCancelacion,
      observacionesComplecion,
      detallesComplecion,
      actualizadoPor
    } = req.body;
    
    const programacion = await prisma.$transaction(async (tx) => {
      // Actualizar la programación
      const updateData: any = {
        estado: estado as EstadoProgramacion,
        motivoCancelacion,
        observacionesComplecion,
        actualizadoPor
      };
      
      // Agregar fechas según el estado
      if (estado === "en_proceso") {
        updateData.fechaInicio = new Date();
      } else if (estado === "completada") {
        updateData.fechaComplecion = new Date();
        if (!await tx.programacion.findFirst({ where: { id: parseInt(id), fechaInicio: { not: null } } })) {
          updateData.fechaInicio = new Date();
        }
      }
      
      const updatedProgramacion = await tx.programacion.update({
        where: { id: parseInt(id) },
        data: updateData
      });
      
      // Actualizar detalles si se proporcionan
      if (detallesComplecion && detallesComplecion.length > 0) {
        for (const detalle of detallesComplecion) {
          await tx.programacionDetalle.update({
            where: { id: detalle.id },
            data: {
              muestrasObtenidas: detalle.muestrasObtenidas,
              observaciones: detalle.observaciones
            }
          });
        }
      }
      
      return updatedProgramacion;
    });
    
    // Obtener programación completa para respuesta
    const programacionCompleta = await prisma.programacion.findUnique({
      where: { id: parseInt(id) },
      include: {
        presupuesto: {
          include: {
            cliente: {
              select: {
                id: true,
                nombre: true
              }
            }
          }
        },
        obra: true,
        brigadistaPrincipal: true,
        brigadistaApoyo: true,
        vehiculo: true,
        detalles: {
          include: {
            concepto: true
          }
        }
      }
    });
    
    res.json(programacionCompleta);
  } catch (error) {
    console.error("Error updating programacion status:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// DELETE /api/programaciones/:id - Eliminar programación
router.delete("/programaciones/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.$transaction(async (tx) => {
      // Eliminar detalles primero
      await tx.programacionDetalle.deleteMany({
        where: { programacionId: parseInt(id) }
      });
      
      // Eliminar programación
      await tx.programacion.delete({
        where: { id: parseInt(id) }
      });
    });
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting programacion:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;