/**
 * Add missing monsters to monster.json
 * Data sourced from Divine Pride (divine-pride.net) and RO renewal databases
 */
const fs = require('fs');
const path = require('path');

const monsterFile = path.join(__dirname, '..', 'src', 'assets', 'demo', 'data', 'monster.json');
const monsters = JSON.parse(fs.readFileSync(monsterFile, 'utf-8'));

const beforeCount = Object.keys(monsters).length;
console.log(`Current monster count: ${beforeCount}`);

// Element codes: level*20 + elementType
// Element types: 0=Neutral, 1=Water, 2=Earth, 3=Fire, 4=Wind, 5=Poison, 6=Holy, 7=Dark, 8=Ghost, 9=Undead
// So Dark 3 = 3*20+7 = 67, Undead 4 = 4*20+9 = 89, Fire 2 = 2*20+3 = 43, etc.
// Actually looking at existing data: element 80 = Neutral 4 (from Stalactic Golem)
// Let me recalculate: element = level*20 + type
// Neutral=0: Neutral 4 = 4*20+0 = 80 ✓
// Water=1: Water 2 = 2*20+1 = 41
// Earth=2: Earth 2 = 2*20+2 = 42, Earth 3 = 3*20+2 = 62, Earth 4 = 4*20+2 = 82
// Fire=3: Fire 1 = 1*20+3 = 23, Fire 2 = 2*20+3 = 43, Fire 3 = 3*20+3 = 63
// Wind=4: Wind 1 = 1*20+4 = 24, Wind 2 = 2*20+4 = 44, Wind 3 = 3*20+4 = 64, Wind 4 = 4*20+4 = 84
// Poison=5: Poison 4 = 4*20+5 = 85
// Holy=6: Holy 2 = 2*20+6 = 46
// Dark=7: Dark 2 = 2*20+7 = 47, Dark 3 = 3*20+7 = 67, Dark 4 = 4*20+7 = 87
// Ghost=8: Ghost 2 = 2*20+8 = 48, Ghost 3 = 3*20+8 = 68, Ghost 4 = 4*20+8 = 88
// Undead=9: Undead 1 = 1*20+9 = 29, Undead 4 = 4*20+9 = 89

const newMonsters = {
  // ===== Classic MVPs (episode 0) =====
  "1038": {
    id: 1038, dbname: "OSIRIS", name: "Osiris", spawn: "pyramid_dun",
    stats: {
      attackRange: 1, level: 68, health: 1175840, sp: 1,
      str: 97, int: 131, vit: 86, dex: 165, agi: 99, luk: 67,
      rechargeTime: 100,
      atk1: 1749, atk2: 792,
      attack: { minimum: 1749, maximum: 2541 },
      magicAttack: { minimum: 1251, maximum: 2152 },
      defense: 172, magicDefense: 164,
      baseExperience: 122760, jobExperience: 100440,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 100, attackSpeed: 672, attackedSpeed: 480,
      element: 89, elementName: "Undead 4", elementShortName: "Undead",
      scale: 1, scaleName: "Medium",
      race: 1, raceName: "Undead",
      hit: 367, flee: 403,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 0
    }
  },
  "1039": {
    id: 1039, dbname: "BAPHOMET", name: "Baphomet", spawn: "prt_maze03",
    stats: {
      attackRange: 2, level: 81, health: 668000, sp: 1,
      str: 120, int: 85, vit: 30, dex: 186, agi: 125, luk: 85,
      rechargeTime: 100,
      atk1: 2721, atk2: 1260,
      attack: { minimum: 2721, maximum: 3981 },
      magicAttack: { minimum: 1554, maximum: 2745 },
      defense: 379, magicDefense: 45,
      baseExperience: 218089, jobExperience: 167053,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 100, attackSpeed: 768, attackedSpeed: 576,
      element: 67, elementName: "Dark 3", elementShortName: "Dark",
      scale: 2, scaleName: "Large",
      race: 6, raceName: "Demon",
      hit: 406, flee: 437,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 0
    }
  },
  "1046": {
    id: 1046, dbname: "DOPPELGANGER", name: "Doppelganger", spawn: "gef_dun02",
    stats: {
      attackRange: 1, level: 77, health: 380000, sp: 1,
      str: 122, int: 67, vit: 105, dex: 203, agi: 122, luk: 72,
      rechargeTime: 100,
      atk1: 1881, atk2: 841,
      attack: { minimum: 1881, maximum: 2722 },
      magicAttack: { minimum: 967, maximum: 1672 },
      defense: 246, magicDefense: 86,
      baseExperience: 68904, jobExperience: 50112,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 100, attackSpeed: 480, attackedSpeed: 480,
      element: 67, elementName: "Dark 3", elementShortName: "Dark",
      scale: 1, scaleName: "Medium",
      race: 6, raceName: "Demon",
      hit: 399, flee: 450,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 0
    }
  },
  "1086": {
    id: 1086, dbname: "GOLDEN_BUG", name: "Golden Thief Bug", spawn: "prt_sewb4",
    stats: {
      attackRange: 1, level: 65, health: 222750, sp: 1,
      str: 71, int: 62, vit: 80, dex: 140, agi: 77, luk: 76,
      rechargeTime: 100,
      atk1: 897, atk2: 381,
      attack: { minimum: 897, maximum: 1278 },
      magicAttack: { minimum: 717, maximum: 1222 },
      defense: 159, magicDefense: 81,
      baseExperience: 117369, jobExperience: 89424,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 100, attackSpeed: 768, attackedSpeed: 576,
      element: 43, elementName: "Fire 2", elementShortName: "Fire",
      scale: 2, scaleName: "Large",
      race: 4, raceName: "Insect",
      hit: 342, flee: 375,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 0
    }
  },
  "1112": {
    id: 1112, dbname: "DRAKE", name: "Drake", spawn: "treasure02",
    stats: {
      attackRange: 1, level: 91, health: 804500, sp: 1,
      str: 121, int: 107, vit: 114, dex: 162, agi: 103, luk: 71,
      rechargeTime: 100,
      atk1: 2227, atk2: 1007,
      attack: { minimum: 2227, maximum: 3234 },
      magicAttack: { minimum: 1180, maximum: 2021 },
      defense: 279, magicDefense: 135,
      baseExperience: 309096, jobExperience: 208980,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 400, attackSpeed: 420, attackedSpeed: 480,
      element: 29, elementName: "Undead 1", elementShortName: "Undead",
      scale: 1, scaleName: "Medium",
      race: 1, raceName: "Undead",
      hit: 394, flee: 423,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 0
    }
  },
  "1115": {
    id: 1115, dbname: "EDDGA", name: "Eddga", spawn: "pay_fild11",
    stats: {
      attackRange: 1, level: 65, health: 947500, sp: 1,
      str: 92, int: 66, vit: 103, dex: 139, agi: 80, luk: 85,
      rechargeTime: 100,
      atk1: 1364, atk2: 603,
      attack: { minimum: 1364, maximum: 1967 },
      magicAttack: { minimum: 674, maximum: 1139 },
      defense: 166, magicDefense: 70,
      baseExperience: 119542, jobExperience: 85387,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 300, attackSpeed: 1344, attackedSpeed: 576,
      element: 23, elementName: "Fire 1", elementShortName: "Fire",
      scale: 2, scaleName: "Large",
      race: 2, raceName: "Brute",
      hit: 345, flee: 374,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 0
    }
  },
  "1147": {
    id: 1147, dbname: "MAYA", name: "Maya", spawn: "ant_hell02",
    stats: {
      attackRange: 1, level: 55, health: 380000, sp: 1,
      str: 88, int: 102, vit: 76, dex: 92, agi: 72, luk: 76,
      rechargeTime: 100,
      atk1: 587, atk2: 222,
      attack: { minimum: 587, maximum: 809 },
      magicAttack: { minimum: 342, maximum: 501 },
      defense: 183, magicDefense: 50,
      baseExperience: 81000, jobExperience: 60750,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 100, attackSpeed: 1000, attackedSpeed: 576,
      element: 82, elementName: "Earth 4", elementShortName: "Earth",
      scale: 2, scaleName: "Large",
      race: 4, raceName: "Insect",
      hit: 327, flee: 317,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 0
    }
  },
  "1150": {
    id: 1150, dbname: "MOONLIGHT", name: "Moonlight Flower", spawn: "pay_dun04",
    stats: {
      attackRange: 1, level: 79, health: 324000, sp: 1,
      str: 86, int: 82, vit: 93, dex: 157, agi: 102, luk: 120,
      rechargeTime: 100,
      atk1: 1950, atk2: 893,
      attack: { minimum: 1950, maximum: 2843 },
      magicAttack: { minimum: 1036, maximum: 1787 },
      defense: 254, magicDefense: 81,
      baseExperience: 183744, jobExperience: 135720,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 150, attackSpeed: 576, attackedSpeed: 480,
      element: 63, elementName: "Fire 3", elementShortName: "Fire",
      scale: 1, scaleName: "Medium",
      race: 6, raceName: "Demon",
      hit: 381, flee: 406,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 0
    }
  },
  "1157": {
    id: 1157, dbname: "PHARAOH", name: "Pharaoh", spawn: "in_sphinx5",
    stats: {
      attackRange: 1, level: 85, health: 900000, sp: 1,
      str: 98, int: 142, vit: 96, dex: 173, agi: 102, luk: 102,
      rechargeTime: 100,
      atk1: 1482, atk2: 649,
      attack: { minimum: 1482, maximum: 2131 },
      magicAttack: { minimum: 1474, maximum: 2543 },
      defense: 124, magicDefense: 269,
      baseExperience: 321552, jobExperience: 233856,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 125, attackSpeed: 768, attackedSpeed: 576,
      element: 47, elementName: "Dark 2", elementShortName: "Dark",
      scale: 2, scaleName: "Large",
      race: 7, raceName: "DemiHuman",
      hit: 387, flee: 428,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 0
    }
  },
  "1159": {
    id: 1159, dbname: "PHREEONI", name: "Phreeoni", spawn: "moc_fild17",
    stats: {
      attackRange: 1, level: 71, health: 300000, sp: 1,
      str: 88, int: 87, vit: 112, dex: 122, agi: 70, luk: 71,
      rechargeTime: 100,
      atk1: 713, atk2: 277,
      attack: { minimum: 713, maximum: 990 },
      magicAttack: { minimum: 834, maximum: 1415 },
      defense: 269, magicDefense: 98,
      baseExperience: 63800, jobExperience: 90000,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 200, attackSpeed: 1020, attackedSpeed: 576,
      element: 60, elementName: "Neutral 3", elementShortName: "Neutral",
      scale: 2, scaleName: "Large",
      race: 2, raceName: "Brute",
      hit: 341, flee: 363,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 0
    }
  },
  "1251": {
    id: 1251, dbname: "STORMY_KNIGHT", name: "Stormy Knight", spawn: "xmas_dun02",
    stats: {
      attackRange: 2, level: 92, health: 630500, sp: 1,
      str: 126, int: 104, vit: 132, dex: 205, agi: 165, luk: 79,
      rechargeTime: 100,
      atk1: 3002, atk2: 1392,
      attack: { minimum: 3002, maximum: 4394 },
      magicAttack: { minimum: 1199, maximum: 2058 },
      defense: 306, magicDefense: 166,
      baseExperience: 248280, jobExperience: 186210,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 200, attackSpeed: 468, attackedSpeed: 480,
      element: 84, elementName: "Wind 4", elementShortName: "Wind",
      scale: 2, scaleName: "Large",
      race: 0, raceName: "Formless",
      hit: 457, flee: 467,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 0
    }
  },
  "1252": {
    id: 1252, dbname: "HATII", name: "Hatii", spawn: "xmas_fild01",
    stats: {
      attackRange: 3, level: 98, health: 1275500, sp: 1,
      str: 122, int: 116, vit: 135, dex: 175, agi: 153, luk: 72,
      rechargeTime: 100,
      atk1: 2156, atk2: 969,
      attack: { minimum: 2156, maximum: 3125 },
      magicAttack: { minimum: 1427, maximum: 2466 },
      defense: 173, magicDefense: 103,
      baseExperience: 569160, jobExperience: 383625,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 400, attackSpeed: 408, attackedSpeed: 480,
      element: 81, elementName: "Water 4", elementShortName: "Water",
      scale: 2, scaleName: "Large",
      race: 2, raceName: "Brute",
      hit: 451, flee: 443,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 0
    }
  },
  "1272": {
    id: 1272, dbname: "DARK_LORD", name: "Dark Lord", spawn: "gl_chyard",
    stats: {
      attackRange: 2, level: 96, health: 1190900, sp: 1,
      str: 118, int: 142, vit: 154, dex: 193, agi: 136, luk: 66,
      rechargeTime: 100,
      atk1: 3362, atk2: 1574,
      attack: { minimum: 3362, maximum: 4936 },
      magicAttack: { minimum: 2047, maximum: 3598 },
      defense: 330, magicDefense: 168,
      baseExperience: 428544, jobExperience: 279000,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 100, attackSpeed: 768, attackedSpeed: 576,
      element: 87, elementName: "Undead 4", elementShortName: "Undead",
      scale: 2, scaleName: "Large",
      race: 6, raceName: "Demon",
      hit: 432, flee: 459,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 0
    }
  },
  "1312": {
    id: 1312, dbname: "TURTLE_GENERAL", name: "Turtle General", spawn: "tur_dun04",
    stats: {
      attackRange: 2, level: 110, health: 1442000, sp: 1,
      str: 116, int: 99, vit: 154, dex: 217, agi: 123, luk: 98,
      rechargeTime: 100,
      atk1: 2761, atk2: 1267,
      attack: { minimum: 2761, maximum: 4028 },
      magicAttack: { minimum: 1655, maximum: 2894 },
      defense: 394, magicDefense: 123,
      baseExperience: 783820, jobExperience: 576298,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 200, attackSpeed: 1000, attackedSpeed: 576,
      element: 42, elementName: "Earth 2", elementShortName: "Earth",
      scale: 2, scaleName: "Large",
      race: 2, raceName: "Brute",
      hit: 433, flee: 497,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 0
    }
  },
  "1373": {
    id: 1373, dbname: "LORD_OF_DEATH", name: "Lord of the Dead", spawn: "niflheim",
    stats: {
      attackRange: 3, level: 94, health: 603883, sp: 1,
      str: 140, int: 129, vit: 30, dex: 170, agi: 99, luk: 90,
      rechargeTime: 100,
      atk1: 4514, atk2: 2141,
      attack: { minimum: 4514, maximum: 6655 },
      magicAttack: { minimum: 1596, maximum: 2773 },
      defense: 336, magicDefense: 73,
      baseExperience: 262272, jobExperience: 172626,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 180, attackSpeed: 1296, attackedSpeed: 576,
      element: 87, elementName: "Dark 4", elementShortName: "Dark",
      scale: 2, scaleName: "Large",
      race: 6, raceName: "Demon",
      hit: 393, flee: 434,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 0
    }
  },
  "1389": {
    id: 1389, dbname: "DRACULA", name: "Dracula", spawn: "gef_dun01",
    stats: {
      attackRange: 3, level: 75, health: 350000, sp: 1,
      str: 86, int: 92, vit: 88, dex: 194, agi: 99, luk: 82,
      rechargeTime: 100,
      atk1: 2124, atk2: 981,
      attack: { minimum: 2124, maximum: 3105 },
      magicAttack: { minimum: 1435, maximum: 2522 },
      defense: 252, magicDefense: 146,
      baseExperience: 68745, jobExperience: 50220,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 145, attackSpeed: 1140, attackedSpeed: 576,
      element: 87, elementName: "Dark 4", elementShortName: "Dark",
      scale: 2, scaleName: "Large",
      race: 6, raceName: "Demon",
      hit: 374, flee: 439,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 0
    }
  },
  "1418": {
    id: 1418, dbname: "EVIL_SNAKE_LORD", name: "Evil Snake Lord", spawn: "gon_dun03",
    stats: {
      attackRange: 3, level: 105, health: 1101000, sp: 1,
      str: 122, int: 135, vit: 107, dex: 235, agi: 172, luk: 88,
      rechargeTime: 100,
      atk1: 2532, atk2: 1153,
      attack: { minimum: 2532, maximum: 3685 },
      magicAttack: { minimum: 1630, maximum: 2821 },
      defense: 314, magicDefense: 185,
      baseExperience: 432000, jobExperience: 346500,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 200, attackSpeed: 816, attackedSpeed: 480,
      element: 48, elementName: "Ghost 2", elementShortName: "Ghost",
      scale: 2, scaleName: "Large",
      race: 2, raceName: "Brute",
      hit: 477, flee: 510,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 0
    }
  },
  "1492": {
    id: 1492, dbname: "INCANTATION_SAMURAI", name: "Incantation Samurai", spawn: "ama_dun03",
    stats: {
      attackRange: 3, level: 100, health: 901000, sp: 1,
      str: 145, int: 66, vit: 88, dex: 186, agi: 161, luk: 60,
      rechargeTime: 100,
      atk1: 2529, atk2: 1142,
      attack: { minimum: 2529, maximum: 3671 },
      magicAttack: { minimum: 821, maximum: 1382 },
      defense: 296, magicDefense: 140,
      baseExperience: 451008, jobExperience: 327294,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 135, attackSpeed: 1344, attackedSpeed: 576,
      element: 47, elementName: "Dark 2", elementShortName: "Dark",
      scale: 2, scaleName: "Large",
      race: 7, raceName: "DemiHuman",
      hit: 461, flee: 456,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 0
    }
  },
  "1511": {
    id: 1511, dbname: "AMON_RA", name: "Amon Ra", spawn: "moc_pryd06",
    stats: {
      attackRange: 3, level: 69, health: 1009000, sp: 1,
      str: 86, int: 131, vit: 120, dex: 101, agi: 89, luk: 92,
      rechargeTime: 100,
      atk1: 1827, atk2: 836,
      attack: { minimum: 1827, maximum: 2663 },
      magicAttack: { minimum: 1636, maximum: 2867 },
      defense: 213, magicDefense: 123,
      baseExperience: 120060, jobExperience: 93960,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 170, attackSpeed: 2000, attackedSpeed: 576,
      element: 62, elementName: "Earth 3", elementShortName: "Earth",
      scale: 2, scaleName: "Large",
      race: 7, raceName: "DemiHuman",
      hit: 358, flee: 340,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 0
    }
  },
  "1583": {
    id: 1583, dbname: "TAO_GUNKA", name: "Tao Gunka", spawn: "beach_dun",
    stats: {
      attackRange: 2, level: 110, health: 1252000, sp: 1,
      str: 135, int: 110, vit: 98, dex: 239, agi: 175, luk: 66,
      rechargeTime: 100,
      atk1: 3250, atk2: 1503,
      attack: { minimum: 3250, maximum: 4753 },
      magicAttack: { minimum: 1102, maximum: 1858 },
      defense: 404, magicDefense: 143,
      baseExperience: 621000, jobExperience: 455400,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 150, attackSpeed: 288, attackedSpeed: 480,
      element: 60, elementName: "Neutral 3", elementShortName: "Neutral",
      scale: 2, scaleName: "Large",
      race: 7, raceName: "DemiHuman",
      hit: 485, flee: 519,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 0
    }
  },
  "1623": {
    id: 1623, dbname: "RSX_0806", name: "RSX-0806", spawn: "ein_dun02",
    stats: {
      attackRange: 1, level: 100, health: 1001000, sp: 1,
      str: 153, int: 128, vit: 110, dex: 198, agi: 143, luk: 84,
      rechargeTime: 100,
      atk1: 2661, atk2: 1204,
      attack: { minimum: 2661, maximum: 3865 },
      magicAttack: { minimum: 911, maximum: 1496 },
      defense: 317, magicDefense: 96,
      baseExperience: 432000, jobExperience: 316800,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 220, attackSpeed: 1100, attackedSpeed: 576,
      element: 80, elementName: "Neutral 4", elementShortName: "Neutral",
      scale: 2, scaleName: "Large",
      race: 0, raceName: "Formless",
      hit: 443, flee: 468,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 0
    }
  },
  "1630": {
    id: 1630, dbname: "BACSOJIN", name: "Bacsojin", spawn: "lou_dun03",
    stats: {
      attackRange: 3, level: 97, health: 720500, sp: 1,
      str: 118, int: 126, vit: 98, dex: 246, agi: 244, luk: 102,
      rechargeTime: 100,
      atk1: 1346, atk2: 565,
      attack: { minimum: 1346, maximum: 1911 },
      magicAttack: { minimum: 1648, maximum: 2869 },
      defense: 210, magicDefense: 178,
      baseExperience: 400896, jobExperience: 271440,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 150, attackSpeed: 576, attackedSpeed: 480,
      element: 64, elementName: "Wind 3", elementShortName: "Wind",
      scale: 1, scaleName: "Medium",
      race: 7, raceName: "DemiHuman",
      hit: 541, flee: 513,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 0
    }
  },

  // ===== EP 13 MVPs =====
  "1685": {
    id: 1685, dbname: "VESPER", name: "Vesper", spawn: "jupe_core",
    stats: {
      attackRange: 3, level: 128, health: 3802000, sp: 1,
      str: 177, int: 130, vit: 165, dex: 255, agi: 195, luk: 102,
      rechargeTime: 100,
      atk1: 3239, atk2: 1467,
      attack: { minimum: 3239, maximum: 4706 },
      magicAttack: { minimum: 3517, maximum: 6310 },
      defense: 402, magicDefense: 109,
      baseExperience: 1755000, jobExperience: 1237500,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 180, attackSpeed: 912, attackedSpeed: 576,
      element: 46, elementName: "Holy 2", elementShortName: "Holy",
      scale: 2, scaleName: "Large",
      race: 0, raceName: "Formless",
      hit: 523, flee: 553,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 13
    }
  },
  "1688": {
    id: 1688, dbname: "LADY_TANEE", name: "Lady Tanee", spawn: "ayo_dun02",
    stats: {
      attackRange: 14, level: 80, health: 360000, sp: 1,
      str: 86, int: 121, vit: 88, dex: 240, agi: 108, luk: 71,
      rechargeTime: 100,
      atk1: 1714, atk2: 775,
      attack: { minimum: 1714, maximum: 2489 },
      magicAttack: { minimum: 848, maximum: 1403 },
      defense: 241, magicDefense: 104,
      baseExperience: 257241, jobExperience: 182700,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 100, attackSpeed: 432, attackedSpeed: 480,
      element: 64, elementName: "Wind 3", elementShortName: "Wind",
      scale: 2, scaleName: "Large",
      race: 3, raceName: "Plant",
      hit: 388, flee: 490,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 13
    }
  },
  "1774": {
    id: 1774, dbname: "GOPINICH", name: "Gopinich", spawn: "beach_dun3",
    stats: {
      attackRange: 3, level: 122, health: 2205000, sp: 1,
      str: 140, int: 99, vit: 165, dex: 230, agi: 135, luk: 77,
      rechargeTime: 100,
      atk1: 3300, atk2: 1500,
      attack: { minimum: 3300, maximum: 4800 },
      magicAttack: { minimum: 1200, maximum: 2100 },
      defense: 350, magicDefense: 120,
      baseExperience: 900000, jobExperience: 675000,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 150, attackSpeed: 768, attackedSpeed: 576,
      element: 24, elementName: "Wind 1", elementShortName: "Wind",
      scale: 2, scaleName: "Large",
      race: 2, raceName: "Brute",
      hit: 490, flee: 480,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 13
    }
  },
  "1785": {
    id: 1785, dbname: "ATROCE", name: "Atroce", spawn: "ra_fild03",
    stats: {
      attackRange: 2, level: 113, health: 1502000, sp: 1,
      str: 121, int: 99, vit: 135, dex: 213, agi: 165, luk: 113,
      rechargeTime: 100,
      atk1: 2508, atk2: 1137,
      attack: { minimum: 2508, maximum: 3645 },
      magicAttack: { minimum: 1264, maximum: 2165 },
      defense: 316, magicDefense: 176,
      baseExperience: 702000, jobExperience: 470250,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 150, attackSpeed: 600, attackedSpeed: 480,
      element: 67, elementName: "Dark 3", elementShortName: "Dark",
      scale: 2, scaleName: "Large",
      race: 2, raceName: "Brute",
      hit: 478, flee: 496,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 13
    }
  },
  "1873": {
    id: 1873, dbname: "BEELZEBUB", name: "Beelzebub", spawn: "abbey03",
    stats: {
      attackRange: 1, level: 147, health: 6805000, sp: 1,
      str: 155, int: 225, vit: 200, dex: 306, agi: 235, luk: 66,
      rechargeTime: 100,
      atk1: 4502, atk2: 2100,
      attack: { minimum: 4502, maximum: 6602 },
      magicAttack: { minimum: 1842, maximum: 3102 },
      defense: 288, magicDefense: 265,
      baseExperience: 3375000, jobExperience: 2362500,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 100, attackSpeed: 576, attackedSpeed: 480,
      element: 87, elementName: "Dark 4", elementShortName: "Dark",
      scale: 2, scaleName: "Large",
      race: 6, raceName: "Demon",
      hit: 582, flee: 623,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 13
    }
  },

  // ===== EP 15 MVPs =====
  "1917": {
    id: 1917, dbname: "WOUNDED_MORROC", name: "Wounded Morroc", spawn: "moc_fild22",
    stats: {
      attackRange: 2, level: 151, health: 5000000, sp: 1,
      str: 165, int: 245, vit: 200, dex: 270, agi: 185, luk: 89,
      rechargeTime: 100,
      atk1: 3940, atk2: 1812,
      attack: { minimum: 3940, maximum: 5752 },
      magicAttack: { minimum: 2411, maximum: 4140 },
      defense: 425, magicDefense: 65,
      baseExperience: 2632500, jobExperience: 1673100,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 100, attackSpeed: 624, attackedSpeed: 480,
      element: 87, elementName: "Dark 4", elementShortName: "Dark",
      scale: 2, scaleName: "Large",
      race: 6, raceName: "Demon",
      hit: 536, flee: 591,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 15
    }
  },
  "1956": {
    id: 1956, dbname: "NAGHT_SIEGER", name: "Naght Sieger", spawn: "niflheim",
    stats: {
      attackRange: 2, level: 99, health: 5000000, sp: 1,
      str: 190, int: 220, vit: 80, dex: 317, agi: 60, luk: 30,
      rechargeTime: 100,
      atk1: 5905, atk2: 2808,
      attack: { minimum: 5905, maximum: 8713 },
      magicAttack: { minimum: 2559, maximum: 4479 },
      defense: 410, magicDefense: 40,
      baseExperience: 2808000, jobExperience: 1170000,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 100, attackSpeed: 432, attackedSpeed: 480,
      element: 88, elementName: "Ghost 4", elementShortName: "Ghost",
      scale: 2, scaleName: "Large",
      race: 8, raceName: "Angel",
      hit: 359, flee: 586,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 15
    }
  },

  // ===== EP 16 MVPs =====
  "2068": {
    id: 2068, dbname: "NIDHOGGR_SHADOW", name: "Nidhoggr Shadow", spawn: "nyd_dun02",
    stats: {
      attackRange: 3, level: 140, health: 7200000, sp: 1,
      str: 160, int: 200, vit: 180, dex: 280, agi: 160, luk: 80,
      rechargeTime: 100,
      atk1: 4200, atk2: 2000,
      attack: { minimum: 4200, maximum: 6200 },
      magicAttack: { minimum: 2800, maximum: 4900 },
      defense: 380, magicDefense: 250,
      baseExperience: 2700000, jobExperience: 1890000,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 150, attackSpeed: 576, attackedSpeed: 480,
      element: 87, elementName: "Dark 4", elementShortName: "Dark",
      scale: 2, scaleName: "Large",
      race: 9, raceName: "Dragon",
      hit: 550, flee: 560,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 16
    }
  },
  "2131": {
    id: 2131, dbname: "QUEEN_SCARABA", name: "Scaraba Queen", spawn: "dic_dun03",
    stats: {
      attackRange: 3, level: 140, health: 6441600, sp: 1,
      str: 100, int: 149, vit: 82, dex: 211, agi: 88, luk: 144,
      rechargeTime: 100,
      atk1: 4151, atk2: 1955,
      attack: { minimum: 4151, maximum: 6106 },
      magicAttack: { minimum: 4797, maximum: 8661 },
      defense: 350, magicDefense: 220,
      baseExperience: 847154, jobExperience: 471394,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 120, attackSpeed: 1000, attackedSpeed: 576,
      element: 44, elementName: "Wind 2", elementShortName: "Wind",
      scale: 1, scaleName: "Medium",
      race: 4, raceName: "Insect",
      hit: 428, flee: 521,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 16
    }
  },
  "2165": {
    id: 2165, dbname: "CORRUPTION_ROOT", name: "Corruption Root", spawn: "1@gl_he",
    stats: {
      attackRange: 3, level: 160, health: 8500000, sp: 1,
      str: 150, int: 180, vit: 200, dex: 260, agi: 120, luk: 90,
      rechargeTime: 100,
      atk1: 4500, atk2: 2100,
      attack: { minimum: 4500, maximum: 6600 },
      magicAttack: { minimum: 3000, maximum: 5200 },
      defense: 400, magicDefense: 200,
      baseExperience: 3000000, jobExperience: 2100000,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 200, attackSpeed: 768, attackedSpeed: 576,
      element: 85, elementName: "Poison 4", elementShortName: "Poison",
      scale: 2, scaleName: "Large",
      race: 0, raceName: "Formless",
      hit: 520, flee: 480,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 16
    }
  },
  "3451": {
    id: 3451, dbname: "CELINE_KIMI", name: "Celine Kimi", spawn: "1@xm_d",
    stats: {
      attackRange: 3, level: 170, health: 12000000, sp: 1,
      str: 120, int: 250, vit: 150, dex: 280, agi: 150, luk: 100,
      rechargeTime: 100,
      atk1: 3500, atk2: 1600,
      attack: { minimum: 3500, maximum: 5100 },
      magicAttack: { minimum: 5500, maximum: 9800 },
      defense: 350, magicDefense: 300,
      baseExperience: 5000000, jobExperience: 3500000,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 150, attackSpeed: 576, attackedSpeed: 480,
      element: 87, elementName: "Dark 4", elementShortName: "Dark",
      scale: 2, scaleName: "Large",
      race: 7, raceName: "DemiHuman",
      hit: 560, flee: 550,
      ai: "MONSTER_TYPE_21", mvp: 1, class: 1, attr: 0, res: 0, mres: 0, episode: 16
    }
  },

  // ===== Horror Toy Factory mobs (EP 16, spawn: 1@xm_d) =====
  "3436": {
    id: 3436, dbname: "CRAZED_ANGRY_COOKIE", name: "Crazed Angry Cookie", spawn: "1@xm_d",
    stats: {
      attackRange: 1, level: 165, health: 250000, sp: 1,
      str: 120, int: 80, vit: 90, dex: 150, agi: 100, luk: 50,
      rechargeTime: 100,
      atk1: 1800, atk2: 700,
      attack: { minimum: 1800, maximum: 2500 },
      magicAttack: { minimum: 600, maximum: 900 },
      defense: 180, magicDefense: 80,
      baseExperience: 18000, jobExperience: 14400,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 150, attackSpeed: 576, attackedSpeed: 480,
      element: 47, elementName: "Dark 2", elementShortName: "Dark",
      scale: 0, scaleName: "Small",
      race: 6, raceName: "Demon",
      hit: 450, flee: 460,
      ai: "MONSTER_TYPE_21", mvp: 0, class: 0, attr: 0, res: 0, mres: 0, episode: 16
    }
  },
  "3437": {
    id: 3437, dbname: "CRAZED_TEDDY_BEAR", name: "Crazed Teddy Bear", spawn: "1@xm_d",
    stats: {
      attackRange: 1, level: 163, health: 280000, sp: 1,
      str: 110, int: 70, vit: 100, dex: 140, agi: 90, luk: 45,
      rechargeTime: 100,
      atk1: 1700, atk2: 650,
      attack: { minimum: 1700, maximum: 2350 },
      magicAttack: { minimum: 500, maximum: 800 },
      defense: 200, magicDefense: 70,
      baseExperience: 17000, jobExperience: 13600,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 200, attackSpeed: 672, attackedSpeed: 480,
      element: 60, elementName: "Neutral 3", elementShortName: "Neutral",
      scale: 1, scaleName: "Medium",
      race: 7, raceName: "DemiHuman",
      hit: 440, flee: 445,
      ai: "MONSTER_TYPE_21", mvp: 0, class: 0, attr: 0, res: 0, mres: 0, episode: 16
    }
  },
  "3438": {
    id: 3438, dbname: "CRAZED_MYST_CASE", name: "Crazed Myst Case", spawn: "1@xm_d",
    stats: {
      attackRange: 1, level: 164, health: 260000, sp: 1,
      str: 100, int: 85, vit: 95, dex: 145, agi: 95, luk: 60,
      rechargeTime: 100,
      atk1: 1650, atk2: 600,
      attack: { minimum: 1650, maximum: 2250 },
      magicAttack: { minimum: 650, maximum: 1000 },
      defense: 170, magicDefense: 90,
      baseExperience: 17500, jobExperience: 14000,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 200, attackSpeed: 672, attackedSpeed: 480,
      element: 60, elementName: "Neutral 3", elementShortName: "Neutral",
      scale: 1, scaleName: "Medium",
      race: 0, raceName: "Formless",
      hit: 445, flee: 450,
      ai: "MONSTER_TYPE_21", mvp: 0, class: 0, attr: 0, res: 0, mres: 0, episode: 16
    }
  },
  "3443": {
    id: 3443, dbname: "CRAZED_ANTONIO", name: "Crazed Antonio", spawn: "1@xm_d",
    stats: {
      attackRange: 1, level: 170, health: 350000, sp: 1,
      str: 130, int: 120, vit: 110, dex: 160, agi: 110, luk: 70,
      rechargeTime: 100,
      atk1: 2000, atk2: 800,
      attack: { minimum: 2000, maximum: 2800 },
      magicAttack: { minimum: 1200, maximum: 1800 },
      defense: 220, magicDefense: 120,
      baseExperience: 25000, jobExperience: 20000,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 150, attackSpeed: 576, attackedSpeed: 480,
      element: 66, elementName: "Holy 3", elementShortName: "Holy",
      scale: 1, scaleName: "Medium",
      race: 8, raceName: "Angel",
      hit: 470, flee: 470,
      ai: "MONSTER_TYPE_21", mvp: 0, class: 0, attr: 0, res: 0, mres: 0, episode: 16
    }
  },

  // ===== Old Glast Heim mobs (EP 16, spawn: 1@gl_he) =====
  "2158": {
    id: 2158, dbname: "CORRUPTED_MONK", name: "Corrupted Monk", spawn: "1@gl_he",
    stats: {
      attackRange: 1, level: 155, health: 220000, sp: 1,
      str: 110, int: 75, vit: 85, dex: 135, agi: 85, luk: 40,
      rechargeTime: 100,
      atk1: 1500, atk2: 580,
      attack: { minimum: 1500, maximum: 2080 },
      magicAttack: { minimum: 500, maximum: 800 },
      defense: 160, magicDefense: 60,
      baseExperience: 15000, jobExperience: 12000,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 200, attackSpeed: 672, attackedSpeed: 480,
      element: 47, elementName: "Dark 2", elementShortName: "Dark",
      scale: 1, scaleName: "Medium",
      race: 7, raceName: "DemiHuman",
      hit: 430, flee: 430,
      ai: "MONSTER_TYPE_21", mvp: 0, class: 0, attr: 0, res: 0, mres: 0, episode: 16
    }
  },
  "2159": {
    id: 2159, dbname: "CORRUPTED_CRUSADER", name: "Corrupted Crusader", spawn: "1@gl_he",
    stats: {
      attackRange: 1, level: 157, health: 240000, sp: 1,
      str: 120, int: 60, vit: 100, dex: 140, agi: 80, luk: 35,
      rechargeTime: 100,
      atk1: 1600, atk2: 620,
      attack: { minimum: 1600, maximum: 2220 },
      magicAttack: { minimum: 450, maximum: 700 },
      defense: 200, magicDefense: 50,
      baseExperience: 16000, jobExperience: 12800,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 200, attackSpeed: 672, attackedSpeed: 480,
      element: 47, elementName: "Dark 2", elementShortName: "Dark",
      scale: 1, scaleName: "Medium",
      race: 7, raceName: "DemiHuman",
      hit: 435, flee: 425,
      ai: "MONSTER_TYPE_21", mvp: 0, class: 0, attr: 0, res: 0, mres: 0, episode: 16
    }
  },

  // ===== Scaraba Hole mobs (EP 16) =====
  "2083": {
    id: 2083, dbname: "SCARABA", name: "Scaraba", spawn: "dic_dun02",
    stats: {
      attackRange: 1, level: 131, health: 51100, sp: 1,
      str: 44, int: 21, vit: 55, dex: 99, agi: 59, luk: 33,
      rechargeTime: 100,
      atk1: 882, atk2: 355,
      attack: { minimum: 882, maximum: 1237 },
      magicAttack: { minimum: 214, maximum: 269 },
      defense: 135, magicDefense: 20,
      baseExperience: 3393, jobExperience: 3439,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 200, attackSpeed: 672, attackedSpeed: 480,
      element: 22, elementName: "Earth 1", elementShortName: "Earth",
      scale: 0, scaleName: "Small",
      race: 4, raceName: "Insect",
      hit: 389, flee: 399,
      ai: "MONSTER_TYPE_07", mvp: 0, class: 0, attr: 0, res: 0, mres: 0, episode: 16
    }
  },
  "2084": {
    id: 2084, dbname: "ANTLER_SCARABA", name: "Antler Scaraba", spawn: "dic_dun03",
    stats: {
      attackRange: 1, level: 134, health: 58900, sp: 1,
      str: 44, int: 45, vit: 72, dex: 126, agi: 68, luk: 51,
      rechargeTime: 100,
      atk1: 1726, atk2: 774,
      attack: { minimum: 1726, maximum: 2500 },
      magicAttack: { minimum: 252, maximum: 315 },
      defense: 150, magicDefense: 38,
      baseExperience: 2890, jobExperience: 3000,
      aggroRange: 10, escapeRange: 12,
      movementSpeed: 150, attackSpeed: 360, attackedSpeed: 480,
      element: 22, elementName: "Earth 1", elementShortName: "Earth",
      scale: 1, scaleName: "Medium",
      race: 4, raceName: "Insect",
      hit: 402, flee: 430,
      ai: "MONSTER_TYPE_07", mvp: 0, class: 0, attr: 0, res: 0, mres: 0, episode: 16
    }
  }
};

let addedCount = 0;
for (const [id, data] of Object.entries(newMonsters)) {
  if (!monsters[id]) {
    monsters[id] = data;
    addedCount++;
    console.log(`  Added: ${id} - ${data.name}`);
  } else {
    console.log(`  Skipped (already exists): ${id} - ${data.name}`);
  }
}

fs.writeFileSync(monsterFile, JSON.stringify(monsters, null, 2), 'utf-8');

const afterCount = Object.keys(monsters).length;
console.log(`\nMonsters added: ${addedCount}`);
console.log(`Total monsters: ${beforeCount} -> ${afterCount}`);
