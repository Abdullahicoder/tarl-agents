import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Cloud Shell's Web Preview proxies to 8080 on the container's external
    // interface, and arrives with a *.cloudshell.dev Host header that Vite
    // rejects unless it is allowed explicitly.
    host: true,
    port: Number(process.env.PORT) || 8080,
    allowedHosts: ['.cloudshell.dev', '.googleusercontent.com'],
  },
})
