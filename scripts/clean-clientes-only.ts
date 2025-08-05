import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function cleanClientesOnly() {
  console.log('🧹 Iniciando limpieza solo de datos de clientes...');
  
  try {
    // Contar registros antes
    const clientesAntes = await prisma.cliente.count();
    const telefonosAntes = await prisma.telefono.count();
    const correosAntes = await prisma.correo.count();
    const presupuestosAntes = await prisma.presupuesto.count();
    const detallesAntes = await prisma.presupuestoDetalle.count();
    
    console.log(`📊 Estado actual:`);
    console.log(`   - Clientes: ${clientesAntes}`);
    console.log(`   - Teléfonos: ${telefonosAntes}`);
    console.log(`   - Correos: ${correosAntes}`);
    console.log(`   - Presupuestos: ${presupuestosAntes}`);
    console.log(`   - Detalles de presupuesto: ${detallesAntes}`);
    
    // Eliminar en orden para respetar las relaciones de clave foránea
    
    // 1. Eliminar detalles de presupuestos (dependen de presupuestos)
    console.log('🗑️  Paso 1: Eliminando detalles de presupuestos...');
    const deletedDetalles = await prisma.presupuestoDetalle.deleteMany({});
    console.log(`   ✅ ${deletedDetalles.count} detalles de presupuestos eliminados`);
    
    // 2. Eliminar presupuestos (dependen de clientes)
    console.log('🗑️  Paso 2: Eliminando presupuestos...');
    const deletedPresupuestos = await prisma.presupuesto.deleteMany({});
    console.log(`   ✅ ${deletedPresupuestos.count} presupuestos eliminados`);

    // 3. Eliminar teléfonos (dependen de clientes)
    console.log('🗑️  Paso 3: Eliminando teléfonos...');
    const deletedTelefonos = await prisma.telefono.deleteMany({});
    console.log(`   ✅ ${deletedTelefonos.count} teléfonos eliminados`);
    
    // 4. Eliminar correos (dependen de clientes)
    console.log('🗑️  Paso 4: Eliminando correos...');
    const deletedCorreos = await prisma.correo.deleteMany({});
    console.log(`   ✅ ${deletedCorreos.count} correos eliminados`);
    
    // 5. Eliminar clientes
    console.log('🗑️  Paso 5: Eliminando clientes...');
    const deletedClientes = await prisma.cliente.deleteMany({});
    console.log(`   ✅ ${deletedClientes.count} clientes eliminados`);
    
    console.log('🎉 Limpieza de clientes completada exitosamente');
    
    // Verificar estado final
    const clientesDespues = await prisma.cliente.count();
    const telefonosDespues = await prisma.telefono.count();
    const correosDespues = await prisma.correo.count();
    const presupuestosDespues = await prisma.presupuesto.count();
    const detallesDespues = await prisma.presupuestoDetalle.count();
    
    console.log(`📊 Estado después de la limpieza:`);
    console.log(`   - Clientes: ${clientesDespues}`);
    console.log(`   - Teléfonos: ${telefonosDespues}`);
    console.log(`   - Correos: ${correosDespues}`);
    console.log(`   - Presupuestos: ${presupuestosDespues}`);
    console.log(`   - Detalles de presupuesto: ${detallesDespues}`);
    
    if (clientesDespues === 0 && telefonosDespues === 0 && correosDespues === 0) {
      console.log('✨ Base de datos de clientes completamente limpia y lista para importación');
    } else {
      console.log('⚠️  Advertencia: Algunos registros no se eliminaron correctamente');
    }
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función
cleanClientesOnly();
