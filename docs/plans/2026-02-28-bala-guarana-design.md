# Design: Adicionar Bala de Guaraná aos Consumíveis

**Data**: 2026-02-28
**Status**: Aprovado

## Problema

A Bala de Guaraná (ID 12414) existe no `item.json` com scripts corretos (`agi: 7`, `aspdPercent: 15`) e `itemTypeId: 3333`, mas não aparece na UI. O tipo `3333` não é capturado pelo filtro `ItemTypeId.CONSUMABLE = 3`, e o item não está em nenhuma lista hardcoded.

## Comportamento no Jogo

A Bala de Guaraná ativa o efeito da Poção da Concentração (mesma tier), portanto substitui a Poção de Concentração — não stacka com ela. Adicionalmente dá +7 AGI e +15% ASPD.

## Solução

### 1. Adicionar à `AspdPotionList`

**Arquivo**: `src/app/constants/aspd-potion-list.ts`

Adicionar entrada:
```ts
{ label: 'Bala de Guaraná', value: 12414, bonus: 4 }
```

O `bonus: 4` é o mesmo da Poção de Concentração. Isso alimenta `AspdPotionFixBonus` automaticamente.

### 2. Incluir `aspdPotion` no `consumeData`

**Arquivo**: `src/app/layout/pages/ro-calculator/ro-calculator.component.ts` (~linha 700)

Mudar de:
```ts
const consumeData = [...consumables, ...consumables2, ...aspdPotions]
```
Para:
```ts
const consumeData = [...consumables, ...consumables2, aspdPotion, ...aspdPotions]
```

As poções atuais (645, 656, 657) têm `script: {}`, então incluí-las não causa efeito colateral. A Bala de Guaraná terá seus bonuses extras (+7 AGI, +15% ASPD%) processados corretamente.

### 3. Imagem

`src/assets/demo/images/items/12414.png` já existe.

## Abordagens Descartadas

- **Mudar `itemTypeId` para 3**: Permitiria selecionar junto com poções ASPD (comportamento errado).
- **Seção separada na UI**: Over-engineering para um único item.
