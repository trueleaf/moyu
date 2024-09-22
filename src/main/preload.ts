
import {contextBridge, ipcRenderer } from 'electron'
import got from 'got'
import { sendRequest } from './sendRequest'
import { readResponseLog } from './fileAccess'


const openDevTools = () => {
  ipcRenderer.invoke('open-dev-tools')
}

contextBridge.exposeInMainWorld('electronAPI', {
  got,
  sendRequest,
  readResponseLog,
  openDevTools,
})