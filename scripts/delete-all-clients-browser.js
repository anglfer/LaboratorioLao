// Script para eliminar todos los clientes desde el navegador
// Ejecutar en la consola del navegador en la página de clientes

async function eliminarTodosLosClientes() {
  console.log("🧹 Iniciando eliminación de todos los clientes...");

  try {
    // Obtener todos los clientes
    const response = await fetch("/api/clientes/full");
    const clientes = await response.json();

    console.log(`📊 Se encontraron ${clientes.length} clientes para eliminar`);

    let eliminados = 0;
    let errores = 0;

    // Eliminar cada cliente uno por uno
    for (const cliente of clientes) {
      try {
        const deleteResponse = await fetch(`/api/clientes/${cliente.id}`, {
          method: "DELETE",
        });

        if (deleteResponse.ok) {
          eliminados++;
          console.log(`✅ Cliente ${cliente.id} (${cliente.nombre}) eliminado`);
        } else {
          errores++;
          console.error(
            `❌ Error eliminando cliente ${cliente.id}: ${deleteResponse.status}`
          );
        }
      } catch (error) {
        errores++;
        console.error(`❌ Error eliminando cliente ${cliente.id}:`, error);
      }

      // Pequeña pausa para no sobrecargar el servidor
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`🎉 Eliminación completada:`);
    console.log(`   ✅ Eliminados: ${eliminados}`);
    console.log(`   ❌ Errores: ${errores}`);

    // Verificar que se eliminaron todos
    const finalResponse = await fetch("/api/clientes/full");
    const clientesRestantes = await finalResponse.json();
    console.log(`📊 Clientes restantes: ${clientesRestantes.length}`);

    if (clientesRestantes.length === 0) {
      console.log("✨ Base de datos de clientes completamente limpia");
    }
  } catch (error) {
    console.error("❌ Error durante la eliminación:", error);
  }
}

// Ejecutar función
eliminarTodosLosClientes();
