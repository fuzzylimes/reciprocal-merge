import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import * as p from "./package.json";

const host = process.env.TAURI_DEV_HOST;

// Set the application base path - will be used for all assets and imports
const BASE_PATH = process.env.VITE_BASE_PATH || (process.env.NODE_ENV === 'production' ? '/reciprocal-merge/' : '/');

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(p.version),
      'import.meta.env.VITE_DEA_PROXY_URL': JSON.stringify(env.VITE_DEA_PROXY_URL || ''),
      'import.meta.env.BASE_PATH': BASE_PATH,
    },
    base: BASE_PATH,
    clearScreen: false,
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
        ignored: ["**/src-tauri/**"],
      },
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor code for better caching in web environments
            react: ['react', 'react-dom'],
            mui: ['@mui/icons-material', '@mui/material', '@emotion/react', '@emotion/styled'],
            word: ['docxtemplater', 'pizzip', 'angular-expressions'],
            excel: ['xlsx']
          }
        }
      }
    },
    // Configure worker bundling options
    worker: {
      format: 'es', // Use ES modules for workers
    }
  }
});
