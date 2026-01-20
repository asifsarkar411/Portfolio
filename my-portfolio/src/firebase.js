import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC0DmCcyjPrJ6-7VfiS3R0dUThDt6VC4SM",
  authDomain: "porfolio-33293.firebaseapp.com",
  projectId: "porfolio-33293",
  storageBucket: "porfolio-33293.firebasestorage.app",
  messagingSenderId: "709514308042",
  appId: "1:709514308042:web:fbca9370c4065164e58733",
  measurementId: "G-V2EGJMGBF9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);