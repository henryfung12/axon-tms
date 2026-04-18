import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { TenantsService } from '../../modules/tenants/tenants.service';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tenantId: string;
  tenantSlug: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly tenantsService: TenantsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: JwtPayload) {
    // Defend against old tokens issued before multi-tenant.
    if (!payload.tenantId) {
      throw new UnauthorizedException('Token missing tenantId — please log in again');
    }

    // Is the tenant still active? Axon staff may have suspended it.
    // Uses raw prisma (via TenantsService), not scoped — the interceptor
    // hasn't had a chance to set ALS context yet at this stage of the request.
    const tenant = await this.tenantsService.findById(payload.tenantId);
    if (!tenant.isActive) {
      throw new ForbiddenException('This tenant is currently suspended');
    }

    // Attach the payload to `request.user`. The TenantContextInterceptor
    // reads `request.user.tenantId` to set up AsyncLocalStorage for the
    // handler (where scoped Prisma queries happen).
    return payload;
  }
}