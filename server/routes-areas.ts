import { Router } from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Esquemas de validación
const AreaJerarquicaSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  padreId: z.string().optional(),
  nivel: z.number().int().min(1, 'El nivel debe ser mayor a 0')
});

const ConceptoJerarquicoSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  unidad: z.string().min(1, 'La unidad es requerida'),
  precioUnitario: z.number().positive('El precio debe ser positivo'),
  areaId: z.string().min(1, 'El área es requerida')
});

// ======================= RUTAS PARA ÁREAS JERÁRQUICAS =======================

// GET /api/areas-jerarquicas - Obtener todas las áreas con estructura jerárquica
router.get('/areas-jerarquicas', async (req, res) => {
  try {
    const areas = await prisma.areasJerarquicas.findMany({
      include: {
        padre: true,
        hijos: {
          include: {
            conceptos: true,
            hijos: {
              include: {
                conceptos: true
              }
            }
          }
        },
        conceptos: true
      },
      orderBy: [
        { nivel: 'asc' },
        { codigo: 'asc' }
      ]
    });

    res.json({ success: true, data: areas });
  } catch (error) {
    console.error('Error al obtener áreas jerárquicas:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// GET /api/areas-jerarquicas/arbol - Obtener áreas en estructura de árbol
router.get('/areas-jerarquicas/arbol', async (req, res) => {
  try {
    // Obtener solo las áreas raíz (sin padre)
    const areasRaiz = await prisma.areasJerarquicas.findMany({
      where: { padreId: null },
      include: {
        hijos: {
          include: {
            conceptos: true,
            hijos: {
              include: {
                conceptos: true,
                hijos: {
                  include: {
                    conceptos: true
                  }
                }
              }
            }
          }
        },
        conceptos: true
      },
      orderBy: { codigo: 'asc' }
    });

    res.json({ success: true, data: areasRaiz });
  } catch (error) {
    console.error('Error al obtener árbol de áreas:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// GET /api/areas-jerarquicas/:id - Obtener área específica
router.get('/areas-jerarquicas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNumero = parseInt(id, 10);
    
    const area = await prisma.areasJerarquicas.findUnique({
      where: { id: idNumero },
      include: {
        padre: true,
        hijos: {
          include: {
            conceptos: true
          }
        },
        conceptos: true
      }
    });

    if (!area) {
      return res.status(404).json({ 
        success: false, 
        error: 'Área no encontrada' 
      });
    }

    res.json({ success: true, data: area });
  } catch (error) {
    console.error('Error al obtener área:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// POST /api/areas-jerarquicas - Crear nueva área
router.post('/areas-jerarquicas', async (req, res) => {
  try {
    const validation = AreaJerarquicaSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: validation.error.errors
      });
    }

    const { codigo, nombre, padreId, nivel } = validation.data;

    // Convertir padreId de string a number si existe
    const padreIdNumero = padreId ? parseInt(padreId, 10) : null;

    // Verificar que el código no exista
    const existeArea = await prisma.areasJerarquicas.findFirst({
      where: { codigo }
    });

    if (existeArea) {
      return res.status(400).json({
        success: false,
        error: 'El código ya existe'
      });
    }

    // Si tiene padre, verificar que exista
    if (padreIdNumero) {
      const padre = await prisma.areasJerarquicas.findUnique({
        where: { id: padreIdNumero }
      });

      if (!padre) {
        return res.status(400).json({
          success: false,
          error: 'El área padre no existe'
        });
      }
    }

    const nuevaArea = await prisma.areasJerarquicas.create({
      data: {
        codigo,
        nombre,
        padreId: padreIdNumero,
        nivel
      },
      include: {
        padre: true,
        hijos: true,
        conceptos: true
      }
    });

    res.status(201).json({ success: true, data: nuevaArea });
  } catch (error) {
    console.error('Error al crear área:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// PUT /api/areas-jerarquicas/:id - Actualizar área
router.put('/areas-jerarquicas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNumero = parseInt(id, 10);
    const validation = AreaJerarquicaSchema.partial().safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: validation.error.errors
      });
    }

    const areaExiste = await prisma.areasJerarquicas.findUnique({
      where: { id: idNumero }
    });

    if (!areaExiste) {
      return res.status(404).json({ 
        success: false, 
        error: 'Área no encontrada' 
      });
    }

    const { codigo, nombre, padreId, nivel } = validation.data;

    // Convertir padreId de string a number si existe
    const padreIdNumero = padreId ? parseInt(padreId, 10) : null;

    // Verificar código único si se está cambiando
    if (codigo && codigo !== areaExiste.codigo) {
      const existeOtroConMismoCodigo = await prisma.areasJerarquicas.findFirst({
        where: { 
          codigo,
          id: { not: idNumero }
        }
      });

      if (existeOtroConMismoCodigo) {
        return res.status(400).json({
          success: false,
          error: 'El código ya existe en otra área'
        });
      }
    }

    const areaActualizada = await prisma.areasJerarquicas.update({
      where: { id: idNumero },
      data: {
        ...(codigo && { codigo }),
        ...(nombre && { nombre }),
        ...(padreId !== undefined && { padreId: padreIdNumero }),
        ...(nivel && { nivel })
      },
      include: {
        padre: true,
        hijos: true,
        conceptos: true
      }
    });

    res.json({ success: true, data: areaActualizada });
  } catch (error) {
    console.error('Error al actualizar área:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// DELETE /api/areas-jerarquicas/:id - Eliminar área
router.delete('/areas-jerarquicas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNumero = parseInt(id, 10);

    const area = await prisma.areasJerarquicas.findUnique({
      where: { id: idNumero },
      include: {
        hijos: true,
        conceptos: true
      }
    });

    if (!area) {
      return res.status(404).json({ 
        success: false, 
        error: 'Área no encontrada' 
      });
    }

    // Verificar que no tenga hijos
    if (area.hijos.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar un área que tiene sub-áreas'
      });
    }

    // Verificar que no tenga conceptos
    if (area.conceptos.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar un área que tiene conceptos'
      });
    }

    await prisma.areasJerarquicas.delete({
      where: { id: idNumero }
    });

    res.json({ success: true, message: 'Área eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar área:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

export default router;
