import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

let client: SupabaseClient | null = null;

/**
 * Cliente Supabase do navegador (anon key, protegido por RLS), criado de
 * forma lazy — evita lancar "supabaseUrl is required" na importacao/build
 * quando as variaveis ainda nao estao configuradas.
 */
export function getSupabase(): SupabaseClient {
  if (!client) {
    if (!env.supabaseUrl) {
      throw new Error(
        'Supabase nao configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.',
      );
    }
    client = createClient(env.supabaseUrl, env.supabaseAnonKey);
  }
  return client;
}
