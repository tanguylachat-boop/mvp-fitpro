import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/services/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, role, tenantId, tenantName, tenantSlug } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    let finalTenantId = tenantId;

    // If registering as ADMIN without tenantId, create a new tenant
    if (role === 'ADMIN' && !tenantId) {
      if (!tenantName || !tenantSlug) {
        throw new BadRequestException('Tenant name and slug are required for admin registration');
      }

      // Check if slug is unique
      const existingTenant = await this.prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (existingTenant) {
        throw new ConflictException('Tenant with this slug already exists');
      }

      // Create the tenant
      const newTenant = await this.prisma.tenant.create({
        data: {
          name: tenantName,
          slug: tenantSlug,
          email: email,
        },
      });

      finalTenantId = newTenant.id;
    }

    // For MEMBER, tenantId is required
    if (role === 'MEMBER' && !finalTenantId) {
      throw new BadRequestException('Tenant ID is required for member registration');
    }

    // Verify tenant exists
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: finalTenantId },
    });

    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        tenantId: finalTenantId,
      },
      include: {
        tenant: true,
      },
    });

    // Create MemberProfile if role is MEMBER
    if (role === 'MEMBER') {
      await this.prisma.memberProfile.create({
        data: {
          userId: user.id,
        },
      });

      // Create AccessBadge for the member
      await this.prisma.accessBadge.create({
        data: {
          userId: user.id,
          token: this.generateAccessToken(),
        },
      });
    }

    // Generate JWT token
    const token = this.generateJwtToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenant: user.tenant,
      },
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user with tenant
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        tenant: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateJwtToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenant: user.tenant,
      },
      token,
    };
  }

  private generateJwtToken(user: any): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    return this.jwtService.sign(payload);
  }

  private generateAccessToken(): string {
    // Generate a random 32-character token for QR code
    return Array.from({ length: 32 }, () =>
      Math.random().toString(36).charAt(2)
    ).join('');
  }
}
