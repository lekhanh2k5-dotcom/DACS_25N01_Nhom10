import { ipcMain, BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

export function registerAdminHandlers() {
  ipcMain.on('open-admin-window', () => {
    const adminWindow = new BrowserWindow({
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
      adminWindow.show()
    })
  })
}