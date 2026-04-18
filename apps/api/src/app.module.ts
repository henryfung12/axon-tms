import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { LoadsModule } from './modules/loads/loads.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { CustomersModule } from './modules/customers/customers.module';
import { CarriersModule } from './modules/carriers/carriers.module';
import { BrokerLoadsModule } from './modules/broker-loads/broker-loads.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { AdminModule } from './modules/admin/admin.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { TenantModule } from './common/tenant/tenant.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    ThrottlerModule.forRoot([
      { ttl: 60000, limit: 100 },
    ]),
    TenantModule,      // global AsyncLocalStorage for per-request tenant scoping
    PrismaModule,
    TenantsModule,     // the Tenant CRUD service (lookup by slug, etc.)
    AuthModule,
    UsersModule,
    LoadsModule,
    DriversModule,
    CustomersModule,
    CarriersModule,
    BrokerLoadsModule,
    DocumentsModule,
    AdminModule,       // AXON_STAFF-only cross-tenant admin routes
  ],
})
export class AppModule {}