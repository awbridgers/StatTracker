import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { player, rosterData } from '../types'

// Custom APIs for renderer
const api = {
  saveRoster: (data: rosterData, type: 'men' | 'women') =>
    ipcRenderer.invoke('saveRoster', data, type),
  fetchRoster: () => ipcRenderer.invoke('fetchRoster'),
  saveStarters: (data: player[], gender: 'men' | 'women') =>
    ipcRenderer.invoke('saveStarters', data, gender),
  fetchStarters: () => ipcRenderer.invoke('fetchStarters'),
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api as typeof api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
