
import {contextBridge } from 'electron'
import got from 'got'
import { sendRequest } from './sendRequest'
import { readResponseLog } from './fileAccess'

contextBridge.exposeInMainWorld('electronAPI', {
  got,
  sendRequest,
  readResponseLog,
})