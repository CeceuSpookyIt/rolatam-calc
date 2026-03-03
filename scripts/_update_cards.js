'use strict';
// Script to update 75+ cards in item.json with proper metadata and scripts.
const fs = require('fs');
const path = require('path');

const ITEM_JSON_PATH = path.resolve(__dirname, '../src/assets/demo/data/item.json');

// compositionPos mapping
// Arma=0, Capa=4, Acessório(Direita/Direito)=8, Armadura=16, Escudo=32,
// Calçado=64, Acessório(Esquerdo)=128, Acessório(genérico)=136, Elmo/Equip.Cabeça=769

const CARD_UPDATES = [
  // ==========================================
  // GROUP 1: Einbech/Dragon (300001-300021)
  // ==========================================
  {
    id: '300001',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 0, // Arma
    script: {
      p_element_poison: ['25', 'EQUIP[Carta Anaconda]15'],
    },
  },
  {
    id: '300002',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 16, // Armadura
    script: {
      hpPercent: ['10', 'EQUIP[Carta Nuvem Tóxica]5'],
    },
  },
  {
    id: '300003',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 64, // Calçado
    script: {
      atk: ['20', 'EQUIP[Carta Porcellio]10', '1---1'],
    },
  },
  {
    id: '300004',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 4, // Capa
    script: {
      def: ['30', 'EQUIP[Carta Mineral]20', '1---3'],
    },
  },
  {
    id: '300005',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 64, // Calçado
    script: {
      hpPercent: ['10'],
      'Nerthus Punishment': ['10', 'EQUIP[Carta Mineiros]10'],
    },
  },
  {
    id: '300006',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 128, // Acessório Esquerdo
    script: {
      m_element_neutral: ['EQUIP[Ungoliant]30'],
    },
  },
  {
    id: '300007',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 16, // Armadura
    script: {
      p_race_formless: ['40'],
      p_race_plant: ['40'],
      p_element_fire: ['40'],
      p_element_water: ['40'],
    },
  },
  {
    id: '300008',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 0, // Arma
    script: {
      m_race_demon: ['10', 'EQUIP[Carta Skeggiold]2---3'],
    },
  },
  {
    id: '300009',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 0, // Arma
    script: {
      m_element_fire: ['10', '10===10', '14===10'],
    },
  },
  {
    id: '300010',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 0, // Arma
    script: {
      m_element_wind: ['10', '10===10', '14===10'],
    },
  },
  {
    id: '300011',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 0, // Arma
    script: {
      m_element_holy: ['10', '10===10', '14===10'],
    },
  },
  {
    id: '300012',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 64, // Calçado
    script: {
      healingPlus: ['5', '7===3', '9===2'],
    },
  },
  {
    id: '300013',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 16, // Armadura
    script: {
      atkPercent: ['30', 'EQUIP[Carta Valquíria Randgris]10'],
      hpPercent: ['-15', 'EQUIP[Carta Valquíria Randgris]5'],
    },
  },
  {
    id: '300014',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 16, // Armadura
    script: {
      hpPercent: ['40', 'EQUIP[Carta Valquíria Randgris]10'],
      atkPercent: ['-15', 'EQUIP[Carta Valquíria Randgris]5'],
    },
  },
  {
    id: '300015',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 769, // Elmo
    script: {
      atkPercent: ['3', '4---1'],
      hpPercent: ['-5'],
      spPercent: ['-5'],
    },
  },
  {
    id: '300016',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 4, // Capa
    script: {
      flee: ['30'],
      cri: ['5'],
      criDmg: ['EQUIP[Carta Mimico Antigo]1---2'],
    },
  },
  {
    id: '300017',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 0, // Arma
    script: {
      p_element_dark: ['25', 'EQUIP[Carta Poring Noel]15'],
    },
  },
  {
    id: '300018',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 0, // Arma
    script: {
      p_element_holy: ['25', 'EQUIP[Carta Orc Esqueleto]15'],
    },
  },
  {
    id: '300019',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 128, // Acessório Esquerdo
    script: {
      p_race_dragon: ['5', 'EQUIP[Carta Acidus Esqueleto]5'],
    },
  },
  {
    id: '300020',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 8, // Acessório Direita
    script: {
      p_race_brute: ['5', 'EQUIP[Carta Ferus Esqueleto]5'],
    },
  },
  {
    id: '300021',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 16, // Armadura
    script: {
      p_race_dragon: ['40'],
      p_race_undead: ['40'],
      p_element_undead: ['40'],
      p_element_dark: ['40'],
    },
  },

  // ==========================================
  // GROUP 2: Sauna/Pitaya (300076-300130)
  // ==========================================

  // 300076 Carta Guarda Quebrada - Acessório (generic) → 136
  // VIT+3, MHP+10%, Sightless Mind +10%, Cannon Spear +10%
  // Combo w/ Carta Verporta: +20% both skills (simplified from 3-card combo)
  {
    id: '300076',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 136, // Acessório
    script: {
      vit: ['3'],
      hpPercent: ['10'],
      'Sightless Mind': ['10', 'EQUIP[Carta Verporta]20'],
      'Cannon Spear': ['10', 'EQUIP[Carta Verporta]20'],
    },
  },

  // 300077 Carta Ômega Quebrada - Acessório → 136
  // DEX+2, VIT+1, MHP+10%, Axe Boomerang +10%, Gatling Fever +10%
  // Combo w/ Carta Kick & Kick: +20% both (simplified)
  {
    id: '300077',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 136, // Acessório
    script: {
      dex: ['2'],
      vit: ['1'],
      hpPercent: ['10'],
      'Axe Boomerang': ['10', 'EQUIP[Carta Kick & Kick]20'],
      'Gatling Fever': ['10', 'EQUIP[Carta Kick & Kick]20'],
    },
  },

  // 300078 Carta Sweety - Arma
  // Descarregar Tambor (Gatling Fever) damage +60%
  // NOTE: "Descarregar Tambor" → "Gatling Fever" per skill-name-map.json
  // But "Viagem de Ida" → "Round Trip". "Descarregar Tambor" is Gatling Fever.
  // However based on the plan context "Round Trip" was suggested.
  // skill-name-map says "Descarregar Tambor": "Gatling Fever" — using that.
  {
    id: '300078',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 0, // Arma
    script: {
      'Gatling Fever': ['60'],
    },
  },

  // 300079 Carta Pimentinha - Armadura
  // +30% magic dmg vs Formless and Fish races
  // +30% magic dmg vs Holy and Water element
  {
    id: '300079',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 16, // Armadura
    script: {
      m_race_formless: ['30'],
      m_race_fish: ['30'],
      m_element_holy: ['30'],
      m_element_water: ['30'],
    },
  },

  // 300080 Carta Jardineira Quebrada Avançada - Armadura
  // +50% magic dmg vs Formless and Fish races
  // +50% magic dmg vs Holy and Water element
  {
    id: '300080',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 16, // Armadura
    script: {
      m_race_formless: ['50'],
      m_race_fish: ['50'],
      m_element_holy: ['50'],
      m_element_water: ['50'],
    },
  },

  // 300081 Carta Assistente - Calçado
  // INT+2, MHP+10%, MSP+10%, Fire Ball +25%
  // "Bolas de Fogo" → "Fire Ball"
  {
    id: '300081',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 64, // Calçado
    script: {
      int: ['2'],
      hpPercent: ['10'],
      spPercent: ['10'],
      'Fire Ball': ['25'],
    },
  },

  // 300082 Fada das Águas Avançada - Arma
  // If 1H or 2H spear: ranged phys ATK +10%, per 2 refines +2% more
  // (weapon type condition not trackable — apply as general ranged bonus)
  {
    id: '300082',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 0, // Arma
    script: {
      range: ['10', '2---2'],
    },
  },

  // 300083 Carta Raflésia Seca - Calçado
  // AGI+2, MHP+10%, MSP+10%
  // Freezing Spear +15%, Throw Shuriken +15%
  // "Lança Congelante" → "Freezing Spear", "Arremessar Kunai" → "Kunai Splash" (see map: "Chuva de Kunais": "Kunai Splash")
  // Actually "Arremessar Kunai" is not in skill-name-map directly. "Arremessar Shuriken" → "Throw Shuriken"
  // and "Kunai Explosiva" → "Kunai Explosion", "Chuva de Kunais" → "Kunai Splash"
  // "Arremessar Kunai" most likely = "Throw Shuriken" in context of Kagerou/Oboro.
  {
    id: '300083',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 64, // Calçado
    script: {
      agi: ['2'],
      hpPercent: ['10'],
      spPercent: ['10'],
      'Freezing Spear': ['15'],
      'Throw Shuriken': ['15'],
    },
  },

  // 300084 Pimentinha Avançada - Capa
  // Resistance to Holy property attacks +30%, Flee +5
  // (damage reduction not tracked by calc, skip; flee is tracked)
  {
    id: '300084',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 4, // Capa
    script: {
      flee: ['5'],
    },
  },

  // 300085 Carta Alnoldi Comum - Calçado
  // STR+2, MHP+10%, MSP+10%
  // ATK+7 per level of Kihop skill (not trackable easily — skip Kihop scaling)
  {
    id: '300085',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 64, // Calçado
    script: {
      str: ['2'],
      hpPercent: ['10'],
      spPercent: ['10'],
    },
  },

  // 300086 Dispositivo Automático Avanç. (Físico) - Arma
  // If 2H sword: melee phys dmg +10%, per 1 refine +1% more
  {
    id: '300086',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 0, // Arma
    script: {
      melee: ['10', '1---1'],
    },
  },

  // 300087 Carta Jardineira Quebrada - Calçado
  // VIT+2, MHP+10%, MSP+10%
  // Silvervine Stem Spear +10%, Tarou Card skill +10%
  // "Lança Gateira" → "Silvervine Stem Spear", "Ferida de Tarou" → "Tarou Card"
  {
    id: '300087',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 64, // Calçado
    script: {
      vit: ['2'],
      hpPercent: ['10'],
      spPercent: ['10'],
      'Silvervine Stem Spear': ['10'],
      'Tarou Card': ['10'],
    },
  },

  // 300088 Carta Jardineira Quebrada Avançada - Arma
  // If book weapon: HIT+20, ATK+5%
  // Per 1 refine: melee phys dmg +1%
  // At refine +10 or more: Moon Kick +15%, Star Rain +15%
  {
    id: '300088',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 0, // Arma
    script: {
      hit: ['20'],
      atkPercent: ['5', '1---1'],
      'Moon Kick': ['10===15'],
      'Star Rain': ['10===15'],
    },
  },

  // 300089 Carta Verporta - Calçado
  // STR+2, MHP+10%, MSP+10%
  // Ignition Break +25%
  // "Impacto Explosivo" → "Ignition Break"
  {
    id: '300089',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 64, // Calçado
    script: {
      str: ['2'],
      hpPercent: ['10'],
      spPercent: ['10'],
      'Ignition Break': ['25'],
    },
  },

  // 300090 Carta Verporte - Calçado
  // DoT magic damage +10%
  // At refine +9: DoT magic damage +10% more
  // (DoT/duration damage — no direct key in calc; using generic dmg key not available;
  //  skip — no clear mapping. Leave script empty or use a placeholder)
  // Actually no clear calc key for "dano mágico de duração". Skip script for now.
  {
    id: '300090',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 64, // Calçado
    script: {},
  },

  // 300091 Carta Papila - Calçado
  // DEX+2, MHP+10%, MSP+10%
  // Desperado +10%, Spread Shot +10%
  // "Ataque Total" → "Spread Shot", "Disparo Espalhado" → "Spread Shot"
  {
    id: '300091',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 64, // Calçado
    script: {
      dex: ['2'],
      hpPercent: ['10'],
      spPercent: ['10'],
      Desperado: ['10'],
      'Spread Shot': ['10'],
    },
  },

  // 300092 Papila Ruba Avançada - Calçado
  // VIT+2, MHP+10%, MSP+10%
  // Brandish Spear +50%
  // "Cavalo-de-Pau" → "Brandish Spear"
  {
    id: '300092',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 64, // Calçado
    script: {
      vit: ['2'],
      hpPercent: ['10'],
      spPercent: ['10'],
      'Brandish Spear': ['50'],
    },
  },

  // 300093 Carta Papila Vermelha - Calçado
  // INT+2, MHP+10%, MSP+10%
  // Holy Light +50%
  // "Luz Divina" → "Holy Light"
  {
    id: '300093',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 64, // Calçado
    script: {
      int: ['2'],
      hpPercent: ['10'],
      spPercent: ['10'],
      'Holy Light': ['50'],
    },
  },

  // 300094 Papila Avançada - Arma
  // If 2H sword: crit dmg +20%, per 2 refines +2% more
  {
    id: '300094',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 0, // Arma
    script: {
      criDmg: ['20', '2---2'],
    },
  },

  // 300095 Carta Papila Azul - Calçado
  // DEX+2, MHP+10%, MSP+10%
  // Arrow Shower +25%
  // "Chuva de Flechas" → "Arrow Shower"
  {
    id: '300095',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 64, // Calçado
    script: {
      dex: ['2'],
      hpPercent: ['10'],
      spPercent: ['10'],
      'Arrow Shower': ['25'],
    },
  },

  // 300096 Papila Avançada - Arma
  // If instrument or whip: MATK+20
  // At refine +10: MATK+20, vct -10%
  // At refine +13: MATK+20
  {
    id: '300096',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 0, // Arma
    script: {
      matk: ['20', '10===20', '13===20'],
      vct: ['10===10'],
    },
  },

  // 300097 Carta Fada das Águas - Calçado
  // AGI+2, MHP+10%, MSP+10%
  // Envenom +25%
  // "Envenenar" → "Envenom"
  {
    id: '300097',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 64, // Calçado
    script: {
      agi: ['2'],
      hpPercent: ['10'],
      spPercent: ['10'],
      Envenom: ['25'],
    },
  },

  // 300098 Raflésia Seca Avançada - Capa
  // MATK+5, Wind Blade +10%, Freezing Spear +10%, Flaming Petals +10%
  // At refine +7: vct -5%
  // "Lâmina de Vento" → "Wind Blade", "Lança Congelante" → "Freezing Spear"
  // "Pétalas Flamejantes" → "Flaming Petals"
  {
    id: '300098',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 4, // Capa
    script: {
      matk: ['5'],
      'Wind Blade': ['10'],
      'Freezing Spear': ['10'],
      'Flaming Petals': ['10'],
      vct: ['7===5'],
    },
  },

  // 300099 Carta Papilia Violeta - Escudo
  // Reduce dmg from Normal class -20% (defensive, skip)
  // Healing received +15%
  {
    id: '300099',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 32, // Escudo
    script: {
      healRecovery: ['15'],
    },
  },

  // 300100 Carta Papilia Rubra - Escudo
  // Reduce dmg from Boss class -25% (defensive, skip)
  // Healing received +30%
  {
    id: '300100',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 32, // Escudo
    script: {
      healRecovery: ['30'],
    },
  },

  // 300101 Carta Massagista Quebrado - Acessório → 136
  // STR+3, MHP+10%, Dragon Breath +10%, Dragon Breath - WATER +10%
  // Combo w/ Carta Verporta: +20% both (simplified 3-card)
  {
    id: '300101',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 136, // Acessório
    script: {
      str: ['3'],
      hpPercent: ['10'],
      'Dragon Breath': ['10', 'EQUIP[Carta Verporta]20'],
      'Dragon Breath - WATER': ['10', 'EQUIP[Carta Verporta]20'],
    },
  },

  // 300102 Carta Gerente da Sauna - Acessório → 136
  // INT+3, MHP+10%, Proton Cannon +10%, Spore Explosion +10%
  // Combo w/ Carta Esqueleto Arqueiro Imortal: +20% both (simplified 3-card)
  {
    id: '300102',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 136, // Acessório
    script: {
      int: ['3'],
      hpPercent: ['10'],
      'Proton Cannon': ['10', 'EQUIP[Carta Esqueleto Arqueiro Imortal]20'],
      'Spore Explosion': ['10', 'EQUIP[Carta Esqueleto Arqueiro Imortal]20'],
    },
  },

  // 300103 Carta Princesa Azure - Calçado
  // MATK+15
  // At refine +9: +10% magic dmg vs Fish and Demihuman
  // At refine +11: ACD -3%
  {
    id: '300103',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 64, // Calçado
    script: {
      matk: ['15'],
      m_race_fish: ['9===10'],
      m_race_demihuman: ['9===10'],
      acd: ['11===3'],
    },
  },

  // 300104 Carta Traça-de-Livro - Acessório → 136
  // INT+2, VIT+1, MHP+10%, Psychic Wave +10%, Diamond Dust +10%
  // Combo w/ Carta Pitaya Azul: +20% both (simplified 3-card)
  {
    id: '300104',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 136, // Acessório
    script: {
      int: ['2'],
      vit: ['1'],
      hpPercent: ['10'],
      'Psychic Wave': ['10', 'EQUIP[Carta Pitaya Azul]20'],
      'Diamond Dust': ['10', 'EQUIP[Carta Pitaya Azul]20'],
    },
  },

  // 300105 Carta Grimório Errante - Acessório → 136
  // INT+3, MHP+5%, MSP+5%, Crimson Rock +10%, Comet +10%
  // Combo w/ Carta Pitaya Vermelha: +20% both (simplified 3-card)
  {
    id: '300105',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 136, // Acessório
    script: {
      int: ['3'],
      hpPercent: ['5'],
      spPercent: ['5'],
      'Crimson Rock': ['10', 'EQUIP[Carta Pitaya Vermelha]20'],
      Comet: ['10', 'EQUIP[Carta Pitaya Vermelha]20'],
    },
  },

  // 300106 Carta Pitaya Vermelha - Arma
  // If 1H or 2H staff: fire magic dmg +10%
  // At refine +10: +10% more
  // At refine +14: +10% more
  {
    id: '300106',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 0, // Arma
    script: {
      m_element_fire: ['10', '10===10', '14===10'],
    },
  },

  // 300107 Carta Árvore de Pitaya - Acessório → 136
  // Apple and Banana recovery +500% (consumable effect — not tracked in calc)
  {
    id: '300107',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 136, // Acessório
    script: {},
  },

  // 300108 Carta Venenum Poluído - Acessório → 136
  // AGI+2, DEX+1, MHP+10%, Fatal Menace +10%, Double Strafe +10%
  // Combo w/ Carta Búfalo Estripador: +20% both (simplified 3-card)
  // "Ofensiva Fatal" → "Fatal Menace", "Disparo Triplo" → "Double Strafe"
  {
    id: '300108',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 136, // Acessório
    script: {
      agi: ['2'],
      dex: ['1'],
      hpPercent: ['10'],
      'Fatal Menace': ['10', 'EQUIP[Carta Búfalo Estripador]20'],
      'Double Strafe': ['10', 'EQUIP[Carta Búfalo Estripador]20'],
    },
  },

  // 300109 Carta Cãibra Poluído - Acessório → 136
  // DEX+2, STR+1, MHP+10%, Cross Slash +10%, Retaliation +10%
  // Combo w/ Dolor Mutante: +20% both (simplified 3-card)
  // "Lâminas de Loki" → "Cross Slash", "Retaliação" → "Retaliation"
  {
    id: '300109',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 136, // Acessório
    script: {
      dex: ['2'],
      str: ['1'],
      hpPercent: ['10'],
      'Cross Slash': ['10', 'EQUIP[Dolor Mutante]20'],
      Retaliation: ['10', 'EQUIP[Dolor Mutante]20'],
    },
  },

  // 300110 Carta Cachoeira Poluída - Acessório → 136
  // AGI+2, INT+1, MHP+10%, Kunai Explosion +10%, Cross Impact +10%
  // Combo w/ Carta Guarda-costas Sohyeon: +20% both (simplified 3-card)
  // "Kunai Explosiva" → "Kunai Explosion", "Corte em Cruz" → "Cross Impact"
  // skill-name-map: "Investida Fulminante" → "Cross Impact", "Impacto Cruzado" → "Cross Impact"
  {
    id: '300110',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 136, // Acessório
    script: {
      agi: ['2'],
      int: ['1'],
      hpPercent: ['10'],
      'Kunai Explosion': ['10', 'EQUIP[Carta Guarda-costas Sohyeon]20'],
      'Cross Impact': ['10', 'EQUIP[Carta Guarda-costas Sohyeon]20'],
    },
  },

  // 300111 Carta Bellare Elite - Acessório → 136
  // AGI+2, INT+1, MHP+10%
  // Flaming Petals +10%, Freezing Spear +10%, Wind Blade +10%
  // Combo w/ Carta E-EA1L: +20% all three (simplified 3-card)
  {
    id: '300111',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 136, // Acessório
    script: {
      agi: ['2'],
      int: ['1'],
      hpPercent: ['10'],
      'Flaming Petals': ['10', 'EQUIP[Carta E-EA1L]20'],
      'Freezing Spear': ['10', 'EQUIP[Carta E-EA1L]20'],
      'Wind Blade': ['10', 'EQUIP[Carta E-EA1L]20'],
    },
  },

  // 300112 Carta Dolor Viciada - Acessório → 136
  // INT+2, VIT+1, MHP+10%, Eswhoo +10%, Curse Explosion +10%
  // Combo w/ Carta Plaga Viciada: +20% both (simplified 3-card)
  // "Eswhoo" → "Eswhoo", "Necroexplosão" → "Curse Explosion"
  {
    id: '300112',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 136, // Acessório
    script: {
      int: ['2'],
      vit: ['1'],
      hpPercent: ['10'],
      Eswhoo: ['10', 'EQUIP[Carta Plaga Viciada]20'],
      'Curse Explosion': ['10', 'EQUIP[Carta Plaga Viciada]20'],
    },
  },

  // 300113 Carta Magia Liberta - Acessório → 136
  // INT+2, VIT+1, MHP+10%, Resonance +10%, Arrow Storm +10%
  // Combo w/ Papila Avançada: +20% both (simplified 3-card)
  // "Ressonância" → "Resonance", "Temporal de Flechas" → "Arrow Storm"
  {
    id: '300113',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 136, // Acessório
    script: {
      int: ['2'],
      vit: ['1'],
      hpPercent: ['10'],
      Resonance: ['10', 'EQUIP[Papila Avançada]20'],
      'Arrow Storm': ['10', 'EQUIP[Papila Avançada]20'],
    },
  },

  // 300114 Carta Plaga Viciada - Arma
  // If 1H or 2H staff: neutral magic dmg +10%
  // At refine +10: +10% more
  // At refine +14: +10% more
  {
    id: '300114',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 0, // Arma
    script: {
      m_element_neutral: ['10', '10===10', '14===10'],
    },
  },

  // 300115 Carta Sanare Viciada - Acessório → 136
  // INT+2, DEX+1, MHP+10%, Adoramus +10%, Judex +10%
  // Combo w/ Carta Sanare: +20% both (simplified 3-card)
  {
    id: '300115',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 136, // Acessório
    script: {
      int: ['2'],
      dex: ['1'],
      hpPercent: ['10'],
      Adoramus: ['10', 'EQUIP[Carta Sanare]20'],
      Judex: ['10', 'EQUIP[Carta Sanare]20'],
    },
  },

  // 300116 Carta de Plasma Poderosa - Acessório → 136
  // STR+2, INT+1, MHP+10%, Soul Expansion +10%, Tiger Cannon +10%
  // Combo w/ Carta Plaga Mutante: +20% both (simplified 3-card)
  // "Explosão Espiritual" → "Soul Expansion", "Garra de Tigre" → "Tiger Cannon"
  {
    id: '300116',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 136, // Acessório
    script: {
      str: ['2'],
      int: ['1'],
      hpPercent: ['10'],
      'Soul Expansion': ['10', 'EQUIP[Carta Plaga Mutante]20'],
      'Tiger Cannon': ['10', 'EQUIP[Carta Plaga Mutante]20'],
    },
  },

  // 300117 Carta Magia Intensa - Acessório → 136
  // DEX+2, AGI+1, MHP+10%, Arrow Storm +10%, Bomb +10%
  // Combo w/ Carta Esqueleto Arqueiro Imortal: +20% both (simplified 3-card)
  // "Tempestade de Flechas" → "Arrow Storm", "Bomba Relógio" → "Bomb"
  {
    id: '300117',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 136, // Acessório
    script: {
      dex: ['2'],
      agi: ['1'],
      hpPercent: ['10'],
      'Arrow Storm': ['10', 'EQUIP[Carta Esqueleto Arqueiro Imortal]20'],
      Bomb: ['10', 'EQUIP[Carta Esqueleto Arqueiro Imortal]20'],
    },
  },

  // 300118 Carta Fen Escaldado - Acessório → 136
  // STR+2, VIT+1, MHP+10%, Moon Kick +10%, Star Rain +10%
  // Combo w/ Carta Jardineira Quebrada Avançada: +20% both (simplified 3-card)
  // "Chute Lunar" → "Moon Kick", "Chuva Estelar" → "Star Rain"
  {
    id: '300118',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 136, // Acessório
    script: {
      str: ['2'],
      vit: ['1'],
      hpPercent: ['10'],
      'Moon Kick': ['10', 'EQUIP[Carta Jardineira Quebrada Avançada]20'],
      'Star Rain': ['10', 'EQUIP[Carta Jardineira Quebrada Avançada]20'],
    },
  },

  // 300119 Carta Peixe Escaldado - Acessório → 136
  // DEX+2, AGI+1, MHP+10%, Expiatio +10%, Soul Reaper +10%
  // Combo w/ Carta Belare Superior: +20% both (simplified 3-card)
  // "Expurgar" → "Expiatio", "Execução" → "Soul Reaper"
  {
    id: '300119',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 136, // Acessório
    script: {
      dex: ['2'],
      agi: ['1'],
      hpPercent: ['10'],
      Expiatio: ['10', 'EQUIP[Carta Belare Superior]20'],
      'Soul Reaper': ['10', 'EQUIP[Carta Belare Superior]20'],
    },
  },

  // 300120 Carta Carpa Escaldada - Acessório → 136
  // MATK+2%
  // Combo w/ Carta Espírito da Água: MATK+10, +15% water magic dmg
  {
    id: '300120',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 136, // Acessório
    script: {
      matkPercent: ['2'],
      matk: ['EQUIP[Carta Espírito da Água]10'],
      m_element_water: ['EQUIP[Carta Espírito da Água]15'],
    },
  },

  // 300121 Carta Marc Escaldado - Calçado
  // +5% magic dmg Holy and Water
  // Per 2 refines: +1% more Holy and Water magic dmg
  {
    id: '300121',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 64, // Calçado
    script: {
      m_element_holy: ['5', '2---1'],
      m_element_water: ['5', '2---1'],
    },
  },

  // 300122 Carta Pitaya Amarela - Capa
  // Neutral resistance +15% (defensive, skip)
  // +3% holy magic dmg per refine level
  // Combo w/ Carta Marc Escaldado: additional neutral resistance +5% (defensive, skip)
  {
    id: '300122',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 4, // Capa
    script: {
      m_element_holy: ['1---3'],
    },
  },

  // 300123 Carta Pitaya Roxa - Capa
  // Neutral resistance +15% (defensive, skip)
  // +3% neutral magic dmg per refine level
  // Combo w/ Carta Marc Escaldado: additional neutral resistance +5% (defensive, skip)
  {
    id: '300123',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 4, // Capa
    script: {
      m_element_neutral: ['1---3'],
    },
  },

  // 300124 Carta Pitaya Azul - Arma
  // If 1H or 2H staff: water magic dmg +10%
  // At refine +10: +10% more
  // At refine +14: +10% more
  {
    id: '300124',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 0, // Arma
    script: {
      m_element_water: ['10', '10===10', '14===10'],
    },
  },

  // 300125 Carta Pitaya Verde - Acessório → 136
  // VIT+2, INT+1, MHP+10%, Picky Peck +10%, Catnip Meteor +10%
  // Combo w/ Carta Plaga Viciada: +20% both (simplified 3-card)
  // "Chilique de Picky" → "Picky Peck", "Meteoros de Nepeta" → "Catnip Meteor"
  {
    id: '300125',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 136, // Acessório
    script: {
      vit: ['2'],
      int: ['1'],
      hpPercent: ['10'],
      'Picky Peck': ['10', 'EQUIP[Carta Plaga Viciada]20'],
      'Catnip Meteor': ['10', 'EQUIP[Carta Plaga Viciada]20'],
    },
  },

  // 300127 Carta Autógrafo de Wolf - Acessório Esquerdo → 128
  // No combat bonuses (autograph card, flavor only)
  {
    id: '300127',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 128, // Acessório Esquerdo
    script: {},
  },

  // 300128 Carta Wolf - Arma (already has correct typeId=6, but update compositionPos + ensure script ok)
  // Physical and magical dmg vs Insect +15%
  // Combo w/ Carta Po: atkPercent+5%, matkPercent+5%, p_size_m+5%, m_size_m+5%; also acd-3%
  {
    id: '300128',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 0, // Arma
    script: {
      p_race_insect: ['15'],
      m_race_insect: ['15'],
      acd: ['EQUIP[Carta Po]===3'],
      atkPercent: ['EQUIP[Carta Po]===5'],
      matkPercent: ['EQUIP[Carta Po]===5'],
      p_size_m: ['EQUIP[Carta Po]===5'],
      m_size_m: ['EQUIP[Carta Po]===5'],
    },
  },

  // 300129 Carta Autógrafo de Po - Acessório Esquerdo → 128
  // No combat bonuses (autograph card, flavor only)
  {
    id: '300129',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 128, // Acessório Esquerdo
    script: {},
  },

  // 300130 Carta Po - Arma (already has correct typeId=6, update compositionPos + script)
  // Physical and magical dmg vs Plant +15%
  // Combo w/ Carta Wolf: atkPercent+5%, matkPercent+5%, p_size_m+5%, m_size_m+5%
  {
    id: '300130',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 0, // Arma
    script: {
      p_race_plant: ['15'],
      m_race_plant: ['15'],
      atkPercent: ['EQUIP[Carta Wolf]===5'],
      matkPercent: ['EQUIP[Carta Wolf]===5'],
      p_size_m: ['EQUIP[Carta Wolf]===5'],
      m_size_m: ['EQUIP[Carta Wolf]===5'],
    },
  },

  // 300140 Carta Sropho Abismal - Arma
  // Wind magic dmg +3%
  // At refine +9: +2% more
  // At refine +11: +5% more
  {
    id: '300140',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 0, // Arma
    script: {
      m_element_wind: ['3', '9===2', '11===5'],
    },
  },

  // 300141 Carta Obeaune Abismal - Acessório → 136
  // MATK+30
  {
    id: '300141',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 136, // Acessório
    script: {
      matk: ['30'],
    },
  },

  // 300142 Carta Deviace Abismal - Arma
  // Fish race phys dmg +5%, Water element phys dmg +5%
  // At refine +7: +5% each more
  // At refine +9: +5% each more
  {
    id: '300142',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 0, // Arma
    script: {
      p_race_fish: ['5', '7===5', '9===5'],
      p_element_water: ['5', '7===5', '9===5'],
    },
  },

  // 300143 Carta Marse Abismal - Escudo → 32
  // Insect race resistance +15% (defensive, skip)
  // Earth property resistance +15% (defensive, skip)
  {
    id: '300143',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 32, // Escudo
    script: {},
  },

  // ==========================================
  // GROUP 3: Gatchaman (300732-300734)
  // ==========================================

  // 300732 Carta Gatchaman - Capa
  // Per 10 base levels up to 200: ATK+10, DEF+3, MDEF+1
  // At level 200: ATK+200, DEF+60, MDEF+20
  {
    id: '300732',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 4, // Capa
    script: {
      atk: ['200'],
      def: ['60'],
      mdef: ['20'],
    },
  },

  // 300733 Carta Galactor Gang - Capa
  // Per 10 base levels up to 200: MATK+10, DEF+3, MDEF+1
  // At level 200: MATK+200, DEF+60, MDEF+20
  {
    id: '300733',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 4, // Capa
    script: {
      matk: ['200'],
      def: ['60'],
      mdef: ['20'],
    },
  },

  // 300734 Carta Míssil Ave - Capa
  // Per 10 base levels up to 200: HP+100, DEF+3, MDEF+1
  // At level 200: HP+2000, DEF+60, MDEF+20
  {
    id: '300734',
    itemTypeId: 6,
    itemSubTypeId: 0,
    compositionPos: 4, // Capa
    script: {
      hp: ['2000'],
      def: ['60'],
      mdef: ['20'],
    },
  },
];

// ==========================================
// Apply updates
// ==========================================
console.log(`Reading ${ITEM_JSON_PATH}...`);
const raw = fs.readFileSync(ITEM_JSON_PATH, 'utf8');
const data = JSON.parse(raw);

let updated = 0;
let notFound = 0;

for (const update of CARD_UPDATES) {
  const item = data[update.id];
  if (!item) {
    console.warn(`WARNING: Item ${update.id} not found in item.json`);
    notFound++;
    continue;
  }

  item.itemTypeId = update.itemTypeId;
  item.itemSubTypeId = update.itemSubTypeId;
  item.compositionPos = update.compositionPos;
  item.script = update.script;

  updated++;
}

console.log(`Updated ${updated} cards. Not found: ${notFound}.`);

// Write back — match original formatting (2-space indent)
console.log('Writing back to item.json...');
const output = JSON.stringify(data, null, 2);
fs.writeFileSync(ITEM_JSON_PATH, output, 'utf8');
console.log('Done.');
