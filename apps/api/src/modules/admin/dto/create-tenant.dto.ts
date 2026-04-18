import { IsString, IsOptional, IsEnum, Matches, MinLength } from 'class-validator';
import { TenantPlan } from '@prisma/client';

export class CreateTenantDto {
  // URL-safe slug: lowercase letters, digits, hyphens. Used as subdomain.
  @IsString()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase letters, digits, and hyphens (no leading/trailing/double hyphens)',
  })
  @MinLength(3)
  slug!: string;

  @IsString()
  @MinLength(2)
  companyName!: string;

  @IsOptional()
  @IsEnum(TenantPlan)
  plan?: TenantPlan;

  @IsOptional()
  @IsString()
  primaryColor?: string;

  // Optional: create an initial admin user for the new tenant.
  @IsOptional()
  @IsString()
  adminEmail?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  adminPassword?: string;

  @IsOptional()
  @IsString()
  adminFirstName?: string;

  @IsOptional()
  @IsString()
  adminLastName?: string;
}