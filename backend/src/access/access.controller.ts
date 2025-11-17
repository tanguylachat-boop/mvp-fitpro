import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { AccessService } from './access.service';
import { CheckinDto } from './dto/checkin.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('access')
export class AccessController {
  constructor(private accessService: AccessService) {}

  @Get('badge')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MEMBER')
  getBadge(
    @CurrentUser('sub') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.accessService.getBadge(userId, tenantId);
  }

  @Post('checkin')
  checkin(@Body() checkinDto: CheckinDto) {
    return this.accessService.checkin(checkinDto.token);
  }

  @Get('checkins')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getCheckins(
    @CurrentUser('tenantId') tenantId: string,
    @Query('limit') limit?: string,
  ) {
    return this.accessService.getCheckins(tenantId, limit ? parseInt(limit) : 50);
  }

  @Get('checkins/my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MEMBER')
  getMyCheckins(
    @CurrentUser('sub') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Query('limit') limit?: string,
  ) {
    return this.accessService.getUserCheckins(userId, tenantId, limit ? parseInt(limit) : 30);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getStats(@CurrentUser('tenantId') tenantId: string) {
    return this.accessService.getCheckinStats(tenantId);
  }

  @Post('badge/regenerate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MEMBER', 'ADMIN')
  regenerateBadge(
    @CurrentUser('sub') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.accessService.regenerateBadge(userId, tenantId);
  }
}
