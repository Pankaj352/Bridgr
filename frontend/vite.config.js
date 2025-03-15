import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-avatar', '@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-label', '@radix-ui/react-select', '@radix-ui/react-slot'],
          utils: ['date-fns', 'emoji-mart', '@emoji-mart/data', '@emoji-mart/react', 'socket.io-client', 'redux-persist', '@reduxjs/toolkit']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: true
  },
})