import { prisma } from "./prisma";

async function seedTestData() {
  console.log("Iniciando seed de datos de prueba...");

  try {
    // Crear múltiples usuarios de cada tipo
    console.log("Creando usuarios...");
    const usuarios = [];
    for (let i = 1; i <= 10; i++) {
      usuarios.push(
        prisma.usuario.upsert({
          where: { email: `admin${i}@laboratorio.com` },
          update: {},
          create: {
            email: `admin${i}@laboratorio.com`,
            password: `admin123`,
            nombre: `Administrador ${i}`,
            rol: "admin",
            activo: true,
          },
        }),
        prisma.usuario.upsert({
          where: { email: `recepcionista${i}@laboratorio.com` },
          update: {},
          create: {
            email: `recepcionista${i}@laboratorio.com`,
            password: `recep123`,
            nombre: `Recepcionista ${i}`,
            rol: "recepcionista",
            activo: true,
          },
        }),
        prisma.usuario.upsert({
          where: { email: `brigadista${i}@laboratorio.com` },
          update: {},
          create: {
            email: `brigadista${i}@laboratorio.com`,
            password: `brig123`,
            nombre: `Brigadista ${i}`,
            rol: "brigadista",
            activo: true,
          },
        })
      );
    }
    await Promise.all(usuarios);
    // Crear áreas y subáreas
    const areas = [];
    for (let i = 1; i <= 3; i++) {
      areas.push(
        prisma.area.upsert({
          where: { codigo: `AREA${i}` },
          update: {},
          create: {
            codigo: `AREA${i}`,
            nombre: `Área ${i}`,
          },
        })
      );
    }
    await Promise.all(areas);

    // Inicializar contador de obras para el área PCC del año actual
    const añoActual = new Date().getFullYear();
    await prisma.contadorObras.upsert({
      where: {
        areaCodigo_año: {
          areaCodigo: "PCC",
          año: añoActual,
        },
      },
      update: {},
      create: {
        areaCodigo: "PCC",
        año: añoActual,
        contador: 1, // Empezamos en 1 porque ya vamos a crear PCC-25-001
      },
    });

    // Crear subáreas
    const subareas = [];
    for (let i = 1; i <= 10; i++) {
      subareas.push(
        prisma.subarea.upsert({
          where: { id: i },
          update: {},
          create: {
            nombre: `Subárea ${i}`,
            areaCodigo: `AREA${((i-1)%3)+1}`,
          },
        })
      );
    }
    await Promise.all(subareas);

    // Crear conceptos
    const conceptos = [];
    for (let i = 1; i <= 10; i++) {
      conceptos.push(
        prisma.concepto.upsert({
          where: { codigo: `CON-${i.toString().padStart(2, "0")}` },
          update: {},
          create: {
            codigo: `CON-${i.toString().padStart(2, "0")}`,
            descripcion: `Concepto ${i}`,
            unidad: "m3",
            p_u: 500 + i * 10,
            subareaId: i,
          },
        })
      );
    }
    await Promise.all(conceptos);

    // Crear clientes
    const clientes = [];
    for (let i = 1; i <= 10; i++) {
      clientes.push(
        prisma.cliente.upsert({
          where: { id: i },
          update: {},
          create: {
            nombre: `Cliente ${i} S.A. de C.V.`,
            direccion: `Calle ${i} #${100+i}, Col. Centro`,
            activo: true,
          },
        })
      );
    }
    await Promise.all(clientes);

    // Crear obras
    const obras = [];
    for (let i = 1; i <= 10; i++) {
      obras.push(
        prisma.obra.upsert({
          where: { clave: `OBRA-${i.toString().padStart(3, "0")}` },
          update: {},
          create: {
            clave: `OBRA-${i.toString().padStart(3, "0")}`,
            areaCodigo: `AREA${((i-1)%3)+1}`,
            contratista: `Contratista ${i}`,
            estado: (i%3)+1,
          },
        })
      );
    }
    await Promise.all(obras);

    // Crear presupuestos
    const presupuestos = [];
    for (let i = 1; i <= 10; i++) {
      presupuestos.push(
        prisma.presupuesto.upsert({
          where: { id: i },
          update: {},
          create: {
            claveObra: `OBRA-${i.toString().padStart(3, "0")}`,
            clienteId: i,
            nombreContratista: `Cliente ${i} S.A. de C.V.`,
            descripcionObra: `Obra de prueba ${i}`,
            tramo: `Tramo ${i}`,
            colonia: `Colonia ${i}`,
            calle: `Calle ${i}`,
            contactoResponsable: `Responsable ${i}`,
            estado: i % 2 === 0 ? "aprobado" : "pendiente",
            subtotal: 4000 + i * 100,
            ivaMonto: 640 + i * 16,
            total: 4640 + i * 116,
            formaPago: "Transferencia bancaria",
          },
        })
      );
    }
    await Promise.all(presupuestos);

    // Crear detalles de presupuestos
    const detalles = [];
    for (let i = 1; i <= 10; i++) {
      detalles.push(
        prisma.presupuestoDetalle.upsert({
          where: { id: i },
          update: {},
          create: {
            presupuestoId: i,
            conceptoCodigo: `CON-${i.toString().padStart(2, "0")}`,
            cantidad: 5 + i,
            precioUnitario: 400 + i * 10,
            subtotal: (5 + i) * (400 + i * 10),
            estado: i % 2 === 0 ? "hecho" : "pendiente",
          },
        })
      );
    }
    await Promise.all(detalles);

    // Crear brigadistas
    const brigadistas = [];
    for (let i = 1; i <= 10; i++) {
      brigadistas.push(
        prisma.brigadista.upsert({
          where: { id: i },
          update: {},
          create: {
            nombre: `Brigadista ${i}`,
            telefono: `555-01${i.toString().padStart(2, "0")}`,
            email: `brigadista${i}@laboratorio.com`,
            activo: true,
          },
        })
      );
    }
    await Promise.all(brigadistas);

    // Crear vehículos
    const vehiculos = [];
    for (let i = 1; i <= 10; i++) {
      vehiculos.push(
        prisma.vehiculo.upsert({
          where: { id: i },
          update: {},
          create: {
            clave: `VEH-${i.toString().padStart(3, "0")}`,
            descripcion: `Vehículo ${i} - Modelo ${2020 + i}`,
            activo: true,
          },
        })
      );
    }
    await Promise.all(vehiculos);

    // Crear programaciones
    const programaciones = [];
    const fechaBase = new Date();
    for (let i = 1; i <= 10; i++) {
      programaciones.push(
        prisma.programacion.upsert({
          where: { id: i },
          update: {},
          create: {
            claveObra: `OBRA-${i.toString().padStart(3, "0")}`,
            fechaProgramada: new Date(fechaBase.getTime() + i * 86400000),
            horaProgramada: `${8 + (i % 10)}:00`,
            tipoProgramacion: "obra_por_visita",
            nombreResidente: `Residente ${i}`,
            telefonoResidente: `555-99${i.toString().padStart(2, "0")}`,
            conceptoCodigo: `CON-${i.toString().padStart(2, "0")}`,
            cantidadMuestras: 2 + i,
            tipoRecoleccion: i % 2 === 0 ? "metros_cuadrados" : "sondeo",
            brigadistaId: i,
            vehiculoId: i,
            estado: i % 3 === 0 ? "completada" : (i % 2 === 0 ? "en_proceso" : "programada"),
            observaciones: `Observaciones de la programación ${i}`,
            fechaInicio: new Date(fechaBase.getTime() + (i-1) * 86400000),
            fechaCompletado: i % 3 === 0 ? new Date(fechaBase.getTime() + (i-1) * 86400000 + 3600000) : null,
            muestrasObtenidas: i % 3 === 0 ? 2 + i : null,
          },
        })
      );
    }
    await Promise.all(programaciones);

    console.log("✅ Datos de prueba creados exitosamente:");
    console.log(`- Usuarios: ${adminUser.nombre} (admin), ${recepcionistaUser.nombre} (recepcionista), ${brigadistaUser.nombre} (brigadista)`);
    console.log(`- Área: ${area.nombre}`);
    console.log(`- Subárea: ${subarea.nombre}`);
    console.log(`- Concepto: ${concepto.descripcion}`);
    console.log(`- Cliente: ${cliente.nombre}`);
    console.log(`- Obra: ${obra.clave}`);
    console.log(`- Presupuesto: ${presupuesto.id} (${presupuesto.estado})`);
    console.log(`- Brigadistas: ${brigadista1.nombre}, ${brigadista2.nombre}`);
    console.log(
      `- Vehículos: ${vehiculo1.descripcion}, ${vehiculo2.descripcion}`,
    );
    console.log("- 3 programaciones de prueba");
    console.log("\n📝 Credenciales de prueba:");
    console.log("- Admin: admin@laboratorio.com / admin123");
    console.log("- Recepcionista: recepcionista@laboratorio.com / recep123");
    console.log("- Brigadista: brigadista@laboratorio.com / brig123");
    console.log(`\n🔗 Usuario brigadista vinculado a: ${brigadista1.nombre} (ID: ${brigadista1.id})`);
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
