
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

function isBcryptHash(value: string | null | undefined): boolean {
  if (!value) return false;
  // Bcrypt hashes typically start with $2a$, $2b$ or $2y$
  return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);
}

async function main() {
  console.log("🌱 Iniciando seed de usuarios adicionales...");
  try {
    // Verificar si ya existen usuarios
    const existingUsers = await prisma.usuario.count();
    console.log(`📋 Usuarios existentes en la base: ${existingUsers}`);

    // Asegurar roles básicos existan siempre (idempotente)
    await prisma.role.createMany({
      data: [
        { nombre: "admin", descripcion: "Administrador" },
        { nombre: "recepcionista", descripcion: "Recepcionista" },
        { nombre: "jefe_laboratorio", descripcion: "Jefe de Laboratorio" },
        { nombre: "laboratorista", descripcion: "Laboratorista" },
      ],
      skipDuplicates: true,
    });

    if (existingUsers > 0) {
      console.log("ℹ️  Ya existen usuarios en la base de datos.");

      // 1) Reparar contraseñas en texto plano (si las hay)
      const usuarios = await prisma.usuario.findMany({
        select: { id: true, email: true, password: true }
      });
      let fixed = 0;
      for (const u of usuarios) {
        if (!isBcryptHash(u.password)) {
          const newHash = await hashPassword(u.password);
          await prisma.usuario.update({
            where: { id: u.id },
            data: { password: newHash },
          });
          fixed++;
          console.log(`🔒 Contraseña hasheada para usuario ${u.email ?? `ID:${u.id}`}`);
        }
      }
      if (fixed > 0) console.log(`✅ ${fixed} contraseña(s) en texto plano fueron hasheadas.`);

      // 2) Asegurar usuarios base existan (upsert si faltan)
      const baseUsers = [
        {
          email: "admin@laboratorio.com",
          nombre: "Admin",
          apellidos: "Sistema",
          password: "admin123",
          rolNombre: "admin",
        },
        {
          email: "recepcion@laboratorio.com",
          nombre: "Recepcionista",
          apellidos: "Ejemplo",
          password: "recep123",
          rolNombre: "recepcionista",
        },
        {
          email: "recepcion2@laboratorio.com",
          nombre: "Recepcionista",
          apellidos: "Ejemplo",
          password: "recep123",
          rolNombre: "recepcionista",
        },
        {
          email: "jefe@laboratorio.com",
          nombre: "Jefe",
          apellidos: "Laboratorio",
          password: "jefe123",
          rolNombre: "jefe_laboratorio",
        },
        {
          email: "laboratorista@laboratorio.com",
          nombre: "Laboratorista",
          apellidos: "Ejemplo",
          password: "lab123",
          rolNombre: "laboratorista",
        },
      ];

      for (const userData of baseUsers) {
        const role = await prisma.role.findUnique({ where: { nombre: userData.rolNombre } });
        if (!role) continue;

        const existing = await prisma.usuario.findUnique({ where: { email: userData.email } });
        if (!existing) {
          const hashedPassword = await hashPassword(userData.password);
          await prisma.usuario.create({
            data: {
              email: userData.email,
              nombre: userData.nombre,
              apellidos: userData.apellidos,
              password: hashedPassword,
              rolId: role.id,
            },
          });
          console.log(`✅ Usuario creado: ${userData.email}`);
        } else if (!isBcryptHash(existing.password)) {
          const hashedPassword = await hashPassword(userData.password);
          await prisma.usuario.update({
            where: { id: existing.id },
            data: { password: hashedPassword, rolId: role.id },
          });
          console.log(`🔁 Usuario actualizado (password hasheada): ${userData.email}`);
        } else {
          console.log(`↩️  Usuario ya existe y está correcto: ${userData.email}`);
        }
      }
    } else {
      // Si no hay usuarios, crear los usuarios básicos
      console.log("🆕 Creando usuarios iniciales...");

      // Obtener los roles creados
      const adminRole = await prisma.role.findUnique({ where: { nombre: "admin" } });
      const recepRole = await prisma.role.findUnique({ where: { nombre: "recepcionista" } });
      const jefeRole = await prisma.role.findUnique({ where: { nombre: "jefe_laboratorio" } });

      // Definir usuarios con emails y contraseñas (que se hashearán)
      const usersData = [
        {
          email: "admin@laboratorio.com",
          nombre: "Admin",
          apellidos: "Sistema",
          password: "admin123",
          rolId: adminRole?.id ?? 1,
        },
        {
          email: "recepcion@laboratorio.com", 
          nombre: "Recepcionista",
          apellidos: "Ejemplo",
          password: "recep123",
          rolId: recepRole?.id ?? 2,
        },
        {
          email: "jefe@laboratorio.com",
          nombre: "Jefe",
          apellidos: "Laboratorio", 
          password: "jefe123",
          rolId: jefeRole?.id ?? 3,
        },
        {
          email: "laboratorista@laboratorio.com",
          nombre: "Laboratorista",
          apellidos: "Ejemplo",
          password: "lab123",
          rolId: (await prisma.role.findUnique({ where: { nombre: "laboratorista" } }))?.id ?? 4,
        },
      ];

      // Crear usuarios con contraseñas hasheadas
      for (const userData of usersData) {
        const hashedPassword = await hashPassword(userData.password);
        
        await prisma.usuario.create({
          data: {
            ...userData,
            password: hashedPassword,
          },
        });
        
        console.log(`✅ Usuario creado: ${userData.email}`);
      }
    }

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
