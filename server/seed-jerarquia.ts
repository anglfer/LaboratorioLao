import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function seedJerarquia() {
  try {
    console.log('🌱 Iniciando seed de la jerarquía...');

    // Limpiar datos existentes
    await prisma.conceptosJerarquicos.deleteMany();
    await prisma.areasJerarquicas.deleteMany();

    console.log('🧹 Datos anteriores eliminados');

    // Crear áreas principales (nivel 1)
    const preliminares = await prisma.areasJerarquicas.create({
      data: {
        codigo: '01',
        nombre: 'TRABAJOS PRELIMINARES',
        nivel: 1
      }
    });

    const albañileria = await prisma.areasJerarquicas.create({
      data: {
        codigo: '02', 
        nombre: 'ALBAÑILERÍA',
        nivel: 1
      }
    });

    const estructuras = await prisma.areasJerarquicas.create({
      data: {
        codigo: '03',
        nombre: 'ESTRUCTURAS DE CONCRETO',
        nivel: 1
      }
    });

    console.log('📁 Áreas principales creadas');

    // Crear sub-áreas (nivel 2)
    const limpieza = await prisma.areasJerarquicas.create({
      data: {
        codigo: '01.01',
        nombre: 'LIMPIEZA Y DESMONTE',
        padreId: preliminares.id,
        nivel: 2
      }
    });

    const excavacion = await prisma.areasJerarquicas.create({
      data: {
        codigo: '01.02',
        nombre: 'EXCAVACIÓN Y MOVIMIENTO DE TIERRAS',
        padreId: preliminares.id,
        nivel: 2
      }
    });

    const murosPanelYeso = await prisma.areasJerarquicas.create({
      data: {
        codigo: '02.01',
        nombre: 'MUROS DE PANEL DE YESO',
        padreId: albañileria.id,
        nivel: 2
      }
    });

    const murosLadrillo = await prisma.areasJerarquicas.create({
      data: {
        codigo: '02.02',
        nombre: 'MUROS DE LADRILLO',
        padreId: albañileria.id,
        nivel: 2
      }
    });

    const cimentacion = await prisma.areasJerarquicas.create({
      data: {
        codigo: '03.01',
        nombre: 'CIMENTACIÓN',
        padreId: estructuras.id,
        nivel: 2
      }
    });

    const columnas = await prisma.areasJerarquicas.create({
      data: {
        codigo: '03.02',
        nombre: 'COLUMNAS',
        padreId: estructuras.id,
        nivel: 2
      }
    });

    console.log('📂 Sub-áreas creadas');

    // Crear conceptos (hojas del árbol)
    await prisma.conceptosJerarquicos.createMany({
      data: [
        // Conceptos de Limpieza
        {
          codigo: '01.01.001',
          descripcion: 'Desmonte y limpieza manual del terreno',
          unidad: 'M²',
          precioUnitario: 15.50,
          areaId: limpieza.id
        },
        {
          codigo: '01.01.002',
          descripcion: 'Retiro de escombros y maleza',
          unidad: 'M³',
          precioUnitario: 45.00,
          areaId: limpieza.id
        },

        // Conceptos de Excavación
        {
          codigo: '01.02.001',
          descripcion: 'Excavación manual en terreno normal',
          unidad: 'M³',
          precioUnitario: 65.00,
          areaId: excavacion.id
        },
        {
          codigo: '01.02.002',
          descripcion: 'Relleno y compactación con material propio',
          unidad: 'M³',
          precioUnitario: 35.00,
          areaId: excavacion.id
        },

        // Conceptos de Muros Panel Yeso
        {
          codigo: '02.01.001',
          descripcion: 'Muro divisorio de panel de yeso 12.7mm estructura metálica',
          unidad: 'M²',
          precioUnitario: 320.00,
          areaId: murosPanelYeso.id
        },
        {
          codigo: '02.01.002',
          descripcion: 'Pasta y lija en uniones de panel de yeso',
          unidad: 'ML',
          precioUnitario: 25.00,
          areaId: murosPanelYeso.id
        },

        // Conceptos de Muros Ladrillo
        {
          codigo: '02.02.001',
          descripcion: 'Muro de ladrillo rojo recocido 14x28x7 cm junteado con mortero',
          unidad: 'M²',
          precioUnitario: 280.00,
          areaId: murosLadrillo.id
        },
        {
          codigo: '02.02.002',
          descripcion: 'Repellado de muros con mortero cemento-arena 1:4',
          unidad: 'M²',
          precioUnitario: 85.00,
          areaId: murosLadrillo.id
        },

        // Conceptos de Cimentación
        {
          codigo: '03.01.001',
          descripcion: 'Excavación para zapata corrida',
          unidad: 'M³',
          precioUnitario: 75.00,
          areaId: cimentacion.id
        },
        {
          codigo: '03.01.002',
          descripcion: 'Concreto ciclópeo f\'c=150 kg/cm² para cimentación',
          unidad: 'M³',
          precioUnitario: 1250.00,
          areaId: cimentacion.id
        },

        // Conceptos de Columnas
        {
          codigo: '03.02.001',
          descripcion: 'Columna de concreto armado 20x20 cm f\'c=210 kg/cm²',
          unidad: 'ML',
          precioUnitario: 450.00,
          areaId: columnas.id
        },
        {
          codigo: '03.02.002',
          descripcion: 'Acero de refuerzo fy=4200 kg/cm² para columnas',
          unidad: 'KG',
          precioUnitario: 28.00,
          areaId: columnas.id
        }
      ]
    });

    console.log('🏗️ Conceptos creados');

    // Verificar los datos creados
    const totalAreas = await prisma.areasJerarquicas.count();
    const totalConceptos = await prisma.conceptosJerarquicos.count();

    console.log(`✅ Seed completado:`);
    console.log(`   📁 ${totalAreas} áreas jerárquicas creadas`);
    console.log(`   🔧 ${totalConceptos} conceptos creados`);

  } catch (error) {
    console.error('❌ Error en el seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedJerarquia()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

export { seedJerarquia };
