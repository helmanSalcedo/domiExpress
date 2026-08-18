import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Colombian cities and municipalities
const MUNICIPALITIES = [
  { name: 'Bogotá', department: 'Cundinamarca', lat: 4.7110, lng: -74.0721 },
  { name: 'Medellín', department: 'Antioquia', lat: 6.2442, lng: -75.5812 },
  { name: 'Cali', department: 'Valle del Cauca', lat: 3.4516, lng: -76.5319 },
  { name: 'Barranquilla', department: 'Atlántico', lat: 10.9639, lng: -74.7964 },
  { name: 'Cartagena', department: 'Bolívar', lat: 10.3932, lng: -75.5148 },
];

// Commerce categories
const COMMERCE_CATEGORIES = [
  { name: 'Restaurant', count: 15 },
  { name: 'Pharmacy', count: 10 },
  { name: 'Clothing Store', count: 8 },
  { name: 'Supermarket', count: 7 },
  { name: 'Bakery', count: 5 },
  { name: 'Ice Cream Shop', count: 3 },
  { name: 'Shoe Store', count: 2 },
];

// Product names by category
const PRODUCTS: { [key: string]: string[] } = {
  Restaurant: ['Hamburguesa', 'Pizza', 'Arepa', 'Bandeja Paisa', 'Ceviche', 'Ajiaco', 'Empanada'],
  Pharmacy: ['Paracetamol', 'Ibuprofeno', 'Vitamina C', 'Multivitamínicos', 'Antitusivo'],
  'Clothing Store': ['Camiseta', 'Pantalón', 'Vestido', 'Chaqueta', 'Zapatos'],
  Supermarket: ['Arroz', 'Aceite', 'Leche', 'Pan', 'Huevos', 'Queso'],
  Bakery: ['Pan integral', 'Croissant', 'Donut', 'Galleta', 'Torta'],
  'Ice Cream Shop': ['Helado Vainilla', 'Helado Chocolate', 'Helado Fresa', 'Sorbet'],
  'Shoe Store': ['Zapatillas', 'Botas', 'Sandalias', 'Formales'],
};

// Commerce names
const COMMERCE_NAMES: { [key: string]: string[] } = {
  Restaurant: ['La Picantería', 'El Sabor Colombiano', 'Delicias del Pacífico', 'Grill Master', 'Pizza Paradise'],
  Pharmacy: ['Farmacia Mayor', 'Droguería La Salud', 'Farmacia Punto Verde', 'Droguerías Premium'],
  'Clothing Store': ['Fashion Zone', 'Ropa Moderna', 'Tienda de Moda', 'Estilo Casual'],
  Supermarket: ['Super Ahorro', 'Mercado Local', 'Supermercado Express'],
  Bakery: ['Panadería Tradicional', 'El Horno', 'Pan Fresco'],
  'Ice Cream Shop': ['Heladería Italiana', 'Helados del Parque'],
  'Shoe Store': ['Zapaterías Elegancia', 'Calzado Premium'],
};

interface Commerce {
  id: string;
  name: string;
  category: string;
  municipalityId: string;
  whatsappNumber: string;
  locationLatitude: number;
  locationLongitude: number;
}

interface Customer {
  id: string;
  phone: string;
  name: string;
  municipalityId: string;
}

interface Driver {
  id: string;
  phone: string;
  fullName: string;
  municipalityId: string;
}

interface Product {
  id: string;
  commerceId: string;
  name: string;
  basePrice: number;
}

function generatePhone(): string {
  return `573${Math.floor(Math.random() * 1000000000)
    .toString()
    .padStart(9, '0')}`;
}

async function seed() {
  console.log('🌱 Starting professional seed...\n');

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.delivery.deleteMany({});
    await prisma.rating.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.orderState.deleteMany({});
    await prisma.refund.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.driverEarning.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.commerce.deleteMany({});
    await prisma.driver.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.municipality.deleteMany({});
    console.log('✅ Data cleared\n');

    // Create municipalities
    console.log('🏙️  Creating municipalities...');
    const municipalities: Record<string, any> = {};
    for (const mun of MUNICIPALITIES) {
      const created = await prisma.municipality.create({
        data: {
          name: mun.name,
          department: mun.department,
          centerLatitude: mun.lat,
          centerLongitude: mun.lng,
          isPublished: true,
        },
      });
      municipalities[mun.name] = created;
    }
    console.log(`✅ Created ${MUNICIPALITIES.length} municipalities\n`);

    // Create commerces
    console.log('🏪 Creating commerces...');
    const commerces: Commerce[] = [];
    let commerceIndex = 0;
    const categoryNames = COMMERCE_CATEGORIES.map(c => c.name);

    for (const catName of categoryNames) {
      const catConfig = COMMERCE_CATEGORIES.find(c => c.name === catName);
      if (!catConfig) continue;

      const names = COMMERCE_NAMES[catName] || ['Commerce'];
      for (let i = 0; i < catConfig.count; i++) {
        const municipality = MUNICIPALITIES[commerceIndex % MUNICIPALITIES.length];
        const nameList = names as string[];
        const commerceName = nameList[i % nameList.length] || `${catName} ${i}`;
        const whatsappNumber = generatePhone();

        const commerce = await prisma.commerce.create({
          data: {
            name: commerceName,
            whatsappNumber: whatsappNumber,
            ownerName: `Owner ${commerceName}`,
            ownerPhone: generatePhone(),
            ownerEmail: `owner.${commerceName.replace(/\s+/g, '').toLowerCase()}@example.com`,
            apiKey: `sk_${Math.random().toString(36).substring(2, 15)}`,
            municipalityId: municipalities[municipality.name].id,
            category: catName,
            description: `${commerceName} - ${catName} in ${municipality.name}`,
            locationLatitude: municipality.lat + (Math.random() - 0.5) * 0.1,
            locationLongitude: municipality.lng + (Math.random() - 0.5) * 0.1,
            isActive: true,
            isVerified: true,
            rating: Math.random() * 5,
          },
        });
        commerces.push({
          id: commerce.id,
          name: commerce.name,
          category: catName,
          municipalityId: commerce.municipalityId,
          whatsappNumber: commerce.whatsappNumber,
          locationLatitude: commerce.locationLatitude as number,
          locationLongitude: commerce.locationLongitude as number,
        });
        commerceIndex++;
      }
    }
    console.log(`✅ Created ${commerces.length} commerces\n`);

    // Create products
    console.log('📦 Creating products...');
    const products: Product[] = [];
    for (const commerce of commerces) {
      const productNames = PRODUCTS[commerce.category] || ['Product'];
      const productsToCreate = productNames.slice(0, Math.floor(Math.random() * 4) + 2);

      for (const prodName of productsToCreate) {
        const product = await prisma.product.create({
          data: {
            name: prodName,
            description: `${prodName} from ${commerce.name}`,
            basePrice: Math.floor(Math.random() * 90000) + 10000,
            commerceId: commerce.id,
            isActive: true,
            stockStatus: 'IN_STOCK',
            currency: 'COP',
          },
        });
        products.push({
          id: product.id,
          commerceId: commerce.id,
          name: product.name,
          basePrice: Math.floor(Math.random() * 90000) + 10000,
        });
      }
    }
    console.log(`✅ Created ${products.length} products\n`);

    // Create customers
    console.log('👥 Creating customers...');
    const customers: Customer[] = [];
    const firstNames = ['Juan', 'María', 'Carlos', 'Ana', 'Pedro', 'Laura', 'Diego', 'Sofia'];
    const lastNames = ['López', 'García', 'Rodríguez', 'Martínez', 'González', 'Pérez', 'Sánchez'];

    for (let i = 0; i < 50; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const munic = Object.values(municipalities)[Math.floor(Math.random() * Object.values(municipalities).length)];

      const customer = await prisma.customer.create({
        data: {
          name: `${firstName} ${lastName}`,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@example.com`,
          phone: generatePhone(),
          municipalityId: munic.id,
          status: 'ACTIVE',
          isVerified: true,
          rating: Math.random() * 5 + 1,
        },
      });
      customers.push({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        municipalityId: customer.municipalityId,
      });
    }
    console.log(`✅ Created ${customers.length} customers\n`);

    // Create drivers
    console.log('🚗 Creating drivers...');
    const drivers: Driver[] = [];
    for (let i = 0; i < 20; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const munic = Object.values(municipalities)[Math.floor(Math.random() * Object.values(municipalities).length)];

      const driver = await prisma.driver.create({
        data: {
          fullName: `${firstName} ${lastName}`,
          phone: generatePhone(),
          identificationNumber: `${Math.floor(Math.random() * 100000000)}`,
          identificationType: 'CC',
          municipalityId: munic.id,
          vehicleType: ['BIKE', 'MOTORCYCLE', 'CAR'][Math.floor(Math.random() * 3)],
          isActive: true,
          isVerified: true,
          rating: Math.random() * 5 + 1,
        },
      });
      drivers.push({
        id: driver.id,
        phone: driver.phone,
        fullName: driver.fullName,
        municipalityId: driver.municipalityId,
      });
    }
    console.log(`✅ Created ${drivers.length} drivers\n`);

    // Create orders
    console.log('🛒 Creating orders...');
    let orderCount = 0;
    for (let i = 0; i < 150; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const commerce = commerces[Math.floor(Math.random() * commerces.length)];
      const driver = drivers[Math.floor(Math.random() * drivers.length)];
      const statuses = ['PENDING', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
      const munic = Object.values(municipalities)[Math.floor(Math.random() * Object.values(municipalities).length)];

      const order = await prisma.order.create({
        data: {
          reference: `ORD-${Date.now()}-${i}`,
          customerId: customer.id,
          municipalityId: munic.id,
          customerPhone: customer.phone,
          customerLocationLatitude: munic.centerLatitude + (Math.random() - 0.5) * 0.1,
          customerLocationLongitude: munic.centerLongitude + (Math.random() - 0.5) * 0.1,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          subtotal: Math.floor(Math.random() * 200000) + 20000,
          deliveryFee: 5000,
          totalAmount: Math.floor(Math.random() * 200000) + 25000,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        },
      });

      // Create order item
      const productsForCommerce = products.filter(p => p.commerceId === commerce.id);
      if (productsForCommerce.length > 0) {
        const product = productsForCommerce[Math.floor(Math.random() * productsForCommerce.length)];
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            commerceId: commerce.id,
            productId: product.id,
            quantity: Math.floor(Math.random() * 5) + 1,
            unitPrice: product.basePrice,
            subtotal: product.basePrice * (Math.floor(Math.random() * 5) + 1),
          },
        });
      }

      // Create delivery if order is not cancelled
      if (order.status !== 'CANCELLED') {
        await prisma.delivery.create({
          data: {
            orderId: order.id,
            driverId: driver.id,
            status: order.status === 'PENDING' ? 'PENDING' : order.status === 'CONFIRMED' ? 'ASSIGNED' : 'DELIVERING',
            pickupLocationLatitude: commerce.locationLatitude,
            pickupLocationLongitude: commerce.locationLongitude,
            deliveryLocationLatitude: order.customerLocationLatitude,
            deliveryLocationLongitude: order.customerLocationLongitude,
            distanceKm: Math.random() * 10 + 1,
            estimatedDurationMinutes: Math.floor(Math.random() * 60) + 15,
          },
        });
      }

      orderCount++;
    }
    console.log(`✅ Created ${orderCount} orders\n`);

    console.log('✨ Professional seed completed!\n');
    console.log('📊 Summary:');
    console.log(`   - Municipalities: ${MUNICIPALITIES.length}`);
    console.log(`   - Commerces: ${commerces.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Customers: ${customers.length}`);
    console.log(`   - Drivers: ${drivers.length}`);
    console.log(`   - Orders: ${orderCount}`);
  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
