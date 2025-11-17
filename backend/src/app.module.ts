import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { MembersModule } from './members/members.module';
import { MembershipsModule } from './memberships/memberships.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AccessModule } from './access/access.module';
import { WorkoutsModule } from './workouts/workouts.module';
import { PrismaService } from './common/services/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    TenantsModule,
    MembersModule,
    MembershipsModule,
    SubscriptionsModule,
    AccessModule,
    WorkoutsModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
