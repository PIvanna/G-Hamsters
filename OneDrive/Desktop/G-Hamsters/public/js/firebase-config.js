// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"; // <- додай це

const firebaseConfig = {
  apiKey: "AIzaSyDrtjLFMHsq2Qrju0k5W6Jk6RsdyOMBF4Q",
  authDomain: "noa2-8fefc.firebaseapp.com",
  projectId: "noa2-8fefc",
  storageBucket: "noa2-8fefc.appspot.com",
  messagingSenderId: "690309993334",
  appId: "1:690309993334:web:511d2127cffdfde126e057",
  measurementId: "G-PLBG2DP99M"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
