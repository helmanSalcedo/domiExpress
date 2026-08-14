import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PushService } from './services/push.service';
import { NotificationOrchestratorService } from './services/notification-orchestrator.service';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly pushService: PushService,
    private readonly orchestrator: NotificationOrchestratorService,
  ) {}

  @Post('register-device')
  @UseGuards(JwtAuthGuard)
  async registerDevice(@Request() req, @Body() body: { token: string }) {
    const _userId = req.user.id;

    if (!body.token) {
      return { success: false, message: 'Token is required' };
    }

    // TODO: Store token in database
    // await this.userService.addFCMToken(_userId, body.token);

    return {
      success: true,
      message: 'Device token registered successfully',
    };
  }

  @Post('unregister-device')
  @UseGuards(JwtAuthGuard)
  async unregisterDevice(@Request() req, @Body() _body: { token: string }) {
    const _userId = req.user.id;

    // TODO: Remove token from database
    // await this.userService.removeFCMToken(_userId, _body.token);

    return {
      success: true,
      message: 'Device token unregistered successfully',
    };
  }

  @Post('send-test')
  @UseGuards(JwtAuthGuard)
  async sendTestNotification(
    @Body()
    body: {
      deviceToken?: string;
      title: string;
      body: string;
    },
  ) {
    if (!body.deviceToken) {
      return {
        success: false,
        message: 'deviceToken is required for testing',
      };
    }

    const result = await this.pushService.sendPushNotification(body.deviceToken, {
      title: body.title,
      body: body.body,
    });

    return result;
  }

  @Post('subscribe-topic')
  @UseGuards(JwtAuthGuard)
  async subscribeToTopic(
    @Body()
    body: {
      deviceToken: string;
      topic: string;
    },
  ) {
    const success = await this.pushService.subscribeToTopic(body.deviceToken, body.topic);

    return {
      success,
      message: success ? `Subscribed to topic: ${body.topic}` : 'Failed to subscribe to topic',
    };
  }

  @Post('unsubscribe-topic')
  @UseGuards(JwtAuthGuard)
  async unsubscribeFromTopic(
    @Body()
    body: {
      deviceToken: string;
      topic: string;
    },
  ) {
    const success = await this.pushService.unsubscribeFromTopic(body.deviceToken, body.topic);

    return {
      success,
      message: success
        ? `Unsubscribed from topic: ${body.topic}`
        : 'Failed to unsubscribe from topic',
    };
  }
}
