import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { StripeService } from './stripe.service';
import { PrismaService } from '../common/services/prisma.service';

@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, StripeService, PrismaService],
  exports: [SubscriptionsService, StripeService],
})
export class SubscriptionsModule {}
