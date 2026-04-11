import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { LoadsModule } from './modules/loads/loads.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { CustomersModule } from './modules/customers/customers.module';
import { CarriersModule } from './modules/carriers/carriers.module';
import { BrokerLoadsModule } from './modules/broker-loads/broker-loads.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { PrismaModule } from './common/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    LoadsModule,
    DriversModule,
    CustomersModule,
    CarriersModule,
    BrokerLoadsModule,
    DocumentsModule,
  ],
})
export class AppModule {}