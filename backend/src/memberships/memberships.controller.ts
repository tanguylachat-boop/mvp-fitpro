import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('memberships')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembershipsController {
  constructor(private membershipsService: MembershipsService) {}

  @Post()
  @Roles('ADMIN')
  create(
    @CurrentUser('tenantId') tenantId: string,
    @Body() createPlanDto: CreatePlanDto,
  ) {
    return this.membershipsService.create(tenantId, createPlanDto);
  }

  @Get()
  findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.membershipsService.findAll(tenantId, activeOnly === 'true');
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.membershipsService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() updatePlanDto: UpdatePlanDto,
  ) {
    return this.membershipsService.update(id, tenantId, updatePlanDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.membershipsService.remove(id, tenantId);
  }
}
