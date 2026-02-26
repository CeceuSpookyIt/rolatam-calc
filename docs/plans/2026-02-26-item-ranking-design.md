# Item Ranking por Builds Compartilhadas — Design

**Data:** 2026-02-26

## Objetivo

Substituir a tela atual de ranking (`/preset-summary`) por uma nova versão baseada em `shared_builds`. O ranking agrupa builds por classe e skill, mostrando os top 5 itens e top 5 cartas mais usados por slot de equipamento.

## Decisoes

| Aspecto | Decisao |
|---|---|
| Fonte de dados | `shared_builds` (substitui `presets` publicados) |
| Agrupamento | Classe → Skill (campo `skill_name`) → Top 5 itens + cartas por slot |
| Criterio de ranking | Popularidade (contagem de builds) |
| Slots | Todos os ~30 slots do `EquipmentPosition` |
| Agregacao | Server-side via 2 RPCs Supabase |
| Cache | 2 tabelas com TTL 30min + `p_force_refresh` |
| UI | Grid de cards (2-3 cols desktop, 1 mobile), scroll continuo |
| Rota | Mesma `/preset-summary`, modulo refatorado |

## Data Layer — RPCs Supabase

### Tabelas de Cache

```sql
CREATE TABLE skill_ranking_cache (
  class_id int NOT NULL,
  skill_name text NOT NULL,
  build_count int NOT NULL,
  unique_users int NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (class_id, skill_name)
);

CREATE TABLE item_ranking_cache (
  class_id int NOT NULL,
  skill_name text NOT NULL,
  slot text NOT NULL,
  type text NOT NULL CHECK (type IN ('item', 'card')),
  item_id int NOT NULL,
  use_count int NOT NULL,
  rank int NOT NULL CHECK (rank BETWEEN 1 AND 5),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (class_id, skill_name, slot, type, rank)
);
```

### RPC 1: `get_skill_ranking(p_class_id int, p_ttl_minutes int DEFAULT 30, p_force_refresh bool DEFAULT false)`

1. Checa se existe cache com `updated_at > now() - interval` para `p_class_id`
2. Se fresh e `p_force_refresh = false` → retorna do cache
3. Se stale ou force → DELETE cache para `p_class_id`, recalcula a partir de `shared_builds`, INSERT no cache, retorna

Retorna:
```typescript
interface SkillRankingEntry {
  skill_name: string;
  build_count: number;
  unique_users: number;
}
```

### RPC 2: `get_item_ranking(p_class_id int, p_skill_name text, p_ttl_minutes int DEFAULT 30, p_force_refresh bool DEFAULT false)`

Mesma logica de TTL/force. Extrai cada slot do JSONB `model` via UNION ALL, conta ocorrencias, usa `ROW_NUMBER() OVER (PARTITION BY slot ORDER BY count DESC)` para top 5.

Para cartas: mesma logica com campos `weaponCard1-4`, `armorCard`, `shieldCard`, etc., filtrando `item_id > 0`.

Retorna:
```typescript
interface SlotRankingEntry {
  slot: string;
  type: 'item' | 'card';
  item_id: number;
  use_count: number;
  rank: number;
}
```

### Mapeamento de Slots no SQL

Cada slot do JSONB e extraido com:
```sql
SELECT 'weapon' as slot, 'item' as type, (model->>'weapon')::int as item_id
FROM shared_builds
WHERE class_id = p_class_id AND skill_name = p_skill_name
  AND (model->>'weapon')::int > 0
UNION ALL
-- ... repetido para todos os ~30 slots
```

Cartas:
```sql
SELECT 'weapon' as slot, 'card' as type, (model->>'weaponCard1')::int as item_id
FROM shared_builds
WHERE ... AND (model->>'weaponCard1')::int > 0
UNION ALL
SELECT 'weapon', 'card', (model->>'weaponCard2')::int ...
-- ... repetido para todos os slots com carta
```

## UI e Navegacao

### Fluxo

1. Entra em `/preset-summary` → listbox de classes no topo
2. Seleciona classe → lista lateral mostra skills ordenadas por `build_count`
3. Seleciona skill → area principal mostra grid de cards por slot

### Layout do Card de Slot

```
+----------------------------------+
| Weapon                           |
+-----------------+----------------+
| Itens           | Cartas         |
| 1. Item A (42)  | 1. Card X (38) |
| 2. Item B (31)  | 2. Card Y (25) |
| 3. Item C (20)  | 3. Card Z (18) |
| 4. Item D (15)  | 4. Card W (12) |
| 5. Item E (8)   | 5. Card V (7)  |
+-----------------+----------------+
| barra de progresso do #1         |
+----------------------------------+
```

- Numero entre parenteses = quantidade de builds usando aquele item
- Barra de progresso relativa ao total de builds daquela skill
- Slots sem carta mostram so a coluna de itens
- Ao clicar num item, mostra tooltip/painel com imagem + descricao

### Grid Responsivo

- Desktop: 2-3 colunas de cards
- Mobile: 1 coluna
- Cards agrupados por categoria (Equip Principal → Shadows → Costume) com separadores visuais, scroll continuo

### Componentes PrimeNG

- `p-listbox` para classes e skills
- `p-card` para cada slot
- `p-progressBar` para barra de uso
- `p-tooltip` ou painel sticky para detalhes do item

## Arquitetura de Codigo

### Componentes Angular

| Componente | Responsabilidade |
|---|---|
| `PresetSummaryComponent` (refatorado) | Container: selecao de classe/skill, orquestra chamadas |
| `SlotRankingCardComponent` (novo) | Card individual de um slot com top 5 itens + top 5 cartas |

### Servico

| Servico | Responsabilidade |
|---|---|
| `SummaryService` (refatorado) | Chamadas as 2 RPCs Supabase (substitui agregacao client-side) |

O `summary-aggregator.ts` e seus models podem ser removidos.

### Models

```typescript
interface SkillRankingEntry {
  skill_name: string;
  build_count: number;
  unique_users: number;
}

interface SlotRankingEntry {
  slot: string;
  type: 'item' | 'card';
  item_id: number;
  use_count: number;
  rank: number;
}

interface SlotRankingGroup {
  slot: string;
  slotLabel: string;
  items: SlotRankingEntry[];
  cards: SlotRankingEntry[];
  totalBuilds: number;
}
```

### Fluxo de Dados

```
Classe selecionada
  → SummaryService.getSkillRanking(classId)
    → Supabase RPC get_skill_ranking
    → retorna do cache ou recalcula
  → mostra lista de skills

Skill selecionada
  → SummaryService.getItemRanking(classId, skillName)
    → Supabase RPC get_item_ranking
    → retorna do cache ou recalcula
  → agrupa por slot no frontend
  → resolve item names via RoService (item.json ja carregado)
  → renderiza grid de SlotRankingCardComponent
```

## Invalidacao de Cache

TTL de 30 minutos. Sem triggers. Parametro `p_force_refresh = true` disponivel para testes e refresh manual. Em producao, `p_force_refresh = false` (padrao).
