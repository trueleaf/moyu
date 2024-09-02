import { ViteDevServer } from 'vite';
import { spawn, ChildProcess } from 'child_process';
import esbuild from 'esbuild';
import electron from 'electron';
import fs from 'fs'
import path from 'path'
import type { AddressInfo } from 'net';

const processWithElectron:  NodeJS.Process & {
  electronProcess?: ChildProcess 
} = process;

let isKilling = false;
let sholdExistProcess = false;
const buildElectron = () => {
  esbuild.buildSync({
    entryPoints: ['./src/main/**'],
    bundle: true,
    platform: 'node',
    outdir: 'dist',
    external: ['electron'],
  });
}
const startElectronProcess = (server: ViteDevServer,) => {
  const addressInfo = server.httpServer?.address() as AddressInfo;
  const httpAddress = `http://${addressInfo?.address}:${addressInfo?.port}`;
  processWithElectron.electronProcess?.removeAllListeners()
  processWithElectron.electronProcess = spawn(electron.toString(), ['./dist/main.js', httpAddress], {
    cwd: process.cwd(),
    stdio: 'inherit',
  });
  processWithElectron.electronProcess.on('exit', () => {
    if (sholdExistProcess) {
      server.close();
      process.exit();
    }
    sholdExistProcess = false;
  });
  processWithElectron.electronProcess.on('error', (err) => {
    console.error(err)
  })
  isKilling = false;
}
export const viteElectronPlugin = () => {
  return {
    name: 'vite-electron-plugn',
    configureServer(server: ViteDevServer) {
      if (processWithElectron.electronProcess?.pid) {
        sholdExistProcess = false;
        process.kill(processWithElectron.electronProcess.pid)
        processWithElectron.electronProcess.removeAllListeners()
        processWithElectron.electronProcess = undefined;
      }
      server.httpServer?.once('listening', () => {
        buildElectron()
        startElectronProcess(server);
        fs.watch(path.resolve(process.cwd(), './src/main'), { recursive: true }, (event, filename) => {
          if (filename?.startsWith('main') || filename?.startsWith('preload') || filename?.startsWith('sendRequest')) {
            sholdExistProcess = false;
            if (processWithElectron.electronProcess?.pid && !isKilling) {
              buildElectron()
              console.log('重启主进程中...')
              isKilling = true;
              process.kill(processWithElectron.electronProcess.pid);
              startElectronProcess(server);
            }
          }
        });
      });
    },
  };
};
