import config from "@/../config/config"
import { sendRequest as browserRequest, stopRequest as stopBrowserRequest } from "./browser";
import { sendRequest as electronRequest, stopRequest as stopElectronRequest } from "./electron";

export function sendRequest(): void {
    if (config.isElectron) {
        electronRequest();
    } else {
        browserRequest();
    }
}

export function stopRequest(): void {
    if (config.isElectron) {
        stopElectronRequest();
    } else {
        stopBrowserRequest();
    }
}
