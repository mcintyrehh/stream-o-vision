import { defineConfig } from "vite";

export default defineConfig({
  root: "./app",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: "./app/public/index.html",
    },
  },
  server: {
    open: false,
  },
});
