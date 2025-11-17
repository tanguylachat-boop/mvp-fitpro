import { Controller, Get, Post, Body, Param, Delete, UseGuards, Headers, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';
import { SubscriptionsService } from './subscriptions.service';
import { StripeService } from './stripe.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private subscriptionsService: SubscriptionsService,
    private stripeService: StripeService,
  ) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MEMBER')
  createCheckout(
    @CurrentUser('sub') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() createCheckoutDto: CreateCheckoutDto,
  ) {
    return this.subscriptionsService.createCheckoutSession(
      userId,
      tenantId,
      createCheckoutDto.planId,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll(@CurrentUser('tenantId') tenantId: string) {
    return this.subscriptionsService.findAll(tenantId);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMySubscriptions(
    @CurrentUser('sub') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.subscriptionsService.findUserSubscriptions(userId, tenantId);
  }

  @Get('revenue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getRevenue(@CurrentUser('tenantId') tenantId: string) {
    return this.subscriptionsService.getMonthlyRevenue(tenantId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('MEMBER', 'ADMIN')
  cancel(
    @CurrentUser('sub') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.subscriptionsService.cancelSubscription(userId, tenantId, id);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    try {
      const event = this.stripeService.constructWebhookEvent(
        request.rawBody,
        signature,
      );

      await this.subscriptionsService.handleWebhook(event);

      return { received: true };
    } catch (err) {
      console.error('Webhook error:', err.message);
      throw err;
    }
  }
}
