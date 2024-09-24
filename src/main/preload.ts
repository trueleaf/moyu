
import {contextBridge, ipcRenderer } from 'electron'
import got from 'got'
import ip from 'ip'
import { sendRequest } from './sendRequest'
import { readResponseLog } from './fileAccess'


const openDevTools = () => {
  ipcRenderer.invoke('open-dev-tools')
}
const readBuffer = (name: string) => {
  ipcRenderer.invoke('clipboard-read-buffer', name)
}
const writeBuffer = (name: string, buffer: Buffer) => {
  ipcRenderer.invoke('clipboard-write-buffer', {
    name,
    buffer
  })
}

contextBridge.exposeInMainWorld('electronAPI', {
  got,
  clipboard: {
    readBuffer,
    writeBuffer
  },
  ip: ip.address(),
  sendRequest,
  readResponseLog,
  openDevTools,
})