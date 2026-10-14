import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  // Base path for deploying the dashboard under the website subpath.
  //   Default ".../" — works for direct hosting and /dashboard redirects.
  //   For same-origin proxied deploy (website rewrites /dashboard/* here),
  //   set VITE_BASE=/dashboard/ so asset URLs stay inside the prefix.
  base: process.env.VITE_BASE || "./",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // "prompt", NOT "autoUpdate": the waiting worker must never swap itself
      // in behind the user's back. An auto-reload mid-form or mid-export loses
      // data, so the refresh is offered through a toast instead (see
      // components/PwaUpdateBanner.tsx).
      registerType: "prompt",
      /*
       * Dev support — WITHOUT this the plugin's own guard
       *   (ctx.devEnvironment && !ctx.options.devOptions.enabled)
       * skips manifest injection entirely during `npm run dev`, so DevTools
       * reports "No manifest detected" on localhost. Enabling it only exposes
       * the manifest + its endpoint locally; service-worker REGISTRATION stays
       * production-only because <PwaUpdateBanner /> is behind a PROD gate in
       * App.tsx. Verified: no SW is registered in dev.
       */
      devOptions: { enabled: true },
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "AuReUs",
        short_name: "AuReUs",
        description:
          "A premium personal finance dashboard to track your wealth, budgets, investments and goals.",
        theme_color: "#090d16",
        background_color: "#090d16",
        display: "standalone",
        orientation: "portrait-primary",
        // Must stay relative to match `base` above — a leading "/" would break
        // the same-origin /dashboard proxy deploy.
        start_url: "./",
        scope: "./",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
          { src: "maskable-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // SPA offline fallback. Navigations only — cross-origin fetches are
        // never candidates for navigateFallback.
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api\//, /\.(?:json|xml)$/],
        // Auth-integrity rule: Supabase auth/rest/storage responses are NEVER
        // cached. A cached token refresh would replay stale credentials and
        // produce exactly the "unexpected logout / stuck session" failures this
        // build has to prevent.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/,
            handler: "NetworkOnly",
          },
        ],
        clientsClaim: true,
        skipWaiting: false,
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});