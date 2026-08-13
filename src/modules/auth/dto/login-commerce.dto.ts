import { IsPhoneNumber, IsString, MinLength, MaxLength } from 'class-validator';

export class LoginCommerceDto {
  @IsPhoneNumber('CO')
  whatsappNumber!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password!: string;
}
