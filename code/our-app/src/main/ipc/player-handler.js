import { ipcMain, BrowserWindow } from 'electron'
import { playerService } from '../services/auto-player'

export function registerPlayerHandlers() {
  ipcMain.on('auto-play:start', async (event, payload) => {
    console.log('Nhận tín hiệu Play')

    const { songNotes, offsetMs = 0 } = payload || {}
    const offset = Number.isFinite(Number(offsetMs)) ? Number(offsetMs) : 0

    if (!Array.isArray(songNotes) || songNotes.length === 0) return

    const win = BrowserWindow.fromWebContents(event.sender)
    win?.minimize()

    await new Promise((resolve) => setTimeout(resolve, 120))

    playerService.start(songNotes, 1.0, offset)
  })

  ipcMain.on('auto-play:stop', () => {
    console.log('Nhận tín hiệu Stop.')
    playerService.stop()
  })
}
