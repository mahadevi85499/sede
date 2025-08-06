import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY || "AIzaSyCh9M_Xjkc_Vh1vBi-r2qrpTz7JnWJqhY4",
  authDomain: import.meta.env.VITE_AUTH_DOMAIN || "gastroflow-dvlg0.firebaseapp.com",
  projectId: import.meta.env.VITE_PROJECT_ID || "gastroflow-dvlg0",
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET || "gastroflow-dvlg0.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID || "661255645986",
  appId: import.meta.env.VITE_APP_ID || "1:661255645986:web:dbeeafc488d9025ac1d37b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
