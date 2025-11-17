import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(['ADMIN', 'MEMBER'])
  role: 'ADMIN' | 'MEMBER';

  @IsString()
  @IsOptional()
  tenantId?: string; // Required for MEMBER, optional for ADMIN (will create tenant)

  // For ADMIN registration - creates a new tenant
  @IsString()
  @IsOptional()
  tenantName?: string;

  @IsString()
  @IsOptional()
  tenantSlug?: string;
}
