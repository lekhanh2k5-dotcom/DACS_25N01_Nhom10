import { ipcMain, dialog, BrowserWindow, app } from 'electron' 
import { readJsonFile, decodeText } from '../utils/file-reader'
import path from 'path'
import admin from 'firebase-admin'
import { readFileSync } from 'fs' 

const isDev = !app.isPackaged;
const keyPath = isDev 
  ? path.join(app.getAppPath(), 'serviceAccountKey.json') 
  : path.join(process.resourcesPath, 'serviceAccountKey.json');

if (!admin.apps.length) {
    try {
        const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: "sky-piano-test-21615.firebasestorage.app" 
        });
        console.log("✅ Firebase Admin initialized successfully");
    } catch (err) {
        console.error("❌ Firebase Admin Init Error:", err.message);
    }
}

export function registerSheetHandlers() {
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
}