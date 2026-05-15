import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Memulai proses seeding...");

  // Buat hash password
  const adminHash = await bcrypt.hash("admin123", 10);
  const kasirHash = await bcrypt.hash("kasir123", 10);

  // Seed Admin
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      password: adminHash,
      role: "ADMIN"
    },
    create: {
      username: "admin",
      name: "Administrator",
      password: adminHash,
      role: "ADMIN",
      status: "AKTIF",
    },
  });

  // Seed Kasir
  await prisma.user.upsert({
    where: { username: "kasir" },
    update: {
      password: kasirHash,
      role: "KASIR"
    },
    create: {
      username: "kasir",
      name: "Kasir Utama",
      password: kasirHash,
      role: "KASIR",
      status: "AKTIF",
    },
  });

  console.log("Seeding berhasil diselesaikan.");
}

main()
  .catch((e) => {
    console.error("Error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });