import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async createCheckoutSession(params: {
    customerId?: string;
    customerEmail: string;
    planName: string;
    priceAmount: number; // in cents
    priceInterval: 'month' | 'year';
    successUrl: string;
    cancelUrl: string;
    metadata: Record<string, string>;
  }) {
    const { customerId, customerEmail, planName, priceAmount, priceInterval, successUrl, cancelUrl, metadata } = params;

    // Create or retrieve customer
    let customer: Stripe.Customer;
    if (customerId) {
      customer = await this.stripe.customers.retrieve(customerId) as Stripe.Customer;
    } else {
      customer = await this.stripe.customers.create({
        email: customerEmail,
        metadata: {
          userId: metadata.userId,
          tenantId: metadata.tenantId,
        },
      });
    }

    // Create checkout session
    const session = await this.stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planName,
            },
            recurring: {
              interval: priceInterval,
            },
            unit_amount: priceAmount,
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });

    return session;
  }

  async cancelSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.cancel(subscriptionId);
  }

  async getSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }

  constructWebhookEvent(payload: Buffer, signature: string) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}
