import type Got from 'got'
import type { SendRequestOptions, ResponseInfo } from '@/types/types';


export type ElectronAPI = {
  ip: string,
  got: Got;
  sendRequest: (requestNode: FlowNode, options: SendRequestOptions) => Promise<ResponseInfo>,
  openDevTools: () => void,
  readResponseLog: () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}