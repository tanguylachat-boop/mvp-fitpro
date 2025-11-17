import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class MembershipsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createPlanDto: CreatePlanDto) {
    return this.prisma.membershipPlan.create({
      data: {
        ...createPlanDto,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, activeOnly = false) {
    return this.prisma.membershipPlan.findMany({
      where: {
        tenantId,
        ...(activeOnly && { isActive: true }),
      },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
      orderBy: {
        price: 'asc',
      },
    });
  }

  async findOne(id: string, tenantId: string) {
    const plan = await this.prisma.membershipPlan.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        subscriptions: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Membership plan not found');
    }

    return plan;
  }

  async update(id: string, tenantId: string, updatePlanDto: UpdatePlanDto) {
    // Verify plan belongs to tenant
    const plan = await this.prisma.membershipPlan.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!plan) {
      throw new NotFoundException('Membership plan not found');
    }

    return this.prisma.membershipPlan.update({
      where: { id },
      data: updatePlanDto,
    });
  }

  async remove(id: string, tenantId: string) {
    // Verify plan belongs to tenant
    const plan = await this.prisma.membershipPlan.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!plan) {
      throw new NotFoundException('Membership plan not found');
    }

    // Check if plan has active subscriptions
    const activeSubscriptions = await this.prisma.subscription.count({
      where: {
        planId: id,
        status: 'ACTIVE',
      },
    });

    if (activeSubscriptions > 0) {
      throw new ForbiddenException(
        'Cannot delete plan with active subscriptions. Consider deactivating it instead.',
      );
    }

    return this.prisma.membershipPlan.delete({
      where: { id },
    });
  }
}
