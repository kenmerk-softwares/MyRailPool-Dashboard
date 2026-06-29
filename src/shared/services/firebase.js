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
  apiKey: "AIzaSyBrnMBRLFLyvVIQ3T-iFmac0fi7bkHgFQY",
  authDomain: "railpool-test.firebaseapp.com",
  projectId: "railpool-test",
  storageBucket: "railpool-test.firebasestorage.app",
  messagingSenderId: "401776332768",
  appId: "1:401776332768:web:272a4fc0cc78aaba9ae585"
};
const adminConfig = {
  apiKey: "AIzaSyBrnMBRLFLyvVIQ3T-iFmac0fi7bkHgFQY",
  authDomain: "railpool-test.firebaseapp.com",
  projectId: "railpool-test",
  storageBucket: "railpool-test.firebasestorage.app",
  messagingSenderId: "401776332768",
  appId: "1:401776332768:web:272a4fc0cc78aaba9ae585"
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