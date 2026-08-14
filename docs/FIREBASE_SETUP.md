# Firebase Setup Guide - DomiExpress

Complete guide to set up Firebase Cloud Messaging (FCM) for push notifications in DomiExpress.

## Backend Setup ✅

### 1. Environment Variables

Your `.env` file should contain:

```bash
# Firebase Admin SDK (Backend)
FIREBASE_PROJECT_ID="domiya-9a926"
FIREBASE_PRIVATE_KEY_ID="73180fc9341805c5c7cadbccb164673333e950bc"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-fbsvc@domiya-9a926.iam.gserviceaccount.com"
FIREBASE_CLIENT_ID="109894081202589246050"
FIREBASE_MESSAGING_SENDER_ID="412712470544"
FIREBASE_VAPID_KEY="BEfFyFbS9sIPPmxwbiGignGxweYs_8tcUD1O7jFNA7Fvech8Df_B1t8Gd8E0X79NL8qHel7KC5xrVLumqmJTcpY"
```

### 2. Push Service

The `PushService` at `src/modules/notifications/services/push.service.ts` handles:
- Sending individual notifications
- Sending notifications to topics
- Device token management
- Multi-platform support (Web, Android, iOS)

**Usage Example (Backend):**

```typescript
constructor(private readonly pushService: PushService) {}

async notifyCustomer(deviceToken: string) {
  await this.pushService.sendOrderConfirmationNotification(
    deviceToken,
    'ORD-123456',
    45000
  );
}
```

### 3. Database Setup

Add these fields to your User/Device model in Prisma:

```prisma
model User {
  id                 String   @id @default(cuid())
  email              String   @unique
  fcmTokens          String[] // Array of device tokens
  notificationPrefs  NotificationPreference?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}

model NotificationPreference {
  id                    String  @id @default(cuid())
  userId                String  @unique
  pushNotifications     Boolean @default(true)
  orderUpdates          Boolean @default(true)
  promotionalOffers     Boolean @default(true)
  deliveryNotifications Boolean @default(true)
  user                  User    @relation(fields: [userId], references: [id])
}
```

## Frontend Setup 🚀

### 1. Install Firebase Dependencies

```bash
npm install firebase
```

### 2. Environment Variables (Frontend)

Create a `.env` file in your React app:

```bash
REACT_APP_FIREBASE_WEB_API_KEY="your-web-api-key"
REACT_APP_FIREBASE_PROJECT_ID="domiya-9a926"
REACT_APP_FIREBASE_MESSAGING_SENDER_ID="412712470544"
REACT_APP_FIREBASE_APP_ID="1:412712470544:web:xxxxx"
REACT_APP_FIREBASE_VAPID_KEY="BEfFyFbS9sIPPmxwbiGignGxweYs_8tcUD1O7jFNA7Fvech8Df_B1t8Gd8E0X79NL8qHel7KC5xrVLumqmJTcpY"
```

### 3. Initialize Firebase (Frontend)

Create `src/lib/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_WEB_API_KEY,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const requestFCMToken = async (): Promise<string | null> => {
  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
    });
    return token;
  } catch (error) {
    console.error('Error requesting FCM token:', error);
    return null;
  }
};

export const listenToNotifications = () => {
  onMessage(messaging, (payload) => {
    console.log('Message received:', payload);
    
    // Handle foreground notifications
    const notification = payload.notification;
    if (notification) {
      new Notification(notification.title || 'DomiExpress', {
        body: notification.body,
        icon: notification.icon,
        tag: payload.data?.type || 'notification',
      });
    }
  });
};
```

### 4. Service Worker Setup

Create `public/firebase-messaging-sw.js`:

```javascript
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'YOUR_API_KEY',
  projectId: 'domiya-9a926',
  messagingSenderId: '412712470544',
  appId: 'YOUR_APP_ID',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  
  const notificationTitle = payload.notification.title || 'DomiExpress';
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
    badge: 'https://domiexpress.co/badge.png',
    data: payload.data,
  };
  
  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

### 5. Request User Permission

Create a hook `src/hooks/useFirebaseNotifications.ts`:

```typescript
import { useEffect, useState } from 'react';
import { requestFCMToken, listenToNotifications } from '../lib/firebase';
import { api } from '../lib/api';

export const useFirebaseNotifications = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check if Notifications API is supported
    if (!('Notification' in window)) {
      setIsSupported(false);
      return;
    }

    // Request permission and get token
    if (Notification.permission === 'granted') {
      handleNotificationSetup();
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          handleNotificationSetup();
        }
      });
    }
  }, []);

  const handleNotificationSetup = async () => {
    const fcmToken = await requestFCMToken();
    if (fcmToken) {
      setToken(fcmToken);
      
      // Send token to backend
      await api.post('/notifications/register-device', { token: fcmToken });
      
      // Listen for foreground notifications
      listenToNotifications();
    }
  };

  return { token, isSupported };
};
```

### 6. Use in Your App

```typescript
// In your main App component
import { useFirebaseNotifications } from './hooks/useFirebaseNotifications';

export default function App() {
  const { token, isSupported } = useFirebaseNotifications();

  return (
    <div>
      {!isSupported && <div>Your browser doesn't support notifications</div>}
      {token && <div>✅ Notifications enabled</div>}
      {/* Your app content */}
    </div>
  );
}
```

## API Endpoints (Backend)

### Register Device Token

**POST** `/notifications/register-device`

```bash
curl -X POST http://localhost:3000/notifications/register-device \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"token":"FCM_TOKEN_HERE"}'
```

### Send Test Notification

**POST** `/notifications/send-test`

```bash
curl -X POST http://localhost:3000/notifications/send-test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","body":"This is a test"}'
```

## Testing Notifications

### 1. Get Your FCM Token

In browser console:
```javascript
import { requestFCMToken } from './lib/firebase';
const token = await requestFCMToken();
console.log(token);
```

### 2. Send Test via Backend

```bash
npm run start:dev
# Then call your test endpoint
```

### 3. Send via Firebase Console

1. Go to Firebase Console → Cloud Messaging
2. New campaign → Notification
3. Select your web app
4. Send to specific topics or devices

## Troubleshooting

### ❌ "Permission denied" error
- Check browser notification settings
- Ensure your app is served over HTTPS (or localhost for dev)

### ❌ "Firebase not initialized"
- Verify all env variables are set
- Check `firebase.config.ts` for correct values

### ❌ Token not received
- Clear browser cache
- Check Service Worker registration
- Verify VAPID key is correct

### ❌ Notifications not showing
- Check if `Notification.permission === 'granted'`
- Verify payload structure matches Android/iOS/Web specs
- Check browser console for errors

## Architecture

```
Frontend (React)
    ↓
[User grants notification permission]
    ↓
[Service Worker registered + firebase-messaging-sw.js loaded]
    ↓
[FCM Token generated]
    ↓
[Token sent to Backend via API]
    ↓
Backend (NestJS)
    ↓
[Token stored in User.fcmTokens array]
    ↓
[When event occurs, send push via Firebase Admin SDK]
    ↓
[Firebase Cloud Messaging routes to device]
    ↓
[Notification displayed in browser/app]
```

## Next Steps

1. ✅ Backend: Firebase Admin SDK initialized
2. 🔄 Frontend: Install Firebase and setup messaging
3. 🔄 Database: Add fcmTokens field to User model
4. 🔄 API: Create endpoints for device token registration
5. 🔄 Testing: Test notifications end-to-end

For detailed Firebase Messaging docs: https://firebase.google.com/docs/cloud-messaging
