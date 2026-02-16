// Firebase Authentication service
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from "firebase/auth";
import { auth, googleProvider } from "./firebaseConfig";
import { User } from "../types";
import { mockApi } from "./mockApi";
import { firestoreService } from "./firestoreService";

/**
 * Sign in with Google using Firebase
 */
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    
    // Extract user information from Firebase
    const email = firebaseUser.email || '';
    const name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
    const photoURL = firebaseUser.photoURL || '';
    
    // Create or get user in our system (passes photoURL + auto-detects admin)
    const user = mockApi.signup(email, 'firebase-google-sso', name, photoURL);
    
    const now = new Date().toISOString();

    // Log the login event to Firestore for admin visibility
    try {
      await firestoreService.logLogin({
        userId: user.id,
        email,
        name,
        photoURL,
        loginAt: now,
        userAgent: navigator.userAgent
      });
    } catch (e) {
      console.warn('Failed to log login event:', e);
    }

    // Create or update user record in Firestore (for ban/role management)
    try {
      await firestoreService.upsertUserRecord({
        id: user.id,
        email,
        name,
        photoURL,
        role: user.role,
        banType: 'none',
        createdAt: now,
        lastLoginAt: now
      });
    } catch (e) {
      console.warn('Failed to upsert user record:', e);
    }
    
    return user;
  } catch (error: any) {
    console.error("Firebase sign-in error:", error);
    throw new Error(error.message || "Failed to sign in with Google");
  }
};

/**
 * Sign out from Firebase
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    mockApi.logout();
  } catch (error: any) {
    console.error("Firebase sign-out error:", error);
    throw new Error(error.message || "Failed to sign out");
  }
};

/**
 * Get current Firebase user
 */
export const getCurrentFirebaseUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

/**
 * Listen to authentication state changes
 */
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Convert Firebase user to our User type
 */
export const convertFirebaseUserToAppUser = (firebaseUser: FirebaseUser | null): User | null => {
  if (!firebaseUser) return null;
  
  const email = firebaseUser.email || '';
  const name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
  const photoURL = firebaseUser.photoURL || '';
  
  // Try to get existing user from our system
  const existingUser = mockApi.getCurrentUser();
  if (existingUser && existingUser.email === email) {
    // Always update photo URL and name from Google in case it changed
    if (photoURL || name) {
      mockApi.updateProfile(existingUser.id, { photoURL, name });
    }
    return { ...existingUser, photoURL, name };
  }
  
  // Create new user if doesn't exist (passes photoURL + auto-detects admin)
  return mockApi.signup(email, 'firebase-google-sso', name, photoURL);
};
