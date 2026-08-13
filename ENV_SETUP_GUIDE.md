# 🔧 **GUÍA COMPLETA PARA CONFIGURAR .env**

---

## **PASO 1: Variables Básicas (AHORA)**

Edita tu `.env`:

```bash
nano .env
```

Reemplaza los primeros 4 campos:

```env
DATABASE_URL="postgresql://user:password123@localhost:5432/domiexpress"
REDIS_URL="redis://localhost:6379"
REDIS_HOST="localhost"
REDIS_PORT="6379"

JWT_SECRET="your-super-secret-jwt-key-should-be-256-chars-minimum-asdfjklqwerty123456789abcdefghijklmnopqrstuvwxyz"
JWT_EXPIRATION="24h"

NODE_ENV="development"
PORT=3000
LOG_LEVEL="debug"
```

---

## **PASO 2: Wompi (Pagos) - 10 MIN**

### 2.1 Crear cuenta Wompi
1. Ir a: https://wompi.co
2. Sign up → Crear cuenta comercial
3. Verificar email

### 2.2 Obtener API Keys (Testing)
1. En dashboard: **Settings** → **API Keys**
2. Crear nueva API Key
3. Copiar:
   - `test_integrity_xxxxx` → `WOMPI_API_KEY`
   - `prv_test_xxxxx` → `WOMPI_PRIVATE_KEY`
   - `pub_test_xxxxx` → `WOMPI_PUBLIC_KEY`

### 2.3 Configurar Webhook
1. En **Settings** → **Webhooks**
2. Agregar webhook:
   ```
   https://tu-dominio.com/webhooks/wompi
   ```
   (Usar ngrok si es local: `ngrok http 3000` → `https://xxxxx.ngrok.io/webhooks/wompi`)

### 2.4 Actualizar .env
```env
WOMPI_API_KEY="test_integrity_xxxxx"
WOMPI_PRIVATE_KEY="prv_test_xxxxx"
WOMPI_PUBLIC_KEY="pub_test_xxxxx"
WOMPI_WEBHOOK_SECRET="webhook_secret_test_12345"
WOMPI_ENVIRONMENT="test"
```

---

## **PASO 3: Firebase (Push Notifications) - 15 MIN**

### 3.1 Crear proyecto Firebase
1. Ir a: https://console.firebase.google.com
2. Click **Crear proyecto**
3. Nombre: `domiexpress-dev`
4. Crear

### 3.2 Habilitar Cloud Messaging
1. En Firebase: **Build** → **Cloud Messaging**
2. Click **Enable**

### 3.3 Crear Service Account
1. **Project Settings** (⚙️) → **Service Accounts**
2. Click **Generate new private key**
3. Descargar JSON (algo así: `domiexpress-dev-xxxxx.json`)
4. Abrir archivo y copiar campos:

```json
{
  "type": "service_account",
  "project_id": "domiexpress-dev",
  "private_key_id": "key-id-xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@domiexpress-dev.iam.gserviceaccount.com",
  "client_id": "123456789",
  ...
}
```

### 3.4 Actualizar .env
```env
FIREBASE_TYPE="service_account"
FIREBASE_PROJECT_ID="domiexpress-dev"
FIREBASE_PRIVATE_KEY_ID="key-id-xxxxx"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@domiexpress-dev.iam.gserviceaccount.com"
FIREBASE_CLIENT_ID="123456789"
FIREBASE_AUTH_URI="https://accounts.google.com/o/oauth2/auth"
FIREBASE_TOKEN_URI="https://oauth2.googleapis.com/token"
FIREBASE_AUTH_PROVIDER_CERT_URL="https://www.googleapis.com/oauth2/v1/certs"
FIREBASE_CLIENT_CERT_URL="https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40domiexpress-dev.iam.gserviceaccount.com"
```

⚠️ **IMPORTANTE:** En `FIREBASE_PRIVATE_KEY`, reemplazar saltos de línea:
- Original: `"-----BEGIN PRIVATE KEY-----\nline1\nline2\n-----END PRIVATE KEY-----\n"`
- En .env, mantener tal cual (con \n)

---

## **PASO 4: SendGrid (Email) - 5 MIN**

### 4.1 Crear cuenta SendGrid
1. Ir a: https://sendgrid.com
2. Sign up (usa email empresarial si tienes)
3. Verificar email

### 4.2 Obtener API Key
1. **Settings** → **API Keys**
2. Click **Create API Key**
3. Nombre: `domiexpress-dev`
4. Permisos: `Full Access`
5. Copiar clave (empieza con `SG.`)

### 4.3 Actualizar .env
```env
SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
SENDGRID_FROM_EMAIL="noreply@domiexpress.com"
SENDGRID_FROM_NAME="DomiExpress"
```

---

## **PASO 5: WhatsApp Business API - 20 MIN**

### 5.1 Crear Business Account
1. Ir a: https://developers.facebook.com
2. Login con cuenta Facebook
3. **Apps** → **Create App**
4. Tipo: **Business**
5. Nombre: `DomiExpress`

### 5.2 Agregar WhatsApp
1. En app: **Add Products** → Buscar **WhatsApp**
2. Click **Set Up**

### 5.3 Obtener credenciales
1. **WhatsApp** → **Getting Started**
2. Crear **Phone Number ID**
3. Generar **Access Token** (válido 24h)
4. Business Account ID está en **Settings**

### 5.4 Actualizar .env
```env
WHATSAPP_API_TOKEN="EAABsbCS1iHgBO0ZAZBfZCxxxxxxxxxxx"
WHATSAPP_BUSINESS_ACCOUNT_ID="123456789"
WHATSAPP_PHONE_NUMBER_ID="1234567890"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="your-webhook-token-here"
```

---

## **PASO 6: Claude AI (Chatbot) - 5 MIN**

### 6.1 Obtener API Key
1. Ir a: https://console.anthropic.com
2. **API Keys** → **Create Key**
3. Copiar clave (empieza con `sk-ant-`)

### 6.2 Actualizar .env
```env
CLAUDE_API_KEY="sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
CLAUDE_MODEL="claude-opus-5"
```

---

## **PASO 7: Verificar .env**

Tu `.env` final debe tener todas estas secciones:

```bash
# Database
DATABASE_URL="..."
REDIS_URL="..."

# JWT
JWT_SECRET="..."

# Wompi
WOMPI_API_KEY="..."
WOMPI_PRIVATE_KEY="..."

# Firebase
FIREBASE_PROJECT_ID="..."
FIREBASE_PRIVATE_KEY="..."

# SendGrid
SENDGRID_API_KEY="..."

# WhatsApp
WHATSAPP_API_TOKEN="..."

# Claude
CLAUDE_API_KEY="..."

# App
NODE_ENV="development"
PORT=3000
```

Verificar:
```bash
grep -c "=" .env
# Debe mostrar ~30+ líneas
```

---

## **PASO 8: Iniciar Todo**

Una vez que .env esté completo:

```bash
# 1. Iniciar Docker (PostgreSQL + Redis)
docker-compose up -d

# 2. Esperar 10 segundos
sleep 10

# 3. Crear base de datos
npx prisma migrate dev --name init

# 4. Cargar datos de prueba (opcional)
npm run seed

# 5. Compilar
npm run build

# 6. INICIAR SERVIDOR
npm run start:dev
```

---

## ✅ **Cuando todo esté listo:**

```
http://localhost:3000/api/docs
```

Verás **todos** los endpoints documentados.

---

## 🆘 **Si algo falla:**

```bash
# Ver logs de contenedores
docker ps
docker logs domiexpress-db
docker logs domiexpress-redis

# Ver errores de aplicación
npm run start:dev

# Ver database
npx prisma studio
```

---

**¡Tiempo total: ~60-90 minutos!**

Una vez completado, el MVP estará 100% funcional. 🚀
