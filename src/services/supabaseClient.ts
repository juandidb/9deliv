import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Diagnostic logs (printed in browser console). Mask the anon key for safety.
try {
  if (typeof window !== 'undefined') {
    console.info('[supabase] env:', {
      supabaseUrl: supabaseUrl ?? null,
      supabaseAnonKey: supabaseAnonKey ? `***${supabaseAnonKey.slice(-6)}` : null,
      configured: Boolean(supabaseUrl && supabaseAnonKey),
    })
  }
} catch (e) {
  // ignore
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

let client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado. Definí VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.')
  }
  if (!client) {
    // show a short log when client is created
    try {
      if (typeof window !== 'undefined') console.info('[supabase] creating client')
    } catch (e) {}
    client = createClient(supabaseUrl!, supabaseAnonKey!)
  }
  return client
}
