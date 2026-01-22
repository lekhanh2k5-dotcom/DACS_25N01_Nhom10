import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

export async function testFirebaseConnection() {
  const snap = await getDocs(collection(db, "songs")); 
  console.log("✅ Firebase connected. songs size =", snap.size);
}
