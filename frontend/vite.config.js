// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // ✨ 외부 접속 허용
    allowedHosts: true, // ✨ ngrok 같은 외부 도메인 접속 허용 (최신 Vite 필수)
    port: 5173,
  }
})