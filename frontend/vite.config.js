import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      usePolling: true, // Ép Vite quét file thủ công để nhận diện thay đổi trong Docker
    },
    host: true, // Tương đương với --host, lắng nghe trên 0.0.0.0
    port: 5173,
  }
})