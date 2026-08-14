import { Test, TestingModule } from '@nestjs/testing';
import { TrackingGateway } from './tracking.gateway';
import { LocationTrackingService } from '../services/location-tracking.service';
import { DeliveriesService } from '@modules/deliveries/services/deliveries.service';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';

describe('TrackingGateway', () => {
  let gateway: TrackingGateway;
  let mockSocket: any;

  const mockLocationTrackingService = {
    updateLocation: jest.fn(),
  };

  const mockDeliveriesService = {
    getDelivery: jest.fn(),
    listDriverDeliveries: jest.fn(),
    listActiveDeliveries: jest.fn(),
  };

  beforeEach(async () => {
    mockSocket = {
      id: 'socket-1',
      handshake: {
        auth: {
          token: 'valid-jwt-token',
        },
      } as any,
      emit: jest.fn(),
      on: jest.fn(),
      join: jest.fn(),
      leave: jest.fn(),
      disconnect: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackingGateway,
        {
          provide: LocationTrackingService,
          useValue: mockLocationTrackingService,
        },
        {
          provide: DeliveriesService,
          useValue: mockDeliveriesService,
        },
      ],
    }).compile();

    gateway = module.get<TrackingGateway>(TrackingGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleConnection', () => {
    it('should accept connection with valid token', () => {
      gateway.handleConnection(mockSocket as Socket);

      expect(mockSocket.emit).toHaveBeenCalledWith('connected', expect.any(Object));
    });

    it('should reject connection without token', () => {
      const socketNoAuth = {
        ...mockSocket,
        handshake: { auth: {} },
      };

      gateway.handleConnection(socketNoAuth as Socket);

      expect(mockSocket.disconnect).not.toHaveBeenCalled();
    });
  });

  describe('handleSubscribeDelivery', () => {
    it('should subscribe to delivery tracking', async () => {
      gateway.handleConnection(mockSocket as Socket);

      mockDeliveriesService.getDelivery.mockResolvedValue({
        id: 'deliv-1',
        status: 'IN_TRANSIT',
        driverId: 'driver-1',
        deliveryLatitude: 4.71,
        deliveryLongitude: -74.073,
      });

      await gateway.handleSubscribeDelivery(mockSocket as any, { deliveryId: 'deliv-1' });

      expect(mockSocket.join).toHaveBeenCalledWith('delivery:deliv-1');
      expect(mockSocket.emit).toHaveBeenCalledWith('delivery_status', expect.any(Object));
    });

    it('should reject unauthorized subscription', async () => {
      gateway.handleConnection(mockSocket as Socket);

      mockDeliveriesService.getDelivery.mockResolvedValue({
        id: 'deliv-1',
        driverId: 'different-driver',
      });

      await expect(
        gateway.handleSubscribeDelivery(mockSocket as any, { deliveryId: 'deliv-1' }),
      ).rejects.toThrow(WsException);
    });
  });

  describe('handleLocationUpdate', () => {
    it('should update location from driver', async () => {
      gateway.handleConnection(mockSocket as Socket);

      mockDeliveriesService.getDelivery.mockResolvedValue({
        id: 'deliv-1',
        driverId: 'driver-1',
        status: 'IN_TRANSIT',
      });

      mockLocationTrackingService.updateLocation.mockResolvedValue(true);

      await gateway.handleSubscribeDelivery(mockSocket as any, { deliveryId: 'deliv-1' });

      await gateway.handleLocationUpdate(mockSocket as any, {
        deliveryId: 'deliv-1',
        latitude: 4.711,
        longitude: -74.0721,
        accuracy: 5,
      });

      expect(mockLocationTrackingService.updateLocation).toHaveBeenCalledWith(
        expect.objectContaining({
          deliveryId: 'deliv-1',
          latitude: 4.711,
          longitude: -74.0721,
        }),
      );
    });

    it('should reject location update from non-driver', async () => {
      gateway.handleConnection(mockSocket as Socket);

      await expect(
        gateway.handleLocationUpdate(mockSocket as any, {
          deliveryId: 'deliv-1',
          latitude: 4.711,
          longitude: -74.0721,
        }),
      ).rejects.toThrow(WsException);
    });
  });

  describe('handlePing', () => {
    it('should respond to ping', () => {
      gateway.handleConnection(mockSocket as Socket);

      gateway.handlePing(mockSocket as any);

      expect(mockSocket.emit).toHaveBeenCalledWith('pong', expect.any(Object));
    });
  });
});
