import { config } from '../config/config'
import { app, BrowserWindow, clipboard, ipcMain } from 'electron'
import path from 'path'
const isDevelopment = process.env.NODE_ENV !== 'production'

function createWindow () {
  const mainWindow = new BrowserWindow({
    title: `${isDevelopment ? `${config.localization.title}(本地)` : config.localization.title} `,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  })
  mainWindow.loadURL('http://localhost:3000')
  mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
  ipcMain.on('counter-value', (_event, value) => {
    console.log(value)
  })
  ipcMain.handle('open-dev-tools', () => {
    BrowserWindow.getAllWindows()?.forEach(win => {
      win.webContents.openDevTools()
    }) 
  })
  ipcMain.handle('clipboard-read-buffer', (_, name: string) => {
    return clipboard.readBuffer(name)
  })
  ipcMain.handle('clipboard-write-buffer', (_, payload: { name: string, buffer: Buffer }) => {
    return clipboard.writeBuffer(payload.name, payload.buffer)
  })
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      console.log('receive', data)
    })
  } else {
    process.on('SIGTERM', () => {
      console.log(222)
    })
  }
}

