import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AxonStaffGuard } from '../../common/guards/axon-staff.guard';

@Module({
  controllers: [AdminController],
  providers: [AdminService, AxonStaffGuard],
})
export class AdminModule {}