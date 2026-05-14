/**
 * Review fixes for 2026-05-12 LATAM update items.
 *
 * 1-2. Remove duplicate set-skill bonus from armor (also lives on the shield).
 * 3-6. Remove phantom skill set bonus from shields whose actual set bonus is acd.
 * 7.   Gate Elmo Real autocast on the Real-weapon set condition.
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ITEM_JSON_PATH = resolve(__dirname, '../src/assets/demo/data/item.json');
const items = JSON.parse(readFileSync(ITEM_JSON_PATH, 'utf-8'));

const REAL_WEAPONS = [
  'Cruz Real', 'Arco Real', 'Cetro Real', 'Katar Real', 'Livro Real',
  'Lança Real', 'Clava Real', 'Punhal Real', 'Espada Real', 'Lábris Real',
  'Alaúde Real', 'Chicote Real', 'Varinha Real', 'Machado Real',
  'Seringa Real', 'Bengala Real', 'Claymore Real', 'Soqueira Real',
  'Revólver Real', 'Catapulta Real', 'Cauda de Gato Real',
  'Shuriken Huuma Real', 'Gladius Dourado Real&&Gladius Prateado Real',
];
const REAL_SET = `EQUIP[${REAL_WEAPONS.join('||')}]`;

function trim(arr, predicate) {
  return arr.filter((v) => !predicate(v));
}

// Bug 1 & 2: drop the third entry on armor (duplicates shield's set bonus)
function dropArmorSetDup(id, skillKey, shieldName, shoesName) {
  const it = items[id];
  if (!it) throw new Error(`missing ${id}`);
  const arr = it.script[skillKey];
  const before = arr.length;
  it.script[skillKey] = trim(arr, (v) =>
    v.includes(`EQUIP[${shieldName}&&${shoesName}]`) && v.includes('REFINE[shadowShield,shadowBoot,shadowArmor==1]---1')
  );
  console.log(`${id} ${it.name}: removed ${before - it.script[skillKey].length} dup ${skillKey} set entry`);
}

dropArmorSetDup(24440, 'RK_SONICWAVE', 'Escudo Sombrio da Onda de Choque', 'Greva Sombria da Onda de Choque');
dropArmorSetDup(24470, 'NC_VULCANARM', 'Escudo Sombrio da Metralhadora', 'Greva Sombria da Metralhadora');

// Bug 3-6: remove phantom skill set bonus from acd-set shields
function dropShieldPhantomSkill(id, skillKey) {
  const it = items[id];
  if (!it) throw new Error(`missing ${id}`);
  if (!it.script[skillKey]) return;
  console.log(`${id} ${it.name}: dropping ${skillKey} key (phantom, real bonus is acd)`);
  delete it.script[skillKey];
}

dropShieldPhantomSkill(24483, 'SR_KNUCKLEARROW');
dropShieldPhantomSkill(24531, 'SC_FATALMENACE');
dropShieldPhantomSkill(24543, 'GC_COUNTERSLASH');
dropShieldPhantomSkill(24573, 'LG_OVERBRAND');

// Bug 7: Elmo Real autocast needs to be gated on the Real weapon set
{
  const it = items['410642'];
  if (!it) throw new Error('missing 410642');
  it.script.autocast__RK_REFRESH = [`${REAL_SET}===1,1,onhit`];
  console.log(`410642 ${it.name}: gated autocast__RK_REFRESH on Real weapon set`);
}

writeFileSync(ITEM_JSON_PATH, JSON.stringify(items, null, 2), 'utf-8');
console.log('\nDone.');
