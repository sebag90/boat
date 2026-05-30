import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// API base can be injected at build/runtime via VITE_API_URL.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
});
