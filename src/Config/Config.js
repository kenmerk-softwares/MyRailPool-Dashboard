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
  apiKey: "AIzaSyADDWfh7SLc14liWKJXdSkpGj6w-PbTVCw",
  authDomain: "rail-pool-admin.firebaseapp.com",
  projectId: "rail-pool-admin",
  storageBucket: "rail-pool-admin.firebasestorage.app",
  messagingSenderId: "1063839563425",
  appId: "1:1063839563425:web:476b90a37a4e1cffa4bae0"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const adminApp = initializeApp(adminConfig, "adminApp");
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const adminDb = getFirestore(adminApp);
export { db, auth, app, storage, adminDb };