import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Seed Municipalities
    console.log('📍 Seeding municipalities...');

    const bogota = await prisma.municipality.upsert({
      where: { name: 'Bogotá' },
      update: {},
      create: {
        name: 'Bogotá',
        department: 'Cundinamarca',
        centerLatitude: 4.7110,
        centerLongitude: -74.0721,
        coverageRadiusKm: 25,
        maxDeliveryDistanceKm: 50,
        timezone: 'America/Bogota',
        language: 'es',
        currency: 'COP',
        commissionPercentage: 10,
        status: 'ACTIVE',
        isPublished: true,
      },
    });

    const medellin = await prisma.municipality.upsert({
      where: { name: 'Medellín' },
      update: {},
      create: {
        name: 'Medellín',
        department: 'Antioquia',
        centerLatitude: 6.2442,
        centerLongitude: -75.5812,
        coverageRadiusKm: 20,
        maxDeliveryDistanceKm: 40,
        timezone: 'America/Bogota',
        language: 'es',
        currency: 'COP',
        commissionPercentage: 10,
        status: 'ACTIVE',
        isPublished: true,
      },
    });

    // Seed Customers
    console.log('👥 Seeding customers...');

    const customer1 = await prisma.customer.upsert({
      where: { phone: '+573001234567' },
      update: {},
      create: {
        municipalityId: bogota.id,
        phone: '+573001234567',
        email: 'customer1@example.com',
        name: 'Juan García',
        preferredLanguage: 'es',
        status: 'ACTIVE',
        isVerified: true,
        rating: 5.0,
        totalOrders: 0,
      },
    });

    const customer2 = await prisma.customer.upsert({
      where: { phone: '+573007654321' },
      update: {},
      create: {
        municipalityId: bogota.id,
        phone: '+573007654321',
        email: 'customer2@example.com',
        name: 'María López',
        preferredLanguage: 'es',
        status: 'ACTIVE',
        isVerified: true,
        rating: 4.8,
        totalOrders: 0,
      },
    });

    // Seed Commerces
    console.log('🏪 Seeding commerces...');

    const commerce1 = await prisma.commerce.upsert({
      where: { apiKey: 'test_api_key_1' },
      update: {},
      create: {
        municipalityId: bogota.id,
        apiKey: 'test_api_key_1',
        apiKeyHash: 'hashed_key_1',
        whatsappNumber: '+573169876543',
        whatsappNumberId: 'wa_123456',
        name: 'Restaurante El Sabor',
        displayName: 'El Sabor - Comida Rápida',
        category: 'RESTAURANT',
        description: 'Comidas rápidas y deliciosas',
        locationLatitude: 4.7110,
        locationLongitude: -74.0721,
        ownerName: 'Carlos Rodríguez',
        ownerPhone: '+573001111111',
        ownerEmail: 'carlos@elsabor.com',
        rating: 4.9,
        isActive: true,
        isVerified: true,
      },
    });

    const commerce2 = await prisma.commerce.upsert({
      where: { apiKey: 'test_api_key_2' },
      update: {},
      create: {
        municipalityId: bogota.id,
        apiKey: 'test_api_key_2',
        apiKeyHash: 'hashed_key_2',
        whatsappNumber: '+573169876544',
        whatsappNumberId: 'wa_123457',
        name: 'Farmacia Total',
        displayName: 'Farmacia Total - Medicinas',
        category: 'PHARMACY',
        description: 'Medicinas y productos de salud',
        locationLatitude: 4.7115,
        locationLongitude: -74.0720,
        ownerName: 'Ana Martínez',
        ownerPhone: '+573001111112',
        ownerEmail: 'ana@farmaciatotal.com',
        rating: 4.7,
        isActive: true,
        isVerified: true,
      },
    });

    // Seed Products
    console.log('🛍️ Seeding products...');

    await prisma.product.create({
      data: {
        commerceId: commerce1.id,
        categoryId: 'cat_1',
        name: 'Hamburguesa Clásica',
        description: 'Hamburguesa con carne 100% de res',
        price: 18000,
        discountPercentage: 0,
        rating: 4.8,
        isAvailable: true,
      },
    });

    await prisma.product.create({
      data: {
        commerceId: commerce1.id,
        categoryId: 'cat_1',
        name: 'Pizza Hawaiana',
        description: 'Pizza con jamón y piña',
        price: 25000,
        discountPercentage: 10,
        rating: 4.5,
        isAvailable: true,
      },
    });

    await prisma.product.create({
      data: {
        commerceId: commerce2.id,
        categoryId: 'cat_2',
        name: 'Paracetamol 500mg',
        description: 'Dolor y fiebre',
        price: 3500,
        discountPercentage: 0,
        rating: 5.0,
        isAvailable: true,
      },
    });

    // Seed Drivers
    console.log('🚗 Seeding drivers...');

    const driver1 = await prisma.driver.upsert({
      where: { phone: '+573115555555' },
      update: {},
      create: {
        municipalityId: bogota.id,
        fullName: 'Roberto Pérez',
        phone: '+573115555555',
        identificationNumber: '1234567890',
        identificationType: 'CC',
        vehicleType: 'MOTORCYCLE',
        vehicleLicensePlate: 'ABC-123',
        rating: 4.9,
        isActive: true,
        isVerified: true,
        totalDeliveries: 0,
      },
    });

    const driver2 = await prisma.driver.upsert({
      where: { phone: '+573115555556' },
      update: {},
      create: {
        municipalityId: bogota.id,
        fullName: 'Sofía González',
        phone: '+573115555556',
        identificationNumber: '0987654321',
        identificationType: 'CC',
        vehicleType: 'CAR',
        vehicleLicensePlate: 'XYZ-789',
        rating: 4.8,
        isActive: true,
        isVerified: true,
        totalDeliveries: 0,
      },
    });

    console.log('✅ Database seeding completed!');
    console.log(`
    📍 Municipalities: ${[bogota.name, medellin.name].join(', ')}
    👥 Customers: ${[customer1.name, customer2.name].join(', ')}
    🏪 Commerces: ${[commerce1.name, commerce2.name].join(', ')}
    🚗 Drivers: ${[driver1.fullName, driver2.fullName].join(', ')}
    `);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
