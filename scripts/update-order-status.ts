import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const EMULATOR_API = 'http://localhost:3000/api/emulator';

async function sendEmulatorNotification(channel: string, message: string) {
  try {
    const response = await (globalThis as any).fetch(`${EMULATOR_API}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel,
        message,
        phone: channel === 'business' ? '573001234567' : channel === 'driver' ? '573009999999' : '573008888888',
        type: 'notification',
      }),
    });
    if (response.ok) {
      console.log(`   ✓ ${channel.toUpperCase()} notificado`);
    }
  } catch (error) {
    console.error(`   ✗ Error notificando ${channel}:`, error);
  }
}

async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: { include: { commerce: true } },
        delivery: { include: { driver: true } },
      },
    });

    if (!order) {
      console.log('❌ Orden no encontrada');
      return;
    }

    const driver = order.delivery?.driver;

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    console.log(`\n📤 Actualizando orden ${order.reference} a: ${newStatus}\n`);

    // Send notifications to 3 channels
    await sendEmulatorNotification(
      'business',
      `📦 Pedido ${order.reference} - Estado: ${newStatus}\nCliente: ${order.customer.name}`,
    );

    await sendEmulatorNotification(
      'customer',
      `📦 Tu pedido ${order.reference}\nEstado: ${newStatus}\nTotal: $${order.totalAmount}`,
    );

    if (driver) {
      await sendEmulatorNotification(
        'driver',
        `🚗 Asignación actualizada\nPedido: ${order.reference}\nEstado: ${newStatus}\nCliente: ${order.customer.name}`,
      );
    }

    console.log('\n✅ Notificaciones enviadas a los 3 canales\n');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get order ID from args or use latest
async function main() {
  let orderId: string | undefined = process.argv[2];

  if (!orderId) {
    const latestOrder = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' },
      where: { reference: { contains: 'TEST' } },
    });
    orderId = latestOrder?.id;
  }

  if (!orderId) {
    console.log('❌ No order ID provided and no TEST order found');
    process.exit(1);
  }

  const newStatus = process.argv[3] || 'CONFIRMED';

  await updateOrderStatus(orderId, newStatus);
}

main();
