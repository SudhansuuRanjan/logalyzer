import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api);
    contextBridge.exposeInMainWorld('streamFileAPI', {
      openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
      readLargeFile: (path: string) => {
        ipcRenderer.send('read-large-file', path);
      },
      onFileChunk: (callback: (chunk: string) => void) => {
        ipcRenderer.on('file-chunk', (_, chunk) => callback(chunk));
      },
      onFileEnd: (callback: (structuredLogs: any) => void) => {
        ipcRenderer.once('file-end', (_, structuredLogs) => callback(structuredLogs));
      },
      onFileError: (callback: (err: string) => void) => {
        ipcRenderer.once('file-error', (_, err) => callback(err));
      }
    });
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
