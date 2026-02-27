import { ipcMain, BrowserWindow } from 'electron'
import { playerService } from '../services/auto-player'

let mainWindow = null;

export function registerPlayerHandlers() {
  ipcMain.on('auto-play:start', async (event, payload) => {
    console.log('\n===== 📍 PLAY START =====' )
    console.log('Got play signal with', payload?.songNotes?.length || 0, 'notes');

    const { songNotes, offsetMs = 0, playbackSpeed = 1.0, gameType = 'Sky' } = payload || {}
    const offset = Number.isFinite(Number(offsetMs)) ? Number(offsetMs) : 0
    const speed = Number.isFinite(Number(playbackSpeed)) ? Number(playbackSpeed) : 1.0

    if (!Array.isArray(songNotes) || songNotes.length === 0) return

    const win = BrowserWindow.fromWebContents(event.sender)
    win?.minimize()
    
    // Lưu reference để dùng trong callback
    mainWindow = win;
    console.log('💾 Saved window reference for callback');

    // Set callback để khi bài hát kết thúc, sẽ gửi tín hiệu về renderer
    playerService.setOnSongEnd(() => {
      console.log('\n🔔 CALLBACK TRIGGERED - Sending auto-play:ended to renderer');
      try {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('auto-play:ended');
          console.log('✅ Event sent via mainWindow.webContents');
        } else {
          console.error('❌ mainWindow is not available');
        }
      } catch (e) {
        console.error('❌ Error sending event:', e);
      }
    });
    console.log('✅ Callback registered');

    await new Promise((resolve) => setTimeout(resolve, 120))
    
    playerService.start(songNotes, speed, offset, gameType)
    
  })

  ipcMain.on('auto-play:stop', () => {
    console.log('Nhận tín hiệu Stop.')
    playerService.stop()
  })
}
