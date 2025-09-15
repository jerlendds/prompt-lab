import { defineConfig } from "vite"
import preact from "@preact/preset-vite"
import tailwindcss from "@tailwindcss/vite"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Use relative paths in production so assets load from extension/app/
  base: mode === "production" ? "./" : "/",
  plugins: [preact(), tailwindcss()],
  css: {
    // existence prevents a crash
    devSourcemap: false,
  },
}))
