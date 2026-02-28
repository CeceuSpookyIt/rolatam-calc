// ============================================================
// EP17.2 Automatic Modification Modules
// Reference: Divine Pride EP17.2 enchant table
// ============================================================

// --- Epic modules (skill-specific) — Armor A/B only, max 2 ---
export const autoModEpic = [
  'Auto_Module_Db',   // Dragon Breath
  'Auto_Module_Wb',   // Wave Break
  'Auto_Module_Hs',   // Hundred Spiral
  'Auto_Module_Dp',   // Drive Press
  'Auto_Module_Vc',   // Vanishing Cannon
  'Auto_Module_Gg',   // Genesis Gloria
  'Auto_Module_Bc',   // Boost Cannon
  'Auto_Module_If',   // Ice Flame
  'Auto_Module_Ts',   // Tornado Swing
  'Auto_Module_Ct',   // Cannon Tornado
  'Auto_Module_Cm',   // Crazy Mandragora
  'Auto_Module_Ae',   // Acid Explosion
  'Auto_Module_Si',   // Sonic Impact
  'Auto_Module_Cs',   // Cutter Slasher
  'Auto_Module_Bs',   // Berserk Slash
  'Auto_Module_Fr',   // Fatal Raid
  'Auto_Module_Ss',   // Shadow Spell
  'Auto_Module_As',   // Angle Shot
  'Auto_Module_Ce',   // Crimson Strain
  'Auto_Module_Jl',   // Jack Lightning
  'Auto_Module_Cv',   // Comet Vortex
  'Auto_Module_Dbl',  // Double Bolt
  'Auto_Module_Ww',   // Warmer Wave
  'Auto_Module_Dg',   // Diamond Grave
  'Auto_Module_Mg',   // Magnus
  'Auto_Module_Hj',   // Holy Judex
  'Auto_Module_Du',   // Duple Light
  'Auto_Module_Ft',   // Fallen Tiger
  'Auto_Module_Ra',   // Rampage Arrow
  'Auto_Module_Rc',   // Raging Crush
  'Auto_Module_Cl',   // Cluster
  'Auto_Module_Bs2',  // Breeze Shooting
  'Auto_Module_Ab',   // Aimed Storm
  'Auto_Module_Me',   // Metallic Echo
  'Auto_Module_Rev',  // Reverberation
  'Auto_Module_Vs',   // Vulcan Severe
  'Auto_Module_Be',   // Blaze Explosion
  'Auto_Module_Mk',   // Moon Kick
  'Auto_Module_Ff',   // Falling Flash
  'Auto_Module_Ew',   // Esma/Eswhoo
  'Auto_Module_Esp',  // Espa
  'Auto_Module_Cx',   // Curse Explosion
  'Auto_Module_Dh',   // Death Hammer Dance
  'Auto_Module_Fh',   // Fire Howling Tail
  'Auto_Module_Sb',   // Storm Buster Trip
  'Auto_Module_Ps',   // Petal Spear Blade
  'Auto_Module_Csl',  // Cross Slash
  'Auto_Module_Dd',   // Dragon Draft Wind
  'Auto_Module_Sea',  // Power of Sea
  'Auto_Module_Land', // Power of Land
  'Auto_Module_Life', // Power of Life
];

// --- Per-equipment module lists ---

// Armor A/B: Normal(DEF,MDEF) + Rare(ATK,MATK,Shooter) + Unique(armor) + Epic
export const autoArmorModules = [
  'Auto_Module_A',    // Defense (Normal, max 3)
  'Auto_Module_A2',   // Magic Defense (Normal, max 3)
  'Auto_Module_B10',  // Attack Power (Rare, max 2)
  'Auto_Module_B11',  // Magic Power (Rare, max 2)
  'Auto_Module_B12',  // Sharpshooter/Shooter (Rare, max 2)
  'Auto_Module_C2',   // Magical Force (Unique, max 1)
  'Auto_Module_C3',   // Attacker Force (Unique, max 1)
  'Auto_Module_C',    // Range Force (Unique, max 1)
  'Auto_Module_C4',   // Critical Force (Unique, max 1)
  // 'Auto_Module_C5', // Recovery Force (Unique, max 1) — TBD: add to item.json
  // 'Auto_Module_C11',// Mirror Counter (Unique, max 1) — TBD: add to item.json
  'Auto_Module_C6',   // Delay after skill (Unique, max 1)
  'Auto_Module_C8',   // Power Force (Unique, max 1)
  ...autoModEpic,
];

// Engine Wing A/B: Normal(DEF,MDEF) + Rare(Fast,Caster,Critical) + Unique(engine)
export const autoEngineModules = [
  'Auto_Module_A',    // Defense (Normal, max 3)
  'Auto_Module_A2',   // Magic Defense (Normal, max 3)
  // 'Auto_Module_B7', // Fast (Rare, max 2) — TBD: add to item.json
  'Auto_Module_B14',  // Caster (Rare, max 2)
  'Auto_Module_B15',  // Critical (Rare, max 2)
  // 'Auto_Module_C12',// Above All (Unique, max 1) — TBD: add to item.json
  'Auto_Module_C9',   // Powerful (Unique, max 1)
  // 'Auto_Module_C13',// Reflection Reject (Unique, max 1) — TBD: add to item.json
];

// Leg A/B: Normal(DEF,MDEF) + Rare(Vital,Mental,Heal) + Unique(leg) + Legendary
export const autoLegModules = [
  'Auto_Module_A',    // Defense (Normal, max 3)
  'Auto_Module_A2',   // Magic Defense (Normal, max 3)
  // 'Auto_Module_B8', // Vital (Rare, max 2) — TBD: add to item.json
  // 'Auto_Module_B9', // Mental (Rare, max 2) — TBD: add to item.json
  // 'Auto_Module_B16',// Heal (Rare, max 2) — TBD: add to item.json
  'Auto_Module_C7',   // Fixed Casting (Unique, max 1)
  // 'Auto_Module_C14',// Robust (Unique, max 1) — TBD: add to item.json
  // Legendary — TBD: add to item.json
  // 'Auto_Module_L1', // Unlimited Vital
  // 'Auto_Module_L2', // Spell Buster
  // 'Auto_Module_L3', // Firing Shot
  // 'Auto_Module_L4', // Overpower
  // 'Auto_Module_L5', // Fatal Flash
  // 'Auto_Module_L6', // Lucky Strike
];

// Accessory Right (Booster R, Battle Chip R):
// Normal(VIT,LUK,STR,AGI,HP Recovery) + Rare(Spell,ASPD,Fatal,Expert Archer)
// + Unique(Drain Life, Magic Healing, All Force)
export const autoAccRModules = [
  'Auto_Module_A3',   // VIT (Normal, max 2)
  'Auto_Module_A4',   // LUK (Normal, max 2)
  'Auto_Module_A5',   // STR (Normal, max 2)
  'Auto_Module_A6',   // AGI (Normal, max 2)
  // 'Auto_Module_A9', // HP Recovery (Normal, max 2) — TBD: add to item.json
  'Auto_Module_B3',   // Spell (Rare, max 1)
  'Auto_Module_B4',   // Attack Speed (Rare, max 1)
  'Auto_Module_B5',   // Fatal (Rare, max 1)
  'Auto_Module_B6',   // Expert Archer (Rare, max 1)
  // 'Auto_Module_C15',// Drain Life (Unique, max 1) — TBD: add to item.json
  // 'Auto_Module_C16',// Magic Healing (Unique, max 1) — TBD: add to item.json
  'Auto_Module_C10',  // All Force (Unique, max 1)
];

// Accessory Left (Booster L, Battle Chip L):
// Normal(VIT,LUK,INT,DEX,SP Recovery) + Rare(Spell,ASPD,Fatal,Expert Archer)
// + Unique(Drain Soul, Magic Soul, All Force)
export const autoAccLModules = [
  'Auto_Module_A3',   // VIT (Normal, max 2)
  'Auto_Module_A4',   // LUK (Normal, max 2)
  'Auto_Module_A7',   // INT (Normal, max 2)
  'Auto_Module_A8',   // DEX (Normal, max 2)
  // 'Auto_Module_A10',// SP Recovery (Normal, max 2) — TBD: add to item.json
  'Auto_Module_B3',   // Spell (Rare, max 1)
  'Auto_Module_B4',   // Attack Speed (Rare, max 1)
  'Auto_Module_B5',   // Fatal (Rare, max 1)
  'Auto_Module_B6',   // Expert Archer (Rare, max 1)
  // 'Auto_Module_C17',// Drain Soul (Unique, max 1) — TBD: add to item.json
  // 'Auto_Module_C18',// Magic Soul (Unique, max 1) — TBD: add to item.json
  'Auto_Module_C10',  // All Force (Unique, max 1)
];

// --- Max enchant per module (default is 1 if not listed) ---
export const moduleMaxEnchant: Record<string, number> = {
  // Normal — Defense/MDEF: max 3
  'Auto_Module_A': 3,
  'Auto_Module_A2': 3,
  // Normal — Stats: max 2
  'Auto_Module_A3': 2,   // VIT
  'Auto_Module_A4': 2,   // LUK
  'Auto_Module_A5': 2,   // STR
  'Auto_Module_A6': 2,   // AGI
  'Auto_Module_A7': 2,   // INT
  'Auto_Module_A8': 2,   // DEX
  // Rare — Armor: max 2
  'Auto_Module_B10': 2,  // Attack Power
  'Auto_Module_B11': 2,  // Magic Power
  'Auto_Module_B12': 2,  // Sharpshooter
  // Rare — Engine: max 2
  'Auto_Module_B14': 2,  // Caster
  'Auto_Module_B15': 2,  // Critical
  // Epic — max 2
  ...Object.fromEntries(autoModEpic.map(aegis => [aegis, 2])),
  // Everything else defaults to 1 (Rare acc, Unique, Legendary)
};

/** Helper: get max enchant for a module aegisName. Returns 1 if not found. */
export function getModuleMaxEnchant(aegisName: string): number {
  return moduleMaxEnchant[aegisName] ?? 1;
}
