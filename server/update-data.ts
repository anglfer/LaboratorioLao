import { prisma } from "./prisma";

async function updateData() {
  await prisma.presupuesto.update({
    where: { id: 1 },
    data: { estado: "aprobado" },
  });

  console.log("Presupuesto actualizado a estado 'aprobado'");
  await prisma.$disconnect();
}

updateData();


