import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DriverAssignmentService } from './driver-assignment.service';
import { PrismaService } from '@shared/database/prisma.service';

describe('DriverAssignmentService', () => {
  let service: DriverAssignmentService;

  const mockPrismaService = {
    delivery: {
      findUnique: jest.fn(),
    },
    driver: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriverAssignmentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DriverAssignmentService>(DriverAssignmentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('assignNearestDriver', () => {
    it('should assign the closest driver', async () => {
      const deliveryId = 'deliv-1';
      const pickupLat = 4.7110;
      const pickupLng = -74.0721;
      const deliveryLat = 4.7100;
      const deliveryLng = -74.0730;

      mockPrismaService.delivery.findUnique.mockResolvedValue({
        id: deliveryId,
        pickupLocationLatitude: pickupLat,
        pickupLocationLongitude: pickupLng,
        deliveryLocationLatitude: deliveryLat,
        deliveryLocationLongitude: deliveryLng,
        order: {
          customer: {
            municipalityId: 'mun-1',
          },
        },
      });

      mockPrismaService.driver.findMany.mockResolvedValue([
        {
          id: 'driver-1',
          fullName: 'Carlos',
          rating: 4.8,
          _count: { deliveries: 1 },
        },
        {
          id: 'driver-2',
          fullName: 'Maria',
          rating: 4.5,
          _count: { deliveries: 2 },
        },
      ]);

      const result = await service.assignNearestDriver(deliveryId, pickupLat, pickupLng);

      expect(result.driverId).toBeDefined();
      expect(result.distanceKm).toBeDefined();
    });

    it('should throw NotFoundException when delivery not found', async () => {
      mockPrismaService.delivery.findUnique.mockResolvedValue(null);

      await expect(
        service.assignNearestDriver('invalid-deliv', 4.7110, -74.0721),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when no active drivers', async () => {
      mockPrismaService.delivery.findUnique.mockResolvedValue({
        id: 'deliv-1',
        order: {
          customer: {
            municipalityId: 'mun-1',
          },
        },
      });

      mockPrismaService.driver.findMany.mockResolvedValue([]);

      await expect(
        service.assignNearestDriver('deliv-1', 4.7110, -74.0721),
      ).rejects.toThrow(BadRequestException);
    });

    it('should prioritize drivers with fewer active deliveries', async () => {
      const deliveryId = 'deliv-1';

      mockPrismaService.delivery.findUnique.mockResolvedValue({
        id: deliveryId,
        pickupLocationLatitude: 4.7110,
        pickupLocationLongitude: -74.0721,
        deliveryLocationLatitude: 4.7100,
        deliveryLocationLongitude: -74.0730,
        order: {
          customer: {
            municipalityId: 'mun-1',
          },
        },
      });

      mockPrismaService.driver.findMany.mockResolvedValue([
        {
          id: 'driver-1',
          fullName: 'Busy',
          rating: 4.5,
          _count: { deliveries: 5 },
        },
        {
          id: 'driver-2',
          fullName: 'Available',
          rating: 4.5,
          _count: { deliveries: 1 },
        },
      ]);

      const result = await service.assignNearestDriver(deliveryId, 4.7110, -74.0721);

      expect(result.driverId).toBe('driver-2');
    });
  });

  describe('getAvailableDrivers', () => {
    it('should return list of available drivers', async () => {
      const municipalityId = 'mun-1';

      mockPrismaService.driver.findMany.mockResolvedValue([
        {
          id: 'driver-1',
          fullName: 'Carlos',
          phone: '3001234567',
          rating: 4.8,
          _count: { deliveries: 1 },
        },
        {
          id: 'driver-2',
          fullName: 'Maria',
          phone: '3005551234',
          rating: 4.5,
          _count: { deliveries: 2 },
        },
      ]);

      const result = await service.getAvailableDrivers(municipalityId);

      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Carlos');
      expect(result[0].activeDeliveries).toBe(1);
      expect(result[0].rating).toBe(4.8);
    });
  });
});
