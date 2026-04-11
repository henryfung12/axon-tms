import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class LoadsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(status?: string) {
    return this.prisma.load.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        customer: { select: { id: true, name: true } },
        driver: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        stops: { orderBy: { sequence: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.load.findUnique({
      where: { id },
      include: {
        customer: true,
        driver: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        stops: { orderBy: { sequence: 'asc' } },
        documents: true,
        invoice: true,
      },
    });
  }

  async create(data: any) {
    const count = await this.prisma.load.count();
    const loadNumber = `GE-${String(10001 + count).padStart(5, '0')}`;

    return this.prisma.load.create({
      data: {
        loadNumber,
        customerId: data.customerId,
        driverId: data.driverId || null,
        commodity: data.commodity,
        weight: data.weight,
        pieces: data.pieces,
        rate: data.rate,
        fuelSurcharge: data.fuelSurcharge || 0,
        detention: data.detention || 0,
        totalRate: data.rate + (data.fuelSurcharge || 0) + (data.detention || 0),
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

  async updateStatus(id: string, status: string) {
    return this.prisma.load.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async assignDriver(id: string, driverId: string) {
    return this.prisma.load.update({
      where: { id },
      data: {
        driverId,
        status: 'ASSIGNED',
      },
      include: {
        customer: { select: { id: true, name: true } },
        driver: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        stops: true,
      },
    });
  }
}