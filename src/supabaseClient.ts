// FIX: Add a triple-slash directive to include Vite's client types. This provides TypeScript with the type definitions for `import.meta.env`.
/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';

// Vite exposes environment variables prefixed with VITE_ on the `import.meta.env` object.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// --- Configuration Validation ---
// A simple check to ensure credentials are not empty.
if (!supabaseUrl || !supabaseKey) {
  const errorMessage = "Supabase URL or Anon Key is missing. Make sure you have VITE_SUPABASE_URL and VITE_SUPABASE_KEY set in your .env file for local development or in your Vercel project settings.";
  const rootEl = document.getElementById('root');
  if (rootEl) {
    rootEl.innerHTML = `<div style="padding: 2rem; margin: 2rem; text-align: center; color: #fff; background-color: #f00; border-radius: 8px; font-family: sans-serif;"><h2>Configuration Error</h2><p>${errorMessage}</p></div>`;
  }
  throw new Error(errorMessage);
}
// --- End of Configuration Validation ---

export const supabase = createClient(supabaseUrl, supabaseKey);
