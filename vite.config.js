import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Simulador de Grandes Cifras',
        short_name: 'BigNumbers',
        description: 'Simulador pedagógico de grandes magnitudes económicas, dilema del prisionero, P2P y gestión estatal.',
        theme_color: '#050b14',
        background_color: '#050b14',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        share_target: {
          action: './',
          method: 'GET',
          params: {
            title: 'title',
            text: 'text',
            url: 'url'
          }
        }
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}']
      }
    })
  ],
})
