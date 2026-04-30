import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAb77EpjnZMZTiXBjP5a__f8FPCipP0Gpo",
  authDomain: "xudoan-media.firebaseapp.com",
  projectId: "xudoan-media",
  storageBucket: "xudoan-media.firebasestorage.app",
  messagingSenderId: "432116757683",
  appId: "1:432116757683:web:411ffec607576ef0926cc6",
  measurementId: "G-L45V93D9FM"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo các dịch vụ cần dùng
export const storage = getStorage(app);
export const db = getFirestore(app);
export default app;