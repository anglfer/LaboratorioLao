import { prisma } from '../prisma.js';

async function limpiarClientes() {
  try {
    console.log('🧹 Iniciando limpieza de clientes...');
    
    // Contar registros antes
    const clientesAntes = await prisma.cliente.count();
    const telefonosAntes = await prisma.telefono.count();
    const correosAntes = await prisma.correo.count();
    
    console.log(`📊 Estado actual:`);
    console.log(`   - Clientes: ${clientesAntes}`);
    console.log(`   - Teléfonos: ${telefonosAntes}`);
    console.log(`   - Correos: ${correosAntes}`);
    
    // Eliminar todos los clientes (esto eliminará automáticamente teléfonos y correos por cascada)
    const clientesEliminados = await prisma.cliente.deleteMany({});
    
    console.log('✅ Limpieza completada:');
    console.log(`   - ${clientesEliminados.count} clientes eliminados`);
    console.log(`   - Teléfonos y correos eliminados automáticamente por cascada`);
    
    // Verificar que todo esté limpio
    const clientesDespues = await prisma.cliente.count();
    const telefonosDespues = await prisma.telefono.count();
    const correosDespues = await prisma.correo.count();
    
    console.log(`📊 Estado después de la limpieza:`);
    console.log(`   - Clientes: ${clientesDespues}`);
    console.log(`   - Teléfonos: ${telefonosDespues}`);
    console.log(`   - Correos: ${correosDespues}`);
    
    if (clientesDespues === 0 && telefonosDespues === 0 && correosDespues === 0) {
      console.log('🎉 Base de datos de clientes completamente limpia');
    } else {
      console.log('⚠️  Advertencia: Algunos registros no se eliminaron');
    }
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

limpiarClientes();
