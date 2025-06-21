import { prisma } from "./prisma";

async function seedTestData() {
  console.log("Iniciando seed de datos de prueba...");

  try {
    // Crear áreas si no existen
    const area = await prisma.area.upsert({
      where: { codigo: "PCC" },
      update: {},
      create: {
        codigo: "PCC",
        nombre: "Control de Calidad",
      }
    });

    // Crear subáreas
    const subarea = await prisma.subarea.upsert({
      where: { id: 1 },
      update: {},
      create: {
        nombre: "Concretos",
        areaCodigo: "PCC"
      }
    });

    // Crear conceptos
    const concepto = await prisma.concepto.upsert({
      where: { codigo: "CON-01" },
      update: {},
      create: {
        codigo: "CON-01",
        descripcion: "Concreto hidráulico",
        unidad: "m3",
        p_u: 750.00,
        subareaId: subarea.id
      }
    });

    // Crear cliente
    const cliente = await prisma.cliente.upsert({
      where: { id: 1 },
      update: {},
      create: {
        nombre: "Constructora ABC S.A. de C.V.",
        direccion: "Av. Principal #123, Col. Centro",
        activo: true
      }
    });

    // Crear obra
    const obra = await prisma.obra.upsert({
      where: { clave: "PCC-2025-001" },
      update: {},
      create: {
        clave: "PCC-2025-001",
        areaCodigo: "PCC",
        contratista: "Constructora ABC",
        estado: 1
      }
    });

    // Crear presupuesto aprobado
    const presupuesto = await prisma.presupuesto.upsert({
      where: { id: 1 },
      update: {},
      create: {
        claveObra: obra.clave,
        clienteId: cliente.id,
        nombreContratista: "Constructora ABC S.A. de C.V.",
        descripcionObra: "Construcción de edificio comercial",
        tramo: "Km 5+200",
        colonia: "Centro",
        calle: "Av. Principal",
        contactoResponsable: "Ing. Juan Pérez",
        estado: "aprobado",
        subtotal: 4500.00,
        ivaMonto: 720.00,
        total: 5220.00,
        formaPago: "Transferencia bancaria"
      }
    });

    // Crear detalle del presupuesto
    await prisma.presupuestoDetalle.upsert({
      where: { id: 1 },
      update: {},
      create: {
        presupuestoId: presupuesto.id,
        conceptoCodigo: concepto.codigo,
        cantidad: 10,
        precioUnitario: 450.00,
        subtotal: 4500.00,
        estado: "hecho"
      }
    });

    // Crear brigadistas
    const brigadista1 = await prisma.brigadista.upsert({
      where: { id: 1 },
      update: {},
      create: {
        nombre: "Mario González",
        telefono: "555-0101",
        email: "mario.gonzalez@laboratorio.com",
        activo: true
      }
    });

    const brigadista2 = await prisma.brigadista.upsert({
      where: { id: 2 },
      update: {},
      create: {
        nombre: "Ana Rodríguez",
        telefono: "555-0102",
        email: "ana.rodriguez@laboratorio.com",
        activo: true
      }
    });

    // Crear vehículos
    const vehiculo1 = await prisma.vehiculo.upsert({
      where: { id: 1 },
      update: {},
      create: {
        clave: "VEH-001",
        descripcion: "Camioneta Nissan NP300 2022",
        activo: true
      }
    });

    const vehiculo2 = await prisma.vehiculo.upsert({
      where: { id: 2 },
      update: {},
      create: {
        clave: "VEH-002", 
        descripcion: "Camioneta Toyota Hilux 2023",
        activo: true
      }
    });

    // Crear programaciones de prueba
    const fechaHoy = new Date();
    const fechaManana = new Date(fechaHoy);
    fechaManana.setDate(fechaHoy.getDate() + 1);

    await prisma.programacion.upsert({
      where: { id: 1 },
      update: {},
      create: {
        claveObra: obra.clave,
        fechaProgramada: fechaHoy,
        horaProgramada: "09:00",
        tipoProgramacion: "obra_por_visita",
        nombreResidente: "Ing. Carlos Méndez",
        telefonoResidente: "555-9999",
        conceptoCodigo: concepto.codigo,
        cantidadMuestras: 5,
        tipoRecoleccion: "metros_cuadrados",
        brigadistaId: brigadista1.id,
        vehiculoId: vehiculo1.id,
        estado: "programada",
        observaciones: "Acceso por entrada principal"
      }
    });

    await prisma.programacion.upsert({
      where: { id: 2 },
      update: {},
      create: {
        claveObra: obra.clave,
        fechaProgramada: fechaHoy,
        horaProgramada: "14:00",
        tipoProgramacion: "obra_por_visita",
        nombreResidente: "Ing. Carlos Méndez",
        telefonoResidente: "555-9999",
        conceptoCodigo: concepto.codigo,
        cantidadMuestras: 3,
        tipoRecoleccion: "metros_cuadrados",
        brigadistaId: brigadista2.id,
        vehiculoId: vehiculo2.id,
        estado: "en_proceso",
        observaciones: "Zona norte del terreno",
        fechaInicio: new Date()
      }
    });

    await prisma.programacion.upsert({
      where: { id: 3 },
      update: {},
      create: {
        claveObra: obra.clave,
        fechaProgramada: fechaManana,
        horaProgramada: "08:30",
        tipoProgramacion: "obra_por_visita",
        nombreResidente: "Ing. Carlos Méndez",
        telefonoResidente: "555-9999",
        conceptoCodigo: concepto.codigo,
        cantidadMuestras: 2,
        tipoRecoleccion: "sondeo",
        brigadistaId: brigadista1.id,
        brigaistaApoyoId: brigadista2.id,
        vehiculoId: vehiculo1.id,
        estado: "completada",
        observaciones: "Trabajo completado exitosamente",
        fechaInicio: new Date(fechaHoy.getTime() - 86400000), // Ayer
        fechaCompletado: new Date(fechaHoy.getTime() - 82800000), // Ayer + 1 hora
        muestrasObtenidas: 2
      }
    });

    console.log("✅ Datos de prueba creados exitosamente:");
    console.log(`- Área: ${area.nombre}`);
    console.log(`- Subárea: ${subarea.nombre}`);
    console.log(`- Concepto: ${concepto.descripcion}`);
    console.log(`- Cliente: ${cliente.nombre}`);
    console.log(`- Obra: ${obra.clave}`);
    console.log(`- Presupuesto: ${presupuesto.id} (${presupuesto.estado})`);
    console.log(`- Brigadistas: ${brigadista1.nombre}, ${brigadista2.nombre}`);
    console.log(`- Vehículos: ${vehiculo1.descripcion}, ${vehiculo2.descripcion}`);
    console.log("- 3 programaciones de prueba");

  } catch (error) {
    console.error("❌ Error creando datos de prueba:", error);
    throw error;
  }
}

async function main() {
  await seedTestData();
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
