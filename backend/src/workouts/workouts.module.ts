import { Module } from '@nestjs/common';
import { WorkoutsController } from './workouts.controller';
import { WorkoutsService } from './workouts.service';
import { WorkoutGeneratorService } from './workout-generator.service';
import { PrismaService } from '../common/services/prisma.service';

@Module({
  controllers: [WorkoutsController],
  providers: [WorkoutsService, WorkoutGeneratorService, PrismaService],
  exports: [WorkoutsService],
})
export class WorkoutsModule {}
