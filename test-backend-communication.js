// Test manual para verificar la comunicación del backend
// Este archivo es temporal solo para verificación

console.log("=== INICIANDO VERIFICACIÓN DE BACKEND ===");

async function testBackendCommunication() {
  try {
    console.log("\n1. Probando GET /api/dashboard/stats");
    const statsResponse = await fetch(
      "http://localhost:3000/api/dashboard/stats"
    );
    const stats = await statsResponse.json();
    console.log("✅ Dashboard stats:", stats);

    console.log("\n2. Probando GET /api/clientes");
    const clientesResponse = await fetch("http://localhost:3000/api/clientes");
    const clientes = await clientesResponse.json();
    console.log("✅ Clientes count:", clientes.length);

    console.log("\n3. Probando GET /api/obras");
    const obrasResponse = await fetch("http://localhost:3000/api/obras");
    const obras = await obrasResponse.json();
    console.log("✅ Obras count:", obras.length);

    console.log("\n4. Probando GET /api/presupuestos");
    const presupuestosResponse = await fetch(
      "http://localhost:3000/api/presupuestos"
    );
    const presupuestos = await presupuestosResponse.json();
    console.log("✅ Presupuestos count:", presupuestos.length);

    if (presupuestos.length > 0) {
      const presupuesto = presupuestos[0];
      console.log("\n5. Verificando estructura de presupuesto:");
      console.log("- ID:", presupuesto.id);
      console.log("- Cliente ID:", presupuesto.clienteId);
      console.log("- Clave Obra:", presupuesto.claveObra);
      console.log("- Obra incluida:", !!presupuesto.obra);
      console.log("- Cliente incluido:", !!presupuesto.cliente);
      console.log("- Usuario incluido:", !!presupuesto.usuario);
      console.log("- Detalles incluidos:", !!presupuesto.detalles);

      if (presupuesto.obra) {
        console.log("  * Obra - Nombre:", presupuesto.obra.nombre);
        console.log("  * Obra - Descripción:", presupuesto.obra.descripcion);
        console.log("  * Obra - Área incluida:", !!presupuesto.obra.area);
      }
    }

    console.log("\n=== ✅ VERIFICACIÓN COMPLETADA EXITOSAMENTE ===");
  } catch (error) {
    console.error("❌ Error en verificación:", error);
  }
}

// Solo ejecutar si estamos en el lado del servidor
if (typeof window === "undefined") {
  testBackendCommunication();
}
