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
import { LoadsService } from './loads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Loads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loads')
export class LoadsController {
  constructor(private readonly loadsService: LoadsService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    return this.loadsService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loadsService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.loadsService.create(body);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.loadsService.updateStatus(id, status);
  }

  @Patch(':id/assign')
  assignDriver(@Param('id') id: string, @Body('driverId') driverId: string) {
    return this.loadsService.assignDriver(id, driverId);
  }
}