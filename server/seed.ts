
import { prisma } from "./prisma";

async function main() {
  console.log("🌱 Iniciando seed SOLO de usuarios...");
  try {
    // Eliminar usuarios existentes
    await prisma.usuario.deleteMany({});
    await prisma.role.deleteMany({});

    // Crear roles básicos
    const roles = await prisma.role.createMany({
      data: [
        { nombre: "admin", descripcion: "Administrador" },
        { nombre: "recepcionista", descripcion: "Recepcionista" },
        { nombre: "jefe_laboratorio", descripcion: "Jefe de Laboratorio" },
      ],
      skipDuplicates: true,
    });

    // Obtener los roles creados
    const adminRole = await prisma.role.findUnique({ where: { nombre: "admin" } });
    const recepRole = await prisma.role.findUnique({ where: { nombre: "recepcionista" } });
    const jefeRole = await prisma.role.findUnique({ where: { nombre: "jefe_laboratorio" } });

    // Crear usuarios de ejemplo
    await prisma.usuario.createMany({
      data: [
        {
          nombre: "Admin",
          apellidos: "Sistema",
          password: "admin123", // Cambia esto por un hash real en producción
          rolId: adminRole?.id ?? 1,
        },
        {
          nombre: "Recepcionista",
          apellidos: "Ejemplo",
          password: "recep123",
          rolId: recepRole?.id ?? 2,
        },
        {
          nombre: "Jefe",
          apellidos: "Laboratorio",
          password: "jefe123",
          rolId: jefeRole?.id ?? 3,
        },
      ],
      skipDuplicates: true,
    });

    console.log("✅ Seed de usuarios completado!");
  } catch (error) {
    console.error("❌ Error durante el seed de usuarios:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
