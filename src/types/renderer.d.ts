import type Got from 'got'
import type { SendRequestOptions, ResponseInfo } from '@/types/types';


export type ElectronAPI = {
  sendRequest: (requestNode: FlowNode, options: SendRequestOptions) => Promise<ResponseInfo>,
  openDevTools: () => void,
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}