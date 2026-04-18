import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Look up a tenant by slug (e.g. "axon-demo"). Throws 404 if not found. */
  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        companyName: true,
        logoUrl: true,
        primaryColor: true,
        isActive: true,
        plan: true,
        cargoWiseEnabled: true,
        quickbooksEnabled: true,
        netsuiteEnabled: true,
      },
    });
    if (!tenant) throw new NotFoundException(`Unknown tenant: ${slug}`);
    return tenant;
  }

  /** Same as findBySlug but also throws if the tenant is disabled. */
  async findActiveBySlug(slug: string) {
    const tenant = await this.findBySlug(slug);
    if (!tenant.isActive) {
      throw new ForbiddenException('This tenant is currently suspended');
    }
    return tenant;
  }

  /** Look up a tenant by id — used when refreshing tokens. */
  async findById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      select: { id: true, slug: true, isActive: true },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }
}