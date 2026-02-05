import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  autoPlay: {
  start: (songNotes, offsetMs = 0, playbackSpeed = 1.0, gameType = 'Sky') =>
    ipcRenderer.send('auto-play:start', { songNotes, offsetMs, playbackSpeed, gameType }),
  stop: () => ipcRenderer.send('auto-play:stop')
  },
  sheet: {
    open: () => ipcRenderer.invoke('sheet:open'),
    readPath: (path) => ipcRenderer.invoke('sheet:read-path', path),
    secureLoad: (txtFilePath) => ipcRenderer.invoke('sheet:secure-load', txtFilePath) 
 }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}