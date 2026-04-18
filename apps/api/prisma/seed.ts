import { PrismaClient, UserRole, TenantPlan } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ---------------- Axon Demo (real tenant for the marketing demo) ----------------
  const demo = await prisma.tenant.upsert({
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
  console.log(`Tenant: ${demo.companyName} (${demo.id})`);

  const demoUsers = [
    { email: "admin@axontms.com",      password: "admin123",      role: UserRole.SUPER_ADMIN, firstName: "Admin",      lastName: "User" },
    { email: "dispatch@axontms.com",   password: "dispatch123",   role: UserRole.DISPATCHER,  firstName: "Dispatch",   lastName: "User" },
    { email: "broker@axontms.com",     password: "broker123",     role: UserRole.ADMIN,       firstName: "Broker",     lastName: "User" },
    { email: "accounting@axontms.com", password: "accounting123", role: UserRole.ACCOUNTANT,  firstName: "Accounting", lastName: "User" },
  ];
  for (const u of demoUsers) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: demo.id, email: u.email } },
      update: {},
      create: {
        tenantId: demo.id,
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

  // ---------------- Axon Internal (staff-only tenant for the admin panel) ----------------
  // This tenant is the home for Axon employees. Users here get the AXON_STAFF
  // role, which the AxonStaffGuard checks before enabling cross-tenant access
  // for the /admin/* routes. It never does real TMS work.
  const internal = await prisma.tenant.upsert({
    where: { slug: "axon-internal" },
    update: {},
    create: {
      slug: "axon-internal",
      companyName: "Axon Internal",
      plan: TenantPlan.ENTERPRISE,
      isActive: true,
      primaryColor: "#0f172a",
    },
  });
  console.log(`Tenant: ${internal.companyName} (${internal.id})`);

  const staffPasswordHash = await bcrypt.hash("axonstaff123", 10);
  const staff = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: internal.id, email: "staff@axon-tms.com" } },
    // On re-seed, keep the password fresh and make sure the role is right.
    update: { role: UserRole.AXON_STAFF, passwordHash: staffPasswordHash },
    create: {
      tenantId: internal.id,
      email: "staff@axon-tms.com",
      passwordHash: staffPasswordHash,
      role: UserRole.AXON_STAFF,
      firstName: "Axon",
      lastName: "Staff",
      isActive: true,
    },
  });
  console.log(`  User: ${staff.email} (${staff.role})`);

  console.log("Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });