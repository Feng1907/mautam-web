import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  cacheDir: '../.vite-cache',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'sitemap.xml'],
      manifest: {
        name: 'Xứ Đoàn Anrê Phú Yên – Mẫu Tâm',
        short_name: 'Mẫu Tâm',
        description: 'Website quản lý và truyền thông Xứ Đoàn Mẫu Tâm',
        theme_color: '#8B0000',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        lang: 'vi',
        icons: [
          {
            src: '/logos/logos doan thieu nhi MT.jpg',
            sizes: '192x192',
            type: 'image/jpeg',
          },
          {
            src: '/logos/logos doan thieu nhi MT.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        importScripts: ['/push-sw.js'],
        // Cache-first: static assets (JS, CSS, fonts, images)
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webp,woff,woff2}'],
        // Network-first / StaleWhileRevalidate cho các API
        runtimeCaching: [
          {
            // Lời Chúa: dữ liệu thay đổi hằng ngày → NetworkFirst, timeout 5s
            urlPattern: /\/api\/loi-chua/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'loi-chua-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 8 },
              networkTimeoutSeconds: 5,
            },
          },
          {
            // Tin tức: StaleWhileRevalidate — load nhanh, update ngầm
            urlPattern: /\/api\/posts/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'posts-cache',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            // Lịch phụng vụ: ít thay đổi → CacheFirst, 7 ngày
            urlPattern: /\/api\/liturgy/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'liturgy-cache',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
        // SPA fallback — mọi navigation đều về index.html để React Router xử lý
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/offline\.html$/],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  optimizeDeps: {
    exclude: ['@sentry/react'],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
    exclude: ['node_modules', 'dist'],
  },
})
