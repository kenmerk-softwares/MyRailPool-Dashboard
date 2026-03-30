// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBGOwpmzI9xQIwcnuvttNCLHCr0dkUznMs",
    authDomain: "my-rail-pool.firebaseapp.com",
    projectId: "my-rail-pool",
    storageBucket: "my-rail-pool.firebasestorage.app",
    messagingSenderId: "574255623231",
    appId: "1:574255623231:web:e08c0f64b532bdcb0edc8a",
    measurementId: "G-2X9438XLY2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);

export default { app, analytics, db };