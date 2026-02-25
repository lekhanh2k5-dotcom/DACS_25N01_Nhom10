import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  autoPlay: {
    start: (songNotes, offsetMs = 0, playbackSpeed = 1.0, gameType = 'Sky') => {
      console.log('[PRELOAD:START] Sending auto-play:start with', songNotes?.length || 0, 'notes');
      ipcRenderer.send('auto-play:start', { songNotes, offsetMs, playbackSpeed, gameType });
    },
    stop: () => {
      console.log('[PRELOAD:STOP] Sending auto-play:stop');
      ipcRenderer.send('auto-play:stop');
    },
    onEnd: (callback) => {
      console.log('\n[PRELOAD:ONEND] Setting up auto-play:ended listener - removeAllListeners first');
      // Remove old listeners and add new one
      ipcRenderer.removeAllListeners('auto-play:ended');
      
      const listener = () => {
        console.log('\n[PRELOAD:EVENT] 🎉 auto-play:ended event RECEIVED FROM MAIN!');
        try {
          console.log('[PRELOAD:EVENT] Calling callback now...');
          callback();
          console.log('[PRELOAD:EVENT] ✅ Callback executed successfully in renderer');
        } catch (e) {
          console.error('[PRELOAD:EVENT] ❌ Error executing callback:', e);
        }
      };
      
      ipcRenderer.on('auto-play:ended', listener);
      console.log('[PRELOAD:ONEND] ✅ Listener registered successfully');
    }
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