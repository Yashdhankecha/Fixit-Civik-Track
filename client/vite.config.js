import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    'process.env.VITE_APP_NAME': JSON.stringify('FixIt'),
    'process.env.VITE_APP_VERSION': JSON.stringify('1.0.0'),
  },
}) 