# Status do Projeto - ElevenTech

Atualizado em: 09/05/2026

## Resumo executivo

O projeto esta no workspace correto (`C:\Users\israe\Downloads\ElevenTech`) e na branch `main`, acompanhando `origin/main` (`https://github.com/eleventeckx-dev/eleventech`). A aplicacao compila em producao apos reconstrucao das dependencias locais, mas ainda nao esta em estado "verde" de qualidade porque o lint falha e a auditoria de seguranca aponta vulnerabilidades em dependencias.

Status geral: funcional para build, pendente para qualidade, seguranca e documentacao tecnica.

## Ambiente validado

| Item | Status |
| --- | --- |
| Diretorio atual | `C:\Users\israe\Downloads\ElevenTech` |
| Repositorio Git | branch `main`, tracking `origin/main` |
| Ultimo commit local | `eb52815` - `ajustepontua3` em 08/04/2026 |
| Node.js | `v24.12.0` |
| pnpm | `10.30.3` |
| npm | `11.6.2` |
| Variaveis `.env` | `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` presentes |
| Package manager | `pnpm`, com `pnpm-lock.yaml` |

Observacao importante: o `node_modules` estava quebrado porque os junctions apontavam para `C:\Users\israe\dyad-apps\eleventech`, fora do workspace atual. A instalacao foi reconstruida com:

```powershell
$env:CI='true'; pnpm install --frozen-lockfile
```

Depois disso, a resolucao de pacotes voltou a funcionar localmente.

## Stack identificada

- Frontend: Vite, React 19, TypeScript, React Router.
- UI: shadcn/Radix UI, Tailwind CSS, lucide-react, Sonner.
- Estado/dados: React Context (`AgroContext`) e TanStack Query.
- Backend/servicos: Supabase Auth, Supabase Database, Supabase Storage e Edge Functions.
- PWA: `vite-plugin-pwa` com service worker gerado via Workbox.
- Deploy: Vercel, com rewrite SPA para `index.html`.

## Funcionalidades e modulos

Rotas principais:

- Login e landing page: `/`, `/lpvendas`, `/link/lpvendas`.
- Super admin: `/super-admin/dashboard`, `/super-admin/companies`, `/super-admin/leads`.
- Admin/colaborador: `/:companySlug/app/dashboard`, `operacao`, `financeiro`, `estoque`, `produtores`, `produtos`, `usuarios`, `configuracoes`.
- Aplicativo mobile do colaborador: `/:companySlug/user/coleta`, `beneficiamento`, `estoque`, `perfil`.
- Portal produtor: `/:companySlug/producer/dashboard`.

Perfis de acesso identificados:

- `maestro`
- `admin`
- `collaborator`
- `producer`

O controle de acesso e feito por `ProtectedRoute`, validando sessao, papel do usuario e integridade do `companySlug` em rotas multitenant.

### Relatorios por unidade

O `AdminDashboard` em `/:companySlug/app/dashboard` possui a secao `Desempenho por Unidade`, que segmenta metricas por `producer_units` usando dados ja carregados pelo `AgroContext`:

- cargas;
- volume bruto;
- peso liquido;
- quebra;
- valor financeiro;
- preco medio/kg ponderado;
- pagamentos pendentes.

Regra de historico:

- Cargas com `producerUnitId` usam chave `unit:${producerUnitId}` e dados atuais de `producerUnits`, inclusive quando a unidade esta inativa.
- Se a unidade referenciada nao estiver mais no contexto, o relatorio usa snapshot `producerUnitName`.
- Cargas antigas sem `producerUnitId` usam fallback `legacy:${producerId}:${fallbackNormalizado}`, evitando misturar produtores com mesmo `location/property`.

Decisao tecnica: nesta etapa nao houve migration, view, RPC ou nova query Supabase. A agregacao fica em memoria no `AdminDashboard`, com `useMemo` e `Map`. Se o volume de cargas crescer, o proximo passo recomendado e mover a agregacao para view/RPC Supabase.

## Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `pnpm install --frozen-lockfile` | Passou apos reconstruir `node_modules` |
| `pnpm exec tsc -b` | Passou |
| `pnpm build` | Passou |
| `pnpm run test:unit-performance` | Passou para a agregacao de metricas por unidade |
| Smoke test logico de relatorios por unidade | Passou para carga nova, carga legada, unidade inativa e nomes iguais |
| `pnpm lint` | Falhou |
| `pnpm audit --audit-level moderate` | Falhou |

Resultado do build:

- Build Vite concluido com sucesso.
- PWA gerado com `dist/sw.js` e Workbox.
- Bundle principal gerado com cerca de `861.95 kB` minificado (`222.08 kB` gzip).

Avisos do build:

- `Browserslist/caniuse-lite` esta desatualizado.
- Chunk principal acima de `500 kB`; considerar code splitting/dynamic imports.

## Problemas encontrados

### 1. Lint falhando

O lint retorna 75 problemas: 62 erros e 13 avisos.

Principais grupos:

- `dev-dist/workbox-*.js` esta sendo analisado pelo ESLint, embora seja artefato gerado. Isso causa erros de regras antigas/inexistentes como `@typescript-eslint/ban-types` e `@typescript-eslint/no-unsafe-*`.
- Componentes shadcn tem interfaces vazias em `command.tsx` e `textarea.tsx`, bloqueadas por `@typescript-eslint/no-empty-object-type`.
- Uso amplo de `any` em contexto, paginas e Edge Functions.
- Blocos `catch`/controle vazios em `AgroContext.tsx`.
- Avisos de `react-refresh/only-export-components` em alguns componentes compartilhados.
- `tailwind.config.ts` usa `require()`, bloqueado por `@typescript-eslint/no-require-imports`.

Recomendacao: ajustar `eslint.config.js` para ignorar `dist`, `dev-dist`, `node_modules` e artefatos gerados; depois tratar os erros reais em `src` e `supabase/functions`.

### 2. Auditoria de seguranca falhando

`pnpm audit --audit-level moderate` encontrou 35 vulnerabilidades:

- 16 high
- 14 moderate
- 5 low

Pacotes relevantes citados:

- `vite`
- `rollup`
- `react-router-dom` / `@remix-run/router`
- `postcss`
- `glob`
- `minimatch`
- `picomatch`
- `yaml`
- `serialize-javascript`
- `lodash`

Recomendacao: atualizar dependencias com cuidado, comecando por Vite, React Router, PostCSS, Tailwind/tooling e vite-plugin-pwa/Workbox, validando build e fluxo de autenticacao apos cada grupo.

### 3. Encoding de textos

Alguns textos do projeto aparecem com caracteres quebrados, por exemplo em `vite.config.ts` e comentarios/mensagens em arquivos TypeScript:

- `ElevenTech â€” GestÃ£o Agro Inteligente`
- `variÃ¡veis de ambiente`

Recomendacao: normalizar arquivos para UTF-8 e revisar textos visiveis ao usuario, especialmente manifest PWA, mensagens de erro e comentarios.

### 4. Cobertura automatizada ainda limitada

Existe um teste automatizado especifico para a agregacao de metricas por unidade (`pnpm run test:unit-performance`), cobrindo carga nova com `producerUnitId`, carga legada sem unidade, unidade inativa, unidade removida com snapshot, nomes iguais em produtores diferentes e protecao contra uso indevido de dados cross-tenant/cross-producer.

Ainda nao ha runner geral de testes para a aplicacao. As validacoes amplas continuam sendo build, TypeScript, lint e audit.

Recomendacao: adicionar testes de fluxo critico para autenticacao, protecao de rotas e operacoes de carga/produtor/financeiro.

### 5. Documentacao inicial insuficiente

O `README.md` atual contem apenas o texto padrao do Dyad. Falta documentacao de setup, scripts, variaveis de ambiente, deploy e fluxos principais.

Recomendacao: criar um `README.md` operacional com setup local, padroes de contribuicao e checklist de validacao.

## Supabase

Estrutura local identificada:

- `supabase/config.toml`
- Edge Functions:
  - `fix-db`
  - `fix-meta`
  - `manage-company-admin`
  - `manage-users`

Configuracao local Supabase:

- API local: porta `54321`
- DB local: porta `54322`
- Studio local: porta `54323`
- Edge runtime: porta inspector `8083`
- Deno major version: `2`

O frontend exige `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. As chaves existem no `.env`, mas seus valores nao foram expostos nesta documentacao.

## Estado do Git

Antes da documentacao, o repositorio tinha apenas itens locais nao rastreados:

- `.codex/`
- `ElevenTech.code-workspace`

Depois desta validacao, este arquivo foi adicionado:

- `docs/STATUS_PROJETO.md`

O build gerado em `dist/` e ignorado pelo `.gitignore`.

## Proximos passos recomendados

1. Corrigir `eslint.config.js` para ignorar artefatos gerados (`dev-dist`, `dist`, `node_modules`).
2. Resolver erros reais do lint em `src` e `supabase/functions`.
3. Atualizar dependencias vulneraveis em grupos pequenos e validar apos cada atualizacao.
4. Normalizar encoding para UTF-8 nos arquivos com texto quebrado.
5. Criar README operacional com setup, scripts, variaveis e deploy.
6. Adicionar testes minimos para autenticacao, rotas protegidas e fluxos criticos.
7. Considerar code splitting para reduzir o bundle principal.
8. Monitorar volume de cargas no `AdminDashboard`; se a agregacao em memoria ficar pesada, criar view/RPC Supabase para relatorios por unidade.

## Comandos uteis

```powershell
pnpm install --frozen-lockfile
pnpm exec tsc -b
pnpm run test:unit-performance
pnpm lint
pnpm build
pnpm audit --audit-level moderate
pnpm preview
```
