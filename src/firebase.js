import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For the prototype, we are using placeholders.
// You can replace these with your actual Firebase project config later.
const firebaseConfig = {
  apiKey: "AIzaSyARYIz3XDh_Q7F1UUkmjzPufQNV6jIRSw4",
  authDomain: "engage-7ca74.firebaseapp.com",
  projectId: "engage-7ca74",
  storageBucket: "engage-7ca74.firebasestorage.app",
  messagingSenderId: "557656072588",
  appId: "1:557656072588:web:2f1dbd3eeb7cda0d2bf6a9",
  measurementId: "G-K9R8YB2BR1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app, "testing");
export const storage = getStorage(app);
