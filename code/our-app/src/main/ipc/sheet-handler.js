import { ipcMain, dialog, BrowserWindow } from 'electron'
import { readJsonFile } from '../utils/file-reader'

export function registerSheetHandlers() {
  ipcMain.handle('sheet:open', async (event) => {
    try {
      const win = BrowserWindow.fromWebContents(event.sender)

      const { canceled, filePaths } = await dialog.showOpenDialog(win, {
        title: 'Chọn file sheet',
        properties: ['openFile'],
        filters: [
          { name: 'Sheet', extensions: ['txt', 'json'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })

      if (canceled || !filePaths?.[0]) {
        return { ok: false, canceled: true }
      }

      const filePath = filePaths[0]
      const data = readJsonFile(filePath)

      return { ok: true, filePath, data }
    } catch (e) {
      console.error('sheet:open handler crashed:', e)
      return { ok: false, error: 'SHEET_OPEN_FAILED', message: String(e) }
    }
  })
}
