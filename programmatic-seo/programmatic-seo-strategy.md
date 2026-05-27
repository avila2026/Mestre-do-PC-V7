# Estratégia de Programmatic SEO — Mestre do PC V7

## 1. Visão Geral

**Produto**: Mestre do PC V7 — Suíte de otimização e manutenção para Windows.
**Público-Alvo**: Usuários de Windows no Brasil que enfrentam lentidão, travamentos ou querem manter o PC saudável.
**Objetivo de Conversão**: Download e instalação do software.
**Stack Técnica Recomendada**: Next.js 14+ com ISR (Incremental Static Regeneration) para geração em massa com performance.

---

## 2. Playbooks Escolhidos

### Primary: Glossary + Personas (Combinados)

**Por quê?**
- O Mestre do PC V7 resolve problemas técnicos específicos. Um glossário de termos de otimização estabelece autoridade técnica e captura tráfego de pesquisa no início da jornada (awareness).
- Personas permitem segmentar o público e criar landing pages com mensagens altamente relevantes para cada tipo de usuário, aumentando conversão.

### Secondary: Curation

**Por quê?**
- "Melhores ferramentas para otimizar PC" e variações capturam usuários comparando soluções — alto intent comercial.

---

## 3. Estrutura de Keywords

### 3.1 Glossary Playbook — "O que é [termo técnico]"

**Padrão**: `/glossario/[termo]/`

**Termos-alvo (exemplos iniciais)**:

| Termo | Keyword Principal | Volume Estimado (BR) | Dificuldade |
|-------|-------------------|---------------------|-------------|
| Cache | "o que é cache do computador" | Alto | Média |
| Prefetch | "o que é prefetch windows" | Médio | Baixa |
| RAM | "o que é memória ram" | Alto | Alta |
| Bloatware | "o que é bloatware" | Médio | Baixa |
| Disco fragmentado | "o que é fragmentação de disco" | Médio | Média |
| Minidump | "o que é minidump" | Baixo | Baixa |
| Thumbnail cache | "o que é thumbnail cache" | Baixo | Baixa |
| DNS cache | "o que é cache dns" | Médio | Baixa |
| Temp files | "arquivos temporários windows" | Médio | Média |
| WinSxS | "o que é winsxs" | Baixo | Baixa |
| Disco a 100% | "disco 100% windows" | Alto | Média |
| Uso de RAM alto | "memória ram 100%" | Alto | Média |
| Processo svchost | "o que é svchost.exe" | Alto | Média |

**Valor Único por Página**:
- Definição clara em português do Brasil
- Explicação de como o termo afeta performance
- **Conexão com o produto**: "Como o Mestre do PC V7 resolve isso"
- Comando PowerShell relacionado (para usuários avançados)
- CTA contextual: "Otimize seu PC agora"

---

### 3.2 Personas Playbook — "[Solução] para [Público]"

**Padrão**: `/para/[persona]/`

**Personas identificadas**:

| Persona | Keyword Principal | Volume Estimado (BR) |
|---------|-------------------|---------------------|
| Gamers | "como otimizar pc para jogos" | Alto |
| Empresas/Escritório | "otimizar computadores empresa" | Médio |
| Estudantes | "pc lento para estudar" | Médio |
| Edição de vídeo | "otimizar pc para editar vídeos" | Médio |
| Usuários com PC antigo | "como deixar pc antigo mais rápido" | Alto |
| Freelancers | "manter notebook rápido freelancer" | Baixo |
| Pessoas não-técnicas | "como limpar pc sem formatar" | Alto |

**Valor Único por Página**:
- Problemas específicos da persona (ex: para gamers = input lag, FPS baixo)
- Soluções passo a passo com prints do Mestre do PC V7
- Benchmarks antes/depois (quando houver dados)
- Depoimentos fictícios segmentados por persona
- CTA específica: "Otimize seu PC para [persona]"

---

### 3.3 Curation Playbook — "Melhores [ferramentas]"

**Padrão**: `/melhores/[categoria]/`

| Categoria | Keyword Principal | Volume Estimado (BR) |
|-----------|-------------------|---------------------|
| Ferramentas de limpeza PC | "melhores programas para limpar pc" | Alto |
| Otimizadores Windows | "melhor otimizador de pc" | Alto |
| Antivírus leves | "antivírus leve para pc lento" | Médio |
| Desfragmentadores | "melhor desfragmentador windows" | Baixo |

**Valor Único por Página**:
- Análise honesta e balanceada
- Critérios de avaliação transparentes
- Mestre do PC V7 posicionado como opção #1 ou #2 com justificativa
- Tabela comparativa
- Atualização mensal com data visível

---

## 4. Arquitetura de URLs

```
mestredopc.com/
├── glossario/
│   ├── cache-do-computador/
│   ├── prefetch-windows/
│   ├── memoria-ram/
│   ├── bloatware/
│   ├── disco-fragmentado/
│   ├── minidump/
│   ├── thumbnail-cache/
│   ├── dns-cache/
│   ├── arquivos-temporarios/
│   ├── winsxs/
│   ├── disco-100-porcento/
│   ├── memoria-ram-alta/
│   └── svchost/
├── para/
│   ├── gamers/
│   ├── empresas/
│   ├── estudantes/
│   ├── edicao-de-video/
│   ├── pc-antigo/
│   └── usuarios-leigos/
├── melhores/
│   ├── ferramentas-limpeza-pc/
│   ├── otimizadores-windows/
│   ├── antivirus-leves/
│   └── desfragmentadores/
├── blog/
│   └── (posts editoriais convencionais)
└── download/  (página principal de conversão)
```

---

## 5. Template de Página (Glossary)

### Meta Tags
```
<title>O que é [Termo] e Como Resolver no Windows | Mestre do PC</title>
<meta name="description" content="Entenda o que é [Termo], por que ele deixa seu PC lento e como o Mestre do PC V7 resolve isso automaticamente em 1 clique.">
```

### Estrutura de Conteúdo

1. **H1**: O que é [Termo] e Como Afeta a Performance do seu PC
2. **Introdução** (2-3 parágrafos): Definição acessível + impacto no dia a dia
3. **H2**: Como o [Termo] Funciona no Windows
4. **H2**: Por que Isso Deixa seu PC Lento?
5. **H2**: Como Resolver Manualmente (PowerShell)
   - Bloco de código com comando
   - Aviso: "Requer privilégios de Administrador"
6. **H2**: Resolva Automaticamente com o Mestre do PC V7
   - Screenshot do software na ação
   - Lista de benefícios
   - CTA: "Download Gratuito"
7. **H2**: Perguntas Frequentes (3-4 FAQs)
8. **Related Links**: Links para outros termos do glossário

### Schema Markup
- Article schema
- FAQ schema
- SoftwareApplication schema (no CTA)

---

## 6. Template de Página (Personas)

### Meta Tags
```
<title>Otimizar PC para [Persona]: Guia Completo 2026 | Mestre do PC</title>
<meta name="description" content="Descubra como otimizar seu PC para [Persona]. Soluções testadas que aumentam performance em até X% com o Mestre do PC V7.">
```

### Estrutura de Conteúdo

1. **H1**: Como Otimizar seu PC para [Persona] em 2026
2. **Introdução**: Problemas específicos da persona
3. **H2**: Os 5 Principais Problemas de [Persona] no Windows
4. **H2**: Solução Passo a Passo
   - Print do Mestre do PC V7
   - Instruções em português
5. **H2**: Resultados Reais (Benchmarks)
6. **H2**: Por que o Mestre do PC V7 é Ideal para [Persona]
7. **Depoimento**: "Como o Mestre do PC V7 melhorou meu workflow"
8. **CTA**: "Baixe Agora — Otimização em 1 Clique"
9. **Related Links**: Outras personas

---

## 7. Dados e Conteúdo

### Fontes de Dados

1. **Proprietários** (mais valiosos):
   - Dados de performance do próprio Mestre do PC V7 (antes/depois de otimização)
   - Comandos PowerShell do projeto (já documentados no HTML)
   - Categorias de comandos existentes no dashboard

2. **Públicos** (apoio):
   - Documentação oficial da Microsoft sobre serviços Windows
   - Estatísticas de uso de Windows no Brasil
   - Dados de mercado de otimização de PC

### Dados Necessários por Página

| Tipo | Dados |
|------|-------|
| Glossary | Definição, impacto, comando PowerShell, relação com features do Mestre do PC V7 |
| Personas | Problemas específicos, benchmarks, screenshots, depoimentos |
| Curation | Lista de concorrentes, preços, features comparadas, scores |

---

## 8. Internal Linking

### Hub-and-Spoke

**Hub Principal**: Página de download (`/download/`)
**Spokes**: Todas as páginas de glossary, personas e curation

**Cross-linking**:
- Cada página de glossary linka para 2-3 glossários relacionados
- Cada página de persona linka para glossários relevantes aos problemas da persona
- Páginas de curation linkam para personas correspondentes

**Exemplo**:
```
Glossário "Cache" → Persona "Gamers" ("Limpar cache melhora FPS")
Persona "Gamers" → Curation "Melhores otimizadores" ("Compare ferramentas")
Curation → Download (CTA principal)
```

---

## 9. Estratégia de Indexação

### Prioridade de Lançamento

| Fase | Páginas | Tempo |
|------|---------|-------|
| 1 | 12 glossários + homepage | Semana 1-2 |
| 2 | 6 personas | Semana 3-4 |
| 3 | 4 curations | Semana 5-6 |
| 4 | Expansão (novos termos) | Mensal |

### Sitemaps

Separar sitemaps por tipo:
- `sitemap-glossary.xml`
- `sitemap-personas.xml`
- `sitemap-curation.xml`

### Noindex Condicional

Páginas com menos de 300 palavras de conteúdo único devem ter `noindex` até serem expandidas.

---

## 10. Stack Técnico Recomendado

```
Framework: Next.js 14+ (App Router)
Deploy: Vercel (edge network global)
CMS: Sanity ou Contentful (para dados estruturados)
Geração: ISR (Incremental Static Regeneration)
  - Revalidação: a cada 24h para glossários
  - Revalidação: a cada 7 dias para personas
Analytics: Google Analytics 4 + Search Console
```

### Por que Next.js?
- ISR permite gerar milhares de páginas com performance
- Server Components para SEO (meta tags dinâmicas)
- Edge caching global
- Facilidade de implementar sitemaps dinâmicos

---

## 11. Checklist Pré-Lançamento

### Conteúdo
- [ ] Cada glossário tem definição única + impacto + solução + CTA
- [ ] Cada persona tem problemas específicos + passo a passo + depoimento
- [ ] Sem conteúdo "thin" (mínimo 500 palavras por página)
- [ ] Titles e descriptions únicos
- [ ] Heading hierarchy (H1 → H2 → H3) correta

### Técnico
- [ ] Schema markup implementado (Article, FAQ, SoftwareApplication)
- [ ] XML sitemaps por tipo
- [ ] robots.txt configurado
- [ ] Core Web Vitals aceitáveis (LCP < 2.5s)
- [ ] Mobile-friendly (testado)
- [ ] hreflang (se houver versões PT-PT)

### Links
- [ ] Hub-and-spoke implementado
- [ ] Nenhuma página órfã
- [ ] Breadcrumbs com structured data
- [ ] Links internos contextuais

---

## 12. Métricas de Acompanhamento

| Métrica | Meta (3 meses) | Meta (6 meses) |
|---------|---------------|----------------|
| Páginas indexadas | 20+ | 50+ |
| Tráfego orgânico mensal | 500+ visitas | 3.000+ visitas |
| Taxa de conversão (download) | 2% | 5% |
| Posição média SERP | Página 3 | Página 1-2 |
| Backlinks | 5+ | 20+ |

---

## 13. Próximos Passos Imediatos

1. **Configurar projeto Next.js** com estrutura de pastas `/glossario/`, `/para/`, `/melhores/`
2. **Criar 3 glossários piloto** (Cache, RAM, Disco 100%) como prova de conceito
3. **Implementar ISR** e sitemap dinâmico
4. **Subir no Vercel** e configurar Google Search Console
5. **Criar template de conteúdo** em Markdown para facilitar produção em massa
6. **Planejar produção de conteúdo** (2 glossários por semana + 1 persona por semana)

---

*Estratégia criada em: Maio 2026*
*Para: Mestre do PC V7*
*Playbooks: Glossary + Personas + Curation*
