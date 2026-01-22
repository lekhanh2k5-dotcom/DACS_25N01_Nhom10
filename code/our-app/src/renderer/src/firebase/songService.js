import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

export async function loadSongsFromFirebase() {
  try {
    const songsCollection = collection(db, "songs");
    console.log("📁 Collection path:", songsCollection.path);
    
    const snapshot = await getDocs(songsCollection);

    if (snapshot.empty) {
      return {};
    }
    
    const songs = {};
    snapshot.forEach((doc) => {
      const data = doc.data();      
      songs[doc.id] = {
        ...data,
        key: doc.id,
        isFromFirebase: true,
        isOwned: false,
        name: data.name || 'Untitled',
        author: data.author || 'Unknown',
        transcribedBy: data.composer || 'Unknown',
        price: data.price || 0,
        region: data.region || 'all',
        songNotes: data.songNotes || []
      };
    });
    return songs;
  } catch (error) {
    console.error("❌ Error loading songs from Firebase:", error);
    console.error("❌ Error code:", error.code);
    console.error("❌ Error message:", error.message);
    return {};
  }
}
