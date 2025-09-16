import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseKey } from './supabaseEnv';

// --- Configuration Validation ---
// A simple check to ensure credentials are not empty.
if (!supabaseUrl || !supabaseKey) {
  const errorMessage = "Supabase URL or Anon Key is missing. Please create a `supabaseEnv.ts` file with your project credentials for local development.";
  const rootEl = document.getElementById('root');
  if (rootEl) {
    rootEl.innerHTML = `<div style="padding: 2rem; margin: 2rem; text-align: center; color: #fff; background-color: #f00; border-radius: 8px; font-family: sans-serif;"><h2>Configuration Error</h2><p>${errorMessage}</p></div>`;
  }
  throw new Error(errorMessage);
}
// --- End of Configuration Validation ---

export const supabase = createClient(supabaseUrl, supabaseKey);