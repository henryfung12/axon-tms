import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContextService } from '../../common/tenant/tenant-context.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

/**
 * Cross-tenant service used only by AXON_STAFF via the AxonStaffGuard.
 *
 * IMPORTANT: This service calls the RAW prisma client (this.prisma) on purpose.
 * It needs to see all tenants, not just the staff user's own. We intentionally
 * do NOT use prisma.scoped here.
 */
@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantCtx: TenantContextService,
  ) {}

  async listTenants() {
    // Return every tenant with counts of users + loads for health visibility.
    return this.prisma.tenant.findMany({
      select: {
        id: true,
        slug: true,
        companyName: true,
        plan: true,
        isActive: true,
        primaryColor: true,
        logoUrl: true,
        cargoWiseEnabled: true,
        quickbooksEnabled: true,
        netsuiteEnabled: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
            loads: true,
            customers: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTenant(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            loads: true,
            customers: true,
            drivers: true,
            externalCarriers: true,
            brokerLoads: true,
          },
        },
      },
    });
    if (!tenant) throw new NotFoundException(`Tenant ${id} not found`);
    return tenant;
  }

  async createTenant(dto: CreateTenantDto) {
    // Reject duplicate slugs early — slug maps 1:1 to a subdomain.
    const existing = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException(`Tenant with slug "${dto.slug}" already exists`);
    }

    // If admin credentials are provided, create the tenant AND its first
    // admin user in a single transaction. Otherwise just the tenant.
    const hasAdmin = dto.adminEmail && dto.adminPassword;
    if (hasAdmin) {
      const passwordHash = await bcrypt.hash(dto.adminPassword!, 10);
      return this.prisma.$transaction(async (tx) => {
        const tenant = await tx.tenant.create({
          data: {
            slug: dto.slug,
            companyName: dto.companyName,
            plan: dto.plan ?? 'STARTER',
            primaryColor: dto.primaryColor ?? '#2563eb',
            isActive: true,
          },
        });
        await tx.user.create({
          data: {
            tenantId: tenant.id,
            email: dto.adminEmail!,
            passwordHash,
            role: 'SUPER_ADMIN',
            firstName: dto.adminFirstName ?? 'Admin',
            lastName: dto.adminLastName ?? 'User',
          },
        });
        this.logger.log(`Created tenant ${tenant.slug} with admin ${dto.adminEmail}`);
        return tenant;
      });
    }

    const tenant = await this.prisma.tenant.create({
      data: {
        slug: dto.slug,
        companyName: dto.companyName,
        plan: dto.plan ?? 'STARTER',
        primaryColor: dto.primaryColor ?? '#2563eb',
        isActive: true,
      },
    });
    this.logger.log(`Created tenant ${tenant.slug} (no initial admin)`);
    return tenant;
  }

  async setActive(id: string, isActive: boolean) {
    // Fetch first for a clean 404 vs letting Prisma throw P2025.
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException(`Tenant ${id} not found`);

    // Belt-and-suspenders: don't let someone accidentally suspend Axon itself.
    if (tenant.slug === 'axon-internal' && !isActive) {
      throw new ConflictException('Cannot suspend the axon-internal tenant');
    }

    const updated = await this.prisma.tenant.update({
      where: { id },
      data: { isActive },
    });
    this.logger.log(
      `${isActive ? 'Activated' : 'Suspended'} tenant ${tenant.slug}`,
    );
    return updated;
  }

  async updateTenant(id: string, data: {
    companyName?: string;
    plan?: string;
    primaryColor?: string;
    logoUrl?: string | null;
  }) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException(`Tenant ${id} not found`);

    // Only include keys the caller actually sent so Prisma doesn't overwrite
    // fields with undefined.
    const update: Record<string, unknown> = {};
    if (data.companyName !== undefined) update.companyName = data.companyName;
    if (data.plan !== undefined) update.plan = data.plan;
    if (data.primaryColor !== undefined) update.primaryColor = data.primaryColor;
    if (data.logoUrl !== undefined) update.logoUrl = data.logoUrl;

    const updated = await this.prisma.tenant.update({
      where: { id },
      data: update,
    });
    this.logger.log(`Updated tenant ${tenant.slug}: ${Object.keys(update).join(', ')}`);
    return updated;
  }

  async deleteTenant(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      select: { id: true, slug: true, companyName: true },
    });
    if (!tenant) throw new NotFoundException(`Tenant ${id} not found`);

    // Safety net: never allow the axon-internal tenant to be deleted.
    if (tenant.slug === 'axon-internal') {
      throw new ForbiddenException('Cannot delete the Axon Internal tenant');
    }

    // Schema has onDelete: Cascade on every child relation, so a single
    // delete cleans up users/loads/customers/invoices/drivers/etc automatically.
    await this.prisma.tenant.delete({ where: { id } });
    this.logger.warn(`DELETED tenant ${tenant.slug} (${tenant.companyName})`);
    return { id: tenant.id, slug: tenant.slug, deleted: true };
  }}