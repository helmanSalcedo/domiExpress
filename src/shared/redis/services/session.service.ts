import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisKeys } from '../redis.config';

export interface SessionData {
  userId: string;
  userType: 'CUSTOMER' | 'COMMERCE' | 'DRIVER' | 'ADMIN';
  municipalityId: string;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
  lastActivity: Date;
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(private redisService: RedisService) {}

  /**
   * Create a new session
   */
  async createSession(sessionId: string, sessionData: SessionData): Promise<void> {
    const key = RedisKeys.SESSION(sessionId);
    await this.redisService.setJson(key, sessionData, RedisKeys.SESSION_TTL);
    this.logger.debug(`Created session: ${sessionId}`);
  }

  /**
   * Get session data
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    const key = RedisKeys.SESSION(sessionId);
    return this.redisService.getJson<SessionData>(key);
  }

  /**
   * Update session last activity
   */
  async updateLastActivity(sessionId: string): Promise<void> {
    const key = RedisKeys.SESSION(sessionId);
    const session = await this.getSession(sessionId);

    if (session) {
      session.lastActivity = new Date();
      await this.redisService.setJson(key, session, RedisKeys.SESSION_TTL);
    }
  }

  /**
   * Refresh session TTL
   */
  async refreshSession(sessionId: string): Promise<void> {
    const key = RedisKeys.SESSION(sessionId);
    const ttl = await this.redisService.ttl(key);

    if (ttl > 0) {
      await this.redisService.expire(key, RedisKeys.SESSION_TTL);
      this.logger.debug(`Refreshed session TTL: ${sessionId}`);
    }
  }

  /**
   * Destroy session
   */
  async destroySession(sessionId: string): Promise<void> {
    const key = RedisKeys.SESSION(sessionId);
    await this.redisService.del(key);
    this.logger.debug(`Destroyed session: ${sessionId}`);
  }

  /**
   * Check if session is valid
   */
  async isValidSession(sessionId: string): Promise<boolean> {
    return this.redisService.exists(RedisKeys.SESSION(sessionId));
  }

  /**
   * Get session TTL (remaining lifetime in seconds)
   */
  async getSessionTTL(sessionId: string): Promise<number> {
    const key = RedisKeys.SESSION(sessionId);
    return this.redisService.ttl(key);
  }
}
