import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { WorkoutGeneratorService } from './workout-generator.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class WorkoutsService {
  constructor(
    private prisma: PrismaService,
    private workoutGenerator: WorkoutGeneratorService,
  ) {}

  async generatePlan(userId: string, tenantId: string) {
    // Get user profile
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
        role: 'MEMBER',
      },
      include: {
        memberProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.memberProfile) {
      throw new ForbiddenException('Please complete your profile first');
    }

    // Check if user already has a workout plan
    const existingPlan = await this.prisma.workoutPlan.findFirst({
      where: {
        userId,
        tenantId,
      },
    });

    // Delete existing plan if any
    if (existingPlan) {
      await this.prisma.workoutPlan.delete({
        where: { id: existingPlan.id },
      });
    }

    // Generate new plan
    const generatedPlan = this.workoutGenerator.generateWorkoutPlan(user.memberProfile);

    // Save to database
    const plan = await this.prisma.workoutPlan.create({
      data: {
        userId,
        tenantId,
        name: generatedPlan.name,
        description: generatedPlan.description,
        weeks: generatedPlan.weeks,
      sessions: {
  // @ts-ignore - Prisma types mismatch in build environment
  create: generatedPlan.sessions.map((session) => ({
    dayNumber: session.dayNumber,
    name: session.name,
    description: session.description,
    exercises: session.exercises,
  })),
},

      include: {
        sessions: {
          orderBy: {
            dayNumber: 'asc',
          },
        },
      },
    });

    return plan;
  }

  async getMyPlan(userId: string, tenantId: string) {
    const plan = await this.prisma.workoutPlan.findFirst({
      where: {
        userId,
        tenantId,
      },
      include: {
        sessions: {
          orderBy: {
            dayNumber: 'asc',
          },
        },
      },
     };

    if (!plan) {
      throw new NotFoundException('No workout plan found. Generate one first.');
    }

    return plan;
  }

  async getUserPlan(memberId: string, tenantId: string) {
    const plan = await this.prisma.workoutPlan.findFirst({
      where: {
        userId: memberId,
        tenantId,
      },
      include: {
        sessions: {
          orderBy: {
            dayNumber: 'asc',
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('No workout plan found for this member');
    }

    return plan;
  }

  async deletePlan(userId: string, tenantId: string) {
    const plan = await this.prisma.workoutPlan.findFirst({
      where: {
        userId,
        tenantId,
      },
    });

    if (!plan) {
      throw new NotFoundException('No workout plan found');
    }

    await this.prisma.workoutPlan.delete({
      where: { id: plan.id },
    });

    return { message: 'Workout plan deleted successfully' };
  }
}
