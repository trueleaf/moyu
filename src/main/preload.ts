
import {contextBridge, ipcRenderer } from 'electron'
import got from 'got'
import ip from 'ip'
import { sendRequest } from './sendRequest'
import { readResponseLog } from './fileAccess'


const openDevTools = () => {
  ipcRenderer.invoke('open-dev-tools')
}

contextBridge.exposeInMainWorld('electronAPI', {
  got,
  ip: ip.address(),
  sendRequest,
  readResponseLog,
  openDevTools,
})