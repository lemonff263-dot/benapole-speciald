import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '@/firebase-applet-config.json';

// Initialize or reuse Firebase App instance
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with configured databaseId
export const db: Firestore = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId || '(default)'
);

export { app };

// Initial boot connection test
if (typeof window !== 'undefined') {
  void (async () => {
    try {
      await getDocFromServer(doc(db, 'config', 'test'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.warn('Firebase client is offline or initializing in background');
      }
    }
  })();
}
