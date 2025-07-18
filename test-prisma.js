import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

async function testPrismaClient() {
  try {
    console.log("🔍 Verificando cliente de Prisma...");

    // Verificar que tenemos acceso a las nuevas tablas
    console.log("✓ areasJerarquicas:", typeof prisma.areasJerarquicas);
    console.log("✓ conceptosJerarquicos:", typeof prisma.conceptosJerarquicos);

    // Contar registros actuales
    const totalAreas = await prisma.areasJerarquicas.count();
    const totalConceptos = await prisma.conceptosJerarquicos.count();

    console.log(`📊 Total áreas: ${totalAreas}`);
    console.log(`📊 Total conceptos: ${totalConceptos}`);

    console.log("✅ Cliente de Prisma funciona correctamente");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaClient();
