import { IsPhoneNumber, IsString, MinLength, MaxLength } from 'class-validator';

export class LoginCustomerDto {
  @IsPhoneNumber('CO')
  phone!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password!: string;
}
