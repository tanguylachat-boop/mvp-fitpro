import { Controller, Get, Post, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { MembersService } from './members.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(private membersService: MembersService) {}

  @Get()
  @Roles('ADMIN')
  findAll(@CurrentUser('tenantId') tenantId: string) {
    return this.membersService.findAll(tenantId);
  }

  @Get('stats')
  @Roles('ADMIN')
  getStats(@CurrentUser('tenantId') tenantId: string) {
    return this.membersService.getMemberStats(tenantId);
  }

  @Get('profile')
  @Roles('MEMBER', 'ADMIN')
  getMyProfile(
    @CurrentUser('sub') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.membersService.getProfile(userId, tenantId);
  }

  @Patch('profile')
  @Roles('MEMBER')
  updateProfile(
    @CurrentUser('sub') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.membersService.updateProfile(userId, tenantId, updateProfileDto);
  }

  @Get(':id')
  @Roles('ADMIN')
  findOne(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.membersService.findOne(id, tenantId);
  }
}
