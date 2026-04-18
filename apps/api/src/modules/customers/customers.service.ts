import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.scoped.customer.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async create(data: any) {
    // `tenantId` is injected by the scoped extension at runtime.
    // The `as any` silences TS which still expects tenantId/tenant on the input type.
    return this.prisma.scoped.customer.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        paymentTerms: data.paymentTerms || 30,
      } as any,
    });
  }
}