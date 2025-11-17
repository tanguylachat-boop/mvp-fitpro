import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('workouts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkoutsController {
  constructor(private workoutsService: WorkoutsService) {}

  @Post('generate')
  @Roles('MEMBER')
  generatePlan(
    @CurrentUser('sub') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.workoutsService.generatePlan(userId, tenantId);
  }

  @Get('my-plan')
  @Roles('MEMBER')
  getMyPlan(
    @CurrentUser('sub') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.workoutsService.getMyPlan(userId, tenantId);
  }

  @Get('member/:memberId')
  @Roles('ADMIN')
  getUserPlan(
    @Param('memberId') memberId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.workoutsService.getUserPlan(memberId, tenantId);
  }

  @Delete('my-plan')
  @Roles('MEMBER')
  deletePlan(
    @CurrentUser('sub') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.workoutsService.deletePlan(userId, tenantId);
  }
}
