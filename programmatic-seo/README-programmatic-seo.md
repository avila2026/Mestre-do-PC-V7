# Programmatic SEO — Mestre do PC V7

## Arquivos Entregues

| Arquivo | Descrição |
|---------|-----------|
| `programmatic-seo-strategy.md` | Estratégia completa de SEO programático |
| `template-glossary-nextjs.jsx` | Template Next.js para páginas de glossário |
| `template-persona-nextjs.jsx` | Template Next.js para páginas de persona |
| `lib-glossary-data.js` | Dados de exemplo (3 termos técnicos) |
| `lib-personas-data.js` | Dados de exemplo (2 personas: Gamers e Empresas) |
| `sitemap-dynamic.js` | API route para sitemap XML dinâmico |

## Como Usar

### 1. Criar Projeto Next.js

```bash
npx create-next-app@latest mestre-seo --app --ts --tailwind --eslint --src-dir
```

### 2. Copiar Templates

- Copiar `template-glossary-nextjs.jsx` para `src/app/glossario/[slug]/page.tsx`
- Copiar `template-persona-nextjs.jsx` para `src/app/para/[slug]/page.tsx`
- Copiar `lib-glossary-data.js` para `src/lib/glossary.ts`
- Copiar `lib-personas-data.js` para `src/lib/personas.ts`
- Copiar `sitemap-dynamic.js` para `src/app/api/sitemap-glossary/route.ts`

### 3. Instalar Dependências

```bash
npm install
```

### 4. Configurar next.config.js

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
};
module.exports = nextConfig;
```

### 5. Build e Deploy

```bash
npm run build
# Saída em /out — subir na Vercel ou Netlify
```

## Estrutura de Pastas Final

```
src/
├── app/
│   ├── api/
│   │   └── sitemap-glossary/
│   │       └── route.ts
│   ├── glossario/
│   │   ├── [slug]/
│   │   │   └── page.tsx
│   │   └── page.tsx  (hub)
│   ├── para/
│   │   ├── [slug]/
│   │   │   └── page.tsx
│   │   └── page.tsx  (hub)
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── glossary.ts
│   └── personas.ts
└── ...
```

## Expansão de Conteúdo

Para adicionar novos termos ao glossário, edite `src/lib/glossary.ts` e adicione novos objetos ao array `glossaryData`. O Next.js ISR regenerará as páginas automaticamente.

Para novas personas, edite `src/lib/personas.ts`.

## Roadmap de Conteúdo

| Semana | Tarefa |
|--------|--------|
| 1 | Subir projeto base + 3 glossários piloto |
| 2 | 3 glossários adicionais + hub pages |
| 3 | 2 personas + sitemap |
| 4 | Google Search Console + Analytics |
| 5+ | 2 glossários/semana + 1 persona/semana |

---

*Documentação criada para o projeto Mestre do PC V7 | Maio 2026*
