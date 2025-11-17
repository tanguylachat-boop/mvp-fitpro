import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';

@Injectable()
export class AccessService {
  constructor(private prisma: PrismaService) {}

  async getBadge(userId: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
        role: 'MEMBER',
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const badge = await this.prisma.accessBadge.findUnique({
      where: { userId },
    });

    if (!badge) {
      throw new NotFoundException('Access badge not found');
    }

    // Check if user has active subscription
    const activeSubscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        tenantId,
        status: 'ACTIVE',
      },
    });

    return {
      ...badge,
      hasActiveSubscription: !!activeSubscription,
    };
  }

  async checkin(token: string) {
    // Find badge by token
    const badge = await this.prisma.accessBadge.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            tenant: true,
            subscriptions: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
      },
    });

    if (!badge) {
      throw new NotFoundException('Invalid access token');
    }

    if (!badge.isActive) {
      throw new ForbiddenException('Access badge is inactive');
    }

    // Check if user has active subscription
    if (badge.user.subscriptions.length === 0) {
      throw new ForbiddenException('No active subscription found');
    }

    // Create checkin record
    const checkin = await this.prisma.checkin.create({
      data: {
        userId: badge.userId,
        tenantId: badge.user.tenantId,
        badgeId: badge.id,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      message: `Welcome, ${badge.user.firstName}!`,
      checkin,
    };
  }

  async getCheckins(tenantId: string, limit = 50) {
    return this.prisma.checkin.findMany({
      where: { tenantId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        checkedAt: 'desc',
      },
      take: limit,
    });
  }

  async getUserCheckins(userId: string, tenantId: string, limit = 30) {
    return this.prisma.checkin.findMany({
      where: {
        userId,
        tenantId,
      },
      orderBy: {
        checkedAt: 'desc',
      },
      take: limit,
    });
  }

  async getCheckinStats(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCheckins = await this.prisma.checkin.count({
      where: {
        tenantId,
        checkedAt: {
          gte: today,
        },
      },
    });

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const weekCheckins = await this.prisma.checkin.count({
      where: {
        tenantId,
        checkedAt: {
          gte: last7Days,
        },
      },
    });

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const monthCheckins = await this.prisma.checkin.count({
      where: {
        tenantId,
        checkedAt: {
          gte: last30Days,
        },
      },
    });

    return {
      today: todayCheckins,
      last7Days: weekCheckins,
      last30Days: monthCheckins,
    };
  }

  async regenerateBadge(userId: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
        role: 'MEMBER',
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newToken = this.generateAccessToken();

    const badge = await this.prisma.accessBadge.update({
      where: { userId },
      data: {
        token: newToken,
      },
    });

    return badge;
  }

  private generateAccessToken(): string {
    return Array.from({ length: 32 }, () =>
      Math.random().toString(36).charAt(2)
    ).join('');
  }
}
