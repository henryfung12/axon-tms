import { Module } from '@nestjs/common';
import { BrokerLoadsController } from './broker-loads.controller';
import { BrokerLoadsService } from './broker-loads.service';

@Module({
  controllers: [BrokerLoadsController],
  providers: [BrokerLoadsService],
  exports: [BrokerLoadsService],
})
export class BrokerLoadsModule {}