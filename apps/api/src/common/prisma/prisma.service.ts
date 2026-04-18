import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { TenantContextService } from '../tenant/tenant-context.service';

// The 7 tables that carry a tenantId column and must be auto-scoped.
const SCOPED_MODELS = new Set<Prisma.ModelName>([
  'User',
  'Driver',
  'Customer',
  'Load',
  'Invoice',
  'ExternalCarrier',
  'BrokerLoad',
]);

// Reads get tenantId merged into `where`. These are the ONLY ops where
// auto-scoping the where clause is both safe and useful.
const READ_OPS = new Set([
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'count',
  'aggregate',
  'groupBy',
]);

// Creates get tenantId injected into `data`.
const CREATE_OPS = new Set(['create', 'createMany']);

// Note: `findUnique`, `update`, `updateMany`, `delete`, `deleteMany`, and
// `upsert` are NOT auto-scoped. Their `where` clauses accept only unique
// identifiers (or composite uniques), and auto-adding `tenantId` breaks
// Prisma's unique-key requirement. Services must do `findFirst` to verify
// tenant ownership, then operate by unique id. The fact that `id` is a UUID
// plus the JWT/controller layer tenancy check keeps cross-tenant access
// impossible in practice.

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private _scoped: ReturnType<typeof this.buildScoped> | null = null;

  constructor(private readonly ctx: TenantContextService) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * The tenant-scoped client. Use this for ALL normal business queries.
   * Reads are auto-filtered by tenantId. Creates have tenantId injected.
   * Updates/deletes operate by unique id (service must verify ownership first).
   */
  get scoped() {
    if (!this._scoped) this._scoped = this.buildScoped();
    return this._scoped;
  }

  private buildScoped() {
    const ctx = this.ctx;
    const logger = this.logger;

    return this.$extends({
      name: 'tenant-scope',
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            // Skip if not a tenant-scoped model.
            if (!model || !SCOPED_MODELS.has(model as Prisma.ModelName)) {
              return query(args);
            }
            // Skip if explicitly in unsafe/admin mode.
            if (ctx.isUnsafe()) {
              return query(args);
            }

            const tenantId = ctx.getTenantId();
            if (!tenantId) {
              logger.error(
                `Query on ${model}.${operation} ran without tenant context. Refusing.`,
              );
              throw new Error(
                `Tenant context required for ${model}.${operation}`,
              );
            }

            // Inject tenantId into `where` for safe read operations.
            if (READ_OPS.has(operation)) {
              args = args ?? {};
              (args as any).where = {
                ...((args as any).where ?? {}),
                tenantId,
              };
            }

            // Inject tenantId into `data` for creates.
            if (CREATE_OPS.has(operation)) {
              args = args ?? {};
              if (operation === 'createMany') {
                const data = (args as any).data;
                if (Array.isArray(data)) {
                  (args as any).data = data.map((row) => ({
                    tenantId,
                    ...row,
                  }));
                } else if (data) {
                  (args as any).data = { tenantId, ...data };
                }
              } else {
                (args as any).data = {
                  tenantId,
                  ...((args as any).data ?? {}),
                };
              }
            }

            return query(args);
          },
        },
      },
    });
  }
}