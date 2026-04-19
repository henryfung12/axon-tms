/**
 * Rename the demo users on the axon-demo tenant so the email addresses
 * match the "Gemini Express" company branding.
 *
 * Usage (local):
 *   npx ts-node scripts/rename-demo-users.ts
 *
 * Usage (production):
 *   DATABASE_URL="<railway public url>" npx ts-node scripts/rename-demo-users.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TENANT_SLUG = 'axon-demo';

const RENAMES: Array<{ from: string; to: string }> = [
  { from: 'admin@axontms.com',       to: 'admin@gemini-express.com' },
  { from: 'dispatch@axontms.com',    to: 'dispatch@gemini-express.com' },
  { from: 'broker@axontms.com',      to: 'broker@gemini-express.com' },
  { from: 'accounting@axontms.com',  to: 'accounting@gemini-express.com' },
];

async function main() {
  const tenant = await prisma.tenant.findUnique({ where: { slug: TENANT_SLUG } });
  if (!tenant) {
    console.error(`Tenant "${TENANT_SLUG}" not found. Nothing to do.`);
    process.exit(1);
  }
  console.log(`Tenant: ${tenant.companyName} (${tenant.id})\n`);

  for (const { from, to } of RENAMES) {
    const existing = await prisma.user.findFirst({
      where: { tenantId: tenant.id, email: from },
    });
    if (!existing) {
      console.log(`  skip    ${from}  (not found)`);
      continue;
    }

    // Abort if the target email already exists on this tenant — that
    // would violate the (tenantId, email) unique constraint and we
    // don't want to silently merge accounts.
    const collision = await prisma.user.findFirst({
      where: { tenantId: tenant.id, email: to },
    });
    if (collision && collision.id !== existing.id) {
      console.log(`  skip    ${from}  (target ${to} already exists)`);
      continue;
    }

    await prisma.user.update({
      where: { id: existing.id },
      data: { email: to },
    });
    console.log(`  ok      ${from}  ->  ${to}`);
  }

  console.log('\nDone.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });