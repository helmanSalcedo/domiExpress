import { Controller, Get, Patch, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CustomersService } from '../services/customers.service';
import {
  CustomerProfileDto,
  CustomerResponseDto,
  CreateAddressDto,
  AddressResponseDto,
} from '../dto';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get customer profile' })
  @ApiOkResponse({ type: CustomerResponseDto })
  async getProfile(@Param('id') customerId: string): Promise<CustomerResponseDto> {
    return this.customersService.getProfile(customerId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update customer profile' })
  @ApiOkResponse({ type: CustomerResponseDto })
  async updateProfile(
    @Param('id') customerId: string,
    @Body() dto: CustomerProfileDto,
  ): Promise<CustomerResponseDto> {
    return this.customersService.updateProfile(customerId, dto);
  }

  @Post(':id/addresses')
  @ApiOperation({ summary: 'Create customer address' })
  @ApiOkResponse({ type: AddressResponseDto })
  async createAddress(
    @Param('id') customerId: string,
    @Body() dto: CreateAddressDto,
  ): Promise<AddressResponseDto> {
    return this.customersService.createAddress(customerId, dto);
  }

  @Get(':id/addresses')
  @ApiOperation({ summary: 'List customer addresses' })
  @ApiOkResponse({ type: [AddressResponseDto] })
  async listAddresses(@Param('id') customerId: string): Promise<AddressResponseDto[]> {
    return this.customersService.listAddresses(customerId);
  }

  @Delete(':id/addresses/:addressId')
  @ApiOperation({ summary: 'Delete customer address' })
  async deleteAddress(
    @Param('id') customerId: string,
    @Param('addressId') addressId: string,
  ): Promise<void> {
    return this.customersService.deleteAddress(customerId, addressId);
  }
}
