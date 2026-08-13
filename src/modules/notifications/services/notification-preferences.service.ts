import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  whatsappNotifications: boolean;
  orderUpdates: boolean;
  paymentNotifications: boolean;
  promotionalEmails: boolean;
  newsAndUpdates: boolean;
}

@Injectable()
export class NotificationPreferencesService {
  private readonly logger = new Logger(NotificationPreferencesService.name);

  constructor(private prisma: PrismaService) {}

  async getPreferences(userId: string): Promise<NotificationPreferences> {
    this.logger.debug(`Fetching notification preferences for user: ${userId}`);

    // TODO: Query from database when schema is ready
    // For now, return defaults
    const defaults: NotificationPreferences = {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      whatsappNotifications: true,
      orderUpdates: true,
      paymentNotifications: true,
      promotionalEmails: false,
      newsAndUpdates: false,
    };

    return defaults;
  }

  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>,
  ): Promise<NotificationPreferences> {
    this.logger.log(`Updating notification preferences for user: ${userId}`);

    // TODO: Update in database when schema is ready
    const updated = {
      emailNotifications: preferences.emailNotifications ?? true,
      pushNotifications: preferences.pushNotifications ?? true,
      smsNotifications: preferences.smsNotifications ?? false,
      whatsappNotifications: preferences.whatsappNotifications ?? true,
      orderUpdates: preferences.orderUpdates ?? true,
      paymentNotifications: preferences.paymentNotifications ?? true,
      promotionalEmails: preferences.promotionalEmails ?? false,
      newsAndUpdates: preferences.newsAndUpdates ?? false,
    };

    this.logger.log(`✅ Notification preferences updated for user: ${userId}`);
    return updated;
  }

  async shouldNotify(userId: string, notificationType: string): Promise<boolean> {
    const prefs = await this.getPreferences(userId);

    switch (notificationType) {
      case 'order_update':
        return prefs.orderUpdates;
      case 'payment':
        return prefs.paymentNotifications;
      case 'promotional':
        return prefs.promotionalEmails;
      case 'news':
        return prefs.newsAndUpdates;
      default:
        return true;
    }
  }

  async isEmailEnabled(userId: string): Promise<boolean> {
    const prefs = await this.getPreferences(userId);
    return prefs.emailNotifications;
  }

  async isPushEnabled(userId: string): Promise<boolean> {
    const prefs = await this.getPreferences(userId);
    return prefs.pushNotifications;
  }

  async isSmsEnabled(userId: string): Promise<boolean> {
    const prefs = await this.getPreferences(userId);
    return prefs.smsNotifications;
  }

  async isWhatsappEnabled(userId: string): Promise<boolean> {
    const prefs = await this.getPreferences(userId);
    return prefs.whatsappNotifications;
  }

  async unsubscribeAll(userId: string): Promise<void> {
    this.logger.log(`Unsubscribing user ${userId} from all notifications`);

    const allDisabled: NotificationPreferences = {
      emailNotifications: false,
      pushNotifications: false,
      smsNotifications: false,
      whatsappNotifications: false,
      orderUpdates: false,
      paymentNotifications: false,
      promotionalEmails: false,
      newsAndUpdates: false,
    };

    await this.updatePreferences(userId, allDisabled);
  }

  async enableAll(userId: string): Promise<void> {
    this.logger.log(`Enabling all notifications for user ${userId}`);

    const allEnabled: NotificationPreferences = {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: true,
      whatsappNotifications: true,
      orderUpdates: true,
      paymentNotifications: true,
      promotionalEmails: true,
      newsAndUpdates: true,
    };

    await this.updatePreferences(userId, allEnabled);
  }
}
