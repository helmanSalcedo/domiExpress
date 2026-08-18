import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestOrder() {
  try {
    // Get random customer
    const customer = await prisma.customer.findFirst();
    if (!customer) {
      console.log('❌ No customers found. Run seed first.');
      process.exit(1);
    }

    // Get random commerce
    const commerce = await prisma.commerce.findFirst();
    if (!commerce) {
      console.log('❌ No commerces found. Run seed first.');
      process.exit(1);
    }

    // Get random driver
    const driver = await prisma.driver.findFirst();
    if (!driver) {
      console.log('❌ No drivers found. Run seed first.');
      process.exit(1);
    }

    // Get municipality
    const municipality = await prisma.municipality.findFirst();
    if (!municipality) {
      console.log('❌ No municipalities found. Run seed first.');
      process.exit(1);
    }

    // Create order
    console.log('📦 Creating test order...\n');

    const order = await prisma.order.create({
      data: {
        reference: `TEST-${Date.now()}`,
        customerId: customer.id,
        municipalityId: municipality.id,
        customerPhone: customer.phone,
        customerLocationLatitude: municipality.centerLatitude + 0.01,
        customerLocationLongitude: municipality.centerLongitude + 0.01,
        status: 'PENDING',
        subtotal: 45000,
        deliveryFee: 5000,
        totalAmount: 50000,
      },
    });

    // Create order item
    const product = await prisma.product.findFirst({ where: { commerceId: commerce.id } });
    if (product) {
      const productPrice = typeof product.basePrice === 'string'
        ? parseFloat(product.basePrice)
        : Number(product.basePrice);

      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          commerceId: commerce.id,
          productId: product.id,
          quantity: 2,
          unitPrice: productPrice,
          subtotal: productPrice * 2,
        },
      });
    }

    // Assign driver
    await prisma.delivery.create({
      data: {
        orderId: order.id,
        driverId: driver.id,
        status: 'ASSIGNED',
        pickupLocationLatitude: commerce.locationLatitude,
        pickupLocationLongitude: commerce.locationLongitude,
        deliveryLocationLatitude: order.customerLocationLatitude,
        deliveryLocationLongitude: order.customerLocationLongitude,
        distanceKm: 2.5,
        estimatedDurationMinutes: 20,
      },
    });

    console.log('✅ Test Order Created!\n');
    console.log('📋 Order Details:');
    console.log(`   Order ID: ${order.id}`);
    console.log(`   Reference: ${order.reference}`);
    console.log(`   Customer: ${customer.name}`);
    console.log(`   Commerce: ${commerce.name}`);
    console.log(`   Driver: ${driver.fullName}`);
    console.log(`   Status: ${order.status}`);
    console.log(`   Total: $${order.totalAmount}\n`);

    console.log('🎯 Next steps:');
    console.log('   1. Test emulator should receive order notifications');
    console.log('   2. Update order status: CONFIRMED → IN_TRANSIT → DELIVERED');
    console.log('   3. Check 3-channel notifications (business, customer, driver)\n');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestOrder();
