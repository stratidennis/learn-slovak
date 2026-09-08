import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Static PWA. Deployed as a prebuilt folder (Vercel CLI); nothing runs on a server.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg'],
      manifest: {
        name: 'Slovenčina — learn spoken Slovak',
        short_name: 'Slovenčina',
        description: 'Spoken Slovak for a Romanian speaker. Local-first, no account.',
        lang: 'sk',
        start_url: '/',
        display: 'standalone',
        background_color: '#FAF8F4',
        theme_color: '#2457C5',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // the shell is precached; content and audio are cached as they are used, so the
        // first load is small and a unit becomes available offline after you do it once
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          { urlPattern: /\/audio\/.*\.(ogg|wav|mp3)$/, handler: 'CacheFirst',
            options: { cacheName: 'audio', expiration: { maxEntries: 4000, maxAgeSeconds: 60 * 60 * 24 * 365 } } },
          { urlPattern: /\/content\/.*\.json$/, handler: 'StaleWhileRevalidate',
            options: { cacheName: 'content', expiration: { maxEntries: 200 } } },
          { urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i, handler: 'CacheFirst',
            options: { cacheName: 'fonts', expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 } } },
        ],
      },
    }),
  ],
  server: { port: 5173 },
  build: { target: 'es2020', sourcemap: false },
})
