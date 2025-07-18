import { prisma } from './prisma';

const conceptosEjemplo = [
  // Nivel 1: Categorías principales
  {
    clave: '1',
    nombre: 'MECÁNICA DE SUELOS',
    nivel: 1,
    padreId: null,
    hijos: [
      {
        clave: '1.1',
        nombre: 'TRABAJOS DE CAMPO',
        nivel: 2,
        hijos: [
          {
            clave: '1.1.1',
            nombre: 'TRABAJOS DE CAMPO - GRUPO',
            nivel: 3,
            hijos: [
              {
                clave: '1.1.1.1',
                nombre: 'POZO A CIELO ABIERTO CON MEDIOS MECÁNICOS, PROFUNDIDAD HASTA 1.5 m. INCLUYE: traslado de personal y equipo dentro de la mancha urbana, inspección, ubicación, excavación, muestreo alterado, relleno semicompactado del pozo y reporte de campo. (Método no acreditado)',
                nivel: 4,
                tipo: 'POZO',
                porcentaje: 9.00,
                precio: 1913.98
              }
            ]
          }
        ]
      },
      {
        clave: '1.2',
        nombre: 'TRABAJOS DE LABORATORIO',
        nivel: 2,
        hijos: [
          {
            clave: '1.2.1',
            nombre: 'TRABAJOS DE LABORATORIO - GRUPO',
            nivel: 3,
            hijos: [
              {
                clave: '1.2.1.1',
                nombre: 'DETERMINACIÓN DE LA MASA VOLUMÉTRICA DE SUELO INALTERADO POR EL MÉTODO DE LA PARAFINA. (Método no acreditado)',
                nivel: 4,
                tipo: 'PRUEBA',
                porcentaje: 26.00,
                precio: 407.15
              }
            ]
          }
        ]
      },
      {
        clave: '1.3',
        nombre: 'TRABAJOS DE GABINETE',
        nivel: 2,
        hijos: [
          {
            clave: '1.3.1',
            nombre: 'TRABAJOS DE GABINETE - GRUPO',
            nivel: 3,
            hijos: [
              {
                clave: '1.3.1.1',
                nombre: 'CÁLCULO DE RELACIÓN DE VACÍOS, POROSIDAD Y GRADO DE SATURACIÓN DE AGUA EN SUELO. (Método no acreditado)',
                nivel: 4,
                tipo: 'CÁLCULO',
                porcentaje: 34.00,
                precio: 204.91
              }
            ]
          }
        ]
      }
    ]
  },
  {
    clave: '2',
    nombre: 'CONTROL DE CALIDAD',
    nivel: 1,
    padreId: null,
    hijos: [
      {
        clave: '2.1',
        nombre: 'TERRACERÍAS',
        nivel: 2,
        hijos: [
          {
            clave: '2.1.1',
            nombre: 'TRABAJOS DE CAMPO',
            nivel: 3,
            hijos: [
              {
                clave: '2.1.1.1',
                nombre: 'VISITA PARA DETERMINACIÓN DE MASA VOLUMÉTRICA SECA DEL LUGAR (CALAS) Y GRADO DE COMPACTACIÓN. INCLUYE: determinación del contenido de agua en laboratorio, análisis y reporte, con un máximo de 5 ensayes (calas) y traslados. No incluye determinación de masa volumétrica seca máxima. Horario diurno de 8:00 a 17:00 h. (Método acreditado)',
                nivel: 4,
                tipo: 'VISITA',
                porcentaje: 3.00,
                precio: 1231.53
              }
            ]
          },
          {
            clave: '2.1.2',
            nombre: 'TRABAJOS DE LABORATORIO',
            nivel: 3,
            hijos: [
              {
                clave: '2.1.2.1',
                nombre: 'DETERMINACIÓN DEL CONTENIDO DE AGUA. INCLUYE: mano de obra, insumos, equipo. (Método acreditado)',
                nivel: 4,
                tipo: 'PRUEBA',
                porcentaje: 42.00,
                precio: 178.97
              }
            ]
          }
        ]
      },
      {
        clave: '2.2',
        nombre: 'CONCRETO HIDRÁULICO',
        nivel: 2,
        hijos: [
          {
            clave: '2.2.1',
            nombre: 'TRABAJOS DE CAMPO',
            nivel: 3,
            hijos: [
              {
                clave: '2.2.1.1',
                nombre: 'VISITA PARA MUESTREO DE CONCRETO EN OBRA con permanencia de 1.5 h máximo. INCLUYE: elaboración de 4 especímenes cilíndricos, en horario diurno de 8:00 a 17:00 h. (Método acreditado)',
                nivel: 4,
                tipo: 'VISITA',
                porcentaje: 11.00,
                precio: 1213.37
              }
            ]
          },
          {
            clave: '2.2.2',
            nombre: 'TRABAJOS DE LABORATORIO',
            nivel: 3,
            hijos: [
              {
                clave: '2.2.2.1',
                nombre: 'DETERMINACIÓN DE LA RESISTENCIA MECÁNICA A LA COMPRESIÓN SIMPLE EN ESPÉCIMEN DE MORTERO HIDRÁULICO (CUBO DE 5 cm X 5 cm X 5 cm), (Método no acreditado) INCLUYE: curado hasta la fecha de ensayo, ensayo con equipo apropiado e informe de resultados',
                nivel: 4,
                tipo: 'PRUEBA',
                precio: 104.01
              }
            ]
          }
        ]
      },
      {
        clave: '2.3',
        nombre: 'MEZCLAS ASFÁLTICAS',
        nivel: 2,
        hijos: [
          {
            clave: '2.3.1',
            nombre: 'TRABAJOS DE CAMPO',
            nivel: 3,
            hijos: [
              {
                clave: '2.3.1.1',
                nombre: 'VISITA PARA EXTRACCIÓN DE NÚCLEOS EN CARPETA ASFÁLTICA. INCLUYE: mano de obra, equipo y herramientas, de 1 a 5 núcleos en horario diurno de 8:00 a 17:00 h. (Método no acreditado)',
                nivel: 4,
                tipo: 'VISITA',
                porcentaje: -8.00,
                precio: 4010.07
              }
            ]
          },
          {
            clave: '2.3.2',
            nombre: 'TRABAJOS DE LABORATORIO',
            nivel: 3,
            hijos: [
              {
                clave: '2.3.2.1',
                nombre: 'ESTUDIO DE CALIDAD DE MUESTRA DE CONCRETO ASFÁLTICO DETERMINANDO: CONTENIDO DE ASFALTO, ESTABILIDAD, FLUJO, CÁLCULO DE RELACIONES VOLUMÉTRICAS, ANÁLISIS GRANULOMÉTRICO. INCLUYE: Mano de obra, equipo y herramientas. (Método no acreditado)',
                nivel: 4,
                tipo: 'ESTUDIO',
                porcentaje: 22.00,
                precio: 3462.06
              }
            ]
          }
        ]
      },
      {
        clave: '2.4',
        nombre: 'ACEROS',
        nivel: 2,
        hijos: [
          {
            clave: '2.4.1',
            nombre: 'TRABAJOS DE CAMPO',
            nivel: 3,
            hijos: [
              {
                clave: '2.4.1.1',
                nombre: 'VISITA DE INSPECCIÓN DE SOLDADURA CON LÍQUIDOS PENETRANTES, horario de lunes a viernes de 8:00 a 17:00 h, sábado 8:00 a 13:00 h. INCLUYE: traslados hasta una distancia de 10 km o 0.50 hora, permanencia en obra o taller hasta 3 h. y regreso (incluidos hasta 20 spots de 1 a 20 cm de longitud), reporte. No incluye maniobras especiales y/o andamios. (Método no acreditado)',
                nivel: 4,
                tipo: 'VISITA',
                porcentaje: 19.00,
                precio: 4382.16
              }
            ]
          },
          {
            clave: '2.4.2',
            nombre: 'TRABAJOS DE LABORATORIO',
            nivel: 3,
            hijos: [
              {
                clave: '2.4.2.1',
                nombre: 'ENSAYE FÍSICO DE VARILLAS DE ACERO A TENSIÓN. INCLUYE: límite elástico, resistencia máxima, alargamiento, doblado y característica de corrugaciones de 6.4 a 15.9 mm (1/4" a 5/8") (Método acreditado)',
                nivel: 4,
                tipo: 'PROBETA',
                porcentaje: 10.00,
                precio: 631.75
              }
            ]
          }
        ]
      },
      {
        clave: '2.5',
        nombre: 'MAMPOSTERÍA',
        nivel: 2,
        hijos: [
          {
            clave: '2.5.1',
            nombre: 'TRABAJOS DE CAMPO',
            nivel: 3,
            hijos: [
              {
                clave: '2.5.1.1',
                nombre: 'VISITA PARA MUESTREO de tabique rojo, blocks y/o tabicón, máximo 11 pzas. por muestreo, horario diurno de 8:00 a 17:00 h. INCLUYE: 1 a 3 muestreos, traslado de 30 minutos o 10 km como máximo',
                nivel: 4,
                tipo: 'VISITA',
                porcentaje: -12.00,
                precio: 947.12
              }
            ]
          },
          {
            clave: '2.5.2',
            nombre: 'TRABAJOS DE LABORATORIO',
            nivel: 3,
            hijos: [
              {
                clave: '2.5.2.1',
                nombre: 'DETERMINACIÓN DE LA RESISTENCIA MECÁNICA A LA COMPRESIÓN SIMPLE (5 PZAS), % DE ABSORCIÓN (6 PZAS) DE TABIQUES, TABICONES, BLOQUES, ADOCRETOS CONFORME A NMX-C-441-ONNCCE- (Método acreditado) INCLUYE: dimensionamiento, ensaye a la compresión, % absorción inicial y total e informe de resultados (muestra de 11 especímenes)',
                nivel: 4,
                tipo: 'MUESTRA',
                porcentaje: 36.00,
                precio: 1339.14
              },
              {
                clave: '2.5.2.3',
                nombre: 'DETERMINACIÓN DE DIMENSIONAMIENTO (NMX-C-038-ONNCCE) Y % DE ABSORCIÓN (NMX-C-037-ONNCCE) INCLUYE: mano de obra, equipos y herramienta (muestra de 6 piezas) (Método acreditado)',
                nivel: 4,
                tipo: 'MUESTRA',
                precio: 620.85
              }
            ]
          }
        ]
      },
      {
        clave: '2.6',
        nombre: 'CONCEPTOS ESPECIALES',
        nivel: 2,
        hijos: [
          {
            clave: '2.6.1',
            nombre: 'TRABAJOS DE CAMPO',
            nivel: 3,
            hijos: [
              {
                clave: '2.6.1.1',
                nombre: 'VISITA EN FALSO, para muestreo en obra considerando traslados y permanencia de 1.5 h máximo en horario diurno de 8:00 a 17:00 h.',
                nivel: 4,
                tipo: 'VISITA',
                porcentaje: 29.00,
                precio: 640.63
              }
            ]
          }
        ]
      }
    ]
  },
  {
    clave: '4',
    nombre: 'SUPERVISIÓN',
    nivel: 1,
    padreId: null,
    hijos: [
      {
        clave: '4.1',
        nombre: 'TRABAJOS DE CAMPO',
        nivel: 2,
        hijos: []
      }
    ]
  }
];

async function crearConceptoRecursivo(concepto: any, padreId: number | null = null): Promise<any> {
  const { hijos, ...conceptoData } = concepto;
  
  const conceptoCreado = await prisma.conceptos.create({
    data: {
      ...conceptoData,
      padreId
    }
  });

  if (hijos && hijos.length > 0) {
    for (const hijo of hijos) {
      await crearConceptoRecursivo(hijo, conceptoCreado.id);
    }
  }

  return conceptoCreado;
}

async function seedConceptosJerarquicos() {
  console.log('🌱 Iniciando seeding de conceptos jerárquicos...');

  try {
    // Limpiar conceptos existentes
    await prisma.conceptos.deleteMany({});
    console.log('🗑️ Conceptos anteriores eliminados');

    // Crear conceptos de nivel 1 y sus hijos
    for (const concepto of conceptosEjemplo) {
      await crearConceptoRecursivo(concepto);
      console.log(`✅ Creado concepto: ${concepto.clave} - ${concepto.nombre}`);
    }

    console.log('🎉 Seeding completado exitosamente');
    
    // Mostrar estadísticas
    const stats = await prisma.conceptos.groupBy({
      by: ['nivel'],
      _count: {
        id: true
      },
      orderBy: {
        nivel: 'asc'
      }
    });

    console.log('\n📊 Estadísticas:');
    stats.forEach(stat => {
      console.log(`   Nivel ${stat.nivel}: ${stat._count.id} conceptos`);
    });

    const total = await prisma.conceptos.count();
    console.log(`   Total: ${total} conceptos\n`);

  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    throw error;
  }
}

// Ejecutar el seeding si se llama directamente
async function main() {
  await seedConceptosJerarquicos();
  console.log('✨ Seeding finalizado');
  await prisma.$disconnect();
}

// Ejecutar el seeding
main()
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });

export { seedConceptosJerarquicos };
