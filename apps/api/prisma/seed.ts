import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding demo users...");

  const users = [
    { email: "admin@axontms.com",      password: "admin123",      firstName: "Henry",   lastName: "Fung",     role: "ADMIN"      as const },
    { email: "dispatch@axontms.com",   password: "dispatch123",   firstName: "Sarah",   lastName: "Williams", role: "DISPATCHER" as const },
    { email: "broker@axontms.com",     password: "broker123",     firstName: "Marcus",  lastName: "Reed",     role: "DISPATCHER" as const },
    { email: "accounting@axontms.com", password: "accounting123", firstName: "Diana",   lastName: "Chen",     role: "ACCOUNTANT" as const },
  ];

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        passwordHash,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: true,
      },
    });
    console.log("Created user: " + user.email + " / " + user.password);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });