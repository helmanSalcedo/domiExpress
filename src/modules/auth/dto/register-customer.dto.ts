import { IsEmail, IsPhoneNumber, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterCustomerDto {
  @IsPhoneNumber('CO')
  phone!: string;

  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(5)
  preferredLanguage: string = 'es';
}
