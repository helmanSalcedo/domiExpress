import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { LocationTrackingService } from '../services/location-tracking.service';
import { DeliveriesService } from '@modules/deliveries/services/deliveries.service';

interface LocationUpdate {
  deliveryId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface ClientSession {
  userId: string;
  role: 'driver' | 'customer' | 'admin';
  deliveryId?: string;
}

@WebSocketGateway({
  namespace: '/tracking',
  cors: { origin: '*' },
})
@Injectable()
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(TrackingGateway.name);
  private clientSessions = new Map<string, ClientSession>();
  private deliverySubscribers = new Map<string, Set<string>>();

  constructor(
    private locationTrackingService: LocationTrackingService,
    private deliveriesService: DeliveriesService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`📱 Client connected: ${client.id}`);

    // Validar JWT token al conectar
    const token = client.handshake.auth.token;
    if (!token) {
      this.logger.warn(`❌ Client attempted connection without token: ${client.id}`);
      client.disconnect();
      return;
    }

    try {
      const decoded = this.validateToken(token);
      const session: ClientSession = {
        userId: decoded.id,
        role: decoded.role || 'customer',
      };

      this.clientSessions.set(client.id, session);
      this.logger.log(`✅ Client authenticated: ${decoded.id} (${session.role})`);

      // Notificar conexión
      client.emit('connected', {
        message: 'Connected to tracking service',
        clientId: client.id,
      });
    } catch (error) {
      this.logger.error(`❌ Authentication failed: ${error}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const session = this.clientSessions.get(client.id);
    if (session) {
      this.logger.log(`📴 Client disconnected: ${session.userId}`);

      // Remover subscripciones
      if (session.deliveryId) {
        const subscribers = this.deliverySubscribers.get(session.deliveryId);
        if (subscribers) {
          subscribers.delete(client.id);
        }
      }

      this.clientSessions.delete(client.id);
    }
  }

  @SubscribeMessage('subscribe_delivery')
  async handleSubscribeDelivery(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { deliveryId: string },
  ) {
    const session = this.clientSessions.get(client.id);
    if (!session) {
      throw new WsException('Not authenticated');
    }

    const { deliveryId } = data;

    try {
      // Validar que delivery existe
      const delivery = await this.deliveriesService.getDelivery(deliveryId);

      // Validar autorización (driver o customer of order)
      const isAuthorized =
        session.role === 'admin' ||
        (session.role === 'driver' && delivery.driverId === session.userId) ||
        (session.role === 'customer' && delivery.orderId); // TODO: check order owner

      if (!isAuthorized) {
        throw new WsException('Unauthorized');
      }

      // Agregar a subscribers
      if (!this.deliverySubscribers.has(deliveryId)) {
        this.deliverySubscribers.set(deliveryId, new Set());
      }
      this.deliverySubscribers.get(deliveryId)?.add(client.id);
      session.deliveryId = deliveryId;

      // Unirse a room
      client.join(`delivery:${deliveryId}`);

      this.logger.log(`✅ Client ${session.userId} subscribed to delivery ${deliveryId}`);

      // Enviar estado actual
      client.emit('delivery_status', {
        deliveryId,
        status: delivery.status,
        driverId: delivery.driverId,
        lastLocation: {
          latitude: delivery.deliveryLatitude,
          longitude: delivery.deliveryLongitude,
        },
      });
    } catch (error) {
      this.logger.error(`❌ Subscribe failed: ${error}`);
      throw new WsException(error instanceof Error ? error.message : 'Subscribe failed');
    }
  }

  @SubscribeMessage('unsubscribe_delivery')
  handleUnsubscribeDelivery(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { deliveryId: string },
  ) {
    const session = this.clientSessions.get(client.id);
    if (!session) {
      throw new WsException('Not authenticated');
    }

    const { deliveryId } = data;

    // Remover de subscribers
    const subscribers = this.deliverySubscribers.get(deliveryId);
    if (subscribers) {
      subscribers.delete(client.id);
    }

    client.leave(`delivery:${deliveryId}`);
    session.deliveryId = undefined;

    this.logger.log(`✅ Client ${session.userId} unsubscribed from delivery ${deliveryId}`);

    client.emit('unsubscribed', { deliveryId });
  }

  @SubscribeMessage('update_location')
  async handleLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: LocationUpdate,
  ) {
    const session = this.clientSessions.get(client.id);
    if (!session) {
      throw new WsException('Not authenticated');
    }

    if (session.role !== 'driver') {
      throw new WsException('Only drivers can update location');
    }

    const { deliveryId, latitude, longitude, accuracy } = data;

    try {
      // Validar que delivery pertenece al driver
      const delivery = await this.deliveriesService.getDelivery(deliveryId);
      if (delivery.driverId !== session.userId) {
        throw new WsException('Unauthorized');
      }

      // Guardar ubicación en DB y Redis
      await this.locationTrackingService.updateLocation(
        session.userId,
        latitude,
        longitude,
      );

      this.logger.debug(
        `📍 Location updated: delivery=${deliveryId}, lat=${latitude}, lng=${longitude}`,
      );

      // Broadcast a todos los subscribers
      this.server.to(`delivery:${deliveryId}`).emit('location_updated', {
        deliveryId,
        latitude,
        longitude,
        accuracy,
        timestamp: new Date().toISOString(),
        driverId: session.userId,
      });

      client.emit('location_ack', { success: true, timestamp: new Date().toISOString() });
    } catch (error) {
      this.logger.error(`❌ Location update failed: ${error}`);
      client.emit('location_error', {
        error: error instanceof Error ? error.message : 'Location update failed',
      });
    }
  }

  @SubscribeMessage('get_active_deliveries')
  async handleGetActiveDeliveries(@ConnectedSocket() client: Socket) {
    const session = this.clientSessions.get(client.id);
    if (!session) {
      throw new WsException('Not authenticated');
    }

    try {
      let deliveries: any[] = [];

      if (session.role === 'driver') {
        // Get driver's active deliveries
        deliveries = await this.deliveriesService.listDriverDeliveries(
          session.userId,
          'IN_TRANSIT' as any,
          10,
          0,
        );
      } else if (session.role === 'customer') {
        // TODO: Get customer's active orders with deliveries
      } else if (session.role === 'admin') {
        // Get all active deliveries
        deliveries = await this.deliveriesService.listActiveDeliveries(50);
      }

      client.emit('active_deliveries', {
        deliveries: deliveries.map(d => ({
          id: d.id,
          orderId: d.orderId,
          driverId: d.driverId,
          status: d.status,
          lastLocation: {
            latitude: d.deliveryLatitude,
            longitude: d.deliveryLongitude,
          },
        })),
      });

      this.logger.log(`✅ Sent ${deliveries.length} active deliveries to ${session.userId}`);
    } catch (error) {
      this.logger.error(`❌ Get deliveries failed: ${error}`);
      throw new WsException(error instanceof Error ? error.message : 'Get deliveries failed');
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: Date.now() });
  }

  async broadcastDeliveryStatusChange(
    deliveryId: string,
    newStatus: string,
    additionalData?: Record<string, any>,
  ) {
    this.server.to(`delivery:${deliveryId}`).emit('delivery_status_changed', {
      deliveryId,
      status: newStatus,
      timestamp: new Date().toISOString(),
      ...additionalData,
    });

    this.logger.log(`📢 Broadcasted status change: ${deliveryId} → ${newStatus}`);
  }

  private validateToken(token: string): any {
    // TODO: Implement proper JWT validation
    // For now, return mock decoded token
    try {
      // In production, use jwt.verify()
      const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      return decoded;
    } catch {
      throw new Error('Invalid token');
    }
  }
}
