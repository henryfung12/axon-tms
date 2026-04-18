import { PrismaClient, UserRole, TenantPlan } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create the Axon Demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: "axon-demo" },
    update: {},
    create: {
      slug: "axon-demo",
      companyName: "Axon Demo",
      plan: TenantPlan.PROFESSIONAL,
      isActive: true,
      cargoWiseEnabled: true,
      quickbooksEnabled: false,
      netsuiteEnabled: false,
      primaryColor: "#2563eb",
    },
  });
  console.log(`Created tenant: ${tenant.companyName} (${tenant.id})`);

  // Create 4 demo users under this tenant
  const users = [
    { email: "admin@axontms.com",      password: "admin123",      role: UserRole.SUPER_ADMIN, firstName: "Admin",      lastName: "User" },
    { email: "dispatch@axontms.com",   password: "dispatch123",   role: UserRole.DISPATCHER,  firstName: "Dispatch",   lastName: "User" },
    { email: "broker@axontms.com",     password: "broker123",     role: UserRole.ADMIN,       firstName: "Broker",     lastName: "User" },
    { email: "accounting@axontms.com", password: "accounting123", role: UserRole.ACCOUNTANT,  firstName: "Accounting", lastName: "User" },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: u.email } },
      update: {},
      create: {
        tenantId: tenant.id,
        email: u.email,
        passwordHash,
        role: u.role,
        firstName: u.firstName,
        lastName: u.lastName,
        isActive: true,
      },
    });
    console.log(`  User: ${user.email} (${user.role})`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
