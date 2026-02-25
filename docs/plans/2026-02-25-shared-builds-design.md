# Shared Builds — Design Document

**Data:** 2026-02-25
**Status:** Aprovado

## Problema

O fluxo atual de compartilhamento de builds exige 6 passos escondidos dentro do dialog de presets. Usuários não conseguem encontrar o botão de compartilhar. Os botões de exportar/importar adicionam complexidade desnecessária.

## Decisões

1. Botão "Compartilhar" na barra de ações da calculadora (substitui exportar/importar)
2. Login obrigatório para compartilhar, importar, like/unlike
3. Leitura aberta para todos (anon)
4. Tabela `shared_builds` separada de `presets` + tabela `shared_build_likes`
5. Snapshot de métricas + monstro alvo + skill principal salvos junto com a build
6. Autor pode atualizar ou deletar suas builds
7. Filtro "Minhas builds" para usuários logados
8. Link compartilhável por build (ícone no card)
9. Link direto (`/shared-presets/:id`) abre a build na calculadora automaticamente
10. Remover código antigo (preset_tags, publish, exportar/importar)
11. Unit tests para tudo que for novo ou alterado
12. Futuro: BI com filtro de pontuação mínima para ranking de builds

## Schema — Supabase

### Tabela `shared_builds`

| Coluna       | Tipo          | Constraints                        |
|-------------|---------------|-------------------------------------|
| id          | UUID          | PK, default gen_random_uuid()       |
| name        | TEXT          | NOT NULL                            |
| class_id    | INTEGER       | NOT NULL                            |
| model       | JSONB         | NOT NULL                            |
| monster_id  | INTEGER       | nullable                            |
| monster_name| TEXT          | nullable                            |
| skill_name  | TEXT          | nullable                            |
| metrics     | JSONB         | nullable                            |
| created_at  | TIMESTAMPTZ   | DEFAULT now()                       |
| updated_at  | TIMESTAMPTZ   | DEFAULT now()                       |
| user_id     | UUID          | NOT NULL, FK auth.users             |

**Índices:** `class_id`, `created_at DESC`, `user_id`

### Tabela `shared_build_likes`

| Coluna     | Tipo          | Constraints                         |
|-----------|---------------|--------------------------------------|
| id        | UUID          | PK, default gen_random_uuid()        |
| build_id  | UUID          | NOT NULL, FK shared_builds           |
| user_id   | UUID          | NOT NULL, FK auth.users              |
| created_at| TIMESTAMPTZ   | DEFAULT now()                        |

**Constraint:** UNIQUE(build_id, user_id)

### RLS (Row Level Security)

**shared_builds:**
- SELECT: aberto para todos (anon)
- INSERT: autenticado (`auth.uid() IS NOT NULL`)
- UPDATE: apenas o autor (`auth.uid() = user_id`)
- DELETE: apenas o autor (`auth.uid() = user_id`)

**shared_build_likes:**
- SELECT: aberto para todos
- INSERT: autenticado
- DELETE: apenas o próprio (`auth.uid() = user_id`)

## Fluxo — Compartilhar (calculadora)

1. Usuário logado clica "Compartilhar" na barra de ações
2. Dialog abre com:
   - Nome da build (pré-preenchido: `"{Classe} - {Skill de maior DPS}"`, editável)
   - Monstro alvo (preenchido do Battle Summary)
   - Skill principal (preenchida)
   - Preview de métricas (DPS, dano, ASPD, etc.) — read-only
3. Se a build foi importada de uma shared_build do mesmo autor:
   - Pergunta: "Atualizar build existente ou criar nova?"
   - Atualizar → UPDATE
   - Criar nova → INSERT
4. Caso contrário → INSERT
5. Toast de sucesso

### Métricas salvas (campo `metrics`)

```json
{
  "dps": 1234567,
  "maxDamage": 98765,
  "minDamage": 87654,
  "aspd": 193,
  "hitPerSecs": 7.14,
  "totalHit": 520,
  "criRate": 85,
  "criDmg": 140,
  "vct": 0,
  "fct": 0.3,
  "acd": 0.5,
  "hp": 120000,
  "sp": 5000
}
```

## Fluxo — Importar (builds compartilhadas → calculadora)

1. Usuário logado clica "Importar" no card da build
2. Carrega o model na calculadora (redireciona para `/`)
3. Guarda internamente o `shared_build_id` de origem + `user_id` do autor
4. Build é independente — usuário pode editar livremente

## Fluxo — Link direto

- URL: `/shared-presets/:id`
- Ao abrir: busca o model da build, redireciona para `/` com a build carregada
- Build não encontrada → redireciona para `/` com toast "Build não encontrada"
- Não precisa de login para visualizar

## Página "Builds Compartilhadas"

### Filtros
- Filtro por classe (listbox lateral)
- Ordenação por data de upload (mais recente primeiro, padrão)
- Toggle "Minhas builds" (apenas logados)
- Paginação server-side

### Card da build
- Nome da build (sem nome do autor)
- Equipamentos (componente `app-equipment-ui`)
- Stats base (STR, AGI, VIT, INT, DEX, LUK)
- Métricas do snapshot (DPS, dano, ASPD, skill, monstro alvo)
- Toggle "Ver detalhes"
- Ícone `pi pi-link` — copia URL da build para clipboard (todos)
- Like/unlike — visível apenas para logados
- Botão "Importar" — exige login
- Ícone `pi pi-trash` — visível apenas para o autor, com confirmação

## Código a remover

### PresetService (`preset.service.ts`)
- `sharePreset()`
- `unsharePreset()`
- `addPresetTags()`
- `removePresetTag()`
- `likePresetTags()`
- `unlikePresetTag()`
- `getPublishPresets()`

### PresetTableComponent (`preset-table.component.ts`)
- Lógica de `is_published`, `publish_name`, `published_at`
- `sharePreset()`, `unsharePreset()`, `addTags()` methods
- HTML: seção de compartilhar e tags

### Modelos
- `publish-preset-model.ts`
- `published-presets.response.ts`
- `preset-tag.model.ts`
- `like-tag.response.ts`

### Calculadora
- Botões exportar/importar

## Testes

- Novo `SharedBuildService`: CRUD + like/unlike
- Dialog de compartilhamento: validação, sugestão de nome, fluxo update vs create
- Página shared-presets: listagem, filtros, importar, delete, link
- Fluxo de importação na calculadora
- Fluxo de link direto (`/shared-presets/:id`)
