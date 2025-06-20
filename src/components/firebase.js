import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";  // Import Firebase Storage
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  
  authDomain: "sharekindness-46f08.firebaseapp.com",
  projectId: "sharekindness-46f08",
  storageBucket: "sharekindness-46f08.firebasestorage.app",  // Add Storage Bucket URL here
  messagingSenderId: "778037472252",
  appId: "1:778037472252:web:c05203eff149bce35de079",
  measurementId: "G-QSN213QHDN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = getAnalytics(app);
const db = getFirestore(app);  // Firestore
const storageService = getStorage(app);  // Renamed to avoid conflict

export const auth = getAuth(app);
export const firestore = db;
export const storage = storageService;  // Export the renamed storage

export default app;
