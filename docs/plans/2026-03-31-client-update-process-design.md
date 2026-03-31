# Design: Processo de Atualização do Cliente LATAM

**Data:** 2026-03-31
**Objetivo:** Documentar o fluxo reprodutível para atualizar a calculadora quando o cliente LATAM recebe patches.

## Problema

Na atualização anterior, snapshots foram editados por engano em vez dos arquivos da calculadora. Faltava documentação clara de quais arquivos são read-only (snapshots) vs. editáveis (dados da calc).

## Regra de Ouro

| Diretório | Permissão | Propósito |
|-----------|-----------|-----------|
| `C:/Users/Marcel/rag/snapshots/pre-update/` | **READ-ONLY** | Estado do cliente antes do patch |
| `C:/Users/Marcel/rag/snapshots/post-update/` | **READ-ONLY** | Estado do cliente depois do patch |
| `src/assets/demo/data/` | **WRITE** | Único lugar onde a calculadora lê dados |

**NUNCA editar arquivos dentro de `snapshots/`.** Se precisar corrigir algo, corrija nos scripts de importação ou diretamente em `src/assets/demo/data/`.

## Arquivos do Cliente a Capturar

Todos em `D:/Gravity/Ragnarok/System/`:

| Arquivo | Conteúdo | Precisa decompile? |
|---------|----------|--------------------|
| `itemInfo.lua` | Nomes/descrições PT-BR (legível) | Não |
| `iteminfo_new.lub` | Itens compilado | Sim (unluac) |
| `monster_size_effect.lub` | Tamanho de monstros | Sim (unluac) |
| `monster_size_effect_new.lub` | Tamanho de monstros (novo) | Sim (unluac) |
| `PetEvolutionCln.lub` | Evolução de pets | Sim (unluac) |

## Fontes de Dados por Tipo

| Dado | Fonte primária | Arquivo destino na calc |
|------|---------------|------------------------|
| Itens (nomes, descrições) | Cliente LATAM (`itemInfo.lua`, `iteminfo_new.lub`) | `src/assets/demo/data/item.json` |
| Itens (scripts/bonuses) | Manual / Divine Pride | `src/assets/demo/data/item.json` |
| Monstros | Divine Pride API | `src/assets/demo/data/monster.json` |
| Skills/Jobs/ASPD | Dentro dos `.grf` (não acessível diretamente) | Código TypeScript nos jobs |

## Ferramentas Existentes

| Script | Função |
|--------|--------|
| `scripts/compare-lub.mjs` | Compara dois `iteminfo_new_decompiled.lua` e lista IDs novos/alterados/removidos |
| `scripts/parse-latam-items.mjs` | Cruza `item.json` com `itemInfo.lua` + `iteminfo_new.lub`, atualiza nomes/descrições PT-BR |
| `scripts/build-latam-items.mjs` | Converte descrições PT-BR do cliente para formato script da calc |
| `unluac.jar` | Decompila `.lub` → `.lua` legível |

## Fases do Processo

### Fase 1 — Snapshot PRE-update

Antes de rodar o patcher:

```bash
# 1. Limpar/criar diretório
mkdir -p C:/Users/Marcel/rag/snapshots/pre-update

# 2. Copiar arquivos do cliente
cp D:/Gravity/Ragnarok/System/itemInfo.lua        C:/Users/Marcel/rag/snapshots/pre-update/
cp D:/Gravity/Ragnarok/System/iteminfo_new.lub     C:/Users/Marcel/rag/snapshots/pre-update/
cp D:/Gravity/Ragnarok/System/monster_size_effect.lub     C:/Users/Marcel/rag/snapshots/pre-update/
cp D:/Gravity/Ragnarok/System/monster_size_effect_new.lub C:/Users/Marcel/rag/snapshots/pre-update/
cp D:/Gravity/Ragnarok/System/PetEvolutionCln.lub  C:/Users/Marcel/rag/snapshots/pre-update/

# 3. Decompile dos .lub
java -jar unluac.jar C:/Users/Marcel/rag/snapshots/pre-update/iteminfo_new.lub > C:/Users/Marcel/rag/snapshots/pre-update/iteminfo_new_decompiled.lua
java -jar unluac.jar C:/Users/Marcel/rag/snapshots/pre-update/monster_size_effect.lub > C:/Users/Marcel/rag/snapshots/pre-update/monster_size_effect_decompiled.lua
java -jar unluac.jar C:/Users/Marcel/rag/snapshots/pre-update/monster_size_effect_new.lub > C:/Users/Marcel/rag/snapshots/pre-update/monster_size_effect_new_decompiled.lua
java -jar unluac.jar C:/Users/Marcel/rag/snapshots/pre-update/PetEvolutionCln.lub > C:/Users/Marcel/rag/snapshots/pre-update/PetEvolutionCln_decompiled.lua

# 4. Verificar que todos os arquivos existem
ls -la C:/Users/Marcel/rag/snapshots/pre-update/
```

### Fase 2 — Atualizar o Cliente

1. Rodar o launcher/patcher LATAM normalmente
2. Esperar completar

### Fase 3 — Snapshot POST-update

```bash
# 1. Criar diretório
mkdir -p C:/Users/Marcel/rag/snapshots/post-update

# 2. Copiar arquivos atualizados
cp D:/Gravity/Ragnarok/System/itemInfo.lua        C:/Users/Marcel/rag/snapshots/post-update/
cp D:/Gravity/Ragnarok/System/iteminfo_new.lub     C:/Users/Marcel/rag/snapshots/post-update/
cp D:/Gravity/Ragnarok/System/monster_size_effect.lub     C:/Users/Marcel/rag/snapshots/post-update/
cp D:/Gravity/Ragnarok/System/monster_size_effect_new.lub C:/Users/Marcel/rag/snapshots/post-update/
cp D:/Gravity/Ragnarok/System/PetEvolutionCln.lub  C:/Users/Marcel/rag/snapshots/post-update/

# 3. Decompile dos .lub
java -jar unluac.jar C:/Users/Marcel/rag/snapshots/post-update/iteminfo_new.lub > C:/Users/Marcel/rag/snapshots/post-update/iteminfo_new_decompiled.lua
java -jar unluac.jar C:/Users/Marcel/rag/snapshots/post-update/monster_size_effect.lub > C:/Users/Marcel/rag/snapshots/post-update/monster_size_effect_decompiled.lua
java -jar unluac.jar C:/Users/Marcel/rag/snapshots/post-update/monster_size_effect_new.lub > C:/Users/Marcel/rag/snapshots/post-update/monster_size_effect_new_decompiled.lua
java -jar unluac.jar C:/Users/Marcel/rag/snapshots/post-update/PetEvolutionCln.lub > C:/Users/Marcel/rag/snapshots/post-update/PetEvolutionCln_decompiled.lua

# 4. Verificar
ls -la C:/Users/Marcel/rag/snapshots/post-update/
```

### Fase 4 — Gerar Diff

Rodar `compare-lub.mjs` adaptado para a nova estrutura de pastas:

```bash
node scripts/compare-lub.mjs
```

O script compara `pre-update/iteminfo_new_decompiled.lua` vs `post-update/iteminfo_new_decompiled.lua` e gera:
- Lista de IDs **novos** (itens que não existiam)
- Lista de IDs **modificados** (itens que mudaram nome ou bloco)
- Lista de IDs **removidos**

**Adaptações necessárias no script:**
- Atualizar os paths hardcoded para usar `snapshots/pre-update/` e `snapshots/post-update/`
- Adicionar comparação de `monster_size_effect` e `PetEvolutionCln`
- Salvar output em `snapshots/diff-report.txt` além de imprimir no console

### Fase 4.5 — Commit Checkpoint

Antes de tocar qualquer arquivo da calculadora, criar um commit checkpoint:

```bash
git add src/assets/demo/data/item.json src/assets/demo/data/monster.json
git commit -m "checkpoint: estado pré-atualização do cliente"
```

Se algo der errado durante a Fase 5, basta `git diff HEAD` pra ver o que mudou ou `git checkout -- src/assets/demo/data/` pra voltar ao estado limpo.

### Fase 5 — Aplicar na Calculadora

Com base no diff-report:

1. **Itens novos (metadata):** Usar `parse-latam-items.mjs` para importar nomes/descrições PT-BR no `item.json`
2. **Itens alterados (metadata):** Revisar se mudou nome, descrição. Atualizar em `item.json`
3. **Scripts de itens:** Gerar scripts automaticamente com validação por confiança (ver seção abaixo)
4. **Monstros novos:** Consultar Divine Pride API e adicionar em `monster.json`
5. **Monster size effects:** Se houver mudanças, atualizar os dados relevantes

**Lembrete: todas as edições acontecem SOMENTE em `src/assets/demo/data/`.**

### Proteção de Itens Manuais

O `parse-latam-items.mjs` filtra itens que não existem no cliente LATAM. Porém, a calculadora contém itens adicionados manualmente de patches futuros (kRO/jRO) que ainda não chegaram no LATAM.

**Regra:** o script de importação deve operar em modo **additive-only**:
- **Adicionar** itens novos do cliente → OK
- **Atualizar** nomes/descrições de itens existentes → OK
- **Remover** itens que não estão no cliente → **NUNCA** (pode ser item de patch futuro)

Se o script atual remove itens ausentes do cliente, precisa ser adaptado antes de rodar.

### Validação de Scripts por Confiança

O Claude gera scripts automaticamente para itens novos/alterados, mas classifica cada um por nível de confiança:

**Alta confiança → aplica direto:**
- Bonus simples e inequívoco mapeável da descrição (ex: `"atk": ["10"]`, `"str": ["5"]`)
- Padrões já vistos em itens similares existentes no `item.json`
- Apenas um bonus por linha da descrição, sem ambiguidade

**Baixa confiança → NÃO aplica, pede aprovação:**
- Descrição com formato desconhecido ou diferente do padrão anterior
- Set bonuses condicionais (`EQUIP[...]`)
- Múltiplos efeitos compostos numa mesma linha
- Skills com nomes ambíguos ou que podem mapear para mais de um skill name
- Prefixos complexos (`chance__`, `cd__`, `vct__`) quando o valor não é óbvio
- Qualquer caso onde o Claude não tem certeza do mapeamento correto

**Fluxo de aprovação:**

```
=== SCRIPTS APLICADOS (alta confiança: 12 itens) ===
  [490500] Espada Exemplo: {"atk": ["10"], "str": ["5"]}
  ...

=== SCRIPTS PENDENTES DE APROVAÇÃO (baixa confiança: 6 itens) ===

[490501] Anel Misterioso
  Descrição: "Quando equipado com [Colar Misterioso], ATQ +15%, VCT de Bash -30%"
  Script proposto: {"atk": ["EQUIP[Colar Misterioso]===15"], "vct__Bash": ["EQUIP[Colar Misterioso]===30"]}
  Motivo: set bonus condicional + prefixo vct__
  → Aprovar / Rejeitar / Editar?

[490502] Brinco Arcano
  Descrição: "Chance de 5% ao atacar fisicamente de conjurar Meteor Storm Lv 10"
  Script proposto: ???
  Motivo: autocast com chance, formato de descrição desconhecido
  → Precisa escrever manualmente
```

O usuário aprova, rejeita ou edita cada item pendente. Só depois de aprovado o script é gravado no `item.json`.

### Fase 6 — Validação

1. `npm start` — verificar que a calc carrega sem erros
2. `npm test` — rodar testes existentes
3. Testar manualmente itens novos na calculadora
4. Verificar que itens alterados refletem as mudanças corretas

### Log de Decisões

Ao final da atualização, gerar `snapshots/update-log-YYYY-MM-DD.md` com:

- Data da atualização
- Itens adicionados (IDs + nomes)
- Itens alterados (o que mudou)
- Scripts aplicados automaticamente (alta confiança) — quais e por quê
- Scripts aprovados manualmente (baixa confiança) — decisão do usuário e justificativa
- Monstros adicionados
- Problemas encontrados e como foram resolvidos

Esse log serve de referência futura: se daqui a meses alguém perguntar "por que esse item tem esse script?", o log tem a resposta. Também serve de input para melhorar o parser em atualizações futuras.

## Checklist Resumido

- [ ] Fase 1: Snapshot pre-update copiado e decompilado
- [ ] Fase 2: Cliente atualizado via patcher
- [ ] Fase 3: Snapshot post-update copiado e decompilado
- [ ] Fase 4: Diff gerado (`compare-lub.mjs`)
- [ ] Fase 4.5: Commit checkpoint criado
- [ ] Fase 5a: Itens novos — metadata importada (modo additive-only)
- [ ] Fase 5b: Itens novos — scripts de alta confiança aplicados automaticamente
- [ ] Fase 5c: Itens novos — scripts de baixa confiança aprovados pelo usuário
- [ ] Fase 5d: Monstros novos adicionados via Divine Pride
- [ ] Fase 5e: Monster size effects atualizados (se aplicável)
- [ ] Fase 6: Validação (build + testes + teste manual)
- [ ] Log de decisões gerado (`snapshots/update-log-YYYY-MM-DD.md`)
