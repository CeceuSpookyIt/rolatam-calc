#!/usr/bin/env node
// _update_equipment.js
// Adds scripts to the new Einbech weapons, Dragon armors, Odin Vests, and Einbech accessories.

const fs = require('fs');
const path = require('path');

const ITEM_JSON = path.join(__dirname, '../src/assets/demo/data/item.json');
const data = JSON.parse(fs.readFileSync(ITEM_JSON, 'utf8'));

// ----- Script definitions -----
// Key: item ID, Value: script object
const SCRIPTS = {

  // ============================================================
  // Armas de Einbech
  // ============================================================

  // Manopla de Segurança [2] — Knuckle for Shura
  // ATK+10%, Power Swing+10%, refine7=ATK+40+acd15%, refine9=Power Swing+15% more, refine11=acd20%
  1867: {
    "atkPercent": ["10"],
    "Power Swing": ["10", "9===15"],
    "atk": ["7===40"],
    "acd": ["7===15", "11===20"],
  },

  // Atirador Bolt [2] — Bow for Ranger
  // ATK+10%, Focused Arrow Strike+10%, refine7=ATK+60+vct10%, refine9=Focused Arrow Strike+15% more, refine11=acd20%
  18190: {
    "atkPercent": ["10"],
    "Focused Arrow Strike": ["10", "9===15"],
    "atk": ["7===60"],
    "vct": ["7===10"],
    "acd": ["11===20"],
  },

  // Chicote de Segurança [2] — Whip for Odalisca/Gypsy
  // range+10%, Arrow Storm+10%, refine7=ATK+40+vct10%, refine9=Arrow Storm+15% more,
  // refine11=cd Arrow Storm-2s + acd20%
  26215: {
    "range": ["10"],
    "Arrow Storm": ["10", "9===15"],
    "atk": ["7===40"],
    "vct": ["7===10"],
    "acd": ["11===20"],
    "cd__Arrow Storm": ["11===2"],
  },

  // Machado Serra [2] — Two-Hand Axe for Mechanic
  // ATK+10%, Arm Cannon+10%, refine7=ATK+60+vct10%, refine9=range+10%, refine11=acd20%
  28140: {
    "atkPercent": ["10"],
    "Arm Cannon": ["10"],
    "atk": ["7===60"],
    "vct": ["7===10"],
    "range": ["9===10"],
    "acd": ["11===20"],
  },

  // Revólver Bolt [2] — Pistol for Gunslinger/Desperado
  // range+15%, Fire Dance+15%, refine7=ATK+60+acd10%, refine9=Fire Dance+20% more, refine11=acd20%
  32303: {
    "range": ["15"],
    "Fire Dance": ["15", "9===20"],
    "atk": ["7===60"],
    "acd": ["7===10", "11===20"],
  },

  // Sabre de Segurança [2] — Sword for Geneticist
  // ATK+10%, Proton Cannon+10%, refine7=ATK+40+vct10%, refine9=Proton Cannon+15%+range+7%, refine11=acd20%
  32352: {
    "atkPercent": ["10"],
    "Proton Cannon": ["10", "9===15"],
    "atk": ["7===40"],
    "vct": ["7===10"],
    "range": ["9===7"],
    "acd": ["11===20"],
  },

  // ============================================================
  // Armaduras de Dragão (15391-15396)
  // ============================================================

  // Armadura do Dragão Vermelho [1] — STR armor
  // STR+12, MHP+15%, MSP+10%
  // per2ref: atkPercent+2%
  // per3ref: p_race_dragon+7%
  // refine11: p_size_m+10%, p_size_l+10%, fct-0.2s
  15391: {
    "str": ["12"],
    "hpPercent": ["15"],
    "spPercent": ["10"],
    "atkPercent": ["2---2"],
    "p_race_dragon": ["3---7"],
    "p_size_m": ["11===10"],
    "p_size_l": ["11===10"],
    "fct": ["11===0.2"],
  },

  // Armadura do Dragão Verde [1] — AGI armor
  // AGI+12, MHP+10%, MSP+10%
  // per2ref: range+2%
  // per3ref: p_race_dragon+7%
  // refine11: p_size_m+10%, p_size_l+10%, fct-0.2s
  15392: {
    "agi": ["12"],
    "hpPercent": ["10"],
    "spPercent": ["10"],
    "range": ["2---2"],
    "p_race_dragon": ["3---7"],
    "p_size_m": ["11===10"],
    "p_size_l": ["11===10"],
    "fct": ["11===0.2"],
  },

  // Armadura do Dragão Dourado [1] — VIT armor
  // VIT+12, MHP+20%, MSP+5%
  // per2ref: vct-3%, acd-3%
  // per3ref: p_race_dragon+7%, m_race_dragon+7%
  // refine11: p_size_m+6%, p_size_l+6%, m_size_m+6%, m_size_l+6%, fct-0.2s
  15393: {
    "vit": ["12"],
    "hpPercent": ["20"],
    "spPercent": ["5"],
    "vct": ["2---3"],
    "acd": ["2---3"],
    "p_race_dragon": ["3---7"],
    "m_race_dragon": ["3---7"],
    "p_size_m": ["11===6"],
    "p_size_l": ["11===6"],
    "m_size_m": ["11===6"],
    "m_size_l": ["11===6"],
    "fct": ["11===0.2"],
  },

  // Placa do Dragão Roxo [1] — DEX armor (already has partial script)
  // DEX+12, MHP+15%, MSP+10%
  // per2ref: vct-4%, acd-4%
  // per3ref: p_race_dragon+8%, m_race_dragon+8%
  // refine11: p_size_m+8%, p_size_l+8%, m_size_m+8%, m_size_l+8%, fct-0.2s
  15394: {
    "dex": ["12"],
    "hpPercent": ["15"],
    "spPercent": ["10"],
    "vct": ["2---4"],
    "acd": ["2---4", "11===15"],
    "p_race_dragon": ["3---8"],
    "m_race_dragon": ["3---8"],
    "p_size_m": ["11===8"],
    "p_size_l": ["11===8"],
    "m_size_m": ["11===8"],
    "m_size_l": ["11===8"],
    "fct": ["11===0.2"],
  },

  // Armadura do Dragão Azul [1] — INT armor (already has partial script)
  // INT+12, MHP+5%, MSP+20%
  // per2ref: matkPercent+2%, healingPlus+4%
  // per3ref: m_race_dragon+7%
  // refine11: m_size_m+10%, m_size_l+10%, fct-0.2s
  15395: {
    "int": ["12"],
    "hpPercent": ["5"],
    "spPercent": ["20"],
    "vct": ["20"],
    "matkPercent": ["2---2"],
    "healingPlus": ["2---4"],
    "m_race_dragon": ["3---7"],
    "m_size_m": ["11===10"],
    "m_size_l": ["11===10"],
    "fct": ["11===0.2"],
  },

  // Armadura do Dragão Prateado [1] — LUK armor (already has partial script)
  // LUK+12, MHP+15%, MSP+15%
  // per2ref: cri+2, criDmg+4%
  // per3ref: p_race_dragon+7%
  // refine11: p_size_m+10%, p_size_l+10%, fct-0.2s
  15396: {
    "luk": ["12"],
    "hpPercent": ["15"],
    "spPercent": ["15"],
    "cri": ["2---2"],
    "criDmg": ["2---4"],
    "p_race_dragon": ["3---7"],
    "p_size_m": ["11===10"],
    "p_size_l": ["11===10"],
    "fct": ["11===0.2"],
  },

  // ============================================================
  // Vestes de Odin (15397-15402)
  // ============================================================

  // Veste da Força [1] — STR vest
  // MHP+10%, MSP+10%, acd-10%
  // per2ref: atkPercent+3%
  // per3ref: str+5
  // per4ref: p_race_angel+8%, p_race_demon+8%
  15397: {
    "hpPercent": ["10"],
    "spPercent": ["10"],
    "acd": ["10"],
    "atkPercent": ["2---3"],
    "str": ["3---5"],
    "p_race_angel": ["4---8"],
    "p_race_demon": ["4---8"],
  },

  // Veste da Agilidade [1] — AGI vest
  // MHP+10%, MSP+10%, acd-10%
  // per2ref: range+3%
  // per3ref: agi+5
  // per4ref: p_race_angel+8%, p_race_demon+8%
  15398: {
    "hpPercent": ["10"],
    "spPercent": ["10"],
    "acd": ["10"],
    "range": ["2---3"],
    "agi": ["3---5"],
    "p_race_angel": ["4---8"],
    "p_race_demon": ["4---8"],
  },

  // Veste da Vitalidade [1] — VIT vest
  // MHP+15%, MSP+5%, acd-7%, vct-7%
  // per2ref: hpPercent+2%
  // per3ref: vit+5
  // per4ref: p_race_angel+10%, p_race_demon+10%, m_race_angel+10%, m_race_demon+10%
  15399: {
    "hpPercent": ["15", "2---2"],
    "spPercent": ["5"],
    "acd": ["7"],
    "vct": ["7"],
    "vit": ["3---5"],
    "p_race_angel": ["4---10"],
    "p_race_demon": ["4---10"],
    "m_race_angel": ["4---10"],
    "m_race_demon": ["4---10"],
  },

  // Veste da Destreza [1] — DEX vest
  // MHP+10%, MSP+10%, acd-10%, vct-10%
  // per2ref: atkPercent+1%, matkPercent+1%
  // per3ref: dex+5
  // per4ref: p_race_angel+6%, p_race_demon+6%, m_race_angel+6%, m_race_demon+6%
  15400: {
    "hpPercent": ["10"],
    "spPercent": ["10"],
    "acd": ["10"],
    "vct": ["10"],
    "atkPercent": ["2---1"],
    "matkPercent": ["2---1"],
    "dex": ["3---5"],
    "p_race_angel": ["4---6"],
    "p_race_demon": ["4---6"],
    "m_race_angel": ["4---6"],
    "m_race_demon": ["4---6"],
  },

  // Veste da Inteligência [1] — INT vest
  // MHP+5%, MSP+15%, vct-10%
  // per2ref: matkPercent+3%
  // per3ref: int+5
  // per4ref: m_race_angel+8%, m_race_demon+8%
  15401: {
    "hpPercent": ["5"],
    "spPercent": ["15"],
    "vct": ["10"],
    "matkPercent": ["2---3"],
    "int": ["3---5"],
    "m_race_angel": ["4---8"],
    "m_race_demon": ["4---8"],
  },

  // Veste da Sorte [1] — LUK vest
  // MHP+10%, MSP+10%, acd-10%
  // per2ref: cri+3, criDmg+4%
  // per3ref: luk+5
  // per4ref: p_race_angel+8%, p_race_demon+8%
  15402: {
    "hpPercent": ["10"],
    "spPercent": ["10"],
    "acd": ["10"],
    "cri": ["2---3"],
    "criDmg": ["2---4"],
    "luk": ["3---5"],
    "p_race_angel": ["4---8"],
    "p_race_demon": ["4---8"],
  },

  // ============================================================
  // Acessórios de Einbech (32248-32249)
  // ============================================================

  // Pingente Vermelho de Segurança [1]
  // All stats +5, acd-5%
  // (Combo effects with shoulders not scripted — those are gear-specific)
  32248: {
    "str": ["5"],
    "agi": ["5"],
    "vit": ["5"],
    "int": ["5"],
    "dex": ["5"],
    "luk": ["5"],
    "acd": ["5"],
  },

  // Pingente Azul de Segurança [1]
  // All stats +5, vct-5%
  32249: {
    "str": ["5"],
    "agi": ["5"],
    "vit": ["5"],
    "int": ["5"],
    "dex": ["5"],
    "luk": ["5"],
    "vct": ["5"],
  },
};

// ----- Apply scripts -----
let updated = 0;
for (const [idStr, script] of Object.entries(SCRIPTS)) {
  const id = parseInt(idStr);
  const item = data[id];
  if (!item) {
    console.warn(`WARNING: Item ${id} not found in item.json — skipping`);
    continue;
  }
  const before = JSON.stringify(item.script);
  item.script = script;
  const after = JSON.stringify(item.script);
  console.log(`Updated ID ${id}: ${item.name}`);
  if (before !== '{}') {
    console.log(`  Previous: ${before}`);
  }
  console.log(`  New:      ${after}`);
  updated++;
}

// ----- Write back -----
fs.writeFileSync(ITEM_JSON, JSON.stringify(data, null, 2), 'utf8');
console.log(`\nDone. Updated ${updated} items.`);
