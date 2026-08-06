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
    // Fail the run on any stray `.only`. Vitest defaults this to `!process.env.CI`,
    // which lets a focused test silently skip the rest of the suite and still exit 0.
    allowOnly: false,
    // Backstop: even if the network guard is bypassed, nothing can reach
    // production. Port 1 on loopback refuses instantly: no DNS, no egress.
    env: { VITE_API_URL: "http://127.0.0.1:1/api" },
  },
});
