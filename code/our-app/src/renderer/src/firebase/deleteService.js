import { db } from './firebase';
import { doc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';

/**
 * Xóa bài hát từ Firebase (Storage + Firestore)
 * @param {string} songId - ID của bài hát
 * @param {string} txtFilePath - Path của file trong Storage
 * @returns {Promise<{ok: boolean}>}
 */
export async function deleteSongFromFirebase(songId, txtFilePath) {
  try {
    // 1. Xóa document trong Firestore (client SDK)
    const docRef = doc(db, 'songs', songId);
    await deleteDoc(docRef);
    console.log(`✅ Deleted Firestore doc: ${songId}`);
    
    // 2. Check còn bài nào dùng txtFilePath này không
    if (txtFilePath) {
      const songsRef = collection(db, 'songs');
      const q = query(songsRef, where('txtFilePath', '==', txtFilePath));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        const result = await window.electron.ipcRenderer.invoke('sheet:delete-storage', {
          txtFilePath
        });
        
        if (!result.ok) {
          console.warn('⚠️ Storage delete warning:', result.message);
        }
      } else {
        console.log(`⚠️ File kept: ${snapshot.size} song(s) still using ${txtFilePath}`);
      }
    }
    
    return { ok: true };
  } catch (error) {
    console.error('❌ Delete error:', error);
    throw error;
  }
}
