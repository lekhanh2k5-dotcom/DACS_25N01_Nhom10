import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBlc7v_nR3TF7LJB0Nbv15Fk2DdxGc12lg",
  authDomain: "sky-piano-test-21615.firebaseapp.com",
  databaseURL: "https://sky-piano-test-21615-default-rtdb.firebaseio.com",
  projectId: "sky-piano-test-21615",
  storageBucket: "sky-piano-test-21615.firebasestorage.app",
  messagingSenderId: "375774105042",
  appId: "1:375774105042:web:9e6b8165348e08a5b00c0b"
};

const app = initializeApp(firebaseConfig);

// Firestore (phần 2 sẽ dùng)
export const db = getFirestore(app);
