# DECISIONS - ElevenTech

> Registro de decisoes arquiteturais do projeto.
> Formato: ADR (Architecture Decision Record).
> Apenas decisoes com peso real, que mudariam o sistema se fossem diferentes.
> Preferencias de estilo e detalhes de implementacao nao entram aqui.

---

## Como ler este arquivo

Cada decisao tem um status:
- **Aceita** -> em vigor
- **Substituida** -> foi trocada por outra ADR, com referencia indicada
- **Revertida** -> foi desfeita, com motivo registrado

Decisoes substituidas e revertidas nao sao apagadas.
O historico completo de raciocinio e parte do valor deste arquivo.

---

## Indice

| ADR | Titulo | Status | Data |
|---|---|---|---|
| ADR-002 | Relatorios por unidade usam agregacao frontend nesta etapa | Aceita | 2026-05-09 |
| ADR-001 | Unidades/rocas pertencem ao fluxo administrativo da empresa | Aceita | 2026-05-09 |

---

## ADR-002 - Relatorios por unidade usam agregacao frontend nesta etapa

**Data:** 2026-05-09
**Status:** Aceita

### Contexto

O `AdminDashboard` precisava segmentar metricas operacionais e financeiras por roca/unidade (`producer_units`) sem alterar schema, sem criar migration e sem abrir nova superficie de consulta Supabase nesta etapa.

Os dados necessarios ja estao carregados pelo `AgroContext`: `loads`, `producers` e `producerUnits`. A RLS existente ja limita esses dados por papel e `company_id`.

Tambem havia historico de cargas antigas sem `producerUnitId`, registradas apenas com `location` ou `producerUnitName`.

### Decisao

Os relatorios por unidade serao calculados no frontend, dentro do fluxo do `AdminDashboard`, usando uma funcao pura de agregacao (`aggregateUnitPerformance`) e indices `Map` (`producerById`, `unitById`).

Nao sera criada migration, view, RPC ou nova query Supabase nesta etapa.

A chave primaria para cargas com unidade vinculada e `unit:${producerUnitId}`.

Cargas antigas sem `producerUnitId` usam fallback legado `legacy:${producerId}:${fallbackNormalizado}`, preservando produtores diferentes que tenham o mesmo nome de propriedade/local.

Unidades inativas continuam aparecendo no historico. Se uma carga referencia uma unidade que nao esta mais no contexto, a exibicao usa o snapshot `producerUnitName` e marca a linha como snapshot.

### Alternativas consideradas

- Criar view/RPC Supabase agora -> descartada porque adicionaria contrato backend e migration antes de haver volume que justifique o custo.
- Tornar `producerUnitId` obrigatorio -> descartada porque quebraria cargas antigas e fluxos legados.
- Agrupar fallback apenas por `location` ou `property` -> descartada porque misturaria produtores/empresas com nomes iguais.
- Fazer nova query especifica para relatorio -> descartada porque os dados ja autorizados pelo `AgroContext` sao suficientes nesta etapa.

### Consequencias

**Positivas:**
- Entrega relatorio por unidade sem migration e sem ampliar superficie Supabase.
- Preserva cargas antigas e unidades inativas no historico.
- Evita N+1 em memoria usando `Map`.
- Mantem validacao testavel em funcao pura.

**Trade-offs:**
- O dashboard continua carregando e agregando cargas em memoria.
- Bases grandes podem exigir evolucao futura para view/RPC Supabase com agregacao no banco.
- Filtros por produtor/unidade afetam apenas a nova secao, enquanto KPIs globais seguem inalterados.

---

## ADR-001 - Unidades/rocas pertencem ao fluxo administrativo da empresa

**Data:** 2026-05-09
**Status:** Aceita

### Contexto

A tabela `public.producer_units` ja existia para representar rocas/unidades de produtores. A primeira implementacao colocou a gestao dessas unidades no `ProducerDashboard`, mas o requisito operacional correto mudou: unidades precisam ser criadas e mantidas pela empresa, no painel admin, durante criacao/edicao do produtor.

As unidades sao dados operacionais sensiveis. Elas afetam origem de coleta, rastreabilidade de cargas, historico financeiro e isolamento multi-tenant por `company_id`.

### Decisao

Unidades/rocas serao geridas pela empresa, via painel admin, e nao pelo produtor.

Produtores podem apenas visualizar unidades associadas as suas cargas. A RLS de `producer_units` permite:
- `maestro`: acesso total.
- `admin` e `collaborator`: `SELECT`, `INSERT` e `UPDATE` apenas da propria `company_id`, validando que `producer_id` pertence a mesma empresa.
- `producer`: `SELECT` apenas das proprias unidades, sem `INSERT` ou `UPDATE`.

Exclusao direta nao recebe policy. O ciclo normal de remocao operacional e soft delete via `is_active`.

### Alternativas consideradas

- Manter gestao no portal produtor -> descartada porque desloca uma decisao operacional da empresa para o produtor e permite alteracao direta de dados sensiveis de origem.
- Permitir produtor inserir/editar apenas proprias unidades via RLS -> descartada porque ainda violaria o requisito de ownership administrativo.
- Usar apenas validacao no frontend -> descartada porque producer poderia burlar a UI usando o Supabase client direto.

### Consequencias

**Positivas:**
- Centraliza a rastreabilidade operacional na empresa.
- Reduz risco de produtor alterar origem de cargas futuras sem validacao administrativa.
- Mantem compatibilidade com cargas antigas via `producerUnitName || location`.
- Alinha frontend e RLS: a UI remove gestao do produtor e o banco bloqueia mutacao direta.

**Trade-offs:**
- Admin/collaborator passam a carregar mais responsabilidade operacional.
- Colaboradores precisam manter unidades antes da coleta para evitar fallback manual em produtores sem unidades.
- O historico fica protegido contra delete direto em `producer_units`, mas hard delete de produtor/empresa ainda pode apagar unidades por cascade.
