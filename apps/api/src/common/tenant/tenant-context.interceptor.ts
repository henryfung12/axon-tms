import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContextService } from './tenant-context.service';

/**
 * Wraps every request in an AsyncLocalStorage scope so downstream code
 * (Prisma extension, services) can read the current tenantId via
 * TenantContextService.getTenantId().
 *
 * Reads tenantId from either:
 *   1. request.user.tenantId — set by JwtStrategy.validate() for authenticated routes
 *   2. the `X-Tenant-Slug` header — for unauthenticated routes like /auth/login
 *      (those typically don't query tenant-scoped tables, so slug is informational)
 *
 * Runs at APP_INTERCEPTOR scope so it wraps EVERY request. The actual handler
 * runs inside the als.run() callback, so any await chain from the handler
 * shares the same AsyncLocalStorage store.
 */
@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(private readonly tenantCtx: TenantContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const tenantId: string | undefined = req.user?.tenantId;
    const userId: string | undefined = req.user?.sub;

    // Always run inside an als scope so the Prisma extension has somewhere
    // to find (or not find) tenantId. If tenantId is undefined (e.g. /auth/login,
    // which doesn't query tenant-scoped tables), the extension will throw only
    // if someone actually attempts a scoped query.
    return new Observable((subscriber) => {
      this.tenantCtx.run({ tenantId, userId }, () => {
        next.handle().subscribe({
          next: (v) => subscriber.next(v),
          error: (e) => subscriber.error(e),
          complete: () => subscriber.complete(),
        });
      });
    });
  }
}