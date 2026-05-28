import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

/**
 * Single shared Supabase client for the whole app.
 *
 * When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are missing
 * (e.g. before you've created a Supabase project), this exports `null`
 * and every caller falls back to a local stub. The UI keeps working —
 * no errors, just no real persistence.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase: SupabaseClient<Database> | null =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null

/** True when both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set. */
export function hasSupabase(): boolean {
  return supabase !== null
}

/** A 1-time warning so we can see in the console that we're in stub mode. */
if (typeof window !== 'undefined' && !supabase) {
  // eslint-disable-next-line no-console
  console.info(
    '%c[supabase] stub mode',
    'color: #00E5CC; font-weight: bold',
    '— set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local to enable real persistence.',
  )
}
