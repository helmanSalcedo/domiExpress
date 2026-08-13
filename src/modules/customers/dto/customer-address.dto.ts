import { IsString, IsNumber, IsOptional, MaxLength, IsBoolean } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @MaxLength(255)
  street!: string;

  @IsString()
  @MaxLength(50)
  number!: string;

  @IsString()
  @MaxLength(255)
  neighborhood!: string;

  @IsString()
  @MaxLength(255)
  city!: string;

  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class AddressResponseDto {
  id!: string;
  customerId!: string;
  street!: string;
  number!: string;
  neighborhood!: string;
  city!: string;
  latitude!: number;
  longitude!: number;
  isDefault!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
