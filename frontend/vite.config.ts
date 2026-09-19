import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react-router-dom': path.resolve(__dirname, './src/lib/router'),
      'recharts': path.resolve(__dirname, './src/lib/charts'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
