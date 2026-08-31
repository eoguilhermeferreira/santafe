import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

/**
 * Cliente Supabase público, sem cookies/sessão. Usado nas páginas da loja
 * (catálogo, produto, categoria) e no sitemap, que só leem dados liberados
 * por RLS para qualquer visitante — nunca deve carregar o token de sessão
 * do navegador, para não quebrar a página caso o cookie de auth do visitante
 * esteja inválido/expirado (ex: sessão de admin corrompida).
 */
export function createClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
