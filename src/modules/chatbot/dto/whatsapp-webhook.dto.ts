export class WhatsAppMessageDto {
  from!: string;
  text!: string;
  messageId!: string;
  timestamp!: string;
}

export class WhatsAppWebhookDto {
  object!: string;
  entry!: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        messages?: WhatsAppMessageDto[];
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: string;
    }>;
  }>;
}
