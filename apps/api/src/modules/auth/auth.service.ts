import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';

interface JwtPayload {
  sub: string;       // user id
  email: string;
  role: string;
  tenantId: string;
  tenantSlug: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly tenantsService: TenantsService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ── Login ──────────────────────────────────────────────────────────────

  async login(tenantSlug: string, email: string, password: string) {
    if (!tenantSlug) {
      throw new UnauthorizedException('Tenant is required');
    }

    // 1. Resolve tenant from slug. Throws 404/403 if unknown or suspended.
    const tenant = await this.tenantsService.findActiveBySlug(tenantSlug);

    // 2. Look up user inside this tenant only.
    const user = await this.usersService.findByEmail(tenant.id, email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3. Verify password.
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 4. Issue tokens with tenantId baked in.
    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role,
      tenant.id,
      tenant.slug,
    );
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      tenant: {
        id: tenant.id,
        slug: tenant.slug,
        companyName: tenant.companyName,
        logoUrl: tenant.logoUrl,
        primaryColor: tenant.primaryColor,
        plan: tenant.plan,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  // ── Refresh token ──────────────────────────────────────────────────────

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Is the refresh token still in our DB and not expired?
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired — please log in again');
    }

    // Is the tenant still active? (Axon staff may have suspended them.)
    const tenant = await this.tenantsService.findById(payload.tenantId);
    if (!tenant.isActive) {
      throw new ForbiddenException('This tenant is currently suspended');
    }

    const accessToken = await this.generateAccessToken(
      stored.user.id,
      stored.user.email,
      stored.user.role,
      payload.tenantId,
      payload.tenantSlug,
    );
    return { accessToken };
  }

  // ── Logout ─────────────────────────────────────────────────────────────

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  // ── Get current user + tenant ──────────────────────────────────────────

  async getMe(userId: string, tenantId: string) {
    const user = await this.usersService.findById(userId);
    const tenant = await this.tenantsService.findById(tenantId);

    // findById returns minimal fields; fetch the full tenant row for branding.
    const fullTenant = await this.prisma.tenant.findUnique({
      where: { id: tenant.id },
      select: {
        id: true,
        slug: true,
        companyName: true,
        logoUrl: true,
        primaryColor: true,
        plan: true,
        cargoWiseEnabled: true,
        quickbooksEnabled: true,
        netsuiteEnabled: true,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
      },
      tenant: fullTenant,
    };
  }

  // ── Create user (admin only, eventually; used by seed + Axon admin) ────

  async createUser(
    tenantId: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: string = 'DISPATCHER',
  ) {
    const existing = await this.usersService.findByEmail(tenantId, email);
    if (existing) throw new ConflictException('Email already in use for this tenant');

    const passwordHash = await bcrypt.hash(password, 12);

    return this.prisma.user.create({
      data: {
        tenantId,
        email,
        passwordHash,
        firstName,
        lastName,
        role: role as any,
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, tenantId: true },
    });
  }

  // ── Token helpers ──────────────────────────────────────────────────────

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
    tenantId: string,
    tenantSlug: string,
  ) {
    const payload: JwtPayload = { sub: userId, email, role, tenantId, tenantSlug };

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(userId, email, role, tenantId, tenantSlug),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN') || '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }

  private generateAccessToken(
    userId: string,
    email: string,
    role: string,
    tenantId: string,
    tenantSlug: string,
  ) {
    const payload: JwtPayload = { sub: userId, email, role, tenantId, tenantSlug };
    return this.jwtService.signAsync(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRES_IN') || '15m',
    });
  }

  private async saveRefreshToken(userId: string, token: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.prisma.refreshToken.create({
      data: { token, userId, expiresAt },
    });
  }
}