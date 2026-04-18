/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,loadNumber]` on the table `broker_loads` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,mcNumber]` on the table `external_carriers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,dotNumber]` on the table `external_carriers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,invoiceNumber]` on the table `invoices` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,loadNumber]` on the table `loads` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tenantId` to the `broker_loads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `drivers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `external_carriers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `loads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TenantPlan" AS ENUM ('STARTER', 'PROFESSIONAL', 'ENTERPRISE');

-- DropIndex
DROP INDEX "broker_loads_loadNumber_key";

-- DropIndex
DROP INDEX "external_carriers_dotNumber_key";

-- DropIndex
DROP INDEX "external_carriers_mcNumber_key";

-- DropIndex
DROP INDEX "invoices_invoiceNumber_key";

-- DropIndex
DROP INDEX "loads_loadNumber_key";

-- DropIndex
DROP INDEX "users_email_key";

-- AlterTable
ALTER TABLE "broker_loads" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "drivers" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "external_carriers" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "loads" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "logoUrl" TEXT,
    "primaryColor" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "plan" "TenantPlan" NOT NULL DEFAULT 'STARTER',
    "cargoWiseEnabled" BOOLEAN NOT NULL DEFAULT false,
    "cargoWiseApiKey" TEXT,
    "cargoWiseEndpoint" TEXT,
    "quickbooksEnabled" BOOLEAN NOT NULL DEFAULT false,
    "quickbooksRealmId" TEXT,
    "netsuiteEnabled" BOOLEAN NOT NULL DEFAULT false,
    "netsuiteAccountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "broker_loads_tenantId_idx" ON "broker_loads"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "broker_loads_tenantId_loadNumber_key" ON "broker_loads"("tenantId", "loadNumber");

-- CreateIndex
CREATE INDEX "customers_tenantId_idx" ON "customers"("tenantId");

-- CreateIndex
CREATE INDEX "drivers_tenantId_idx" ON "drivers"("tenantId");

-- CreateIndex
CREATE INDEX "external_carriers_tenantId_idx" ON "external_carriers"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "external_carriers_tenantId_mcNumber_key" ON "external_carriers"("tenantId", "mcNumber");

-- CreateIndex
CREATE UNIQUE INDEX "external_carriers_tenantId_dotNumber_key" ON "external_carriers"("tenantId", "dotNumber");

-- CreateIndex
CREATE INDEX "invoices_tenantId_idx" ON "invoices"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_tenantId_invoiceNumber_key" ON "invoices"("tenantId", "invoiceNumber");

-- CreateIndex
CREATE INDEX "loads_tenantId_idx" ON "loads"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "loads_tenantId_loadNumber_key" ON "loads"("tenantId", "loadNumber");

-- CreateIndex
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenantId_email_key" ON "users"("tenantId", "email");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loads" ADD CONSTRAINT "loads_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_carriers" ADD CONSTRAINT "external_carriers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broker_loads" ADD CONSTRAINT "broker_loads_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
