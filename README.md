# Santa Fé — Artigos Religiosos Católicos

Loja virtual de artigos religiosos católicos (bíblias, terços, crucifixos,
imagens, escapulários, livros e outros), com painel administrativo próprio
e checkout com pagamento transparente via Mercado Pago.

## Identidade visual — pendente

Logo, paleta de cores e fonte oficiais ainda não foram enviadas pela
cliente. O projeto está com uma identidade neutra provisória
(`src/app/globals.css`), pronta para receber os tokens definitivos assim
que chegarem — basta trocar os valores em `:root`/`.dark` e, se for o
caso, as fontes em `src/app/layout.tsx`.

## Stack

- **Next.js 16** (App Router, Turbopack, Server Actions) + TypeScript
- **Tailwind CSS 4** + componentes de UI no padrão shadcn (montados à mão neste
  projeto, sem depender do registry remoto)
- **Supabase** (Postgres + Auth + Storage)
- **Mercado Pago** (Payment Bricks — Pix, cartão de crédito/débito, boleto)
- **Vercel** para deploy

Frete é calculado de forma simplificada (valor fixo, configurável em
`src/config/store.ts`) — sem integração com transportadora. Não há envio
de e-mail transacional.

## Estrutura de pastas

```
src/
├── app/
│   ├── (store)/          # loja: home, produtos, produto/[slug], categoria/[slug], carrinho, checkout
│   ├── admin/             # painel administrativo (login + área protegida)
│   ├── api/webhooks/mercadopago/route.ts
│   ├── sitemap.ts, robots.ts
│   └── layout.tsx
├── components/
│   ├── ui/                # primitivos de UI (button, input, dialog, table...)
│   ├── store/, cart/, checkout/, admin/, icons/
├── config/store.ts         # dados fixos da loja (nome, contato, frete)
├── lib/
│   ├── supabase/{client,server,admin}.ts
│   ├── queries.ts, mercadopago.ts, shipping.ts, format.ts, checkout-schema.ts
├── proxy.ts                 # protege /admin/* (renomeado de middleware.ts no Next 16)
└── types/database.types.ts
supabase/migrations/
├── 0001_init.sql            # schema completo (tabelas, enums, RLS, buckets)
└── 0002_seed_categories.sql # categorias iniciais da loja
```

## Categorias cadastradas

Bíblias, Camisetas, Crucifixos, Terços, Imagens, Escapulários, Livros,
Terços de pulso e Diário Bíblico 2027. Produtos são cadastrados pelo
painel em `/admin` depois que o projeto Supabase estiver configurado.

## Configurando o projeto do zero

1. **Supabase**: crie um projeto novo e rode, em ordem, os arquivos em
   `supabase/migrations/` no SQL Editor (cria tabelas, enums, RLS,
   `is_admin()`, os buckets de Storage `products`/`categories`/`banners`
   e as categorias iniciais da loja).
2. **Usuário admin**: crie um usuário em *Authentication > Users* (e-mail/senha)
   e depois insira uma linha em `admin_profiles` com o mesmo `id`:
   ```sql
   insert into admin_profiles (id, email) values ('<uuid-do-usuario>', 'seu@email.com');
   ```
3. **Mercado Pago**: crie uma aplicação em *Suas integrações* no modelo
   "Checkout Transparente / Bricks" e gere as credenciais (Public Key e
   Access Token).
4. **Variáveis de ambiente**: copie `.env.example` para `.env.local` e
   preencha com as credenciais acima.
5. **Rodar localmente**:
   ```bash
   npm install
   npm run dev
   ```
6. Cadastre os produtos, imagens e banners da home pelo painel em `/admin`.

## Dados da loja

- **Nome**: Santa Fé
- **E-mail**: santafeartigoscatolicos@gmail.com
- **WhatsApp**: (14) 99763-0452
- **Cidade de entrega**: Avaré/SP (CEP 18700-070)

## Deploy

Conecte o repositório à Vercel, cadastre as mesmas variáveis de
`.env.example` em *Project Settings > Environment Variables*, defina
`NEXT_PUBLIC_SITE_URL` com o domínio final e configure a URL do webhook do
Mercado Pago (`/api/webhooks/mercadopago`) apontando para esse domínio.

## Possíveis evoluções futuras

- Identidade visual definitiva (logo, cores, fonte) assim que a cliente enviar.
- Baixa automática de estoque ao confirmar pagamento (hoje o estoque é
  ajustado manualmente pelo admin).
- E-mail transacional (ex: Resend) e cálculo de frete real por transportadora
  (ex: Melhor Envio), caso a loja precise deles no futuro.
