
import {BrowserWindow, contextBridge } from 'electron'
import got from 'got'
import { sendRequest } from './sendRequest'
import { readResponseLog } from './fileAccess'


const openDevTools = () => {
  BrowserWindow.getAllWindows().forEach(win => win.webContents.openDevTools());
}

contextBridge.exposeInMainWorld('electronAPI', {
  got,
  sendRequest,
  readResponseLog,
  openDevTools,
})