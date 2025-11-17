import { IsString, IsNumber, IsEnum, IsArray, IsOptional, IsBoolean, Min } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number; // in cents

  @IsEnum(['MONTHLY', 'YEARLY'])
  interval: 'MONTHLY' | 'YEARLY';

  @IsArray()
  @IsString({ each: true })
  features: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
