import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as p from "./package.json";

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(p.version),
  },
  // Set the base path to match GitHub Pages repository structure when building for web
  base: process.env.VITE_BASE_PATH || '/',
  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
        protocol: "ws",
        host,
        port: 1421,
      }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
  build: {
    // Ensure source maps are generated for better debugging
    sourcemap: true,

    // Customize output for web vs. Tauri
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code for better caching in web environments
          react: ['react', 'react-dom'],
          mui: ['@mui/icons-material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          word: ['docxtemplater', 'pizzip', 'angular-expressions'],
          excel: ['xlsx']
        }
      }
    }
  },
}));
