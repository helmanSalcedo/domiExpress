export interface FirebaseConfig {
  projectId: string;
  privateKeyId: string;
  privateKey: string;
  clientEmail: string;
  clientId: string;
  messagingSenderId: string;
  vapidKey: string;
}

export const getFirebaseConfig = (): FirebaseConfig => {
  const config: FirebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    clientId: process.env.FIREBASE_CLIENT_ID || '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    vapidKey: process.env.FIREBASE_VAPID_KEY || '',
  };

  if (!config.projectId) {
    console.warn('⚠️ Firebase configuration incomplete');
  }

  return config;
};

export const getWebFirebaseConfig = () => ({
  apiKey: process.env.REACT_APP_FIREBASE_WEB_API_KEY || '',
  projectId: process.env.FIREBASE_PROJECT_ID || 'domiya-9a926',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '412712470544',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '',
  vapidKey: process.env.FIREBASE_VAPID_KEY || '',
});
