import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue' // o el framework que uses
// import legacy from '@vitejs/plugin-legacy' <--- SI TIENES ESTO, COMENTALO

export default defineConfig({
  plugins: [
    vue(),
    // legacy(...) <--- SI TIENES ESTO, COMENTALO TAMBIÉN
  ],
  build: {
    // Esto le dice a esbuild que está bien usar BigInt
    target: 'es2020' 
  },
  optimizeDeps: {
    esbuildOptions: {
      // Esto asegura que durante el desarrollo también se soporte
      target: 'es2020'
    }
  }
})