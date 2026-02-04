import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";


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

export const db = getFirestore(app, 'skysheet');
export const auth = getAuth(app);
export const storage = getStorage(app);

enableIndexedDbPersistence(db)
  .then(() => {
    console.log('✅ Data được cache local');
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('⚠️ Cache disabled: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('⚠️ Cache disabled: Browser không hỗ trợ');
    }
  });
