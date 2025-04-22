import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // Nếu dùng Realtime DB

const firebaseConfig = {
  apiKey: "AlzaSyBFhBl-u4eue-X3yOJ07rCR00Tqt5hOqFM",
  authDomain: "hdhntgt.firebaseapp.com",
  databaseURL:
    "https://hdhntgt-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "hdhntgt",
  storageBucket: "hdhntgt.appspot.com",
  messagingSenderId: "700617602773",
  appId: "1:700617602773:android:ce2ebb52ed4bb183aa145c", // Có trong Firebase > Project settings > Your apps
};

const app = initializeApp(firebaseConfig);

// Nếu bạn dùng Realtime Database:
const db = getDatabase(app);

export { db };
