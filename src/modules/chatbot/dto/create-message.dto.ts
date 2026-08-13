import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @IsOptional()
  @IsString()
  source?: string = 'WEBSOCKET';

  @IsOptional()
  @IsString()
  messageType?: string = 'TEXT';
}
