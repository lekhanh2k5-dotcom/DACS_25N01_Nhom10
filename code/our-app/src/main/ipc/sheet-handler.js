import { ipcMain, dialog, BrowserWindow, app } from 'electron' 
import { readJsonFile, decodeText } from '../utils/file-reader'
import path from 'path'
import admin from 'firebase-admin'
import { readFileSync } from 'fs'


/**
 * Phát hiện region từ text dựa vào Unicode ranges
 */
function detectRegion(text) {
  if (!text) return 'world';
  
  // Chinese: U+4E00-U+9FFF (CJK Unified Ideographs)
  if (/[\u4E00-\u9FFF]/.test(text)) return 'chinese';
  
  // Korean: U+AC00-U+D7AF (Hangul Syllables)
  if (/[\uAC00-\uD7AF]/.test(text)) return 'korean';
  
  // Japanese: U+3040-U+309F (Hiragana), U+30A0-U+30FF (Katakana)
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'japanese';
  
  // Vietnamese: chữ có dấu
  if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text)) {
    return 'vietnam';
  }
  
  return 'world';
}

/**
 * Extract metadata từ songData và fileName
 */
function extractMetadata(songData, filePath) {
  const fileName = path.basename(filePath);
  const fileNameWithoutExt = fileName.replace(/\.(txt|json)$/i, '');
  
  // Extract fields
  const name = songData.name || fileNameWithoutExt;
  const author = songData.author || songData.Author || 'Unknown';
  const composer = songData.transcribedBy || songData.composer || songData.Composer || 'Unknown';
  
  // Auto-detect region từ name + author
  const combinedText = `${name} ${author}`;
  const region = detectRegion(combinedText);
  
  
  return {
    name: name.trim(),
    author: author.trim(),
    composer: composer.trim(),
    region,
    price: 30000,
    fileName: fileNameWithoutExt, 
    songNotes: songData.songNotes || []
  };
} 

const isDev = !app.isPackaged;
const keyPath = isDev 
  ? path.join(app.getAppPath(), 'serviceAccountKey.json') 
  : path.join(process.resourcesPath, 'serviceAccountKey.json');

if (!admin.apps.length) {
    try {
        const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: "sky-piano-test-21615.firebasestorage.app",
            databaseURL: "https://sky-piano-test-21615-default-rtdb.firebaseio.com"
        });
        console.log("✅ Firebase Admin initialized successfully");
    } catch (err) {
        console.error("❌ Firebase Admin Init Error:", err.message);
    }
}

export function registerSheetHandlers() {
  console.log('🔧 Registering sheet handlers...');
  
  ipcMain.handle('sheet:open', async (event) => {
    try {
      const win = BrowserWindow.fromWebContents(event.sender)
      const { canceled, filePaths } = await dialog.showOpenDialog(win, {
        title: 'Chọn file sheet',
        properties: ['openFile'],
        filters: [{ name: 'Sheet', extensions: ['txt', 'json'] }]
      })

      if (canceled || !filePaths?.[0]) return { ok: false, canceled: true }

      const data = readJsonFile(filePaths[0])
      return { ok: true, filePath: filePaths[0], data }
    } catch (e) {
      return { ok: false, error: 'SHEET_OPEN_FAILED', message: String(e) }
    }
  })

  ipcMain.handle('sheet:extract-metadata', async (event) => {
    try {
      const win = BrowserWindow.fromWebContents(event.sender)
      const { canceled, filePaths } = await dialog.showOpenDialog(win, {
        title: 'Chọn file sheet để upload',
        properties: ['openFile'],
        filters: [{ name: 'Sheet', extensions: ['txt', 'json'] }]
      })

      if (canceled || !filePaths?.[0]) {
        return { ok: false, canceled: true }
      }

      const filePath = filePaths[0]
      const rawData = readJsonFile(filePath)
      const songData = Array.isArray(rawData) ? rawData[0] : rawData
      
      const metadata = extractMetadata(songData, filePath)
      
      const buffer = readFileSync(filePath)
      const fileContent = decodeText(buffer)
      
      return {
        ok: true,
        metadata,
        fileContent,
        isValid: metadata.songNotes.length > 0
      }
    } catch (e) {
      console.error('Extract metadata error:', e)
      return { ok: false, error: e.message }
    }
  })

  ipcMain.handle('sheet:secure-load', async (event, txtFilePath) => {
    try {
      const bucket = admin.storage().bucket();
      const file = bucket.file(txtFilePath); 
      
      const [buffer] = await file.download();
      const textData = decodeText(buffer);
      const rawData = JSON.parse(textData);
      
      const songData = Array.isArray(rawData) ? rawData[0] : rawData;
      const songNotes = songData.songNotes || [];

      return { ok: true, songNotes };
    } catch (e) {
      console.error('Lỗi tải nhạc bảo mật IPC:', e);
      return { ok: false, message: e.message };
    }
  });

  // Handler upload sử dụng Admin SDK 
  ipcMain.handle('sheet:upload-to-storage', async (event, { fileContent, txtFilePath }) => {
    console.log('📤 Upload handler called:', txtFilePath);
    try {
      const bucket = admin.storage().bucket();
      const file = bucket.file(txtFilePath);
      
      // Upload file
      await file.save(fileContent, {
        contentType: 'text/plain',
        metadata: {
          cacheControl: 'public, max-age=31536000',
        }
      });
      
      console.log(`✅ Uploaded to Storage: ${txtFilePath}`);
      return { ok: true, path: txtFilePath };
    } catch (e) {
      console.error('❌ Upload to Storage failed:', e);
      return { ok: false, message: e.message };
    }
  });

  //  xóa file trong Storage 
  ipcMain.handle('sheet:delete-storage', async (event, { txtFilePath }) => {
    console.log('🗑️ Delete storage handler called:', txtFilePath);
    
    if (!txtFilePath) {
      return { ok: true }; 
    }
    
    try {
      const bucket = admin.storage().bucket();
      const file = bucket.file(txtFilePath);
      
      try {
        await file.delete();
        console.log(`✅ Deleted Storage file: ${txtFilePath}`);
      } catch (storageError) {
        console.warn(`⚠️ Could not delete file (may not exist): ${txtFilePath}`);
      }
      
      return { ok: true };
    } catch (e) {
      console.error('❌ Storage delete failed:', e);
      return { ok: false, message: e.message };
    }
  });
  
  console.log('✅ Sheet handlers registered: sheet:open, sheet:extract-metadata, sheet:secure-load, sheet:upload-to-storage, sheet:delete-storage');
}