// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBGOwpmzI9xQIwcnuvttNCLHCr0dkUznMs",
    authDomain: "myrailpool-4150a.firebaseapp.com",
    projectId: "myrailpool-4150a",
    storageBucket: "myrailpool-4150a.firebasestorage.app",
    messagingSenderId: "574255623231",
    appId: "1:574255623231:web:e08c0f64b532bdcb0edc8a",
    measurementId: "G-2X9438XLY2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
export { db, auth, app, storage };