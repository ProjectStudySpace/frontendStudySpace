import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "process.env": {},
    global: "globalThis",
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  server: {
    port: 1234,
  },
  test: {
    environment: "jsdom",
    include: ["src/features/intensive-study/**/*.test.ts"],
  },
});
