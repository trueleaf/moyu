/**
 * @description        自动更新
 * @author              shuxiaokai
 * @create             2020-09-30 22:28
 */
import path from "path";
import { autoUpdater } from "electron-updater";
// eslint-disable-next-line import/no-extraneous-dependencies
import { BrowserWindow, ipcMain } from "electron";
import config from "../config/config";

function update(): void {
    const { url } = config.updateConfig;
    const winId = BrowserWindow.getFocusedWindow()?.id;
    const win = BrowserWindow.fromId(winId as number);
    if (process.env.NODE_ENV === "development") {
        autoUpdater.updateConfigPath = path.join(__dirname, "../local-update.yml");
    }
    //=====================================render进程事件====================================//
    ipcMain.on("vue-check-update", () => {
        autoUpdater.checkForUpdates();
    });
    ipcMain.on("vue-quit-and-install", () => {
        autoUpdater.quitAndInstall();
    });
    //=====================================参数设置====================================//
    autoUpdater.setFeedURL(url);
    //=====================================反馈更新事件给render进程====================================//
    //存在可用更新
    autoUpdater.on("update-available", (progressObj) => {
        win?.webContents.send("vue-update-available", progressObj);
    });
    //不存在可用更新
    autoUpdater.on("update-not-available", (progressObj) => {
        win?.webContents.send("vue-update-not-available", progressObj);
    });
    //下载完成
    autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
        win?.webContents.send("vue-update-downloaded", {
            event,
            releaseNotes,
            releaseName,
        });
    });
    //下载过程
    autoUpdater.on("download-progress", (progressObj) => {
        win?.webContents.send("vue-download-progress", progressObj);
    });
    //更新错误
    autoUpdater.on("error", (error) => {
        console.error(error);
        win?.webContents.send("vue-download-error", error);
    });
}
export default update;
