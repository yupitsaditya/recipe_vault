import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// [PASTE FIREBASE CONFIG HERE]
// Replace these values with your actual Firebase project settings
const firebaseConfig = {
  apiKey: "AIzaSyATqNkZtfjCgvbbQcc9ExQCqOMDGA20mis",
  authDomain: "rashika-s-recipe-vault.firebaseapp.com",
  projectId: "rashika-s-recipe-vault",
  storageBucket: "rashika-s-recipe-vault.firebasestorage.app",
  messagingSenderId: "969519576975",
  appId: "1:969519576975:web:26d892e68cdedb2fc2fdfa"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Legacy compat namespace
export const primaryAppId = 'rashikas-recipes-v2';
