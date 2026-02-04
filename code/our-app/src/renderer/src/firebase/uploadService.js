import { db } from './firebase';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Region code mapping
const REGION_CODE_MAP = {
  'vietnam': 'vn',
  'chinese': 'cn',
  'korean': 'kr',
  'japanese': 'jp',
  'world': 'wd'
};

/**
 * Lấy ID tiếp theo cho bài hát theo region
 * @param {string} region - vietnam, chinese, korean, japanese, world
 * @returns {Promise<string>} - song_vn_156, song_wd_039, etc.
 */
export async function getNextSongId(region) {
  const regionCode = REGION_CODE_MAP[region] || 'wd';
  const prefix = `song_${regionCode}_`;
  
  try {
    const songsRef = collection(db, 'songs');
    const q = query(songsRef, where('region', '==', region));
    const snapshot = await getDocs(q);
    
    let maxNumber = 0;
    snapshot.forEach(doc => {
      const id = doc.id;
      if (id.startsWith(prefix)) {
        const numStr = id.replace(prefix, '');
        const num = parseInt(numStr, 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    });
    
    const nextNumber = maxNumber + 1;
    const paddedNumber = String(nextNumber).padStart(3, '0');
    return `${prefix}${paddedNumber}`;
    
  } catch (error) {
    console.error('Error getting next song ID:', error);
    return `${prefix}${Date.now()}`;
  }
}

/**
 * Upload sheet file và metadata lên Firebase
 * @param {string} fileContent - Nội dung file JSON string
 * @param {Object} metadata - {name, author, composer, region, price, txtFilePath}
 * @param {string} userId - ID user đang upload
 * @param {Function} onProgress - Callback progress (0-1)
 * @returns {Promise<{success: boolean, songId: string}>}
 */
export async function uploadSheetToFirebase(fileContent, metadata, userId, onProgress = null) {
  try {
    if (onProgress) onProgress(0.1);
    
    const songId = await getNextSongId(metadata.region);
    
    if (onProgress) onProgress(0.3);
    
    const uploadResult = await window.electron.ipcRenderer.invoke('sheet:upload-to-storage', {
      fileContent,
      txtFilePath: metadata.txtFilePath
    });
    
    if (!uploadResult.ok) {
      throw new Error(uploadResult.message || 'Upload to storage failed');
    }
    
    if (onProgress) onProgress(0.7);
    
    const docRef = doc(db, 'songs', songId);
    await setDoc(docRef, {
      name: metadata.name,
      author: metadata.author,
      composer: metadata.composer,
      region: metadata.region,
      price: metadata.price,
      txtFilePath: metadata.txtFilePath,
      createdAt: serverTimestamp(),
      uploadedBy: userId
    });
    
    if (onProgress) onProgress(1.0);
    
    console.log(`✅ Uploaded song: ${songId}`);
    return { success: true, songId };
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    throw error;
  }
}
