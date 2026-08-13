import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/shared/database/prisma.service';

export class E2eTestHelper {
  private app: INestApplication;
  private prisma: PrismaService;

  async setup(): Promise<void> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = moduleFixture.createNestApplication();
    this.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    this.prisma = moduleFixture.get<PrismaService>(PrismaService);

    await this.app.init();
  }

  async cleanup(): Promise<void> {
    if (this.app) {
      await this.app.close();
    }
  }

  getApp(): INestApplication {
    return this.app;
  }

  getPrisma(): PrismaService {
    return this.prisma;
  }

  request(): request.SuperTest<request.Test> {
    return request(this.app.getHttpServer());
  }

  // Helper for authenticated requests
  async authenticatedRequest(
    token: string,
  ): Promise<request.SuperTest<request.Test>> {
    return request(this.app.getHttpServer()).set('Authorization', `Bearer ${token}`);
  }

  // Clean up database
  async cleanDatabase(): Promise<void> {
    const tables = [
      'PaymentWebhook',
      'Rating',
      'Dispute',
      'Delivery',
      'Order',
      'DriverEarning',
      'Driver',
      'Product',
      'Commerce',
      'CustomerAddress',
      'Customer',
      'SearchLog',
    ];

    for (const table of tables) {
      try {
        await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`);
      } catch (error) {
        // Table might not exist in test schema
      }
    }
  }

  // Seed test data
  async seedTestData(): Promise<{
    municipalityId: string;
    customerId: string;
    commerceId: string;
    driverId: string;
  }> {
    const municipality = await this.prisma.municipality.create({
      data: {
        name: 'Test Municipality',
        department: 'Test Department',
        centerLatitude: 4.7110,
        centerLongitude: -74.0721,
        status: 'ACTIVE',
      },
    });

    const customer = await this.prisma.customer.create({
      data: {
        municipalityId: municipality.id,
        phone: '+573001111111',
        name: 'Test Customer',
        status: 'ACTIVE',
      },
    });

    const commerce = await this.prisma.commerce.create({
      data: {
        municipalityId: municipality.id,
        apiKey: 'test-api-key',
        whatsappNumber: '+573169999999',
        name: 'Test Commerce',
        category: 'RESTAURANT',
        locationLatitude: 4.7110,
        locationLongitude: -74.0721,
        ownerName: 'Test Owner',
        ownerPhone: '+573002222222',
        ownerEmail: 'owner@test.com',
        isActive: true,
      },
    });

    const driver = await this.prisma.driver.create({
      data: {
        municipalityId: municipality.id,
        phone: '+573003333333',
        fullName: 'Test Driver',
        identificationNumber: '1234567890',
        identificationType: 'CC',
        vehicleType: 'MOTORCYCLE',
        isActive: true,
      },
    });

    return {
      municipalityId: municipality.id,
      customerId: customer.id,
      commerceId: commerce.id,
      driverId: driver.id,
    };
  }
}
