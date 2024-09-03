import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { viteElectronPlugin } from './build/vite';
import dayjs from 'dayjs'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig(() => {
  console.log(process.argv, 22)
  return{
    plugins: [
      viteElectronPlugin(),
      vue(), AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      })
    ],
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
          additionalData: `@import "./src/renderer/scss/index.scss";`
        }
      }
    }
  }
})
