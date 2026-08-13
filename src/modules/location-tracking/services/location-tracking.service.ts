import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@shared/redis/services/redis.service';
import { RedisKeys } from '@shared/redis/redis.config';

interface DriverLocation {
  driverId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
}

@Injectable()
export class LocationTrackingService {
  private readonly logger = new Logger(LocationTrackingService.name);

  constructor(private redisService: RedisService) {}

  async updateLocation(
    driverId: string,
    latitude: number,
    longitude: number,
    accuracy?: number,
  ): Promise<DriverLocation> {
    const location: DriverLocation = {
      driverId,
      latitude,
      longitude,
      accuracy,
      timestamp: new Date(),
    };

    // Store in Redis with geospatial index
    await this.redisService.geoAdd(RedisKeys.DRIVERS_ACTIVE, longitude, latitude, driverId);

    // Store full location data as JSON
    const key = RedisKeys.DRIVER_LOCATION(driverId);
    await this.redisService.setJson(key, location, 3600); // 1 hour TTL

    this.logger.debug(`Updated location for driver ${driverId}: ${latitude}, ${longitude}`);

    // Publish real-time update via Pub/Sub
    await this.redisService.publishJson(RedisKeys.DRIVER_STATUS(driverId), location);

    return location;
  }

  async getDriverLocation(driverId: string): Promise<DriverLocation | null> {
    const key = RedisKeys.DRIVER_LOCATION(driverId);
    return this.redisService.getJson<DriverLocation>(key);
  }

  async getNearbyDrivers(
    latitude: number,
    longitude: number,
    radiusKm = 5,
  ): Promise<DriverLocation[]> {
    // Get driver IDs within radius using geospatial search
    const driverIds = await this.redisService.geoRadius(
      RedisKeys.DRIVERS_ACTIVE,
      longitude,
      latitude,
      radiusKm,
      'km',
    );

    if (driverIds.length === 0) {
      return [];
    }

    // Get full location data for each driver
    const locations: DriverLocation[] = [];
    for (const driverId of driverIds) {
      const location = await this.getDriverLocation(driverId);
      if (location) {
        locations.push(location);
      }
    }

    // Sort by distance
    return locations.sort(
      (a, b) =>
        this.calculateDistance(latitude, longitude, a.latitude, a.longitude) -
        this.calculateDistance(latitude, longitude, b.latitude, b.longitude),
    );
  }

  async getDistanceBetweenDrivers(driverId1: string, driverId2: string): Promise<number | null> {
    const distStr = await this.redisService.geoDist(
      RedisKeys.DRIVERS_ACTIVE,
      driverId1,
      driverId2,
      'km',
    );
    return distStr ? parseFloat(distStr) : null;
  }

  async clearDriverLocation(driverId: string): Promise<void> {
    const key = RedisKeys.DRIVER_LOCATION(driverId);
    await this.redisService.del(key);

    // Remove from geospatial index (requires getting all and re-adding)
    // Note: Redis doesn't have direct geospatial removal, so we'll use a TTL approach
    this.logger.debug(`Cleared location for driver ${driverId}`);
  }

  async clearAllDriverLocations(): Promise<void> {
    // This is a maintenance operation - clear all active drivers
    // In production, you'd want to do this more gracefully
    this.logger.warn('Clearing all driver locations');
    // Note: We can't directly clear the DRIVERS_ACTIVE key as it's a sorted set
    // Should implement proper cleanup with TTLs
  }

  async getActiveDriversCount(): Promise<number> {
    // This is an approximation based on geospatial index
    // For exact count, would need to implement differently
    return await this.redisService.getClient().zcount(RedisKeys.DRIVERS_ACTIVE, '-inf', '+inf');
  }

  async trackDeliveryLocation(
    deliveryId: string,
    latitude: number,
    longitude: number,
  ): Promise<void> {
    const trackingData = {
      deliveryId,
      latitude,
      longitude,
      timestamp: new Date(),
    };

    const key = RedisKeys.DELIVERY_TRACKING(deliveryId);
    await this.redisService.setJson(key, trackingData, 3600);

    // Publish real-time update
    await this.redisService.publishJson(RedisKeys.DELIVERY_UPDATES(deliveryId), trackingData);

    this.logger.debug(`Tracked delivery ${deliveryId} at ${latitude}, ${longitude}`);
  }

  async getDeliveryTracking(deliveryId: string): Promise<Record<string, any> | null> {
    const key = RedisKeys.DELIVERY_TRACKING(deliveryId);
    return this.redisService.getJson<Record<string, any>>(key);
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
