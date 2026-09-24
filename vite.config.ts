import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  // Base path for deploying the dashboard under the website subpath.
  //   Default ".../" — works for direct hosting and /dashboard redirects.
  //   For same-origin proxied deploy (website rewrites /dashboard/* here),
  //   set VITE_BASE=/dashboard/ so asset URLs stay inside the prefix.
  base: process.env.VITE_BASE || "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});