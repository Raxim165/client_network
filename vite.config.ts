import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // вместо localhost
    port: 5173
  },
  base: '/client_network/'
})
