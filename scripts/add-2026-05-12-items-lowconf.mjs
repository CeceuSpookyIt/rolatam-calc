/**
 * Add the 6 low-confidence items from the 2026-05-12 update, after user approval.
 *
 *   24324 Manopla Sombria Espiritual II — simple (no leech)
 *   24325 Malha Sombria Cabal II        — simple (no leech)
 *   24328 Manopla Sombria Muito Forte   — full (with Forte + Penetração set bonuses)
 *   24329 Manopla Sombria Muito Mística — full (with Mística + Tempeste set bonuses)
 *   410642 Elmo Real [1]                — vct/aspd + autocast Purificação
 *   491014 Anulus Ira [1]               — perfectDodge/size + allStat set + autocast Assumptio
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ITEM_JSON_PATH = resolve(__dirname, '../src/assets/demo/data/item.json');

const SHADOW_WEAPON = { itemTypeId: 10, itemSubTypeId: 280, location: 'Weapon' };
const SHADOW_ARMOR = { itemTypeId: 2, itemSubTypeId: 526, location: 'Armor' };

// 26 Varmunt weapons for Anulus Ira set bonus
const VARMUNT_WEAPONS = [
  'Máquina Hypocritae', 'Lâmina Hypocritae', 'Espada Invidia', 'Clava Invidia',
  'Adaga Furiae', 'Luva Furiae', 'Roda Furiae', 'Lábris Superbia',
  'Báculo Superbia', 'Presa Glutonia', 'Arco Superbia', 'Arpão Glutonia',
  'Arbaleste Glutonia', 'Caderno Acedia', 'Livro Acedia', 'Guitarra Pigritia',
  'Balestra Pigritia', 'Faísca Pigritia', 'Varinha Avaritia', 'Metal Avaritia',
  'Planta Luxuriae', 'Perfurador Luxuriae', 'Rifle Luxuriae', 'Escopeta Luxuriae',
  'Metralhadora Luxuriae', 'Arsenal Luxuriae',
];
const VARMUNT_SET = `EQUIP[${VARMUNT_WEAPONS.join('||')}]`;

const entries = [
  {
    id: 24324, name: 'Manopla Sombria Espiritual II', ...SHADOW_WEAPON,
    usableClass: ['all'], requiredLevel: 1,
    script: {
      atk: ['1---1'],
      matk: ['1---1'],
      atkPercent: ['1', '7===1'],
    },
  },
  {
    id: 24325, name: 'Malha Sombria Cabal II', ...SHADOW_ARMOR,
    usableClass: ['all'], requiredLevel: 1,
    script: {
      hp: ['10', '100'],
      atkPercent: ['1', '7===1'],
    },
  },
  {
    id: 24328, name: 'Manopla Sombria Muito Forte', ...SHADOW_WEAPON,
    usableClass: ['all'], requiredLevel: 1,
    script: {
      atk: [
        '1---1',
        '5',
        '1---1',
        'EQUIP[Colar Sombrio Forte&&Brinco Sombrio Forte]===10',
      ],
      matk: ['1---1'],
      p_pene_race_demihuman: [
        '2---1',
        'EQUIP[Colar Sombrio da Penetração&&Brinco Sombrio da Penetração]REFINE[shadowWeapon,shadowEarring,shadowPendant==25]===100',
      ],
      atkPercent: [
        'EQUIP[Colar Sombrio Forte&&Brinco Sombrio Forte]REFINE[shadowWeapon,shadowEarring,shadowPendant==20]===1',
        'EQUIP[Colar Sombrio Forte&&Brinco Sombrio Forte]REFINE[shadowWeapon,shadowEarring,shadowPendant==25]===1',
      ],
    },
  },
  {
    id: 24329, name: 'Manopla Sombria Muito Mística', ...SHADOW_WEAPON,
    usableClass: ['all'], requiredLevel: 1,
    script: {
      atk: ['1---1'],
      matk: [
        '1---1',
        '5',
        '1---1',
        'EQUIP[Colar Sombrio Místico&&Brinco Sombrio Místico]===10',
      ],
      m_pene_race_demihuman: [
        '2---1',
        'EQUIP[Colar Sombrio Tempeste&&Brinco Sombrio Tempeste]REFINE[shadowWeapon,shadowEarring,shadowPendant==25]===100',
      ],
      matkPercent: [
        'EQUIP[Colar Sombrio Místico&&Brinco Sombrio Místico]REFINE[shadowWeapon,shadowEarring,shadowPendant==20]===1',
        'EQUIP[Colar Sombrio Místico&&Brinco Sombrio Místico]REFINE[shadowWeapon,shadowEarring,shadowPendant==25]===1',
      ],
    },
  },
  {
    id: 410642, name: 'Elmo Real [1]',
    itemTypeId: 5, itemSubTypeId: 1, location: 'Middle', compositionPos: 256,
    slots: 1, defense: 2, weight: 5, requiredLevel: 130,
    usableClass: ['all'],
    script: {
      vct: ['-8'],
      aspdPercent: ['8'],
      autocast__RK_REFRESH: ['1,1,onhit'],
    },
  },
  {
    id: 491014, name: 'Anulus Ira [1]',
    itemTypeId: 2, itemSubTypeId: 530, location: 'AccessoryLeft',
    slots: 1, defense: 0, weight: 30, requiredLevel: 150,
    usableClass: ['all'],
    script: {
      perfectDodge: ['10'],
      p_size_all: ['10'],
      m_size_all: ['10'],
      allStat: [`${VARMUNT_SET}===1`],
      autocast__HP_ASSUMPTIO: [`${VARMUNT_SET}===5,7,onhit`],
    },
  },
];

const items = JSON.parse(readFileSync(ITEM_JSON_PATH, 'utf-8'));
let added = 0;
let skipped = 0;
for (const entry of entries) {
  const id = String(entry.id);
  if (items[id]) {
    console.log(`SKIP ${id} "${entry.name}" — already exists`);
    skipped++;
    continue;
  }
  items[id] = {
    id: entry.id,
    aegisName: `LATAM_${entry.id}`,
    name: entry.name,
    unidName: entry.name,
    resName: '',
    description: '',
    slots: entry.slots ?? 0,
    itemTypeId: entry.itemTypeId,
    itemSubTypeId: entry.itemSubTypeId,
    itemLevel: null,
    attack: null,
    defense: entry.defense ?? null,
    weight: entry.weight ?? 0,
    requiredLevel: entry.requiredLevel,
    location: entry.location,
    compositionPos: entry.compositionPos ?? null,
    usableClass: entry.usableClass,
    script: entry.script,
  };
  console.log(`ADD  ${id} "${entry.name}"`);
  added++;
}
writeFileSync(ITEM_JSON_PATH, JSON.stringify(items, null, 2), 'utf-8');
console.log(`\nDone: ${added} added, ${skipped} skipped.`);
