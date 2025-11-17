import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.user.findMany({
      where: {
        tenantId,
        role: 'MEMBER',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        memberProfile: true,
        subscriptions: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            plan: true,
          },
        },
        accessBadge: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, tenantId: string) {
    const member = await this.prisma.user.findFirst({
      where: {
        id,
        tenantId,
        role: 'MEMBER',
      },
      include: {
        memberProfile: true,
        subscriptions: {
          include: {
            plan: true,
          },
        },
        accessBadge: true,
        workoutPlans: {
          include: {
            sessions: true,
          },
        },
        checkins: {
          orderBy: {
            checkedAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  async getProfile(userId: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
      },
      include: {
        memberProfile: true,
        tenant: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, tenantId: string, updateProfileDto: UpdateProfileDto) {
    // Verify user belongs to tenant
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
      },
    });

    if (!user) {
      throw new ForbiddenException('Not authorized');
    }

    // Update or create member profile
    const profile = await this.prisma.memberProfile.upsert({
      where: {
        userId,
      },
      update: updateProfileDto,
      create: {
        userId,
        ...updateProfileDto,
      },
    });

    return profile;
  }

  async getMemberStats(tenantId: string) {
    const totalMembers = await this.prisma.user.count({
      where: {
        tenantId,
        role: 'MEMBER',
      },
    });

    const activeSubscriptions = await this.prisma.subscription.count({
      where: {
        tenantId,
        status: 'ACTIVE',
      },
    });

    const todayCheckins = await this.prisma.checkin.count({
      where: {
        tenantId,
        checkedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    const recentCheckins = await this.prisma.checkin.findMany({
      where: {
        tenantId,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        checkedAt: 'desc',
      },
      take: 10,
    });

    return {
      totalMembers,
      activeSubscriptions,
      todayCheckins,
      recentCheckins,
    };
  }
}
