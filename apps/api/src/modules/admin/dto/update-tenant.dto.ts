import { IsOptional, IsString, IsEnum, IsUrl, MinLength } from 'class-validator';
import { TenantPlan } from '@prisma/client';

// Every field optional — partial updates only.
// `slug` is intentionally NOT editable: it controls the subdomain and DNS, and
// changing it would break every existing user bookmark / SSO redirect.
export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  companyName?: string;

  @IsOptional()
  @IsEnum(TenantPlan)
  plan?: TenantPlan;

  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, {
    message: 'logoUrl must be a valid http(s) URL',
  })
  logoUrl?: string | null;
}