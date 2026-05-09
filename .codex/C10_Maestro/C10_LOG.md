# LOG - ElevenTech

> Cronologia completa do projeto. Nada e apagado daqui.
> Cada entrada e imutavel apos ser criada.
> Analises e aprendizados ficam no LEARNINGS.md.
> Este arquivo e fatos, datas, e o que aconteceu.

---

## Como ler este log

- Entradas mais recentes no topo
- Cada entrada tem data, titulo, e descricao objetiva
- `[OK]` -> ciclo encerrado com sucesso
- `[OK*]` -> encerrado com ressalvas documentadas
- `[PARCIAL]` -> entrega incompleta, continua no proximo ciclo
- `[REVERTIDO]` -> implementacao foi desfeita

---

## 2026-05-09 - Relatorios por unidade no AdminDashboard

**Fase:** IMPLEMENTACAO VALIDADA
**Ciclo:** 2
**Agentes ativos:** Camisa10 -> security_validator -> performance_validator -> final_validator -> test_implementer -> Documentador
**O que aconteceu:** a rota admin `/:companySlug/app/dashboard` recebeu a secao `Desempenho por Unidade`, agregando metricas operacionais e financeiras por `producer_units` usando dados ja carregados no `AgroContext`. A secao calcula ranking por unidade, volume bruto, quantidade de cargas, peso liquido, quebra, valor financeiro, preco medio ponderado e pagamentos pendentes. Cargas antigas sem `producerUnitId` foram preservadas por fallback legado com chave `legacy:${producerId}:${fallbackNormalizado}`. Unidades inativas continuam aparecendo no historico.
**Arquivos criados:**
  - `src/pages/admin/adminDashboardMetrics.ts`
  - `src/pages/admin/adminDashboardMetrics.test.ts`
**Arquivos modificados:**
  - `src/pages/admin/AdminDashboard.tsx`
  - `package.json`
**Validacoes executadas:**
  - `pnpm run test:unit-performance` passou
  - `pnpm exec tsc -b` passou
  - `pnpm build` passou
  - Smoke test logico cobriu: carga nova com `producerUnitId`, carga legada sem unidade, unidade inativa, unidade removida com snapshot, nomes iguais em produtores diferentes e unidade cross-tenant/cross-producer sem uso indevido de dados
**Status ao fechar:** [OK*]
**Ressalvas:** a agregacao permanece em memoria no `AdminDashboard`. Se o volume de cargas crescer, evoluir para view/RPC Supabase com agregacao no banco. O smoke visual do dashboard completo depende de sessao autenticada; em ambiente local a rota redirecionou para login.

---

## 2026-05-09 - Correcao da feature producer_units

**Fase:** IMPLEMENTACAO VALIDADA
**Ciclo:** 1
**Agentes ativos:** Camisa10 -> impact_validator -> security_validator -> Documentador
**O que aconteceu:** o plano de `producer_units` foi validado por impacto e seguranca. A gestao de rocas/unidades foi movida do portal do produtor para `AdminProdutores`. O produtor deixou de criar, editar, inativar e reativar unidades. A coleta passou a exigir unidade ativa quando o produtor possui unidades ativas, mantendo fallback para `location` quando nao houver unidade. As cargas continuam exibindo `producerUnitName || location`.
**Arquivos criados:**
  - `supabase/migrations/20260509190000_restrict_producer_units_management_to_admin.sql`
**Arquivos modificados:**
  - `src/pages/admin/AdminProdutores.tsx`
  - `src/pages/producer/ProducerDashboard.tsx`
  - `src/pages/user/UserColeta.tsx`
  - `src/contexts/AgroContext.tsx`
**Validacoes executadas:**
  - `pnpm exec tsc -b` passou
  - `pnpm build` passou
  - Smoke test tecnico executado: AdminProdutores contem gestao de unidades; ProducerDashboard nao contem gestao de rocas; UserColeta filtra unidades ativas; migration permite producer apenas em `SELECT`; nao ha policy de `DELETE`
**Status ao fechar:** [OK*]
**Ressalvas:** aplicar a migration no Supabase alvo e validar RLS com sessoes reais. Historico por soft delete esta preservado em `producer_units`, mas cascatas de hard delete em produtor/empresa ainda podem apagar unidades.

---

<!-- NOVA ENTRADA SEMPRE ACIMA DESTA LINHA -->

---

## [DATA] - INICIO DO PROJETO

**Fase:** CONCEPCAO
**Agentes ativos:** CAMISA10
**O que aconteceu:** Onboarding concluido. PROJECT.md, STATUS.md, LOG.md,
DECISIONS.md, LEARNINGS.md e claude.md criados na raiz do projeto.
**Arquivos criados:**
  - PROJECT.md
  - STATUS.md
  - LOG.md
  - DECISIONS.md
  - LEARNINGS.md
  - claude.md
**Status:** [OK]
