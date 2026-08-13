import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { CustomerProfileDto, CustomerResponseDto, CreateAddressDto, AddressResponseDto } from '../dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(customerId: string): Promise<CustomerResponseDto> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        phone: true,
        email: true,
        name: true,
        rating: true,
        totalOrders: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return {
      ...customer,
      rating: Number(customer.rating),
    };
  }

  async updateProfile(customerId: string, dto: CustomerProfileDto): Promise<CustomerResponseDto> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const updated = await this.prisma.customer.update({
      where: { id: customerId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.email && { email: dto.email }),
        ...(dto.preferredLanguage && { preferredLanguage: dto.preferredLanguage }),
        ...(dto.homeLatitude !== undefined && { homeLatitude: dto.homeLatitude }),
        ...(dto.homeLongitude !== undefined && { homeLongitude: dto.homeLongitude }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        phone: true,
        email: true,
        name: true,
        rating: true,
        totalOrders: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      ...updated,
      rating: Number(updated.rating),
    };
  }

  async createAddress(customerId: string, dto: CreateAddressDto): Promise<AddressResponseDto> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const address = await this.prisma.customerAddress.create({
      data: {
        customerId,
        street: dto.street,
        number: dto.number,
        neighborhood: dto.neighborhood,
        city: dto.city,
        latitude: dto.latitude,
        longitude: dto.longitude,
        isDefault: dto.isDefault || false,
      },
    });

    return address;
  }

  async listAddresses(customerId: string): Promise<AddressResponseDto[]> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return this.prisma.customerAddress.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteAddress(customerId: string, addressId: string): Promise<void> {
    const address = await this.prisma.customerAddress.findUnique({
      where: { id: addressId },
    });

    if (!address || address.customerId !== customerId) {
      throw new NotFoundException('Address not found');
    }

    // Since there's no soft delete, we perform a hard delete
    await this.prisma.customerAddress.delete({
      where: { id: addressId },
    });
  }
}
