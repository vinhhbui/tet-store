// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Cấu hình Firebase - thay thế bằng config từ Firebase Console
const firebaseConfig = {

  apiKey: "AIzaSyAC7FcMA1uDji6wv3A-t83rTpxxxlMHRU4",

  authDomain: "tet-store-db415.firebaseapp.com",

  projectId: "tet-store-db415",

  storageBucket: "tet-store-db415.firebasestorage.app",

  messagingSenderId: "429702472489",

  appId: "1:429702472489:web:278ec12b562a50a92a8d38",

  measurementId: "G-6G3F9PGNJT"

};


console.log('Firebase config check:', { 
    apiKey: !!firebaseConfig.apiKey, 
    projectId: !!firebaseConfig.projectId 
});

if (!firebaseConfig.apiKey) {
    console.error('Lỗi: Chưa cấu hình Firebase API Key trong .env.local');
}

// Khởi tạo Firebase (chỉ khởi tạo 1 lần)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Khởi tạo Firestore
export const db = getFirestore(app);