import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client for the Aureus dashboard (Vite).
 *
 * IMPORTANT — Vite vs Next.js environment variables:
 *  • Vite only exposes variables prefixed with `VITE_` (never NEXT_PUBLIC_).
 *  • Vite only loads `.env` files from the PROJECT ROOT (the folder with
 *    vite.config.ts) — a `.env` inside src/ is ignored.
 *  • The website (Next.js) uses NEXT_PUBLIC_ prefixed names for the same
 *    values; the values themselves must be identical in both apps.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loudly in the console with an actionable message instead of crashing.
  console.error(
    "[Aureus] Supabase is not configured. Create a `.env` file in the PROJECT ROOT (next to vite.config.ts) with:\n" +
      "VITE_SUPABASE_URL=https://your-project.supabase.co\n" +
      "VITE_SUPABASE_ANON_KEY=your-anon-key\n" +
      "Then restart `npm run dev`."
  );
}

// Placeholder fallback keeps the app rendering (no blank screen) even when
// unconfigured — auth calls will simply fail until real keys are provided.
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "public-anon-key-placeholder"
);