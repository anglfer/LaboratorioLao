// Test completo del flujo de presupuestos
import { PrismaClient } from "./generated/prisma/index.js";

const prisma = new PrismaClient();

async function testCompleteFlow() {
  console.log("🔄 INICIANDO TEST DEL FLUJO COMPLETO DE PRESUPUESTOS\n");

  try {
    // 1. Verificar conexión a BD
    console.log("1️⃣ Verificando conexión a base de datos...");
    await prisma.$connect();
    console.log("✅ Conexión exitosa\n");

    // 2. Verificar areas jerárquicas disponibles
    console.log("2️⃣ Verificando áreas jerárquicas...");
    const areas = await prisma.areasJerarquicas.findMany({
      take: 3,
    });
    console.log(`✅ Áreas disponibles: ${areas.length}`);
    areas.forEach((area) => {
      console.log(`   - ${area.codigo}: ${area.nombre}`);
    });
    console.log("");

    // 3. Verificar conceptos jerárquicos
    console.log("3️⃣ Verificando conceptos jerárquicos...");
    const conceptos = await prisma.conceptosJerarquicos.findMany({
      where: { areaId: areas[0]?.id },
      take: 3,
    });
    console.log(
      `✅ Conceptos para área ${areas[0]?.codigo}: ${conceptos.length}`
    );
    conceptos.forEach((concepto) => {
      console.log(
        `   - ${concepto.codigo}: ${concepto.nombre} ($${concepto.precioUnitario})`
      );
    });
    console.log("");

    // 4. Crear un cliente de prueba
    console.log("4️⃣ Creando cliente de prueba...");
    const clienteData = {
      nombre: "Cliente Test " + Date.now(),
      direccion: "Calle Test 123, Ciudad Test",
      representanteLegal: "Juan Pérez",
      contactoPagos: "María García",
      metodoPago: "TRANSFERENCIA",
      fechaRegistro: new Date(),
    };

    const cliente = await prisma.cliente.create({
      data: clienteData,
    });
    console.log(`✅ Cliente creado: ID ${cliente.id} - ${cliente.nombre}\n`);

    // 5. Crear obra automáticamente
    console.log("5️⃣ Creando obra de prueba...");
    const areaCodigo = areas[0]?.codigo;
    if (!areaCodigo) {
      throw new Error("No hay áreas disponibles");
    }

    // Generar clave única para la obra
    const claveObra = `${areaCodigo}-${Date.now().toString().slice(-6)}`;

    const obra = await prisma.obra.create({
      data: {
        clave: claveObra,
        areaCodigo: areaCodigo,
        nombre: "Obra Test " + Date.now(),
        descripcion: "Descripción de obra de prueba para testing",
        contratista: "Contratista Test SA de CV",
        direccion: "Av. Construcción 456, Ciudad Test",
        alcance:
          "Alcance completo de la obra incluyendo todos los trabajos especificados en el proyecto ejecutivo",
        contacto: "Ing. Pedro González - Responsable de Obra",
        clienteId: cliente.id,
        estado: 1,
        fechaCreacion: new Date(),
        creadoPor: "Sistema Test",
      },
    });
    console.log(`✅ Obra creada: ${obra.clave} - ${obra.nombre}\n`);

    // 6. Crear presupuesto
    console.log("6️⃣ Creando presupuesto...");

    // Seleccionar conceptos para el presupuesto
    const conceptosParaPresupuesto = conceptos.slice(0, 2).map((concepto) => ({
      conceptoCodigo: concepto.codigo,
      cantidad: Math.floor(Math.random() * 10) + 1,
      precioUnitario: concepto.precioUnitario || 100,
    }));

    // Calcular totales
    const subtotal = conceptosParaPresupuesto.reduce(
      (sum, item) => sum + item.cantidad * item.precioUnitario,
      0
    );
    const iva = 0.16;
    const ivaMonto = subtotal * iva;
    const total = subtotal + ivaMonto;

    const presupuesto = await prisma.presupuesto.create({
      data: {
        clienteId: cliente.id,
        claveObra: obra.clave,
        fechaSolicitud: new Date(),
        subtotal: subtotal,
        iva: iva,
        ivaMonto: ivaMonto,
        total: total,
        estado: "borrador",
        manejaAnticipo: true,
        porcentajeAnticipo: 30,
        usuarioId: 1, // Usuario por defecto
        ultimoUsuarioId: 1,
      },
    });
    console.log(`✅ Presupuesto creado: ID ${presupuesto.id}\n`);

    // 7. Crear detalles del presupuesto
    console.log("7️⃣ Creando detalles del presupuesto...");
    for (const concepto of conceptosParaPresupuesto) {
      const subtotalConcepto = concepto.cantidad * concepto.precioUnitario;
      await prisma.presupuestoDetalle.create({
        data: {
          presupuestoId: presupuesto.id,
          conceptoCodigo: concepto.conceptoCodigo,
          cantidad: concepto.cantidad,
          precioUnitario: concepto.precioUnitario,
          subtotal: subtotalConcepto,
          estado: "en_proceso",
        },
      });
    }
    console.log(`✅ ${conceptosParaPresupuesto.length} detalles creados\n`);

    // 8. Verificar presupuesto completo
    console.log("8️⃣ Verificando presupuesto completo...");
    const presupuestoCompleto = await prisma.presupuesto.findUnique({
      where: { id: presupuesto.id },
      include: {
        cliente: true,
        obra: {
          include: { area: true },
        },
        detalles: {
          include: { concepto: true },
        },
      },
    });

    if (presupuestoCompleto) {
      console.log("✅ PRESUPUESTO COMPLETO VERIFICADO:");
      console.log(`   📋 ID: ${presupuestoCompleto.id}`);
      console.log(`   👤 Cliente: ${presupuestoCompleto.cliente?.nombre}`);
      console.log(
        `   🏗️ Obra: ${presupuestoCompleto.obra?.nombre} (${presupuestoCompleto.claveObra})`
      );
      console.log(`   📊 Área: ${presupuestoCompleto.obra?.area?.nombre}`);
      console.log(`   💰 Total: $${presupuestoCompleto.total?.toFixed(2)}`);
      console.log(
        `   📝 Detalles: ${presupuestoCompleto.detalles.length} conceptos`
      );

      presupuestoCompleto.detalles.forEach((detalle, index) => {
        console.log(
          `      ${index + 1}. ${detalle.concepto?.nombre} - Cant: ${
            detalle.cantidad
          } - $${detalle.subtotal?.toFixed(2)}`
        );
      });
    }

    console.log("\n🎉 ¡TEST COMPLETADO EXITOSAMENTE!");
    console.log("✅ El flujo completo de presupuestos funciona correctamente");
  } catch (error) {
    console.error("\n❌ ERROR EN EL TEST:", error);
    console.error("Stack:", error.stack);
  } finally {
    await prisma.$disconnect();
    console.log("\n🔌 Conexión cerrada");
  }
}

// Ejecutar el test
testCompleteFlow();
