import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder')

export function createClient() {
  if (!isConfigured) {
    // Mode démo — retourne un client factice pour éviter le crash
    console.info('[Fotia] Supabase non configuré — mode démo actif')
  }
  return createBrowserClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder-key'
  )
}

export { isConfigured as isSupabaseConfigured }
