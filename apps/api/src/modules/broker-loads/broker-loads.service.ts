import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class BrokerLoadsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(status?: string) {
    return this.prisma.brokerLoad.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        customer: { select: { id: true, name: true } },
        carrier: { select: { id: true, name: true, mcNumber: true } },
        stops: { orderBy: { sequence: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.brokerLoad.findUnique({
      where: { id },
      include: {
        customer: true,
        carrier: true,
        stops: { orderBy: { sequence: 'asc' } },
        datPostings: { orderBy: { postedAt: 'desc' } },
      },
    });
  }

  async create(data: any) {
    const count = await this.prisma.brokerLoad.count();
    const loadNumber = `GB-${String(10001 + count).padStart(5, '0')}`;

    return this.prisma.brokerLoad.create({
      data: {
        loadNumber,
        customerId: data.customerId,
        carrierId: data.carrierId || null,
        commodity: data.commodity,
        weight: data.weight,
        pieces: data.pieces,
        shipperRate: data.shipperRate,
        carrierRate: data.carrierRate || null,
        margin: data.carrierRate ? data.shipperRate - data.carrierRate : null,
        notes: data.notes,
        stops: {
          create: data.stops?.map((stop: any, index: number) => ({
            type: stop.type,
            sequence: index + 1,
            facilityName: stop.facilityName,
            address: stop.address,
            city: stop.city,
            state: stop.state,
            zip: stop.zip,
            scheduledAt: stop.scheduledAt ? new Date(stop.scheduledAt).toISOString() : null,
          })),
        },
      },
      include: {
        customer: { select: { id: true, name: true } },
        stops: true,
      },
    });
  }

  async assignCarrier(id: string, carrierId: string, carrierRate: number) {
    const load = await this.prisma.brokerLoad.findUnique({ where: { id } });
    return this.prisma.brokerLoad.update({
      where: { id },
      data: {
        carrierId,
        carrierRate,
        margin: load ? load.shipperRate - carrierRate : null,
        status: 'CARRIER_ASSIGNED',
      },
      include: {
        customer: { select: { id: true, name: true } },
        carrier: { select: { id: true, name: true, mcNumber: true } },
        stops: true,
      },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.brokerLoad.update({
      where: { id },
      data: { status: status as any },
    });
  }
}