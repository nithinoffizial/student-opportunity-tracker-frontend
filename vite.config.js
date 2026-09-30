import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
    proxy: {
      '/api': {
        target: 'https://student-opportunity-tracker-1-0.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
