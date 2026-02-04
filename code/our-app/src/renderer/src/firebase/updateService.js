import { db } from './firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Update metadata bài hát trong Firestore
 * @param {string} songId - ID của bài hát
 * @param {Object} updates - {name, author, composer, region, price}
 * @returns {Promise<{ok: boolean}>}
 */
export async function updateSongMetadata(songId, updates) {
  try {
    const docRef = doc(db, 'songs', songId);
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ Updated song metadata: ${songId}`);
    return { ok: true };
  } catch (error) {
    console.error('❌ Update error:', error);
    throw error;
  }
}
