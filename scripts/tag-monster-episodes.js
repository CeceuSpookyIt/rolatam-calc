const fs = require('fs');
const path = require('path');

const monsterPath = path.join(__dirname, '..', 'src', 'assets', 'demo', 'data', 'monster.json');
const monsters = JSON.parse(fs.readFileSync(monsterPath, 'utf-8'));

const mapToEpisode = {
  // Pre-renewal / Classic / Test
  iz_ac01: 0, hero_tra: 0, tra_fild: 0, prontera: 0, beach_dun2: 0,

  // EP 13 - Nameless Island, Abyss Lake
  abbey01: 13, abbey02: 13, abbey03: 13, nameless_n: 13,
  abyss_01: 13, abyss_02: 13, abyss_03: 13,

  // EP 14 - Lighthalzen, Biolabs, Kiel
  lhz_dun02: 14, lhz_dun03: 14, lhz_dun04: 14,
  kh_dun02: 14,

  // EP 15 - Lasagna, Thanatos, Thor, Odin, Morroc
  lasa_dun02: 15, lasa_dun03: 15,
  tha_t09: 15, tha_t10: 15, tha_t11: 15, tha_t12: 15,
  thor_v03: 15,
  odin_tem03: 15,
  ra_san05: 15, moc_prydn2: 15,

  // EP 16 - Illusion Dungeons, Rudus, Glast Heim, Power Plant, Lost Valley
  tur_d03_i: 16, tur_d04_i: 16,
  com_d02_i: 16, ant_d02_i: 16, prt_mz03_i: 16,
  iz_d04_i: 16, iz_d05_i: 16,
  sp_rudus2: 16, sp_rudus3: 16,
  gl_cas01_: 16,
  ba_lost: 16, ba_pw03: 16,
  '1@gl_he': 16,
  gld2_ald: 16,

  // EP 17.1 - Oz Labyrinth, Magma 3, Mina 3, Odin Past, Abyss 4, Rudus 4, Lab 5
  oz_dun01: 17.1, oz_dun02: 17.1,
  ra_fild10: 17.1, ra_fild11: 17.1,
  mag_dun03: 17.1,
  ein_dun03: 17.1,
  odin_past: 17.1,
  abyss_04: 17.1,
  sp_rudus4: 17.1,
  lhz_dun_n: 17.1,

  // EP 17.2 - Amicitia, Nifheim, Clock Tower Unknown
  amicitia1: 17.2, amicitia2: 17.2,
  nif_dun01: 17.2, nif_dun02: 17.2,
  clock_01: 17.2,
  MD_BETELGEUSE: 17.2,

  // EP 18 - Varmundt's Mansion
  bl_ice: 18, bl_grass: 18, bl_lava: 18, bl_death: 18,

  // EP 19 - Jormungand
  jor_tail: 19, jor_back1: 19, jor_back2: 19, jor_back3: 19,
  jor_back4: 19, jor_back5: 19, jor_back6: 19,
  jor_dun01: 19, jor_dun02: 19, jor_ab01: 19, jor_ab02: 19,
};

const manualEpisodes = {
  // Biolabs MVPs (EP 14)
  1646: 14, // Lord Knight Seyren
  1651: 14, // High Wizard Kathryne

  // EP 15
  1708: 15, // Thanatos Phantom
  2476: 15, // Amdarais (Old)
  2529: 15, // Faceworm Queen
  2564: 15, // Fenrir
  3097: 15, // Morocc the Desperate god
  3429: 15, // Orc Hero
  3430: 15, // Tao Gunka
  3450: 15, // Bijou
  3796: 15, // Awaken Ktullanux
  3804: 15, // Ominous Turtle General

  // EP 16
  3150: 16, // Amdarais (new)
  3220: 16, // Guillotine Cross Eremes
  3223: 16, // Mechanic Howard
  3240: 16, // Royal Guard Randel
  3484: 16, // Stefan.J.E.Wolf
  20260: 16, // Shining Teddy Bear
  20340: 16, // EL-A17T (Charleston)
  20346: 16, // Miguel (Charleston)
  20386: 16, // Curse-swallowed King (low)
  20387: 16, // Curse-swallowed King (high)
  20536: 16, // Unknown Swordsman

  // EP 17.1
  20573: 17.1, // Phantom of Amdarais
  20621: 17.1, // Senior Red Pepper
  20668: 17.1, // Grand Papillia
  20785: 17.1, // Broken Memory of Thanatos

  // EP 17.2
  20892: 17.2, // Sakray
  20893: 17.2, // Tiara
  21361: 17.2, // Twisted God Freyja
};

function getEpisodeFromSpawn(spawnStr) {
  if (!spawnStr || spawnStr.trim() === '') return null;
  const maps = spawnStr.split(',').map(s => s.trim());
  let minEpisode = null;
  for (const map of maps) {
    if (mapToEpisode[map] !== undefined) {
      const ep = mapToEpisode[map];
      if (minEpisode === null || ep < minEpisode) {
        minEpisode = ep;
      }
    }
  }
  return minEpisode;
}

const episodeCounts = {};
let total = 0;

for (const [id, monster] of Object.entries(monsters)) {
  let episode = null;

  // 1. Try manual override
  if (manualEpisodes[Number(id)] !== undefined) {
    episode = manualEpisodes[Number(id)];
  }

  // 2. Try spawn map
  if (episode === null) {
    episode = getEpisodeFromSpawn(monster.spawn);
  }

  // 3. Default
  if (episode === null) {
    episode = 0;
  }

  monster.stats.episode = episode;
  episodeCounts[episode] = (episodeCounts[episode] || 0) + 1;
  total++;
}

fs.writeFileSync(monsterPath, JSON.stringify(monsters, null, 2), 'utf-8');

console.log(`Tagged ${total} monsters with episodes.\n`);
console.log('Monsters per episode:');
const sortedEpisodes = Object.keys(episodeCounts).map(Number).sort((a, b) => a - b);
for (const ep of sortedEpisodes) {
  console.log(`  Episode ${ep}: ${episodeCounts[ep]}`);
}
