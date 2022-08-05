import { app, shell, protocol, BrowserWindow } from "electron"
import { createProtocol } from "vue-cli-plugin-electron-builder/lib"
import update from "./update";
import config from "../config/config"

const isDevelopment = process.env.NODE_ENV !== "production"

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    { scheme: "app", privileges: { secure: true, standard: true } }
])

async function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            nodeIntegration: (process.env
                .ELECTRON_NODE_INTEGRATION as unknown) as boolean,
            contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
        }
    })

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
        if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else if (!config.mainConfig.useLocalFile) {
        console.log(`加载远端文件`, config.mainConfig.onlineUrl)
        //使用远端地址
        win
            .loadURL(config.mainConfig.onlineUrl)
            .then((res) => {
                console.log("success", res);
            })
            .catch((err) => {
                console.log("error", err);
            });
    } else {
        createProtocol("app")
        // Load the index.html when not in development
        win.loadURL("app://./index.html")
    }
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit()
    }
})

app.on("activate", () => {
    // On macOS it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on("ready", async () => {
    createWindow()
    update();
})

app.on("web-contents-created", (event, webContents) => {
    webContents.addListener("new-window", (e, url) => {
        e.preventDefault();
        shell.openExternal(url);
    })
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === "win32") {
        process.on("message", (data) => {
            if (data === "graceful-exit") {
                app.quit()
            }
        })
    } else {
        process.on("SIGTERM", () => {
            app.quit()
        })
    }
}
