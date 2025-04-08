/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Send the build output to the server application public folder
    outDir: '../server/public',
    emptyOutDir: false,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    root: './',
    typecheck: {
      include: ['**/*.{ts,tsx}'],
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
