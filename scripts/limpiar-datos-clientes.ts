import { prisma } from '../server/prisma.js';

async function limpiarDatosClientes() {
  try {
    console.log('🧹 Iniciando limpieza completa de datos de clientes...');
    
    // Contar registros antes
    const clientesAntes = await prisma.cliente.count();
    const telefonosAntes = await prisma.telefono.count();
    const correosAntes = await prisma.correo.count();
    const presupuestosAntes = await prisma.presupuesto.count();
    
    console.log(`📊 Estado actual:`);
    console.log(`   - Clientes: ${clientesAntes}`);
    console.log(`   - Teléfonos: ${telefonosAntes}`);
    console.log(`   - Correos: ${correosAntes}`);
    console.log(`   - Presupuestos: ${presupuestosAntes}`);
    
    // Eliminar en el orden correcto para evitar violaciones de clave foránea
    
    console.log('🗑️  Paso 1: Eliminando detalles de presupuesto...');
    const detallesEliminados = await prisma.presupuestoDetalle.deleteMany({});
    console.log(`   ✅ ${detallesEliminados.count} detalles de presupuesto eliminados`);
    
    console.log('🗑️  Paso 2: Eliminando presupuestos...');
    const presupuestosEliminados = await prisma.presupuesto.deleteMany({});
    console.log(`   ✅ ${presupuestosEliminados.count} presupuestos eliminados`);
    
    console.log('🗑️  Paso 3: Eliminando teléfonos...');
    const telefonosEliminados = await prisma.telefono.deleteMany({});
    console.log(`   ✅ ${telefonosEliminados.count} teléfonos eliminados`);
    
    console.log('🗑️  Paso 4: Eliminando correos...');
    const correosEliminados = await prisma.correo.deleteMany({});
    console.log(`   ✅ ${correosEliminados.count} correos eliminados`);
    
    console.log('🗑️  Paso 5: Eliminando clientes...');
    const clientesEliminados = await prisma.cliente.deleteMany({});
    console.log(`   ✅ ${clientesEliminados.count} clientes eliminados`);
    
    console.log('🎉 Limpieza completada exitosamente');
    
    // Verificar que todo esté limpio
    const clientesDespues = await prisma.cliente.count();
    const telefonosDespues = await prisma.telefono.count();
    const correosDespues = await prisma.correo.count();
    const presupuestosDespues = await prisma.presupuesto.count();
    
    console.log(`📊 Estado después de la limpieza:`);
    console.log(`   - Clientes: ${clientesDespues}`);
    console.log(`   - Teléfonos: ${telefonosDespues}`);
    console.log(`   - Correos: ${correosDespues}`);
    console.log(`   - Presupuestos: ${presupuestosDespues}`);
    
    if (clientesDespues === 0 && telefonosDespues === 0 && correosDespues === 0) {
      console.log('✨ Base de datos de clientes completamente limpia y lista para nuevas importaciones');
    } else {
      console.log('⚠️  Advertencia: Algunos registros no se eliminaron');
    }
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

limpiarDatosClientes();
