import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { viteElectronPlugin } from './build/vite';
import dayjs from 'dayjs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [viteElectronPlugin(), vue()],
  server: {
    host: 'localhost',
    port: 3000
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, 'src/renderer'),
      "@@": path.resolve(__dirname, "../src"),
    }
  },
  define: {
    __APP_BUILD_TIME__: JSON.stringify(dayjs().format('YYYY-MM-DD HH:mm:ss'))
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData (source, fp) {
          if (fp.endsWith('variables.scss')) return source;
          // Use additionalData from legacy nuxt scss options
          return `@import "./src/renderer/scss/index.scss"; ${source}`
        }
        // additionalData: `@import "./src/renderer/scss/index.scss";`
      }
    }
  }
})
