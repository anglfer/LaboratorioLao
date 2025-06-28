import { PrismaClient } from "../generated/prisma";
import { config } from "dotenv";

// Load environment variables from .env file
config();

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});
