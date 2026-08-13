import { IsEmail, IsPhoneNumber, IsString, IsNumber, MinLength, MaxLength, IsOptional } from 'class-validator';

export class RegisterCommerceDto {
  @IsPhoneNumber('CO')
  whatsappNumber!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password!: string;

  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  category!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  documentNumber?: string;
}
