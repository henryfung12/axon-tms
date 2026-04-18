import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CarriersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(status?: string) {
    return this.prisma.scoped.externalCarrier.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.scoped.externalCarrier.findFirst({
      where: { id },
      include: {
        brokerLoads: {
          include: {
            customer: { select: { id: true, name: true } },
            stops: { orderBy: { sequence: 'asc' } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async create(data: any) {
    return this.prisma.scoped.externalCarrier.create({
      data: {
        name: data.name,
        mcNumber: data.mcNumber,
        dotNumber: data.dotNumber,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        paymentTerms: data.paymentTerms || 30,
        preferredLanes: data.preferredLanes,
        notes: data.notes,
        insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : null,
        authorityExpiry: data.authorityExpiry ? new Date(data.authorityExpiry) : null,
      } as any,
    });
  }

  async updateStatus(id: string, status: string) {
    // Verify ownership within the current tenant before updating.
    const existing = await this.prisma.scoped.externalCarrier.findFirst({ where: { id } });
    if (!existing) return null;
    return this.prisma.externalCarrier.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async markRmisVerified(id: string) {
    const existing = await this.prisma.scoped.externalCarrier.findFirst({ where: { id } });
    if (!existing) return null;
    return this.prisma.externalCarrier.update({
      where: { id },
      data: {
        rmisVerifiedAt: new Date(),
        status: 'ACTIVE',
      },
    });
  }
}