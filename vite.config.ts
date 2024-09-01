import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { viteElectronPlugin } from './build/vite';
import dayjs from 'dayjs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [viteElectronPlugin(), vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, 'src')
    }
  },
  define: {
    __APP_BUILD_TIME__: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
})
