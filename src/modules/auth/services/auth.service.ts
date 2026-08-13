import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '@shared/database/prisma.service';
import {
  RegisterCustomerDto,
  LoginCustomerDto,
  RegisterCommerceDto,
  LoginCommerceDto,
  AuthResponseDto,
} from '../dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async registerCustomer(dto: RegisterCustomerDto, municipalityId: string): Promise<AuthResponseDto> {
    const existing = await this.prisma.customer.findUnique({
      where: { phone: dto.phone },
    });

    if (existing) {
      throw new BadRequestException('Customer with this phone already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const customer = await this.prisma.customer.create({
      data: {
        municipalityId,
        phone: dto.phone,
        email: dto.email,
        name: dto.name,
        preferredLanguage: dto.preferredLanguage || 'es',
        authToken: hashedPassword,
        isVerified: true,
      },
    });

    return this.generateTokens(customer.id, 'customer');
  }

  async loginCustomer(dto: LoginCustomerDto): Promise<AuthResponseDto> {
    const customer = await this.prisma.customer.findUnique({
      where: { phone: dto.phone },
    });

    if (!customer) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, customer.authToken || '');
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(customer.id, 'customer');
  }

  async registerCommerce(dto: RegisterCommerceDto, municipalityId: string): Promise<AuthResponseDto> {
    const existing = await this.prisma.commerce.findUnique({
      where: { whatsappNumber: dto.whatsappNumber },
    });

    if (existing) {
      throw new BadRequestException('Commerce with this WhatsApp number already exists');
    }

    const apiKey = this.generateApiKey();
    const apiKeyHash = await bcrypt.hash(dto.password, 10);

    const commerce = await this.prisma.commerce.create({
      data: {
        municipalityId,
        whatsappNumber: dto.whatsappNumber,
        name: dto.name,
        category: dto.category,
        description: dto.description,
        locationLatitude: dto.latitude,
        locationLongitude: dto.longitude,
        ownerName: dto.name,
        ownerPhone: dto.whatsappNumber,
        ownerEmail: dto.email,
        nit: dto.documentNumber,
        apiKey,
        apiKeyHash,
        isActive: true,
        isVerified: false,
      },
    });

    return this.generateTokens(commerce.id, 'commerce');
  }

  async loginCommerce(dto: LoginCommerceDto): Promise<AuthResponseDto> {
    const commerce = await this.prisma.commerce.findUnique({
      where: { whatsappNumber: dto.whatsappNumber },
    });

    if (!commerce) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (commerce.apiKeyHash) {
      const isPasswordValid = await bcrypt.compare(dto.password, commerce.apiKeyHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    if (!commerce.isActive) {
      throw new UnauthorizedException('Commerce account is inactive');
    }

    return this.generateTokens(commerce.id, 'commerce');
  }

  async validateUser(userId: string, userType: 'customer' | 'commerce') {
    if (userType === 'customer') {
      return this.prisma.customer.findUnique({
        where: { id: userId },
        select: {
          id: true,
          phone: true,
          name: true,
          municipalityId: true,
        },
      });
    }

    return this.prisma.commerce.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        municipalityId: true,
        apiKey: true,
      },
    });
  }

  generateTokens(userId: string, userType: 'customer' | 'commerce'): AuthResponseDto {
    const payload = { sub: userId, type: userType };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '24h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      expiresIn: 86400,
      tokenType: 'Bearer',
      userId,
      userType,
    };
  }

  private generateApiKey(): string {
    return `sk_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}
