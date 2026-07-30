import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Base relativa: funciona tanto na raiz (Render) quanto em subpasta (GitHub Pages).
  base: "./",
  plugins: [react()],
  resolve: {
    preserveSymlinks: true,
  },
});
