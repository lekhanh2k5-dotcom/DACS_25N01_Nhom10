import { ipcMain, BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

let adminWindow = null

export function registerAdminHandlers() {
  // Xóa tất cả listeners cũ
  ipcMain.removeAllListeners('open-admin-window')
  
  ipcMain.on('open-admin-window', () => {
    console.log('[Admin] Button clicked. Current adminWindow:', adminWindow ? 'exists' : 'null')
    
    // Nếu admin window đã tồn tại và chưa destroy, focus lên nó
    if (adminWindow && !adminWindow.isDestroyed()) {
      console.log('[Admin] Window already exists, focusing...')
      adminWindow.focus()
      adminWindow.show()
      return
    }

    console.log('[Admin] Creating new admin window...')
    adminWindow = new BrowserWindow({
      width: 900,
      height: 670,
      autoHideMenuBar: true,
      title: "Bảng Điều Khiển Admin - KChip",
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })

    // Xử lý Load URL/File tùy theo môi trường
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      adminWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/admin`)
    } else {
      adminWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'admin' })
    }

    adminWindow.on('ready-to-show', () => {
      console.log('[Admin] Window ready to show')
      adminWindow.show()
    })

    // Reset reference khi cửa sổ đóng
    adminWindow.on('closed', () => {
      console.log('[Admin] Window closed, clearing reference')
      adminWindow = null
    })
  })
}