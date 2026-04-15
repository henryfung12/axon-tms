-- CreateEnum
CREATE TYPE "CarrierStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED');

-- CreateEnum
CREATE TYPE "BrokerLoadStatus" AS ENUM ('PENDING', 'POSTED_TO_DAT', 'CARRIER_ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CarrierPaymentStatus" AS ENUM ('UNPAID', 'SCHEDULED', 'PAID');

-- CreateTable
CREATE TABLE "external_carriers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mcNumber" TEXT NOT NULL,
    "dotNumber" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "status" "CarrierStatus" NOT NULL DEFAULT 'PENDING',
    "rmisVerifiedAt" TIMESTAMP(3),
    "insuranceExpiry" TIMESTAMP(3),
    "authorityExpiry" TIMESTAMP(3),
    "paymentTerms" INTEGER NOT NULL DEFAULT 30,
    "preferredLanes" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_carriers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broker_loads" (
    "id" TEXT NOT NULL,
    "loadNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "carrierId" TEXT,
    "status" "BrokerLoadStatus" NOT NULL DEFAULT 'PENDING',
    "commodity" TEXT,
    "weight" DOUBLE PRECISION,
    "pieces" INTEGER,
    "shipperRate" DOUBLE PRECISION NOT NULL,
    "carrierRate" DOUBLE PRECISION,
    "margin" DOUBLE PRECISION,
    "datPostId" TEXT,
    "truckerToolsLoadId" TEXT,
    "cargoWiseSyncedAt" TIMESTAMP(3),
    "carrierPayStatus" "CarrierPaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "carrierPaidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "broker_loads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broker_stops" (
    "id" TEXT NOT NULL,
    "brokerLoadId" TEXT NOT NULL,
    "type" "StopType" NOT NULL,
    "sequence" INTEGER NOT NULL,
    "facilityName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "scheduledAt" TIMESTAMP(3),
    "arrivedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "broker_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dat_postings" (
    "id" TEXT NOT NULL,
    "brokerLoadId" TEXT NOT NULL,
    "datPostId" TEXT NOT NULL,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rateOffered" DOUBLE PRECISION,

    CONSTRAINT "dat_postings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "external_carriers_mcNumber_key" ON "external_carriers"("mcNumber");

-- CreateIndex
CREATE UNIQUE INDEX "external_carriers_dotNumber_key" ON "external_carriers"("dotNumber");

-- CreateIndex
CREATE UNIQUE INDEX "broker_loads_loadNumber_key" ON "broker_loads"("loadNumber");

-- CreateIndex
CREATE UNIQUE INDEX "dat_postings_datPostId_key" ON "dat_postings"("datPostId");

-- AddForeignKey
ALTER TABLE "broker_loads" ADD CONSTRAINT "broker_loads_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broker_loads" ADD CONSTRAINT "broker_loads_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "external_carriers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broker_stops" ADD CONSTRAINT "broker_stops_brokerLoadId_fkey" FOREIGN KEY ("brokerLoadId") REFERENCES "broker_loads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dat_postings" ADD CONSTRAINT "dat_postings_brokerLoadId_fkey" FOREIGN KEY ("brokerLoadId") REFERENCES "broker_loads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
