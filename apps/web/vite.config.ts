import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// @ts-expect-error - proxyOptions is not typed
import proxyOptions from "./proxyOptions";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 8080,
    proxy: proxyOptions
  },
  build: {
    outDir: "../../raven/public/raven",
    emptyOutDir: true,
    target: "es2015",
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
          return
        }
        warn(warning)
      }
    }
  }
})
