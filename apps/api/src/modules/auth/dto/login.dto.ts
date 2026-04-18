import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'dispatch@axontms.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'dispatch123' })
  @IsString()
  @MinLength(6)
  password: string;

  // Optional in the body — if missing, the server falls back to the
  // X-Tenant-Slug header set by the frontend from the subdomain.
  @ApiPropertyOptional({ example: 'axon-demo', description: 'Tenant slug (optional if sent via X-Tenant-Slug header)' })
  @IsString()
  @IsOptional()
  tenantSlug?: string;
}