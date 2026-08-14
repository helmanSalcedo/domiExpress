# Firebase Configuration Checklist ✅

## Backend Setup

### ✅ Environment Variables
- [x] `FIREBASE_PROJECT_ID` = "domiya-9a926"
- [x] `FIREBASE_PRIVATE_KEY_ID` = "73180fc9341805c5c7cadbccb164673333e950bc"
- [x] `FIREBASE_PRIVATE_KEY` = Private key from service account
- [x] `FIREBASE_CLIENT_EMAIL` = "firebase-adminsdk-fbsvc@domiya-9a926.iam.gserviceaccount.com"
- [x] `FIREBASE_CLIENT_ID` = "109894081202589246050"
- [x] `FIREBASE_MESSAGING_SENDER_ID` = "412712470544"
- [x] `FIREBASE_VAPID_KEY` = "BEfFyFbS9sIPPmxwbiGignGxweYs_8tcUD1O7jFNA7Fvech8Df_B1t8Gd8E0X79NL8qHel7KC5xrVLumqmJTcpY"

### ✅ Backend Code
- [x] Push Service initialized with Firebase Admin SDK
- [x] Notifications Controller created with endpoints
- [x] Notifications Module updated with providers
- [x] Firebase config file created

### ✅ API Endpoints Ready
```
POST /notifications/register-device          # Register FCM token
POST /notifications/unregister-device        # Remove FCM token
POST /notifications/send-test                # Send test notification
POST /notifications/subscribe-topic          # Subscribe to topic
POST /notifications/unsubscribe-topic        # Unsubscribe from topic
```

## Frontend Setup

### ⏳ Pending Frontend Configuration

**Steps to complete in your React app:**

#### 1. Install Firebase
```bash
npm install firebase
```

#### 2. Create `.env` file
```bash
REACT_APP_FIREBASE_WEB_API_KEY="your-web-api-key"
REACT_APP_FIREBASE_PROJECT_ID="domiya-9a926"
REACT_APP_FIREBASE_MESSAGING_SENDER_ID="412712470544"
REACT_APP_FIREBASE_APP_ID="1:412712470544:web:xxxxx"
REACT_APP_FIREBASE_VAPID_KEY="BEfFyFbS9sIPPmxwbiGignGxweYs_8tcUD1O7jFNA7Fvech8Df_B1t8Gd8E0X79NL8qHel7KC5xrVLumqmJTcpY"
```

**To get `REACT_APP_FIREBASE_WEB_API_KEY` and `REACT_APP_FIREBASE_APP_ID`:**

1. Go to Firebase Console → Project Settings → General
2. Scroll down to "Your apps" section
3. Find or create Web app
4. Copy the config:
```json
{
  "apiKey": "AIzaSy...", // Copy this to REACT_APP_FIREBASE_WEB_API_KEY
  "projectId": "domiya-9a926",
  "messagingSenderId": "412712470544",
  "appId": "1:412712470544:web:...", // Copy this
  ...
}
```

#### 3. Copy Firebase setup files
Copy the code from `docs/FIREBASE_SETUP.md`:
- [ ] `src/lib/firebase.ts` - Firebase initialization
- [ ] `src/hooks/useFirebaseNotifications.ts` - React hook
- [ ] `public/firebase-messaging-sw.js` - Service Worker

#### 4. Update App component
```typescript
import { useFirebaseNotifications } from './hooks/useFirebaseNotifications';

export default function App() {
  const { token, isSupported } = useFirebaseNotifications();
  
  return (
    <div>
      {/* Your app */}
    </div>
  );
}
```

## Database Setup

### ⏳ Update Prisma Schema

Add to your `User` model:

```prisma
model User {
  id                String   @id @default(cuid())
  email             String   @unique
  // ... existing fields ...
  
  // NEW: Firebase Cloud Messaging
  fcmTokens         String[]
  notificationPrefs NotificationPreference?
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model NotificationPreference {
  id                    String  @id @default(cuid())
  userId                String  @unique
  pushNotifications     Boolean @default(true)
  orderUpdates          Boolean @default(true)
  promotionalOffers     Boolean @default(true)
  deliveryNotifications Boolean @default(true)
  user                  User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

Then run:
```bash
npm run db:migrate -- --name add_fcm_tokens
```

## Testing Checklist

### Manual Testing

- [ ] Backend starts without Firebase errors
- [ ] Frontend service worker registers successfully
- [ ] User grants notification permission
- [ ] FCM token is generated
- [ ] Token is sent to backend via `/notifications/register-device`
- [ ] Test notification received via `/notifications/send-test`

### Send Test Notification

```bash
# 1. Get your device token (from browser console)
token = await requestFCMToken()

# 2. Copy the token
# "c5M0pJ2k9Q4..."

# 3. Send test notification
curl -X POST http://localhost:3000/notifications/send-test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceToken": "c5M0pJ2k9Q4...",
    "title": "Test Notification",
    "body": "This is a test from DomiExpress!"
  }'
```

## Integration Points

### After Setup, Enable Notifications for:

- [ ] **Order Confirmation** - When customer places order
  - Uses: `sendOrderConfirmationNotification()`
  
- [ ] **Driver Assignment** - When driver is assigned
  - Uses: `sendDeliveryAssignedNotification()`
  
- [ ] **Delivery Started** - When driver starts delivery
  - Uses: `sendDeliveryStartedNotification()`
  
- [ ] **Delivery Completed** - When order is delivered
  - Uses: `sendDeliveryCompletedNotification()`
  
- [ ] **Promotional Offers** - Bulk notifications
  - Uses: `sendPromotionalNotification()`

## Troubleshooting

### Backend Issues

**Error: "Cannot find module 'firebase-admin'"**
```bash
npm install firebase-admin
```

**Error: "Firebase not initialized"**
- Check all env variables are set
- Check private key includes newlines correctly

**Error: "PERMISSION_DENIED"**
- Verify Firebase project ID is correct
- Check credentials have messaging permissions

### Frontend Issues

**Error: "Service Worker failed to register"**
- Check `public/firebase-messaging-sw.js` exists
- Clear browser cache
- Ensure app is served over HTTPS (or localhost)

**Error: "Permission denied"**
- User must explicitly grant notification permission
- Cannot be forced or auto-granted

**Error: "FCM token is empty"**
- Check REACT_APP_FIREBASE_VAPID_KEY is correct
- Check Firebase Web app is created in console
- Clear browser data and try again

## Next Steps

1. **Immediate**: Get `REACT_APP_FIREBASE_WEB_API_KEY` and `REACT_APP_FIREBASE_APP_ID`
2. **Complete**: Follow frontend setup steps in FIREBASE_SETUP.md
3. **Update**: Add fcmTokens to Prisma User model
4. **Test**: Manual end-to-end testing
5. **Integrate**: Add push notifications to order flow

## Resources

- [Firebase Console](https://console.firebase.google.com)
- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)

---

**Status**: ✅ Backend Ready | ⏳ Frontend Pending | ⏳ Database Pending
