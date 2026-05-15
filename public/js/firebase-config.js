// Firebase Configuration for Shrigovinda Portfolio
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDeps0BK1v0VX9aygDPfjrWteSXr54SSBU",
  authDomain: "shrigovinda-portfolio.firebaseapp.com",
  projectId: "shrigovinda-portfolio",
  storageBucket: "shrigovinda-portfolio.firebasestorage.app",
  messagingSenderId: "723792510069",
  appId: "1:723792510069:web:5ae0a00a4f67ebbccd0c3c",
  measurementId: "G-SEPKKQ0TCZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };
