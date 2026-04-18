import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TenantContextService } from './tenant-context.service';
import { TenantContextInterceptor } from './tenant-context.interceptor';

/**
 * Global module providing tenant-scoping infrastructure.
 * - TenantContextService: the AsyncLocalStorage wrapper
 * - TenantContextInterceptor: registered as APP_INTERCEPTOR so it wraps
 *   every request in an ALS scope, making tenantId available to Prisma.
 */
@Global()
@Module({
  providers: [
    TenantContextService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantContextInterceptor,
    },
  ],
  exports: [TenantContextService],
})
export class TenantModule {}