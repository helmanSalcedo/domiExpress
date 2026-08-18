import { Module } from '@nestjs/common';
import { PushService } from './services/push.service';
import { EmailService } from './services/email.service';
import { NotificationOrchestratorService } from './services/notification-orchestrator.service';
import { NotificationPreferencesService } from './services/notification-preferences.service';
import { NotificationsController } from './notifications.controller';

@Module({
  controllers: [NotificationsController],
  providers: [
    PushService,
    EmailService,
    NotificationOrchestratorService,
    NotificationPreferencesService,
  ],
  exports: [
    PushService,
    EmailService,
    NotificationOrchestratorService,
    NotificationPreferencesService,
  ],
})
export class NotificationsModule {}
