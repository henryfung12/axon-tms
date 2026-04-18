import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

interface TenantContext {
  tenantId?: string;
  userId?: string;
  // When true, Prisma queries skip the auto tenantId filter.
  // Use ONLY for Axon-staff admin operations (cross-tenant reads/writes).
  unsafe?: boolean;
}

@Injectable()
export class TenantContextService {
  private readonly als = new AsyncLocalStorage<TenantContext>();

  /** Run `fn` inside a tenant context. All Prisma queries during `fn` auto-scope. */
  run<T>(ctx: TenantContext, fn: () => T): T {
    return this.als.run(ctx, fn);
  }

  /** Get the current tenantId. Returns undefined if called outside a request. */
  getTenantId(): string | undefined {
    return this.als.getStore()?.tenantId;
  }

  /** Get the current userId. Returns undefined if called outside a request. */
  getUserId(): string | undefined {
    return this.als.getStore()?.userId;
  }

  /** Whether the current context is in "unsafe" / cross-tenant mode. */
  isUnsafe(): boolean {
    return this.als.getStore()?.unsafe === true;
  }

  /**
   * Flip the CURRENT als scope into unsafe mode. Mutates the existing store
   * so the change is visible for the rest of the request.
   *
   * Designed for guards: a guard can't wrap the handler in a callback, but it
   * can flip this flag after verifying the user is AXON_STAFF. Returns false
   * (does nothing) if called outside an als scope — which shouldn't happen
   * because TenantContextInterceptor wraps every request.
   *
   * Use ONLY from AxonStaffGuard. Never from tenant-user code paths.
   */
  enableUnsafe(): boolean {
    const store = this.als.getStore();
    if (!store) return false;
    store.unsafe = true;
    return true;
  }

  /**
   * Escape hatch — runs `fn` with auto-scoping DISABLED in a fresh scope.
   * Use for one-off admin operations outside a request (e.g. from a cron job
   * or a script). Prefer `enableUnsafe()` inside a normal request.
   */
  runUnsafe<T>(fn: () => T): T {
    const existing = this.als.getStore() ?? {};
    return this.als.run({ ...existing, unsafe: true }, fn);
  }
}