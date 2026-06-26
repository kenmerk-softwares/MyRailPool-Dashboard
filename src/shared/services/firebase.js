// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBxLcoDryseaiAA0SCYUZKoAKwMYIKsAUc",
  authDomain: "myrailpool-4150a.firebaseapp.com",
  projectId: "myrailpool-4150a",
  storageBucket: "myrailpool-4150a.firebasestorage.app",
  messagingSenderId: "804422835617",
  appId: "1:804422835617:web:83db70548129193daf3fe0",
  measurementId: "G-97E8W842LT"
};
const adminConfig = {
  apiKey: "AIzaSyBxLcoDryseaiAA0SCYUZKoAKwMYIKsAUc",
  authDomain: "myrailpool-4150a.firebaseapp.com",
  projectId: "myrailpool-4150a",
  storageBucket: "myrailpool-4150a.firebasestorage.app",
  messagingSenderId: "804422835617",
  appId: "1:804422835617:web:83db70548129193daf3fe0",
  measurementId: "G-97E8W842LT"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const adminApp = initializeApp(adminConfig, "adminApp");
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const adminDb = getFirestore(adminApp);
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_PLACES_WEB_API;
export { db, auth, app, storage, adminDb, GOOGLE_MAPS_API_KEY };