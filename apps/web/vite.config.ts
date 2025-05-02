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
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@raven/types": path.resolve(__dirname, "../../packages/types"),
      "@raven/lib": path.resolve(__dirname, "../../packages/lib"),
    },
  },
  server: {
    port: 8080,
    proxy: proxyOptions
  },
  build: {
    outDir: "../../raven/public/raven_v3",
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
