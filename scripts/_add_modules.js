#!/usr/bin/env node
// Script to add new enchant/module items to item.json
// Tasks 1, 3, 4: 11 TBD Modules, 6 Blessings, 12 Class II Enchants

const fs = require('fs');
const path = require('path');

const ITEM_JSON_PATH = path.join(__dirname, '../src/assets/demo/data/item.json');

console.log('Reading item.json...');
const data = JSON.parse(fs.readFileSync(ITEM_JSON_PATH, 'utf8'));
console.log(`Loaded ${Object.keys(data).length} items.`);

// ============================================================
// Task 1: 11 TBD Modules (itemTypeId: 11, compositionPos: 65535)
// ============================================================
const modules = [
  {
    id: 1000210,
    aegisName: 'Auto_Module_A9',
    name: 'Módulo Automático Mod. (Recuperação de HP)',
    script: { hp: ['200', '7===100', '11===200'] },
  },
  {
    id: 1000211,
    aegisName: 'Auto_Module_A10',
    name: 'Módulo Automático Mod. (Recuperação de SP)',
    script: { sp: ['50', '7===25', '11===50'] },
  },
  {
    id: 1000212,
    aegisName: 'Auto_Module_B7',
    name: 'Módulo Automático Mod. (Velocidade)',
    script: { aspd: ['1'], aspdPercent: ['7===5', '11===5'] },
  },
  {
    id: 1000213,
    aegisName: 'Auto_Module_C5',
    name: 'Módulo Automático Mod. (Força de Recuperação)',
    script: { healingPlus: ['10', '7===5', '11===10'] },
  },
  {
    id: 1000214,
    aegisName: 'Auto_Module_C11',
    name: 'Módulo Automático Mod. (Contra-Espelho)',
    script: {},
  },
  {
    id: 1000215,
    aegisName: 'Auto_Module_C12',
    name: 'Módulo Automático Mod. (Acima de Tudo)',
    script: { melee: ['3', '7===2', '11===3'], range: ['3', '7===2', '11===3'], m_element_all: ['3', '7===2', '11===3'] },
  },
  {
    id: 1000216,
    aegisName: 'Auto_Module_C13',
    name: 'Módulo Automático Mod. (Rejeição de Reflexão)',
    script: {},
  },
  {
    id: 1000217,
    aegisName: 'Auto_Module_C15',
    name: 'Módulo Automático Mod. (Drenar Vida)',
    script: { melee: ['5'], p_size_all: ['3', '7===1', '11===1'] },
  },
  {
    id: 1000218,
    aegisName: 'Auto_Module_C16',
    name: 'Módulo Automático Mod. (Cura Mágica)',
    script: { matk: ['20'], m_element_all: ['3', '7===1', '11===1'] },
  },
  {
    id: 1000219,
    aegisName: 'Auto_Module_C17',
    name: 'Módulo Automático Mod. (Drenar Alma)',
    script: { melee: ['5'], p_size_all: ['3', '7===1', '11===1'] },
  },
  {
    id: 1000220,
    aegisName: 'Auto_Module_C18',
    name: 'Módulo Automático Mod. (Alma Mágica)',
    script: { matk: ['20'], m_element_all: ['3', '7===1', '11===1'] },
  },
];

for (const mod of modules) {
  if (data[mod.id]) {
    console.warn(`WARNING: ID ${mod.id} (${mod.aegisName}) already exists! Skipping.`);
    continue;
  }
  data[mod.id] = {
    id: mod.id,
    aegisName: mod.aegisName,
    name: mod.name,
    unidName: '',
    resName: '',
    description: '',
    slots: 0,
    itemTypeId: 11,
    itemSubTypeId: 0,
    itemLevel: null,
    attack: null,
    defense: null,
    weight: 0,
    requiredLevel: null,
    location: null,
    compositionPos: 65535,
    script: mod.script,
  };
  console.log(`Added module: ${mod.id} ${mod.aegisName}`);
}

// ============================================================
// Task 3: 6 Blessings (itemTypeId: 11, compositionPos: 65535)
// ============================================================
const blessings = [
  { id: 310076, aegisName: 'Blessing_Str', name: 'Bênção da Força', script: { str: ['5'] } },
  { id: 310077, aegisName: 'Blessing_Agi', name: 'Bênção da Agilidade', script: { agi: ['5'] } },
  { id: 310078, aegisName: 'Blessing_Vit', name: 'Bênção da Vida', script: { vit: ['5'] } },
  { id: 310079, aegisName: 'Blessing_Dex', name: 'Bênção da Destreza', script: { dex: ['5'] } },
  { id: 310080, aegisName: 'Blessing_Int', name: 'Bênção da Sabedoria', script: { int: ['5'] } },
  { id: 310081, aegisName: 'Blessing_Luk', name: 'Bênção da Sorte', script: { luk: ['5'] } },
];

for (const b of blessings) {
  if (data[b.id]) {
    console.warn(`WARNING: ID ${b.id} (${b.aegisName}) already exists! Skipping.`);
    continue;
  }
  data[b.id] = {
    id: b.id,
    aegisName: b.aegisName,
    name: b.name,
    unidName: '',
    resName: '',
    description: '',
    slots: 0,
    itemTypeId: 11,
    itemSubTypeId: 0,
    itemLevel: null,
    attack: null,
    defense: null,
    weight: 0,
    requiredLevel: null,
    location: null,
    compositionPos: 65535,
    script: b.script,
  };
  console.log(`Added blessing: ${b.id} ${b.aegisName}`);
}

// ============================================================
// Task 4: 12 Class II Enchants (itemTypeId: 6)
// itemSubTypeId: Top2=71, Middle2=72, Bottom2=73, Robe2=74
// compositionPos: null
// ============================================================
const classIIEnchants = [
  {
    id: 310180,
    aegisName: 'Archmage_Robe2',
    name: 'Arcano II (Capa)',
    itemSubTypeId: 74,
    script: {
      Comet: ['15', 'EQUIP[Arquimago II (Topo)]15'],
      m_my_element_all: ['EQUIP[Arquimago II (Meio)]5'],
      matkPercent: ['EQUIP[Arquimago II (Baixo)]5'],
    },
  },
  {
    id: 310181,
    aegisName: 'Archmage_Top2',
    name: 'Arquimago II (Topo)',
    itemSubTypeId: 71,
    script: { matkPercent: ['5'] },
  },
  {
    id: 310182,
    aegisName: 'Archmage_Middle2',
    name: 'Arquimago II (Meio)',
    itemSubTypeId: 72,
    script: { vct: ['10'] },
  },
  {
    id: 310183,
    aegisName: 'Archmage_Bottom2',
    name: 'Arquimago II (Baixo)',
    itemSubTypeId: 73,
    script: { matkPercent: ['5'] },
  },
  {
    id: 310184,
    aegisName: 'RoyalGuard_Robe2',
    name: 'Guardião Real II (Capa)',
    itemSubTypeId: 74,
    script: {
      'Genesis Ray': ['15', 'EQUIP[Paladino II (Topo)]15'],
      atkPercent: ['EQUIP[Paladino II (Meio)]5'],
      p_size_all: ['EQUIP[Paladino II (Baixo)]5'],
    },
  },
  {
    id: 310185,
    aegisName: 'RoyalGuard_Bottom2',
    name: 'Paladino II (Baixo)',
    itemSubTypeId: 73,
    script: { atkPercent: ['5'] },
  },
  {
    id: 310186,
    aegisName: 'RoyalGuard_Middle2',
    name: 'Paladino II (Meio)',
    itemSubTypeId: 72,
    script: { atk: ['30'] },
  },
  {
    id: 310187,
    aegisName: 'RoyalGuard_Top2',
    name: 'Paladino II (Topo)',
    itemSubTypeId: 71,
    script: { hpPercent: ['5'] },
  },
  {
    id: 310188,
    aegisName: 'GX_Robe2',
    name: 'Sicário II (Capa)',
    itemSubTypeId: 74,
    script: {
      criDmg: ['15', 'EQUIP[Algoz II (Topo)]15'],
      atkPercent: ['EQUIP[Algoz II (Meio)]5'],
      melee: ['EQUIP[Algoz II (Baixo)]5'],
    },
  },
  {
    id: 310189,
    aegisName: 'GX_Bottom2',
    name: 'Algoz II (Baixo)',
    itemSubTypeId: 73,
    script: { atkPercent: ['5'] },
  },
  {
    id: 310190,
    aegisName: 'GX_Middle2',
    name: 'Algoz II (Meio)',
    itemSubTypeId: 72,
    script: { Retaliation: ['20'] },
  },
  {
    id: 310191,
    aegisName: 'GX_Top2',
    name: 'Algoz II (Topo)',
    itemSubTypeId: 71,
    script: { atkPercent: ['5'], criDmg: ['15'] },
  },
];

for (const enc of classIIEnchants) {
  if (data[enc.id]) {
    console.warn(`WARNING: ID ${enc.id} (${enc.aegisName}) already exists! Skipping.`);
    continue;
  }
  data[enc.id] = {
    id: enc.id,
    aegisName: enc.aegisName,
    name: enc.name,
    unidName: '',
    resName: '',
    description: '',
    slots: 0,
    itemTypeId: 6,
    itemSubTypeId: enc.itemSubTypeId,
    itemLevel: null,
    attack: null,
    defense: null,
    weight: null,
    requiredLevel: null,
    location: null,
    compositionPos: null,
    script: enc.script,
  };
  console.log(`Added class II enchant: ${enc.id} ${enc.aegisName}`);
}

// Write back
console.log('\nWriting item.json...');
fs.writeFileSync(ITEM_JSON_PATH, JSON.stringify(data, null, 2), 'utf8');
console.log('Done! item.json updated successfully.');
console.log(`Total items now: ${Object.keys(data).length}`);
