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
          ui: ['@radix-ui/react-avatar', '@radix-ui/react-dialog', '@radix-ui/react-popover', 'next-themes'],
          utils: ['date-fns', '@emoji-mart/data', '@emoji-mart/react']
        }
      },
      external: ['next-themes', '@emoji-mart/data']
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: true
  },
})