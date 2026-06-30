import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Google Sign-In Error", error);
    alert("Google Sign-In failed: " + error.message);
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign Out Error", error);
  }
};

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        // If no user is logged in (e.g. first visit or just signed out), sign in anonymously
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Auth Error", error);
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}
