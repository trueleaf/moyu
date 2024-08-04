import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { viteElectronPlugin } from './build/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [viteElectronPlugin(), vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, 'src')
    }
  }
})
