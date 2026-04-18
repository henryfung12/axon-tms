import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { TenantContextService } from '../../common/tenant/tenant-context.service';

/**
 * Guard that gates admin routes to AXON_STAFF users AND enables cross-tenant
 * access by flipping the tenant context into "unsafe" mode. The Prisma
 * scoped extension detects this flag and skips tenantId injection, letting
 * admin services query across all tenants.
 *
 * Use alongside JwtAuthGuard:
 *   @UseGuards(JwtAuthGuard, AxonStaffGuard)
 */
@Injectable()
export class AxonStaffGuard implements CanActivate {
  constructor(private readonly tenantCtx: TenantContextService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user || user.role !== 'AXON_STAFF') {
      throw new ForbiddenException('Axon staff access required');
    }

    // Flip the current ALS scope into unsafe/cross-tenant mode.
    // The TenantContextInterceptor already wrapped this request in an ALS
    // scope; we just set the unsafe flag on its store.
    this.tenantCtx.enableUnsafe();

    return true;
  }
}