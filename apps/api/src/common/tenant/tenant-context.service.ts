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
   * Escape hatch. Runs `fn` with auto-scoping DISABLED.
   * Use ONLY from Axon-staff admin code. Never from tenant-user code paths.
   */
  runUnsafe<T>(fn: () => T): T {
    const existing = this.als.getStore() ?? {};
    return this.als.run({ ...existing, unsafe: true }, fn);
  }
}