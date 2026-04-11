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
import { CarriersService } from './carriers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Carriers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('carriers')
export class CarriersController {
  constructor(private readonly carriersService: CarriersService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    return this.carriersService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carriersService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.carriersService.create(body);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.carriersService.updateStatus(id, status);
  }

  @Patch(':id/rmis-verify')
  markRmisVerified(@Param('id') id: string) {
    return this.carriersService.markRmisVerified(id);
  }
}