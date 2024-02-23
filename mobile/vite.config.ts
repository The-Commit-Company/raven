import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react'
import proxyOptions from './proxyOptions';
import { VitePWA } from 'vite-plugin-pwa'
// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {

  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(),
    VitePWA({
      strategies: 'injectManifest',
      registerType: 'autoUpdate',
      outDir: '../raven/public/raven_mobile',
      filename: 'firebase-messaging-sw.js',
      srcDir: 'src',
      scope: '/assets/raven/raven_mobile/',
      workbox: {
        importScripts: [],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,ttf,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      },
      manifest: {
        name: "Raven",
        short_name: "Raven",
        // start_url: `/${env.VITE_BASE_NAME}`,
        description: "Raven",
        display: "standalone",
        theme_color: "#ffffff",
        background_color: "#09090B",
        "icons": [
          {
            "src": "/android-chrome-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
          },
          {
            "src": "/android-chrome-384x384.png",
            "sizes": "384x384",
            "type": "image/png"
          }
        ],
      },
    })
    ],
    server: {
      port: 8081,
      proxy: proxyOptions,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    build: {
      outDir: '../raven/public/raven_mobile',
      emptyOutDir: true,
      target: 'es2015',
    },
  }
});
