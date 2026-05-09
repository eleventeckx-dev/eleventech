# LEARNINGS - ElevenTech

> Materia-prima do guia de SDD.
> Cada entrada aqui e uma licao que o proximo projeto nao vai precisar aprender
> do jeito dificil.
> Escrever sempre como se fosse para alguem que nunca viu este projeto.
> Sem julgamento. Sem culpados. So dados, causa raiz, e o que fazer diferente.

---

## Tipos de entrada

- **Erro** -> algo que quebrou ou precisou ser refeito
- **Armadilha** -> algo que quase deu errado, evitado pelo Cetico ou por sorte
- **Padrao** -> uma abordagem que funcionou bem e deve ser repetida
- **Otimizacao** -> algo que acelerou o desenvolvimento ou reduziu risco
- **Descoberta** -> algo que nao estava no plano mas emergiu como importante

---

## Indice

| # | Tipo | Titulo | Fase | Data |
|---|---|---|---|---|
| L-002 | Padrao | Relatorios incrementais podem comecar em memoria se houver RLS e limite claro | Implementacao | 2026-05-09 |
| L-001 | Descoberta | Rocas pertencem ao fluxo administrativo, nao ao portal produtor | Implementacao | 2026-05-09 |

---

## L-002 - Relatorios incrementais podem comecar em memoria se houver RLS e limite claro

**Data:** 2026-05-09
**Tipo:** Padrao
**Fase:** Implementacao
**Agente que identificou:** performance_validator | final_validator | test_implementer | Camisa10

### O que aconteceu

A feature de relatorios por unidade precisava segmentar cargas por `producer_units` no `AdminDashboard`, mas o requisito tambem proibia migration e nova query Supabase nesta etapa.

### Por que aconteceu

O `AgroContext` ja carregava os dados necessarios e autorizados pela RLS. Criar uma view/RPC antecipadamente adicionaria contrato backend, migration e manutencao antes de existir evidencia de volume que exigisse agregacao no banco.

### Como foi resolvido

A agregacao foi mantida em memoria no frontend, com `useMemo`, `Map` para `producerById` e `unitById`, e uma funcao pura testavel (`aggregateUnitPerformance`). O fallback legado usa `legacy:${producerId}:${fallbackNormalizado}` para nao misturar produtores com o mesmo `location/property`.

### O que fazer diferente da proxima vez

Ao criar relatorios incrementais:
- confirmar se os dados ja estao autorizados e carregados;
- definir uma chave de agregacao que preserve historico e multi-tenant;
- documentar o limite de escala;
- extrair a regra para funcao pura antes de considerar RPC/view;
- criar teste automatizado para legado, snapshots e conflitos de nomes.

### Impacto no projeto

Reduziu escopo e risco nesta etapa, mantendo cobertura automatizada dos cenarios criticos. O proximo passo esta claro: se o volume crescer, migrar a agregacao para view/RPC Supabase.

### Tags

`admin-dashboard` `producer_units` `relatorios` `useMemo` `Map` `fallback-legado` `performance`

---

## L-001 - Rocas pertencem ao fluxo administrativo, nao ao portal produtor

**Data:** 2026-05-09
**Tipo:** Descoberta
**Fase:** Implementacao
**Agente que identificou:** Usuario | impact_validator | security_validator | Camisa10

### O que aconteceu

A feature `producer_units` foi inicialmente colocada no portal do produtor como "Minhas Rocas". Durante a validacao do requisito, ficou claro que a criacao e manutencao de unidades deveria acontecer no painel administrativo, junto ao cadastro/edicao do produtor.

### Por que aconteceu

O termo "minhas rocas" parecia naturalmente ligado ao produtor na camada de UI, mas a responsabilidade operacional da informacao e da empresa. A unidade influencia coleta, rastreabilidade, multi-tenant por `company_id` e seguranca RLS. Portanto, o ownership correto e administrativo, nao individual do produtor.

### Como foi resolvido

A gestao de unidades foi movida para `AdminProdutores`. O `ProducerDashboard` perdeu as mutacoes e manteve apenas leitura de cargas com fallback `producerUnitName || location`. A RLS foi ajustada para permitir producer apenas em `SELECT`, enquanto admin/collaborator gerenciam unidades da propria empresa e maestro acessa tudo.

### O que fazer diferente da proxima vez

Antes de posicionar uma funcionalidade no portal de um papel, definir quem e o dono operacional do dado. Se o dado altera rastreabilidade, faturamento, origem de carga ou isolamento multi-tenant, validar ownership com RLS antes de desenhar a UI.

### Impacto no projeto

Evitou que produtores pudessem alterar dados operacionais sensiveis via UI ou client direto. O ciclo tambem registrou um padrao reutilizavel: decisao de ownership precisa ser refletida ao mesmo tempo em frontend, contexto de dados e RLS.

### Tags

`producer_units` `rls` `multi-tenant` `admin` `producer-dashboard` `coleta`
