import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🧹 Iniciando limpieza solo de datos de clientes...');
  
  try {
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
    
    // Eliminar en orden para respetar las relaciones de clave foránea
    
    // 1. Eliminar detalles de presupuestos (dependen de presupuestos y conceptos)
    console.log('🗑️  Eliminando detalles de presupuestos...');
    const deletedDetalles = await prisma.presupuestoDetalle.deleteMany({});
    console.log(`   ✅ ${deletedDetalles.count} detalles de presupuestos eliminados`);
    
    // 2. Eliminar presupuestos (dependen de clientes y obras)
    console.log('🗑️  Eliminando presupuestos...');
    const deletedPresupuestos = await prisma.presupuesto.deleteMany({});
    console.log(`   ✅ ${deletedPresupuestos.count} presupuestos eliminados`);

    // 3. Eliminar teléfonos (dependen de clientes)
    console.log('🗑️  Eliminando teléfonos...');
    const deletedTelefonos = await prisma.telefono.deleteMany({});
    console.log(`   ✅ ${deletedTelefonos.count} teléfonos eliminados`);
    
    // 4. Eliminar correos (dependen de clientes)
    console.log('🗑️  Eliminando correos...');
    const deletedCorreos = await prisma.correo.deleteMany({});
    console.log(`   ✅ ${deletedCorreos.count} correos eliminados`);
    
    // 5. Eliminar clientes
    console.log('🗑️  Eliminando clientes...');
    const deletedClientes = await prisma.cliente.deleteMany({});
    console.log(`   ✅ ${deletedClientes.count} clientes eliminados`);
    
    console.log('🎉 Limpieza de clientes completada exitosamente');
    
    // Verificar estado final
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
      console.log('✨ Base de datos de clientes completamente limpia y lista para importación');
    }
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    await prisma.$disconnect();
  }
}
    
    // 7. Eliminar teléfonos y correos de clientes
    console.log('🗑️  Eliminando teléfonos de clientes...');
    const deletedTelefonos = await prisma.telefono.deleteMany({});
    console.log(`   ✅ ${deletedTelefonos.count} teléfonos eliminados`);
    
    console.log('🗑️  Eliminando correos de clientes...');
    const deletedCorreos = await prisma.correo.deleteMany({});
    console.log(`   ✅ ${deletedCorreos.count} correos eliminados`);
    
    // 8. Eliminar clientes
    console.log('🗑️  Eliminando clientes...');
    const deletedClientes = await prisma.cliente.deleteMany({});
    console.log(`   ✅ ${deletedClientes.count} clientes eliminados`);
    
    // Verificar qué datos quedan
    console.log('\n📊 Datos restantes en la base de datos:');
    const remainingUsuarios = await prisma.usuario.count();
    const remainingRoles = await prisma.role.count();
    const remainingAreas = await prisma.area.count();
    
    console.log(`   👥 Usuarios: ${remainingUsuarios}`);
    console.log(`   🔐 Roles: ${remainingRoles}`);
    console.log(`   📂 Áreas: ${remainingAreas}`);
    
    console.log('\n✅ Limpieza de base de datos completada exitosamente!');
    console.log('💾 Se mantuvieron: usuarios, roles y áreas básicas');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
cleanDatabase();

export { cleanDatabase };
