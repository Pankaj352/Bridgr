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
      external: ['date-fns', '@emoji-mart/data', '@emoji-mart/react', 'redux-persist/integration/react', 'next-themes', '@radix-ui/react-popover'],
      output: {
        globals: {
          'date-fns': 'dateFns',
          '@emoji-mart/data': 'emojiMartData',
          '@emoji-mart/react': 'emojiMartReact',
          'redux-persist/integration/react': 'ReduxPersistIntegration',
          'next-themes': 'nextThemes',
          '@radix-ui/react-popover': 'RadixUIReactPopover'
        }
      }
    }
  },
})