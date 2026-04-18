import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AxonStaffGuard } from '../../common/guards/axon-staff.guard';
import { AdminService } from './admin.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/tenants')
@UseGuards(AuthGuard('jwt'), AxonStaffGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get()
  listTenants() {
    return this.admin.listTenants();
  }

  @Get(':id')
  getTenant(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.admin.getTenant(id);
  }

  @Post()
  createTenant(@Body() dto: CreateTenantDto) {
    return this.admin.createTenant(dto);
  }

  @Patch(':id/suspend')
  suspend(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.admin.setActive(id, false);
  }

  @Patch(':id/activate')
  activate(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.admin.setActive(id, true);
  }
}