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
    
    // Create or get user in our system
    // Check if user exists, otherwise create new one
    const existingUser = mockApi.getCurrentUser();
    let user: User;
    
    if (existingUser && existingUser.email === email) {
      // User already exists, update last login
      user = existingUser;
      mockApi.updateProfile(user.id, { lastLoginAt: new Date().toISOString() });
    } else {
      // Create new user
      user = mockApi.signup(email, 'firebase-google-sso', name);
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
  
  // Try to get existing user from our system
  const existingUser = mockApi.getCurrentUser();
  if (existingUser && existingUser.email === email) {
    return existingUser;
  }
  
  // Create new user if doesn't exist
  return mockApi.signup(email, 'firebase-google-sso', name);
};
