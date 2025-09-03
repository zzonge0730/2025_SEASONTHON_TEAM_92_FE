/// <reference types="vite/client" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0', // 모든 네트워크 인터페이스에서 접근 허용
    allowedHosts: 'all', // 모든 호스트 허용 (터널링 서비스용)
    hmr: {
      port: 3000
    },
    proxy: {
      // API 요청을 백엔드로 프록시
      '/api': {
        target: 'http://localhost:8891',
        changeOrigin: true,
        secure: false
      }
    }
  }
})