# Integraciones con Servicios Externos

## Matriz de Integraciones

| Servicio | Propósito | Crítico | Fallback | Latencia |
|----------|-----------|---------|----------|----------|
| **Meta WhatsApp** | Mensajería bidireccional | ✅ Sí | SMS (futuro) | <2s |
| **Wompi** | Pagos en línea | ✅ Sí | Manual (futuro) | <3s |
| **Google Maps** | Geocoding, distancia, rutas | ❌ No | Geopy library | <2s |
| **Claude API** | NLU, búsqueda, OCR | ❌ No | Keywords fallback | <5s |
| **Cloudflare R2** | Almacenamiento objetos | ❌ No | Local temp storage | <1s |
| **Cloudflare DNS** | DNS + DDoS | ✅ Sí | Route53 alternate | <50ms |
| **DataDog** | Observabilidad | ❌ No | Local logs fallback | <1s |

---

## WhatsApp Cloud API

### Arquitectura

```
Cliente WhatsApp
    ↓ (Message)
Meta WhatsApp Servers
    ↓ (Webhook)
NestJS Webhook Endpoint
    ├─ Verify signature (HMAC)
    ├─ Validate payload
    ├─ Process message
    └─ Return 200 OK
    ↓
Save to DB
Add to NLP Queue
    ↓
NLP Service
    ├─ Claude API (extract intent)
    ├─ Save results
    └─ Emit event
    ↓
Listeners react
    ├─ Send response back via WhatsApp API
    └─ Update state machine
```

### Endpoints

#### Webhook (Incoming)

```
POST /webhooks/whatsapp/messages

Headers:
  - Content-Type: application/json
  
Body:
  {
    "messaging_product": "whatsapp",
    "entry": [{
      "id": "...",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "phone_number_id": "...",
            "display_phone_number": "+57..."
          },
          "contacts": [{
            "profile": {"name": "Juan"},
            "wa_id": "573001234567"
          }],
          "messages": [{
            "from": "573001234567",
            "id": "...",
            "timestamp": "1234567890",
            "type": "text",
            "text": {"body": "Quiero una hamburguesa"}
          }]
        }
      }]
    }]
  }

Processing:
  1. Verify X-Hub-Signature (HMAC-SHA256)
  2. Extract message from payload
  3. Validate sender (is customer?)
  4. Add to message queue
  5. Return 200 OK immediately
  6. Process async
```

#### Send Message (Outgoing)

```
POST https://graph.instagram.com/v18.0/{phone_id}/messages

Headers:
  - Authorization: Bearer {access_token}
  - Content-Type: application/json
  
Body (Text):
  {
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "573001234567",
    "type": "text",
    "text": {
      "preview_url": true,
      "body": "Tu pedido fue confirmado..."
    }
  }

Body (Interactive):
  {
    "messaging_product": "whatsapp",
    "to": "573001234567",
    "type": "interactive",
    "interactive": {
      "type": "button",
      "body": {"text": "¿Aceptas el pedido?"},
      "action": {
        "buttons": [
          {"type": "reply", "reply": {"id": "1", "title": "Aceptar"}},
          {"type": "reply", "reply": {"id": "2", "title": "Rechazar"}}
        ]
      }
    }
  }

Response:
  {
    "messages": [
      {"id": "wamid.xxx", "message_status": "accepted"}
    ]
  }
```

#### Webhook Configuration

```
Verify Token: Random 256-bit string (secured)
Webhook URL: https://api.domiexpress.app/webhooks/whatsapp/messages
Subscribe to: messages, message_status_update, message_template_status_update

Verification flow (one-time):
  1. Meta calls: GET /webhooks/whatsapp/messages?
     mode=subscribe&
     challenge=abc123&
     verify_token=my_verify_token
  2. We validate verify_token
  3. Return challenge
```

### Retry Strategy

```
If request to WhatsApp fails:
  1. First retry: Immediate
  2. Second retry: 5 seconds
  3. Third retry: 30 seconds
  4. Fourth retry: 5 minutes (in queue)
  5. After 24 hours: Move to DLQ

Exponential backoff with jitter
Max 5 retries before marking as failed
```

### Rate Limiting

```
Meta limits:
  - 1000 messages/second per phone number ID
  - 60 API calls/minute for status updates

Our limits:
  - 100 messages/second per customer
  - 1000 messages/second globally
  
Queueing:
  - If approaching limit: Add to queue
  - BullMQ workers respect rate limit
  - Monitor metrics via DataDog
```

---

## Wompi (Payments)

### Flujo de Pago

```
1. GENERATE PAYMENT LINK (HTTP POST)
   NestJS → Wompi API
   Body: {
     amount_in_cents: 6800000,
     currency: "COP",
     reference: "ORD-2024-00234",
     customer_email: "juan@example.com",
     redirect_url: "https://app.domiexpress.app/success"
   }
   Response: {
     data: {
       id: "TX-12345",
       amount_in_cents: 6800000,
       status: "PENDING",
       payment_link: "https://checkout.wompi.co/l/TX-12345",
       expires_at: "2024-01-15T23:59:59Z"
     }
   }

2. CLIENT PAYS (Client navigates to payment_link)
   - Opens Wompi checkout
   - Enters card details
   - Completes payment
   - Wompi processes

3. WEBHOOK NOTIFICATION (Wompi → NestJS)
   POST /webhooks/wompi/transaction
   Body: {
     data: {
       id: "TX-12345",
       status: "APPROVED",
       amount_in_cents: 6800000,
       reference: "ORD-2024-00234",
       payment_method: "CARD",
       timestamp: "2024-01-15T18:35:42Z"
     },
     signature: "hmac_signature"
   }

4. PROCESS WEBHOOK
   - Verify signature (HMAC-SHA256)
   - Find order by reference
   - Validate amount matches
   - Update order status to PAYMENT_OK
   - Emit PaymentCompleted event
   - Return 200 OK

5. REDIRECT (Client returns from Wompi)
   - Show success page
   - Order continues processing
```

### Error Handling

```
Wompi rejects payment:
  ├─ Insufficient funds
  ├─ Card declined
  ├─ Fraud detected
  ├─ Expired card
  └─ Invalid CVV

Response: status=DECLINED
  → Notify customer
  → Regenerate payment link
  → Allow retry
```

### Refunds

```
POST /wompi/refund
Body: {
  transaction_id: "TX-12345",
  amount_in_cents: 6800000 (full or partial)
}

Response: {
  refund_id: "REF-...",
  status: "SUBMITTED",
  processing_time: "3-5 business days"
}

Webhook notification:
  - When refund completes
  - Update order status
  - Notify customer
```

### Reconciliation

```
Daily Cron (11 PM):
  1. Get all transactions from last 24h
  2. Compare with Wompi API
  3. Detect discrepancies
  4. Alert if found
  5. Auto-retry if partially processed
```

---

## Google Maps API

### Geocoding

```
GET https://maps.googleapis.com/maps/api/geocode/json?
  address=Cra+5+%234-20+Timb%C3%ADo+Cauca&
  key=API_KEY

Response:
  {
    results: [{
      formatted_address: "Cra 5 #4-20, Timbío, Cauca",
      geometry: {
        location: {lat: 4.7908, lng: -76.1428},
        viewport: {...}
      },
      place_id: "ChIJ...",
      types: ["street_address"]
    }],
    status: "OK"
  }

Caching:
  - Key: "geocode:{address}"
  - TTL: 30 days (directions don't change)
```

### Distance Matrix

```
POST https://maps.googleapis.com/maps/api/distancematrix/json?
  origins=4.7908,-76.1428|4.7900,-76.1420&
  destinations=4.7950,-76.1400&
  mode=driving&
  key=API_KEY

Response:
  {
    rows: [{
      elements: [
        {
          distance: {text: "1.2 km", value: 1234},
          duration: {text: "5 mins", value: 300},
          status: "OK"
        }
      ]
    }],
    status: "OK"
  }

Caching:
  - Key: "distance:{from}:{to}"
  - TTL: 24 hours
```

### Directions

```
GET https://maps.googleapis.com/maps/api/directions/json?
  origin=4.7908,-76.1428&
  destination=4.7950,-76.1400&
  mode=driving&
  key=API_KEY

Response:
  {
    routes: [{
      legs: [{
        distance: {text: "1.2 km", value: 1234},
        duration: {text: "5 mins", value: 300},
        steps: [...]
      }],
      overview_polyline: {...}
    }],
    status: "OK"
  }

Caching:
  - TTL: 24 hours
  - Used for offline routing (future)
```

### Quota & Limits

```
Pricing: $7 per 1000 requests
Monthly quota: ~$200 (budgeted for 500k requests)

Rate limit:
  - 50 QPS (per-second)
  - 25,000 daily

Optimization:
  - Batch requests when possible
  - Cache aggressively
  - Use Geopy (local) for simple calculations
```

---

## Claude API (Anthropic)

### NLU - Message Processing

```
POST https://api.anthropic.com/v1/messages

Body:
  {
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 500,
    system: "Eres experto en e-commerce de comida...",
    messages: [{
      role: "user",
      content: "Quiero una hamburguesa sin tomate..."
    }]
  }

Response:
  {
    content: [{
      type: "text",
      text: "{\"products\": [...], \"confidence\": 0.95}"
    }],
    stop_reason: "end_turn",
    usage: {
      input_tokens: 150,
      output_tokens: 200
    }
  }

Cost:
  - Input: $3/1M tokens
  - Output: $15/1M tokens
  - Estimate: $0.001-0.005 per query
```

### Vision - OCR (Futuro)

```
POST https://api.anthropic.com/v1/messages

Body:
  {
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2000,
    messages: [{
      role: "user",
      content: [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: "base64_encoded_pdf"
          }
        },
        {
          type: "text",
          text: "Extrae el catálogo de este PDF..."
        }
      ]
    }]
  }

Cost: Similar a text + image token overhead
```

### Caching

```
- Cache modelo en memoria
- Batch requests en cola de IA
- Rate limiting: 10 req/segundo (Anthropic plan)
```

---

## Cloudflare R2 (Storage)

### Upload

```
PUT https://r2-bucket.domiexpress.app/orders/ORD-123/photo.jpg

Headers:
  - Authentication: AWS Signature v4
  - Content-Type: image/jpeg

Body: Binary file data

Response: 200 OK
```

### Download

```
GET https://cdn.domiexpress.app/orders/ORD-123/photo.jpg

Response:
  - 200 OK + binary file
  - Served via Cloudflare CDN (cached)
```

### Retention Policy

```
Fotos de entrega: 7 años (compliance)
PDFs de menús: Indefinido
Temp uploads: 30 días
```

---

## Manejo Global de Errores de Integraciones

```
Wompi falla:
  └─ Payment in PENDING (retry via queue)
  
WhatsApp falla:
  └─ Message in QUEUED (retry up to 24h)
  
Maps falla:
  └─ Use cached distance or estimate
  
IA falla:
  └─ Fallback a keyword-based search
  
R2 falla:
  └─ Temp store locally, retry later
```

---

**Estado**: Documentado, implementación en ETAPA 4
