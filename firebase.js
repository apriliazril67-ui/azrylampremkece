import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD_R3I4cFJtvo31pkaljIRL4DgvDRhwMxU",
  authDomain: "ampremiumupdate.firebaseapp.com",
  projectId: "ampremiumupdate",
  storageBucket: "ampremiumupdate.firebasestorage.app",
  messagingSenderId: "610405511324",
  appId: "1:610405511324:web:c2711a37257f6799c27d59",
  measurementId: "G-5E5ZQZTZT8"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
