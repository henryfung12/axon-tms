import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BrokerLoadsService } from './broker-loads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Broker Loads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('broker-loads')
export class BrokerLoadsController {
  constructor(private readonly brokerLoadsService: BrokerLoadsService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    return this.brokerLoadsService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brokerLoadsService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.brokerLoadsService.create(body);
  }

  @Patch(':id/assign-carrier')
  assignCarrier(
    @Param('id') id: string,
    @Body('carrierId') carrierId: string,
    @Body('carrierRate') carrierRate: number,
  ) {
    return this.brokerLoadsService.assignCarrier(id, carrierId, carrierRate);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.brokerLoadsService.updateStatus(id, status);
  }
}