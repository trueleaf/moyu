import { sendRequest as electronRequest } from './electron';

export function sendRequest(): void {
  electronRequest()
}

export function stopRequest(): void {
  electronRequest()
}
