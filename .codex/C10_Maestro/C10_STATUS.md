# STATUS - ElevenTech

> Arquivo vivo. Sempre reflete o estado presente do projeto.
> Historico fica no LOG.md. Aqui so vive o agora.

---

## Estado Atual

**Fase:** IMPLEMENTACAO VALIDADA
**Ultima atualizacao:** 2026-05-09
**Atualizado por:** Documentador | Camisa10
**Ciclos completos:** 2

---

## Em Andamento

_(vazio no momento)_

---

## Proximas Tarefas

- [ ] Aplicar a migration `20260509190000_restrict_producer_units_management_to_admin.sql` no ambiente Supabase alvo.
- [ ] Executar smoke test com usuarios reais/sessoes reais: admin, collaborator e producer.
- [ ] Monitorar volume de `loads`; se o dashboard passar dos limites aceitaveis em memoria, planejar view/RPC Supabase para agregacao por unidade.

---

## Concluido

- [x] Feature `producer_units` corrigida: rocas/unidades sao geridas no painel admin durante criacao/edicao do produtor.
- [x] Portal do produtor deixou de criar, editar, inativar ou reativar unidades.
- [x] Coleta manteve selecao de unidades ativas por produtor e fallback para `location`.
- [x] Cargas exibem `producerUnitName || location`, preservando cargas antigas.
- [x] RLS de `producer_units` restringida: producer apenas `SELECT`, admin/collaborator gerenciam por `company_id`, maestro acessa tudo.
- [x] Soft delete de unidades mantido via `is_active`.
- [x] Validacao: `pnpm exec tsc -b` passou.
- [x] Validacao: `pnpm build` passou.
- [x] Smoke test tecnico executado por checagem de codigo: AdminProdutores contem gestao de unidades; ProducerDashboard nao contem gestao; UserColeta filtra `isActive`; migration nao cria policy de `DELETE`.
- [x] Secao `Desempenho por Unidade` adicionada ao `AdminDashboard` usando `loads`, `producers` e `producerUnits` do `AgroContext`.
- [x] Metricas por unidade implementadas: cargas, volume bruto, peso liquido, quebra, valor financeiro, preco medio ponderado e pagamentos pendentes.
- [x] Fallback legado documentado e implementado com chave `legacy:${producerId}:${fallbackNormalizado}`, sem misturar produtores com mesmo local/propriedade.
- [x] Unidades inativas e unidades ausentes do contexto preservadas no historico via badge `Inativa` ou `Snapshot`.
- [x] Decisao registrada: sem migration/view/RPC nesta etapa; agregacao em memoria no frontend.
- [x] Teste automatizado `pnpm run test:unit-performance` cobre carga nova, carga legada, unidade inativa, unidade removida com snapshot, nomes iguais e seguranca contra uso de dados cross-tenant/cross-producer.
- [x] Smoke test logico executado para relatorios por unidade: carga nova com `producerUnitId`, carga legada sem unidade, unidade inativa, nomes iguais em produtores diferentes e filtro por unidade/produtor.
- [x] Validacao da feature de relatorios: `pnpm exec tsc -b` passou.
- [x] Validacao da feature de relatorios: `pnpm build` passou.

---

## Bloqueios

_(vazio - preencher quando houver algo impedindo avanco)_

```text
[BLOQUEIO] -> [o que esta bloqueando] -> aguardando: [o que resolve]
```

---

## Metricas

| Metrica | Valor |
|---|---|
| Ciclos completos | 2 |
| Features entregues | 2 |
| ADRs registrados | 2 |
| Aprendizados registrados | 2 |
| Apontamentos do Cetico/validadores resolvidos | 5 |

---

## Saude do Projeto

**Risco atual:** MEDIO
**Motivo:** a correcao de RLS ainda precisa ser aplicada no Supabase alvo e validada com sessoes reais. A nova secao de relatorios esta validada no frontend, mas agrega em memoria e deve ser migrada para view/RPC se o volume de cargas crescer.
**Divida tecnica identificada:** validar em ambiente com sessoes reais que producer nao consegue `INSERT/UPDATE` via client direto; revisar futuramente cascatas de `producer_units` se o historico operacional precisar ser forte contra hard delete; monitorar performance do `AdminDashboard` para decidir quando mover agregacao por unidade ao banco.
