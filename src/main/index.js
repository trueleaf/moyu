import { app, BrowserWindow, ipcMain } from "electron"; 
import config from "../config/config.default"
import update from "./update"

if (process.env.NODE_ENV !== "development") {
    global.__static = require("path")
        .join(__dirname, "/static")
        .replace(/\\/g, "\\\\"); 
}

let mainWindow;
const winURL = process.env.NODE_ENV === "development" ? `http://localhost:9080` : config.mainConfig.onlineUrl;
function createWindow() {
    mainWindow = new BrowserWindow({
        title: config.renderConfig.layout.title,
        height: config.mainConfig.height,
        width: config.mainConfig.width,
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            webviewTag: true
        },
    });
    mainWindow.loadURL(winURL).then().catch(err => {
        console.error(err)
    })
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
        mainWindow.fullScreen();
        update();
    });
    //=====================================render进程事件====================================//
    ipcMain.on("vue-fresh-content", (event, status) => {
        mainWindow.webContents.reload()
    });
    ipcMain.on("vue-strong-fresh-content", (event, status) => {
        mainWindow.webContents.session.clearCache().then(() => {
            mainWindow.webContents.reload()
        });
    });
    ipcMain.on("vue-open-dev-tools", (event, status) => {
        mainWindow.webContents.openDevTools();
    });
    //=====================================自动更新====================================//
    
}

app.on("ready", createWindow);
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
app.on("activate", () => {
    if (mainWindow === null) {
        createWindow();
    }
});

