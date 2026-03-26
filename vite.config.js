import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { devTunnelOrigin } from './vite-plugins/devTunnel.js';

export default defineConfig({
  plugins: [devTunnelOrigin(), react()],
  base: './',
  server: {
    open: true,
    host: true,
    /** Cloudflare/터널 스크립트와 동일 — `npm run dev` 도 여기서 열림 (localhost:5183) */
    port: 5183,
    /** 터널·프록시에서 오는 임의 Host 허용 (개발 전용) */
    allowedHosts: true,
  },
  preview: {
    open: true,
    host: true,
    port: 4173,
  },
});
