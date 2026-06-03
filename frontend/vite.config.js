import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    mode === 'development' && vueDevTools(),
  ].filter(Boolean),
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'vue-vendor', test: /node_modules[\\/](vue|@vue|vue-router)[\\/]/ },
            { name: 'primevue-vendor', test: /node_modules[\\/](primevue|@primevue)[\\/]/, maxSize: 450 * 1024 },
            { name: 'primeui-vendor', test: /node_modules[\\/]@primeuix[\\/]/ },
            { name: 'primeicons-vendor', test: /node_modules[\\/]primeicons[\\/]/ },
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
}))
