import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { StripeService } from './stripe.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SubscriptionsService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private configService: ConfigService,
  ) {}

  async createCheckoutSession(userId: string, tenantId: string, planId: string) {
    // Get user info
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get plan info
    const plan = await this.prisma.membershipPlan.findFirst({
      where: {
        id: planId,
        tenantId,
        isActive: true,
      },
    });

    if (!plan) {
      throw new NotFoundException('Membership plan not found or inactive');
    }

    // Check if user already has an active subscription
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        tenantId,
        status: 'ACTIVE',
      },
    });

    if (existingSubscription) {
      throw new BadRequestException('User already has an active subscription');
    }

    // Get existing Stripe customer ID if any
    const existingStripeSubscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    // Create Stripe checkout session
    const session = await this.stripeService.createCheckoutSession({
      customerId: existingStripeSubscription?.stripeCustomerId,
      customerEmail: user.email,
      planName: plan.name,
      priceAmount: plan.price,
      priceInterval: plan.interval === 'MONTHLY' ? 'month' : 'year',
      successUrl: `${frontendUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${frontendUrl}/memberships`,
      metadata: {
        userId,
        tenantId,
        planId,
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  async findAll(tenantId: string) {
    return this.prisma.subscription.findMany({
      where: {
        tenantId,
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
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findUserSubscriptions(userId: string, tenantId: string) {
    return this.prisma.subscription.findMany({
      where: {
        userId,
        tenantId,
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async cancelSubscription(userId: string, tenantId: string, subscriptionId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId,
        tenantId,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (!subscription.stripeSubscriptionId) {
      throw new BadRequestException('No Stripe subscription found');
    }

    // Cancel in Stripe
    await this.stripeService.cancelSubscription(subscription.stripeSubscriptionId);

    // Update in database
    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        cancelAtPeriodEnd: true,
      },
    });
  }

  async handleWebhook(event: any) {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleCheckoutCompleted(session: any) {
    const { userId, tenantId, planId } = session.metadata;

    // Create subscription in database
    await this.prisma.subscription.create({
      data: {
        userId,
        tenantId,
        planId,
        stripeSubscriptionId: session.subscription,
        stripeCustomerId: session.customer,
        status: 'ACTIVE',
        currentPeriodStart: new Date(session.subscription_start * 1000),
        currentPeriodEnd: new Date(session.subscription_end * 1000),
      },
    });

    console.log(`✅ Subscription created for user ${userId}`);
  }

  private async handleSubscriptionUpdated(subscription: any) {
    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (existingSubscription) {
      await this.prisma.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: subscription.status.toUpperCase(),
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      });

      console.log(`✅ Subscription updated: ${subscription.id}`);
    }
  }

  private async handleSubscriptionDeleted(subscription: any) {
    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: 'CANCELED',
      },
    });

    console.log(`✅ Subscription canceled: ${subscription.id}`);
  }

  private async handlePaymentSucceeded(invoice: any) {
    console.log(`✅ Payment succeeded for subscription: ${invoice.subscription}`);
  }

  private async handlePaymentFailed(invoice: any) {
    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: invoice.subscription },
      data: {
        status: 'PAST_DUE',
      },
    });

    console.log(`⚠️ Payment failed for subscription: ${invoice.subscription}`);
  }

  async getMonthlyRevenue(tenantId: string) {
    const activeSubscriptions = await this.prisma.subscription.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
      },
      include: {
        plan: true,
      },
    });

    const monthlyRevenue = activeSubscriptions.reduce((total, sub) => {
      const amount = sub.plan.interval === 'MONTHLY' ? sub.plan.price : sub.plan.price / 12;
      return total + amount;
    }, 0);

    return {
      monthlyRevenue: Math.round(monthlyRevenue),
      activeSubscriptions: activeSubscriptions.length,
      subscriptions: activeSubscriptions,
    };
  }
}
