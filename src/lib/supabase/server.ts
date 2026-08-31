import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/types/database.types";

/**
 * Cliente Supabase para uso em Server Components / Server Actions / Route
 * Handlers. Usa a chave anônima — respeita RLS (leitura pública do catálogo,
 * escrita só como admin autenticado via Supabase Auth).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Chamado de um Server Component sem permissão de escrever
            // cookies — ok quando o proxy.ts já cuida de renovar a sessão.
          }
        },
      },
    }
  );
}
