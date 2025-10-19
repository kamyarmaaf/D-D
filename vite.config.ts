import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'D&D Bolt - ماجراجویی‌های مدرن',
        short_name: 'D&D Bolt',
        description: 'بازی مدرن D&D با داستان‌سرایی هوش مصنوعی و چندنفره آنلاین',
        theme_color: '#8b5cf6',
        background_color: '#1e1b4b',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        lang: 'fa',
        dir: 'rtl',
        categories: ['games', 'entertainment', 'role-playing'],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        shortcuts: [
          {
            name: 'شروع سریع',
            short_name: 'شروع بازی',
            description: 'شروع یک ماجراجویی جدید D&D',
            url: '/?action=quickstart',
            icons: [
              {
                src: 'pwa-192x192.png',
                sizes: '192x192'
              }
            ]
          },
          {
            name: 'سازنده کاراکتر',
            short_name: 'ساخت کاراکتر',
            description: 'ساخت یا ویرایش کاراکتر',
            url: '/character',
            icons: [
              {
                src: 'pwa-192x192.png',
                sizes: '192x192'
              }
            ]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fxumrywaxagueiqlovgg\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'supabase-realtime-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
              }
            }
          }
        ],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/_/, /\/[^/?]+\.[^/]+$/]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['sql.js']
  },
  define: {
    global: 'globalThis',
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api/n8n': {
        target: 'https://devewa9004.app.n8n.cloud',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/n8n/, ''),
        secure: true,
        headers: {
          'Origin': 'https://devewa9004.app.n8n.cloud'
        }
      }
    }
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true
  }
});
