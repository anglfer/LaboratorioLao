import { Router } from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Esquema de validación para conceptos
const ConceptoJerarquicoSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  unidad: z.string().min(1, 'La unidad es requerida'),
  precioUnitario: z.number().positive('El precio debe ser positivo'),
  areaId: z.string().min(1, 'El área es requerida')
});

// ======================= RUTAS PARA CONCEPTOS JERÁRQUICOS =======================

// GET /api/conceptos-jerarquicos - Obtener todos los conceptos
router.get('/conceptos-jerarquicos', async (req, res) => {
  try {
    const { areaId, search } = req.query;

    const where: any = {};

    // Filtrar por área si se especifica (convertir a número)
    if (areaId && typeof areaId === 'string') {
      const areaIdNumero = parseInt(areaId, 10);
      if (!isNaN(areaIdNumero)) {
        where.areaId = areaIdNumero;
      }
    }

    // Búsqueda por código o descripción
    if (search && typeof search === 'string') {
      where.OR = [
        { codigo: { contains: search } },
        { descripcion: { contains: search } }
      ];
    }

    const conceptos = await prisma.conceptosJerarquicos.findMany({
      where,
      include: {
        area: {
          include: {
            padre: true
          }
        }
      },
      orderBy: { codigo: 'asc' }
    });

    res.json({ success: true, data: conceptos });
  } catch (error) {
    console.error('Error al obtener conceptos:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// GET /api/conceptos-jerarquicos/:id - Obtener concepto específico
router.get('/conceptos-jerarquicos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNumero = parseInt(id, 10);
    
    const concepto = await prisma.conceptosJerarquicos.findUnique({
      where: { id: idNumero },
      include: {
        area: {
          include: {
            padre: true
          }
        }
      }
    });

    if (!concepto) {
      return res.status(404).json({ 
        success: false, 
        error: 'Concepto no encontrado' 
      });
    }

    res.json({ success: true, data: concepto });
  } catch (error) {
    console.error('Error al obtener concepto:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// GET /api/conceptos-jerarquicos/area/:areaId - Obtener conceptos de un área específica
router.get('/conceptos-jerarquicos/area/:areaId', async (req, res) => {
  try {
    const { areaId } = req.params;
    const areaIdNumero = parseInt(areaId, 10);
    
    // Verificar que el área existe
    const area = await prisma.areasJerarquicas.findUnique({
      where: { id: areaIdNumero }
    });

    if (!area) {
      return res.status(404).json({ 
        success: false, 
        error: 'Área no encontrada' 
      });
    }

    const conceptos = await prisma.conceptosJerarquicos.findMany({
      where: { areaId: areaIdNumero },
      include: {
        area: true
      },
      orderBy: { codigo: 'asc' }
    });

    res.json({ success: true, data: conceptos });
  } catch (error) {
    console.error('Error al obtener conceptos del área:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// POST /api/conceptos-jerarquicos - Crear nuevo concepto
router.post('/conceptos-jerarquicos', async (req, res) => {
  try {
    const validation = ConceptoJerarquicoSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: validation.error.errors
      });
    }

    const { codigo, descripcion, unidad, precioUnitario, areaId } = validation.data;

    // Convertir areaId de string a number
    const areaIdNumero = parseInt(areaId, 10);

    // Verificar que el código no exista
    const existeConcepto = await prisma.conceptosJerarquicos.findFirst({
      where: { codigo }
    });

    if (existeConcepto) {
      return res.status(400).json({
        success: false,
        error: 'El código ya existe'
      });
    }

    // Verificar que el área existe
    const area = await prisma.areasJerarquicas.findUnique({
      where: { id: areaIdNumero }
    });

    if (!area) {
      return res.status(400).json({
        success: false,
        error: 'El área especificada no existe'
      });
    }

    const nuevoConcepto = await prisma.conceptosJerarquicos.create({
      data: {
        codigo,
        descripcion,
        unidad,
        precioUnitario,
        areaId: areaIdNumero
      },
      include: {
        area: {
          include: {
            padre: true
          }
        }
      }
    });

    res.status(201).json({ success: true, data: nuevoConcepto });
  } catch (error) {
    console.error('Error al crear concepto:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// PUT /api/conceptos-jerarquicos/:id - Actualizar concepto
router.put('/conceptos-jerarquicos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNumero = parseInt(id, 10);
    const validation = ConceptoJerarquicoSchema.partial().safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: validation.error.errors
      });
    }

    const conceptoExiste = await prisma.conceptosJerarquicos.findUnique({
      where: { id: idNumero }
    });

    if (!conceptoExiste) {
      return res.status(404).json({ 
        success: false, 
        error: 'Concepto no encontrado' 
      });
    }

    const { codigo, descripcion, unidad, precioUnitario, areaId } = validation.data;

    // Convertir areaId de string a number si existe
    const areaIdNumero = areaId ? parseInt(areaId, 10) : undefined;

    // Verificar código único si se está cambiando
    if (codigo && codigo !== conceptoExiste.codigo) {
      const existeOtroConMismoCodigo = await prisma.conceptosJerarquicos.findFirst({
        where: { 
          codigo,
          id: { not: idNumero }
        }
      });

      if (existeOtroConMismoCodigo) {
        return res.status(400).json({
          success: false,
          error: 'El código ya existe en otro concepto'
        });
      }
    }

    // Verificar que el área existe si se está cambiando
    if (areaIdNumero && areaIdNumero !== conceptoExiste.areaId) {
      const area = await prisma.areasJerarquicas.findUnique({
        where: { id: areaIdNumero }
      });

      if (!area) {
        return res.status(400).json({
          success: false,
          error: 'El área especificada no existe'
        });
      }
    }

    const conceptoActualizado = await prisma.conceptosJerarquicos.update({
      where: { id: idNumero },
      data: {
        ...(codigo && { codigo }),
        ...(descripcion && { descripcion }),
        ...(unidad && { unidad }),
        ...(precioUnitario && { precioUnitario }),
        ...(areaIdNumero && { areaId: areaIdNumero })
      },
      include: {
        area: {
          include: {
            padre: true
          }
        }
      }
    });

    res.json({ success: true, data: conceptoActualizado });
  } catch (error) {
    console.error('Error al actualizar concepto:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// DELETE /api/conceptos-jerarquicos/:id - Eliminar concepto
router.delete('/conceptos-jerarquicos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNumero = parseInt(id, 10);

    const concepto = await prisma.conceptosJerarquicos.findUnique({
      where: { id: idNumero }
    });

    if (!concepto) {
      return res.status(404).json({ 
        success: false, 
        error: 'Concepto no encontrado' 
      });
    }

    await prisma.conceptosJerarquicos.delete({
      where: { id: idNumero }
    });

    res.json({ success: true, message: 'Concepto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar concepto:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// GET /api/conceptos-jerarquicos/estadisticas - Obtener estadísticas de conceptos
router.get('/conceptos-jerarquicos/estadisticas', async (req, res) => {
  try {
    const totalConceptos = await prisma.conceptosJerarquicos.count();
    
    const conceptosPorArea = await prisma.conceptosJerarquicos.groupBy({
      by: ['areaId'],
      _count: {
        id: true
      }
    });

    const precioPromedio = await prisma.conceptosJerarquicos.aggregate({
      _avg: {
        precioUnitario: true
      },
      _min: {
        precioUnitario: true
      },
      _max: {
        precioUnitario: true
      }
    });

    res.json({ 
      success: true, 
      data: {
        totalConceptos,
        conceptosPorArea: conceptosPorArea.length,
        precioPromedio: precioPromedio._avg.precioUnitario || 0,
        precioMinimo: precioPromedio._min.precioUnitario || 0,
        precioMaximo: precioPromedio._max.precioUnitario || 0
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

export default router;
