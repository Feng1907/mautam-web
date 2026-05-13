import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    css: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
});
