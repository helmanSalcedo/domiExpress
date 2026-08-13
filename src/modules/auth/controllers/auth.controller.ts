import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Request as ExpressRequest } from 'express';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  RegisterCustomerDto,
  LoginCustomerDto,
  RegisterCommerceDto,
  LoginCommerceDto,
  AuthResponseDto,
} from '../dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('customer/register')
  @ApiOperation({ summary: 'Register new customer' })
  @ApiCreatedResponse({ type: AuthResponseDto })
  async registerCustomer(
    @Body() dto: RegisterCustomerDto,
    @Request() req: ExpressRequest,
  ): Promise<AuthResponseDto> {
    const municipalityId = (req.query?.municipalityId as string) || 'default';
    return this.authService.registerCustomer(dto, municipalityId);
  }

  @Post('customer/login')
  @ApiOperation({ summary: 'Login customer' })
  @ApiCreatedResponse({ type: AuthResponseDto })
  async loginCustomer(@Body() dto: LoginCustomerDto): Promise<AuthResponseDto> {
    return this.authService.loginCustomer(dto);
  }

  @Post('commerce/register')
  @ApiOperation({ summary: 'Register new commerce' })
  @ApiCreatedResponse({ type: AuthResponseDto })
  async registerCommerce(
    @Body() dto: RegisterCommerceDto,
    @Request() req: ExpressRequest,
  ): Promise<AuthResponseDto> {
    const municipalityId = (req.query?.municipalityId as string) || 'default';
    return this.authService.registerCommerce(dto, municipalityId);
  }

  @Post('commerce/login')
  @ApiOperation({ summary: 'Login commerce' })
  @ApiCreatedResponse({ type: AuthResponseDto })
  async loginCommerce(@Body() dto: LoginCommerceDto): Promise<AuthResponseDto> {
    return this.authService.loginCommerce(dto);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiCreatedResponse({ type: AuthResponseDto })
  async refreshToken(@Request() req: any): Promise<AuthResponseDto> {
    return this.authService.generateTokens(req.user.id, req.user.userType);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify current token' })
  async verifyToken(@Request() req: any) {
    return {
      valid: true,
      user: req.user,
    };
  }
}
