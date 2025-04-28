import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    commonjsOptions: {
      include: [/shared/, /node_modules/],
    },
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  base: "/",
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@peaceflow/shared": resolve(__dirname, "../shared/src"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
