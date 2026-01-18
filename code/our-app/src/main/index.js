import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { playerService } from './services/auto-player'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // auto  

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

  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})