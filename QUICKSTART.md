# ⚡ **DOMIEXPRESS MVP - QUICKSTART GUIDE**

---

## 🚀 **Instalación Rápida**

### 1. Clonar repositorio
```bash
git clone <repo-url>
cd domiExpress
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

### 4. Configurar base de datos
```bash
# Crear base de datos PostgreSQL
npx prisma migrate dev --name init

# Seedear datos de prueba (opcional)
npm run seed
```

### 5. Ejecutar servidor
```bash
npm run start:dev
```

El servidor estará disponible en `http://localhost:3000`

---

## 📊 **Documentación Swagger**

Una vez que el servidor esté corriendo, accede a:
```
http://localhost:3000/api/docs
```

Aquí verás todos los endpoints documentados con ejemplos de request/response.

---

## 🧪 **Ejecutar Tests**

### Tests unitarios
```bash
npm test
```

### Tests con cobertura
```bash
npm test -- --coverage
```

### E2E tests completos
```bash
npm test -- test/mvp-e2e.spec.ts
```

---

## 🔧 **Configuración de Integraciones**

### Wompi (Pagos)
```env
WOMPI_API_KEY=your-key
WOMPI_PRIVATE_KEY=your-private-key
WOMPI_WEBHOOK_SECRET=your-webhook-secret
```

### Firebase (Push Notifications)
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-email
```

### SendGrid (Email)
```env
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@domiexpress.com
```

### WhatsApp Business API
```env
WHATSAPP_API_TOKEN=your-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-id
```

---

## 📁 **Estructura del Proyecto**

```
domiExpress/
├── src/
│   ├── modules/
│   │   ├── auth/                  - Autenticación JWT
│   │   ├── orders/                - Gestión de órdenes
│   │   ├── payments/              - Pagos + Wompi
│   │   ├── deliveries/            - Entregas
│   │   ├── drivers/               - Gestión de drivers
│   │   ├── location-tracking/     - GPS real-time (WebSocket)
│   │   ├── notifications/         - Email + Push + WhatsApp
│   │   ├── products/              - Productos CRUD
│   │   └── analytics/             - Admin dashboard
│   ├── common/
│   │   ├── guards/                - JWT, Rate limiting
│   │   ├── filters/               - Exception filters
│   │   └── middleware/            - Custom middleware
│   ├── app.module.ts              - Root module
│   └── main.ts                    - Bootstrap
├── prisma/
│   └── schema.prisma              - Database schema
├── test/
│   └── mvp-e2e.spec.ts            - E2E test suite
├── package.json                   - Dependencies
├── tsconfig.json                  - TypeScript config
└── README.md                      - Project info
```

---

## 🔑 **Casos de Uso Principales**

### 1. Crear una orden
```bash
curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust-123",
    "items": [
      {
        "productId": "prod-1",
        "quantity": 2,
        "unitPrice": 25000
      }
    ]
  }'
```

### 2. Generar link de pago
```bash
curl -X POST http://localhost:3000/payments/link \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"orderId": "ord-123"}'
```

### 3. Obtener dashboard admin
```bash
curl -X GET http://localhost:3000/admin/analytics/dashboard \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
```

### 4. Listar productos
```bash
curl -X GET "http://localhost:3000/products/commerce/comm-123" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### 5. WebSocket tracking (JavaScript)
```javascript
const socket = io('http://localhost:3000/tracking', {
  auth: {
    token: '<JWT_TOKEN>'
  }
});

// Suscribirse a delivery
socket.emit('subscribe_delivery', { deliveryId: 'del-123' });

// Escuchar actualizaciones
socket.on('location_updated', (data) => {
  console.log('Nueva ubicación:', data);
});

// Desuscribirse
socket.emit('unsubscribe_delivery', { deliveryId: 'del-123' });
```

---

## 📈 **Métricas & Monitoring**

### Health Check
```bash
curl http://localhost:3000/health
```

### Ver logs
```bash
# Logs en tiempo real
npm run start:dev

# Con formato JSON (para producción)
LOG_LEVEL=debug npm start
```

---

## 🐳 **Docker**

### Build imagen
```bash
docker build -t domiexpress:latest .
```

### Run con Docker Compose
```bash
docker-compose up -d
```

Esto inicia:
- 🟢 NestJS API (puerto 3000)
- 🗄️ PostgreSQL (puerto 5432)
- 🔴 Redis (puerto 6379)

---

## 🌐 **Deployment**

### Staging
```bash
npm run build
npm start
```

### Production
```bash
# Build
npm run build

# Set env vars
export NODE_ENV=production
export DATABASE_URL=<prod-db-url>
export JWT_SECRET=<prod-secret>

# Run
npm start
```

### Cloud Platforms

#### Railway
```bash
railway link
railway up
```

#### Vercel (con serverless)
```bash
vercel deploy
```

#### AWS EC2
```bash
pm2 start npm -- start
pm2 startup
pm2 save
```

---

## 🆘 **Troubleshooting**

### Error: "Database connection failed"
```bash
# Verificar PostgreSQL está corriendo
psql -U postgres -d domiexpress

# Reset DB
npx prisma migrate reset
```

### Error: "JWT token invalid"
```bash
# Verificar JWT_SECRET en .env
echo $JWT_SECRET

# Regenerar token
curl -X POST http://localhost:3000/auth/login \
  -d '{"email":"user@example.com","password":"password"}'
```

### Error: "Wompi webhook failed"
```bash
# Verificar webhook URL es accesible externamente
# Usar ngrok para local testing:
ngrok http 3000
# Configurar WOMPI_WEBHOOK_URL=https://your-ngrok-url/webhooks/wompi
```

### Tests fallan
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm test
```

---

## 📞 **Soporte**

- 📧 Email: support@domiexpress.com
- 📋 Issues: github.com/domiexpress/issues
- 💬 Slack: #domiexpress-support
- 📚 Docs: docs.domiexpress.com

---

## ✅ **Checklist Pre-launch**

```
✅ Instalación completada
✅ Base de datos configurada
✅ Variables de entorno seteadas
✅ Tests pasando
✅ Swagger documentation accesible
✅ Integraciones (Wompi, Firebase, SendGrid) verificadas
✅ WebSocket funcionando
✅ Logging configurado
✅ Error handling probado
✅ Database backup configurado
```

---

## 🚀 **¡LISTO PARA LANZAR!**

El MVP de DomiExpress está completamente funcional. Sigue este guide y estarás corriendo en cuestión de minutos.

**Happy coding! 🎉**

---

*Última actualización: 2026-08-13*
