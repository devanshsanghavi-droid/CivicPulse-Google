// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKncOQB52e-em2Zi7w9TYlPZlByPx47MM",
  authDomain: "civicpulsewebsite.firebaseapp.com",
  projectId: "civicpulsewebsite",
  storageBucket: "civicpulsewebsite.firebasestorage.app",
  messagingSenderId: "309051340001",
  appId: "1:309051340001:web:b642bfc4df4a4b9daab3a0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore (shared database for all users)
export const db = getFirestore(app);

// Initialize Firebase Storage (for photo uploads)
export const storage = getStorage(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
