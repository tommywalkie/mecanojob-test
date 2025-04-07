/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: "jsdom",
    root: "./",
    typecheck: {
      include: ["**/*.{ts,tsx}"],
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
