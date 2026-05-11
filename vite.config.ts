import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), legacy()],
  build: { target: 'esnext' }, // <--- Esto es lo único que arregla el error rojo
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  }
})
