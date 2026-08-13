import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { AuthService } from './services/auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            customer: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerCustomer', () => {
    it('should create a new customer', async () => {
      const municipalityId = '123e4567-e89b-12d3-a456-426614174000';
      const registerDto = {
        phone: '+57 123456789',
        name: 'Test Customer',
        password: 'password123',
        preferredLanguage: 'es',
      };

      const mockCustomer = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        ...registerDto,
      };

      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.customer.create as jest.Mock).mockResolvedValue(mockCustomer);
      (jwtService.sign as jest.Mock).mockReturnValue('token123');

      const result = await service.registerCustomer(registerDto, municipalityId);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('customer');
      expect(prisma.customer.create).toHaveBeenCalled();
    });

    it('should throw error if customer already exists', async () => {
      const municipalityId = '123e4567-e89b-12d3-a456-426614174000';
      const registerDto = {
        phone: '+57 123456789',
        name: 'Test Customer',
        password: 'password123',
        preferredLanguage: 'es',
      };

      (prisma.customer.findUnique as jest.Mock).mockResolvedValue({
        id: '123e4567-e89b-12d3-a456-426614174001',
      });

      await expect(
        service.registerCustomer(registerDto, municipalityId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('loginCustomer', () => {
    it('should return access token on successful login', async () => {
      const loginDto = {
        phone: '+57 123456789',
        password: 'password123',
      };

      const mockCustomer = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        phone: loginDto.phone,
        authToken: 'hashed_password',
      };

      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(
        mockCustomer,
      );
      (jwtService.sign as jest.Mock).mockReturnValue('token123');

      const result = await service.loginCustomer(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('should throw error on invalid credentials', async () => {
      const loginDto = {
        phone: '+57 123456789',
        password: 'wrongpassword',
      };

      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.loginCustomer(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
