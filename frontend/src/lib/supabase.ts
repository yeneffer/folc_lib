import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** Cliente Supabase para o navegador (usa a anon key, protegido por RLS). */
export const supabase = createClient(url, anonKey);
