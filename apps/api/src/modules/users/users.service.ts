import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find user by email within a specific tenant.
   * Called from AuthService.login — BEFORE tenant context is set on the
   * request, so we use the raw prisma client (not `scoped`).
   */
  async findByEmail(tenantId: string, email: string) {
    return this.prisma.user.findFirst({
      where: { tenantId, email },
    });
  }

  /**
   * Find user by id. Used by JWT strategy on every authenticated request —
   * by then the tenant context IS set, so we use `scoped` for defense in depth.
   */
  async findById(id: string) {
    const user = await this.prisma.scoped.user.findFirst({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /** List all users in the current tenant. */
  async findAll() {
    return this.prisma.scoped.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }
}