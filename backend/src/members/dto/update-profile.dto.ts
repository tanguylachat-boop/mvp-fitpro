import { IsNumber, IsEnum, IsOptional, IsString, Min, Max } from 'class-validator';

export class UpdateProfileDto {
  @IsNumber()
  @IsOptional()
  @Min(100)
  @Max(250)
  height?: number; // in cm

  @IsNumber()
  @IsOptional()
  @Min(30)
  @Max(300)
  weight?: number; // in kg

  @IsNumber()
  @IsOptional()
  @Min(13)
  @Max(120)
  age?: number;

  @IsEnum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
  @IsOptional()
  fitnessLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

  @IsEnum(['WEIGHT_LOSS', 'MUSCLE_GAIN', 'GENERAL_FITNESS', 'STRENGTH', 'ENDURANCE'])
  @IsOptional()
  fitnessGoal?: 'WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'GENERAL_FITNESS' | 'STRENGTH' | 'ENDURANCE';

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(7)
  workoutsPerWeek?: number;

  @IsString()
  @IsOptional()
  medicalNotes?: string;
}
