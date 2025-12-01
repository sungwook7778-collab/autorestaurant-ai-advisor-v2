import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/autorestaurant-ai-advisor-v2/', // 꼭 GitHub repo 이름과 일치
  build: {
    outDir: 'docs',
  },
});