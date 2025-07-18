import express from "express";
import { PrismaClient } from "./generated/prisma/index.js";

const app = express();
const prisma = new PrismaClient();
const port = 3002;

app.use(express.json());

// Endpoint de prueba para las nuevas tablas
app.get("/test/jerarquia", async (req, res) => {
  try {
    console.log("🔍 Probando acceso a las nuevas tablas...");

    // Verificar que podemos acceder a las tablas
    const totalAreas = await prisma.areasJerarquicas.count();
    const totalConceptos = await prisma.conceptosJerarquicos.count();

    console.log(`📊 Áreas: ${totalAreas}, Conceptos: ${totalConceptos}`);

    // Si no hay datos, crear algunos de prueba
    if (totalAreas === 0) {
      console.log("🌱 Creando datos de prueba...");

      const area = await prisma.areasJerarquicas.create({
        data: {
          codigo: "01",
          nombre: "TRABAJOS PRELIMINARES",
          nivel: 1,
        },
      });

      const concepto = await prisma.conceptosJerarquicos.create({
        data: {
          codigo: "01.001",
          descripcion: "Limpieza del terreno",
          unidad: "M²",
          precioUnitario: 15.5,
          areaId: area.id,
        },
      });

      res.json({
        success: true,
        message: "Datos de prueba creados",
        data: { area, concepto },
      });
    } else {
      // Obtener algunos datos existentes
      const areas = await prisma.areasJerarquicas.findMany({
        take: 3,
        include: {
          conceptos: true,
          hijos: true,
        },
      });

      res.json({
        success: true,
        message: "Sistema jerárquico funcionando",
        data: { totalAreas, totalConceptos, areas },
      });
    }
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Endpoint para obtener el árbol completo
app.get("/test/arbol", async (req, res) => {
  try {
    const areasRaiz = await prisma.areasJerarquicas.findMany({
      where: { padreId: null },
      include: {
        hijos: {
          include: {
            conceptos: true,
            hijos: {
              include: {
                conceptos: true,
              },
            },
          },
        },
        conceptos: true,
      },
      orderBy: { codigo: "asc" },
    });

    res.json({
      success: true,
      data: areasRaiz,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Endpoint para crear estructura completa de prueba
app.post("/test/crear-estructura", async (req, res) => {
  try {
    console.log("🌱 Creando estructura jerárquica completa...");

    // Limpiar datos existentes
    await prisma.conceptosJerarquicos.deleteMany();
    await prisma.areasJerarquicas.deleteMany();

    // Crear áreas principales (nivel 1)
    const preliminares = await prisma.areasJerarquicas.create({
      data: {
        codigo: "01",
        nombre: "TRABAJOS PRELIMINARES",
        nivel: 1,
      },
    });

    const albañileria = await prisma.areasJerarquicas.create({
      data: {
        codigo: "02",
        nombre: "ALBAÑILERÍA",
        nivel: 1,
      },
    });

    const estructuras = await prisma.areasJerarquicas.create({
      data: {
        codigo: "03",
        nombre: "ESTRUCTURAS DE CONCRETO",
        nivel: 1,
      },
    });

    // Crear sub-áreas (nivel 2)
    const limpieza = await prisma.areasJerarquicas.create({
      data: {
        codigo: "01.01",
        nombre: "LIMPIEZA Y DESMONTE",
        padreId: preliminares.id,
        nivel: 2,
      },
    });

    const excavacion = await prisma.areasJerarquicas.create({
      data: {
        codigo: "01.02",
        nombre: "EXCAVACIÓN Y MOVIMIENTO DE TIERRAS",
        padreId: preliminares.id,
        nivel: 2,
      },
    });

    const murosPanelYeso = await prisma.areasJerarquicas.create({
      data: {
        codigo: "02.01",
        nombre: "MUROS DE PANEL DE YESO",
        padreId: albañileria.id,
        nivel: 2,
      },
    });

    const murosLadrillo = await prisma.areasJerarquicas.create({
      data: {
        codigo: "02.02",
        nombre: "MUROS DE LADRILLO",
        padreId: albañileria.id,
        nivel: 2,
      },
    });

    const cimentacion = await prisma.areasJerarquicas.create({
      data: {
        codigo: "03.01",
        nombre: "CIMENTACIÓN",
        padreId: estructuras.id,
        nivel: 2,
      },
    });

    const columnas = await prisma.areasJerarquicas.create({
      data: {
        codigo: "03.02",
        nombre: "COLUMNAS",
        padreId: estructuras.id,
        nivel: 2,
      },
    });

    // Crear conceptos (hojas del árbol)
    const conceptos = await prisma.conceptosJerarquicos.createMany({
      data: [
        // Conceptos de Limpieza
        {
          codigo: "01.01.001",
          descripcion: "Desmonte y limpieza manual del terreno",
          unidad: "M²",
          precioUnitario: 15.5,
          areaId: limpieza.id,
        },
        {
          codigo: "01.01.002",
          descripcion: "Retiro de escombros y maleza",
          unidad: "M³",
          precioUnitario: 45.0,
          areaId: limpieza.id,
        },

        // Conceptos de Excavación
        {
          codigo: "01.02.001",
          descripcion: "Excavación manual en terreno normal",
          unidad: "M³",
          precioUnitario: 65.0,
          areaId: excavacion.id,
        },
        {
          codigo: "01.02.002",
          descripcion: "Relleno y compactación con material propio",
          unidad: "M³",
          precioUnitario: 35.0,
          areaId: excavacion.id,
        },

        // Conceptos de Muros Panel Yeso
        {
          codigo: "02.01.001",
          descripcion:
            "Muro divisorio de panel de yeso 12.7mm estructura metálica",
          unidad: "M²",
          precioUnitario: 320.0,
          areaId: murosPanelYeso.id,
        },
        {
          codigo: "02.01.002",
          descripcion: "Pasta y lija en uniones de panel de yeso",
          unidad: "ML",
          precioUnitario: 25.0,
          areaId: murosPanelYeso.id,
        },

        // Conceptos de Muros Ladrillo
        {
          codigo: "02.02.001",
          descripcion:
            "Muro de ladrillo rojo recocido 14x28x7 cm junteado con mortero",
          unidad: "M²",
          precioUnitario: 280.0,
          areaId: murosLadrillo.id,
        },
        {
          codigo: "02.02.002",
          descripcion: "Repellado de muros con mortero cemento-arena 1:4",
          unidad: "M²",
          precioUnitario: 85.0,
          areaId: murosLadrillo.id,
        },

        // Conceptos de Cimentación
        {
          codigo: "03.01.001",
          descripcion: "Excavación para zapata corrida",
          unidad: "M³",
          precioUnitario: 75.0,
          areaId: cimentacion.id,
        },
        {
          codigo: "03.01.002",
          descripcion: "Concreto ciclópeo f'c=150 kg/cm² para cimentación",
          unidad: "M³",
          precioUnitario: 1250.0,
          areaId: cimentacion.id,
        },

        // Conceptos de Columnas
        {
          codigo: "03.02.001",
          descripcion: "Columna de concreto armado 20x20 cm f'c=210 kg/cm²",
          unidad: "ML",
          precioUnitario: 450.0,
          areaId: columnas.id,
        },
        {
          codigo: "03.02.002",
          descripcion: "Acero de refuerzo fy=4200 kg/cm² para columnas",
          unidad: "KG",
          precioUnitario: 28.0,
          areaId: columnas.id,
        },
      ],
    });

    const totalAreas = await prisma.areasJerarquicas.count();
    const totalConceptos = await prisma.conceptosJerarquicos.count();

    res.json({
      success: true,
      message: "Estructura jerárquica completa creada",
      data: {
        totalAreas,
        totalConceptos,
        areasCreadas: [preliminares, albañileria, estructuras],
        subAreasCreadas: [
          limpieza,
          excavacion,
          murosPanelYeso,
          murosLadrillo,
          cimentacion,
          columnas,
        ],
        conceptosCreados: conceptos.count,
      },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor de prueba corriendo en http://localhost:${port}`);
  console.log(`📋 Prueba: http://localhost:${port}/test/jerarquia`);
  console.log(`🌳 Árbol: http://localhost:${port}/test/arbol`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit();
});
