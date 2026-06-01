import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA8T1P2X7huSvV1w3VRGRM93PWvhbcqTXE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hack-14ae1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hack-14ae1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hack-14ae1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "165708034616",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:165708034616:web:93378611ceeb01ce6c6ccd",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
