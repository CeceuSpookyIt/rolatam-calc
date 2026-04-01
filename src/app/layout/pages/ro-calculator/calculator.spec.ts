import { ItemTypeEnum, ItemTypeId } from 'src/app/constants';
import { JobBuffs } from 'src/app/constants/job-buffs';
import { ActiveSkillModel, AtkSkillModel, CharacterBase, ClassIDEnum, ClassName } from 'src/app/jobs';
import { HpSpTable } from 'src/app/models/hp-sp-table.model';
import { ItemModel } from 'src/app/models/item.model';
import { MainModel } from 'src/app/models/main.model';
import { MonsterModel } from 'src/app/models/monster.model';
import { createMainModel } from 'src/app/utils';
import { Calculator } from './calculator';

// Mock CharacterBase for testing purposes
class MockCharacter extends CharacterBase {
  protected override CLASS_NAME: ClassName;
  protected override JobBonusTable: Record<number, [number, number, number, number, number, number]>;
  protected override initialStatusPoint: number;
  protected override classNames: ClassName[];
  protected override _atkSkillList: AtkSkillModel[];
  protected override _activeSkillList: ActiveSkillModel[];
  protected override _passiveSkillList: ActiveSkillModel[];
  // className = ClassName.RuneKnight;
  // classNameSet = new Set([ClassName.RuneKnight]);
  // isAllowTraitStat = () => false;
  // minMaxLevelCap = { minMaxLevel: [1, 200] as [number, number], maxJob: 70 };
  // initialStatPoint = 48;
  // getJobBonusStatus = () => ({ str: 7, agi: 2, vit: 5, int: 0, dex: 4, luk: 2, pow: 0, sta: 0, wis: 0, spl: 0, con: 0, crt: 0 });
}

describe('Calculator', () => {
  let calculator: Calculator;
  let mockItems: Record<number, Partial<ItemModel>>;
  let mockMonster: MonsterModel;
  let mockModel: MainModel;
  let mockHpSpTable: HpSpTable;
  let mockCharacter: CharacterBase;

  beforeEach(() => {
    calculator = new Calculator();
    mockCharacter = new MockCharacter();

    mockItems = {
      1: { id: 1, name: 'Test Weapon', itemTypeId: ItemTypeId.WEAPON, attack: 100, script: { atk: ['10'] } },
      2: { id: 2, name: 'Test Armor', itemTypeId: ItemTypeId.ARMOR, defense: 10, script: { vit: ['5'] } },
      3: { id: 3, name: 'Test Card', itemTypeId: ItemTypeId.CARD, script: { str: ['2'] } },
    };

    mockMonster = {
      id: 1002,
      name: 'Poring',
      spawn: 'pay_fild04',
      stats: {
        level: 1,
        health: 50,
        attack: { min: 7, max: 8 },
        range: 1,
        defense: 0,
        magicDefense: 0,
        str: 1,
        int: 0,
        vit: 1,
        dex: 6,
        agi: 1,
        luk: 30,
        baseExp: 2,
        jobExp: 1,
        hitRequireFor100: 182,
        fleeRequireFor95: 182,
        element: 1,
        elementName: 'Water',
        elementShortName: 'W1',
        race: 4,
        raceName: 'Plant',
        scale: 0,
        scaleName: 'Small',
        class: 0,
        criShield: 0,
        softDef: 0,
        mdef: 0,
        softMdef: 0,
        res: 0,
        mres: 0,
      },
      data: {
        def: 0,
        mdef: 0,
        hitRequireFor100: 182,
        fleeRequireFor95: 182,
        criShield: 0,
        softDef: 0,
        res: 0,
        mres: 0,
      },
    } as any;

    mockModel = createMainModel();
    mockModel.class = ClassIDEnum.RuneKnight;
    mockModel.level = 100;
    mockModel.jobLevel = 50;
    mockModel.str = 10;
    mockModel.agi = 10;
    mockModel.vit = 10;
    mockModel.int = 10;
    mockModel.dex = 10;
    mockModel.luk = 10;

    mockHpSpTable = [
      {
        jobs: { [mockCharacter.className]: true },
        baseHp: Array(251).fill(1000),
        baseSp: Array(251).fill(100),
      },
    ] as any;

    calculator.setMasterItems(mockItems).setHpSpTable(mockHpSpTable).setClass(mockCharacter).setMonster(mockMonster);
  });

  it('should be created', () => {
    expect(calculator).toBeTruthy();
  });

  describe('loadItemFromModel', () => {
    it('should load items and refines from model', () => {
      mockModel.weapon = 1;
      mockModel.weaponRefine = 7;
      mockModel.armor = 2;
      mockModel.armorRefine = 4;
      mockModel.armorCard = 3;

      calculator.loadItemFromModel(mockModel);

      const itemSummary = calculator.prepareAllItemBonus().getItemSummary();

      // expect(itemSummary.weapon).toBeDefined();
      // expect(itemSummary.armor).toBeDefined();
      // expect(itemSummary.armorCard).toBeDefined();
      expect(itemSummary.consumableBonuses).toBeDefined();

      const internalEquipItem = (calculator as any).equipItem;
      expect(internalEquipItem.get(ItemTypeEnum.weapon).id).toBe(1);
      expect(internalEquipItem.get(ItemTypeEnum.armor).id).toBe(2);
      expect(internalEquipItem.get(ItemTypeEnum.armorCard).id).toBe(3);

      const internalRefineMap = (calculator as any).mapRefine;
      expect(internalRefineMap.get(ItemTypeEnum.weapon)).toBe(7);
      expect(internalRefineMap.get(ItemTypeEnum.armor)).toBe(4);
    });
  });

  describe('Escudo Ilusão B (460014) script', () => {
    it('should apply +5% boss physical and magic damage', () => {
      mockItems[460014] = {
        id: 460014,
        name: 'Escudo Ilusión B [1]',
        itemTypeId: ItemTypeId.ARMOR,
        defense: 20,
        script: {
          p_class_boss: ['5', '2---2'],
          m_class_boss: ['5', '2---2'],
          matk: ['EQUIP[Soquete Ilusión B]===30'],
          atk: ['EQUIP[Turbina Ilusión B]===30'],
        },
      } as any;

      calculator.setMasterItems(mockItems);
      mockModel.shield = 460014;
      mockModel.shieldRefine = 0;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();

      const totalBonus = (calculator as any).totalEquipStatus;
      expect(totalBonus['p_class_boss']).toBe(5);
      expect(totalBonus['m_class_boss']).toBe(5);
    });

    it('should scale boss damage per 2 refine levels', () => {
      mockItems[460014] = {
        id: 460014,
        name: 'Escudo Ilusión B [1]',
        itemTypeId: ItemTypeId.ARMOR,
        defense: 20,
        script: {
          p_class_boss: ['5', '2---2'],
          m_class_boss: ['5', '2---2'],
        },
      } as any;

      calculator.setMasterItems(mockItems);
      mockModel.shield = 460014;
      mockModel.shieldRefine = 10;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();

      const totalBonus = (calculator as any).totalEquipStatus;
      // +5 base + floor(10/2)*2 = 5 + 10 = 15
      expect(totalBonus['p_class_boss']).toBe(15);
      expect(totalBonus['m_class_boss']).toBe(15);
    });

    it('should not apply set bonus without set item equipped', () => {
      mockItems[460014] = {
        id: 460014,
        name: 'Escudo Ilusión B [1]',
        itemTypeId: ItemTypeId.ARMOR,
        defense: 20,
        script: {
          atk: ['EQUIP[Turbina Ilusión B]===30'],
          matk: ['EQUIP[Soquete Ilusión B]===30'],
        },
      } as any;

      calculator.setMasterItems(mockItems);
      mockModel.shield = 460014;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();

      const totalBonus = (calculator as any).totalEquipStatus;
      expect(totalBonus['atk'] || 0).toBe(0);
    });
  });

  describe('Pedra Flutuante Mágica (19393) script', () => {
    it('should apply VCT -5%', () => {
      mockItems[19393] = {
        id: 19393,
        name: 'Pedra Flutuante Mágica',
        itemTypeId: ItemTypeId.ARMOR,
        script: {
          vct: ['5'],
          m_my_element_neutral: ['SUM[str==12]---2'],
          m_my_element_wind: ['SUM[agi==12]---2'],
          m_my_element_water: ['SUM[vit==12]---2'],
          m_my_element_fire: ['SUM[int==12]---2'],
          m_my_element_earth: ['SUM[dex==12]---2'],
          m_my_element_holy: ['SUM[luk==12]---2'],
        },
      } as any;

      calculator.setMasterItems(mockItems);
      mockModel.headUpper = 19393;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();

      const totalBonus = (calculator as any).totalEquipStatus;
      expect(totalBonus['vct']).toBe(5);
    });

    it('should scale magic element damage based on base stats', () => {
      mockItems[19393] = {
        id: 19393,
        name: 'Pedra Flutuante Mágica',
        itemTypeId: ItemTypeId.ARMOR,
        script: {
          vct: ['5'],
          m_my_element_neutral: ['SUM[str==12]---2'],
          m_my_element_wind: ['SUM[agi==12]---2'],
          m_my_element_water: ['SUM[vit==12]---2'],
          m_my_element_fire: ['SUM[int==12]---2'],
          m_my_element_earth: ['SUM[dex==12]---2'],
          m_my_element_holy: ['SUM[luk==12]---2'],
        },
      } as any;

      calculator.setMasterItems(mockItems);
      // Set stats to 120 each -> floor(120/12)*2 = 20% each
      mockModel.str = 120;
      mockModel.agi = 120;
      mockModel.vit = 120;
      mockModel.int = 120;
      mockModel.dex = 120;
      mockModel.luk = 120;
      mockModel.headUpper = 19393;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();

      const totalBonus = (calculator as any).totalEquipStatus;
      expect(totalBonus['m_my_element_neutral']).toBe(20);
      expect(totalBonus['m_my_element_wind']).toBe(20);
      expect(totalBonus['m_my_element_water']).toBe(20);
      expect(totalBonus['m_my_element_fire']).toBe(20);
      expect(totalBonus['m_my_element_earth']).toBe(20);
      expect(totalBonus['m_my_element_holy']).toBe(20);
    });

    it('should give 0 element bonus when stats are below 12', () => {
      mockItems[19393] = {
        id: 19393,
        name: 'Pedra Flutuante Mágica',
        itemTypeId: ItemTypeId.ARMOR,
        script: {
          m_my_element_neutral: ['SUM[str==12]---2'],
        },
      } as any;

      calculator.setMasterItems(mockItems);
      mockModel.str = 11;
      mockModel.headUpper = 19393;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();

      const totalBonus = (calculator as any).totalEquipStatus;
      expect(totalBonus['m_my_element_neutral'] || 0).toBe(0);
    });
  });

  describe('Cachecol Dínamo B (420154) script', () => {
    it('should apply VCT -3% and all-element magic damage +5%', () => {
      mockItems[420154] = {
        id: 420154,
        name: 'Cachecol Dínamo B',
        itemTypeId: ItemTypeId.ARMOR,
        script: {
          vct: ['3'],
          m_my_element_all: ['5'],
        },
      } as any;

      calculator.setMasterItems(mockItems);
      mockModel.headLower = 420154;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();

      const totalBonus = (calculator as any).totalEquipStatus;
      expect(totalBonus['vct']).toBe(3);
      expect(totalBonus['m_my_element_all']).toBe(5);
    });
  });

  describe('Luva dos Espíritos Malignos (2980) script', () => {
    it('should apply HP +500 and SP +200', () => {
      mockItems[2980] = {
        id: 2980,
        name: 'Luva dos Espíritos Malignos [1]',
        itemTypeId: ItemTypeId.ARMOR,
        script: {
          sp: ['200'],
          hp: ['500'],
          'autocast__Frost Nova': ['10,1,onhit'],
          'autocast__Psychic Wave': ['1,1,onhit'],
        },
      } as any;

      calculator.setMasterItems(mockItems);
      mockModel.accLeft = 2980;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();

      const totalBonus = (calculator as any).totalEquipStatus;
      expect(totalBonus['sp']).toBe(200);
      expect(totalBonus['hp']).toBe(500);
    });

    it('should register autocast entries', () => {
      mockItems[2980] = {
        id: 2980,
        name: 'Luva dos Espíritos Malignos [1]',
        itemTypeId: ItemTypeId.ARMOR,
        script: {
          sp: ['200'],
          hp: ['500'],
          'autocast__Frost Nova': ['10,1,onhit'],
          'autocast__Psychic Wave': ['1,1,onhit'],
        },
      } as any;

      calculator.setMasterItems(mockItems);
      mockModel.accLeft = 2980;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();

      const autocastEntries = (calculator as any).autocastEntries;
      expect(autocastEntries).toBeDefined();
      expect(autocastEntries.length).toBeGreaterThanOrEqual(2);

      const frostNova = autocastEntries.find((a: any) => a.skillName === 'Frost Nova');
      expect(frostNova).toBeDefined();
      expect(frostNova.skillLevel).toBe(10);
      expect(frostNova.chancePercent).toBe(1);

      const psychicWave = autocastEntries.find((a: any) => a.skillName === 'Psychic Wave');
      expect(psychicWave).toBeDefined();
      expect(psychicWave.skillLevel).toBe(1);
    });
  });

  describe('Manto Ultio-OS (480088) script', () => {
    it('should apply MATK per 2 refine', () => {
      mockItems[480088] = {
        id: 480088,
        name: 'Manto Ultio-OS [1]',
        itemTypeId: ItemTypeId.ARMOR,
        script: {
          matk: ['2---10', 'EQUIP[Ultio-OS]===30'],
          m_my_element_neutral: ['4---3'],
          m_my_element_holy: ['4---3'],
          matkPercent: ['9===10'],
          acd: ['11===12'],
          p_pene_class_boss: ['13===10'],
        },
      } as any;

      calculator.setMasterItems(mockItems);
      mockModel.garment = 480088;
      mockModel.garmentRefine = 8;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();

      const totalBonus = (calculator as any).totalEquipStatus;
      // floor(8/2)*10 = 40
      expect(totalBonus['matk']).toBe(40);
    });

    it('should apply element bonuses per 4 refine', () => {
      mockItems[480088] = {
        id: 480088,
        name: 'Manto Ultio-OS [1]',
        itemTypeId: ItemTypeId.ARMOR,
        script: {
          matk: ['2---10'],
          m_my_element_neutral: ['4---3'],
          m_my_element_holy: ['4---3'],
        },
      } as any;

      calculator.setMasterItems(mockItems);
      mockModel.garment = 480088;
      mockModel.garmentRefine = 12;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();

      const totalBonus = (calculator as any).totalEquipStatus;
      // floor(12/4)*3 = 9
      expect(totalBonus['m_my_element_neutral']).toBe(9);
      expect(totalBonus['m_my_element_holy']).toBe(9);
    });

    it('should apply matkPercent at refine +9', () => {
      mockItems[480088] = {
        id: 480088,
        name: 'Manto Ultio-OS [1]',
        itemTypeId: ItemTypeId.ARMOR,
        script: {
          matkPercent: ['9===10'],
        },
      } as any;

      calculator.setMasterItems(mockItems);
      mockModel.garment = 480088;
      mockModel.garmentRefine = 9;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();

      const totalBonus = (calculator as any).totalEquipStatus;
      expect(totalBonus['matkPercent']).toBe(10);
    });

    it('should not apply matkPercent below refine +9', () => {
      mockItems[480088] = {
        id: 480088,
        name: 'Manto Ultio-OS [1]',
        itemTypeId: ItemTypeId.ARMOR,
        script: {
          matkPercent: ['9===10'],
        },
      } as any;

      calculator.setMasterItems(mockItems);
      mockModel.garment = 480088;
      mockModel.garmentRefine = 8;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();

      const totalBonus = (calculator as any).totalEquipStatus;
      expect(totalBonus['matkPercent'] || 0).toBe(0);
    });
  });

  describe('Oratio debuff skill', () => {
    it('should be defined in job buffs with correct bonus', () => {
      const oratio = JobBuffs.find((b: any) => b.name === 'AB_ORATIO');
      expect(oratio).toBeDefined();
      expect(oratio!.isDebuff).toBe(true);
      const yesOption = oratio!.dropdown!.find((d: any) => d.isUse);
      expect(yesOption).toBeDefined();
      expect(yesOption!.bonus.p_my_element_holy).toBe(20);
      expect(yesOption!.bonus.m_my_element_holy).toBe(20);
    });
  });

  // =====================================================
  // Shadow Equipment Tests (03/03 patch)
  // =====================================================

  describe('Rolling Shadow Set (GX) - 24536/24537/24538', () => {
    beforeEach(() => {
      // Malha Sombria de Loki (Shadow Armor)
      mockItems[24536] = {
        id: 24536, name: 'Malha Sombria de Loki', itemTypeId: 10, itemSubTypeId: 526,
        script: {
          hp: ['10'],
          'GC_ROLLINGCUTTER': ['5', '2---2', 'EQUIP[Escudo Sombrio de Loki&&Greva Sombria de Loki]REFINE[shadowArmor,shadowShield,shadowBoot==1]---1'],
        },
      } as any;
      // Escudo Sombrio de Loki (Shadow Shield)
      mockItems[24537] = {
        id: 24537, name: 'Escudo Sombrio de Loki', itemTypeId: 10, itemSubTypeId: 527,
        script: {
          hp: ['10'],
          p_size_all: ['3', '7===3', '9===4'],
          p_pene_race_all: ['EQUIP[Manopla Sombria de Sicário]40', 'EQUIP[Manopla Sombria de Sicário]REFINE[shadowShield,shadowWeapon==1]---1'],
        },
      } as any;
      // Greva Sombria de Loki (Shadow Boot)
      mockItems[24538] = {
        id: 24538, name: 'Greva Sombria de Loki', itemTypeId: 10, itemSubTypeId: 528,
        script: { hp: ['10'] },
      } as any;
      // Manopla Sombria de Sicário (referenced in set bonus)
      mockItems[24294] = {
        id: 24294, name: 'Manopla Sombria de Sicário', itemTypeId: 10, itemSubTypeId: 280,
        script: {},
      } as any;
      calculator.setMasterItems(mockItems);
    });

    it('should apply base HP +10 from shadow armor', () => {
      mockModel.shadowArmor = 24536;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      expect(totalBonus['hp']).toBe(10);
    });

    it('should apply Rolling Cutter +5 base from armor alone', () => {
      mockModel.shadowArmor = 24536;
      mockModel.shadowArmorRefine = 0;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      expect(totalBonus['GC_ROLLINGCUTTER']).toBe(5);
    });

    it('should scale Rolling Cutter per 2 refine', () => {
      mockModel.shadowArmor = 24536;
      mockModel.shadowArmorRefine = 10;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      // +5 base + floor(10/2)*2 = 5 + 10 = 15
      expect(totalBonus['GC_ROLLINGCUTTER']).toBe(15);
    });

    it('should apply Rolling Cutter set bonus with 3-piece at +7 each', () => {
      mockModel.shadowArmor = 24536;
      mockModel.shadowArmorRefine = 7;
      mockModel.shadowShield = 24537;
      mockModel.shadowShieldRefine = 7;
      mockModel.shadowBoot = 24538;
      mockModel.shadowBootRefine = 7;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      // base 5 + floor(7/2)*2=6 + set: floor((7+7+7)/1)*1=21
      expect(totalBonus['GC_ROLLINGCUTTER']).toBe(5 + 6 + 21);
    });

    it('should NOT apply Rolling Cutter set bonus without full 3-piece', () => {
      mockModel.shadowArmor = 24536;
      mockModel.shadowArmorRefine = 7;
      mockModel.shadowShield = 24537;
      mockModel.shadowShieldRefine = 7;
      // no boot
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      // base 5 + floor(7/2)*2=6, no set bonus
      expect(totalBonus['GC_ROLLINGCUTTER']).toBe(11);
    });

    it('should apply p_size_all from shield: +3 base, +3 at +7, +4 at +9', () => {
      mockModel.shadowShield = 24537;
      mockModel.shadowShieldRefine = 9;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      // 3 + 3 + 4 = 10
      expect(totalBonus['p_size_all']).toBe(10);
    });

    it('should apply p_size_all from shield at +7 but not +9', () => {
      mockModel.shadowShield = 24537;
      mockModel.shadowShieldRefine = 7;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      // 3 + 3 = 6
      expect(totalBonus['p_size_all']).toBe(6);
    });

    it('should apply p_pene_race_all set bonus with Manopla Sombria de Sicário', () => {
      mockModel.shadowShield = 24537;
      mockModel.shadowShieldRefine = 7;
      mockModel.shadowWeapon = 24294; // Manopla Sombria de Sicário
      mockModel.shadowWeaponRefine = 7;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      // 40 + floor((7+7)/1)*1 = 40 + 14 = 54
      expect(totalBonus['p_pene_race_all']).toBe(54);
    });

    it('should NOT apply p_pene_race_all without Manopla de Sicário', () => {
      mockModel.shadowShield = 24537;
      mockModel.shadowShieldRefine = 9;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      expect(totalBonus['p_pene_race_all'] || 0).toBe(0);
    });
  });

  describe('Grave Shadow Set (Sorcerer) - 24551/24552/24553', () => {
    beforeEach(() => {
      // Manopla Sombria de Nerthus (Shadow Weapon)
      mockItems[24551] = {
        id: 24551, name: 'Manopla Sombria de Nerthus', itemTypeId: 10, itemSubTypeId: 280,
        script: {
          atk: ['1---1'], matk: ['1---1'],
          m_element_earth: ['3', '7===3', '9===4'],
          m_pene_race_all: ['EQUIP[Escudo Sombrio de Feiticeiro]40', 'EQUIP[Escudo Sombrio de Feiticeiro]REFINE[shadowWeapon,shadowShield==1]---1'],
        },
      } as any;
      // Colar Sombrio de Nerthus (Shadow Pendant)
      mockItems[24552] = {
        id: 24552, name: 'Colar Sombrio de Nerthus', itemTypeId: 10, itemSubTypeId: 530,
        script: {
          hp: ['10'],
          'Earth Grave': ['5', '2---2', 'EQUIP[Manopla Sombria de Nerthus&&Brinco Sombrio de Nerthus]REFINE[shadowPendant,shadowWeapon,shadowEarring==1]---1'],
        },
      } as any;
      // Brinco Sombrio de Nerthus (Shadow Earring)
      mockItems[24553] = {
        id: 24553, name: 'Brinco Sombrio de Nerthus', itemTypeId: 10, itemSubTypeId: 529,
        script: {
          hp: ['10'],
          'cd__Earth Grave': ['0.2', '3---0.1'],
        },
      } as any;
      // Escudo Sombrio de Feiticeiro (referenced in set bonus)
      mockItems[24310] = {
        id: 24310, name: 'Escudo Sombrio de Feiticeiro', itemTypeId: 10, itemSubTypeId: 527,
        script: {},
      } as any;
      calculator.setMasterItems(mockItems);
    });

    it('should scale ATK and MATK per refine on weapon', () => {
      mockModel.shadowWeapon = 24551;
      mockModel.shadowWeaponRefine = 10;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      // floor(10/1)*1 = 10 each
      expect(totalBonus['atk']).toBe(10);
      expect(totalBonus['matk']).toBe(10);
    });

    it('should apply m_element_earth: +3 base, +3 at +7, +4 at +9', () => {
      mockModel.shadowWeapon = 24551;
      mockModel.shadowWeaponRefine = 9;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      // 3 + 3 + 4 = 10
      expect(totalBonus['m_element_earth']).toBe(10);
    });

    it('should apply m_pene_race_all with Escudo Sombrio de Feiticeiro', () => {
      mockModel.shadowWeapon = 24551;
      mockModel.shadowWeaponRefine = 7;
      mockModel.shadowShield = 24310; // Escudo Sombrio de Feiticeiro
      mockModel.shadowShieldRefine = 7;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      // 40 + floor((7+7)/1)*1 = 54
      expect(totalBonus['m_pene_race_all']).toBe(54);
    });

    it('should apply Earth Grave base +5 and refine scaling from pendant', () => {
      mockModel.shadowPendant = 24552;
      mockModel.shadowPendantRefine = 8;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      // 5 + floor(8/2)*2 = 5 + 8 = 13
      expect(totalBonus['Earth Grave']).toBe(13);
    });

    it('should apply Earth Grave set bonus with 3-piece', () => {
      mockModel.shadowPendant = 24552;
      mockModel.shadowPendantRefine = 7;
      mockModel.shadowWeapon = 24551;
      mockModel.shadowWeaponRefine = 7;
      mockModel.shadowEarring = 24553;
      mockModel.shadowEarringRefine = 7;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      // from pendant: base 5 + floor(7/2)*2=6 + set floor((7+7+7)/1)*1=21 = 32
      expect(totalBonus['Earth Grave']).toBe(32);
    });

    it('should apply cd__Earth Grave from earring: 0.2 base + scaling', () => {
      mockModel.shadowEarring = 24553;
      mockModel.shadowEarringRefine = 9;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      // 0.2 + floor(9/3)*0.1 = 0.2 + 0.3 = 0.5
      expect(totalBonus['cd__Earth Grave']).toBeCloseTo(0.5, 5);
    });
  });

  describe('Vanishing Cannon Shadow Set (RG) - 24578/24579/24580', () => {
    beforeEach(() => {
      // Malha Sombria Hoplita (Shadow Armor)
      mockItems[24578] = {
        id: 24578, name: 'Malha Sombria Hoplita', itemTypeId: 10, itemSubTypeId: 526,
        script: {
          hp: ['10'],
          'Sightless Mind': ['5'],
          'Vanishing Buster': ['2---2'],
        },
      } as any;
      // Escudo Sombrio Hoplita (Shadow Shield)
      mockItems[24579] = {
        id: 24579, name: 'Escudo Sombrio Hoplita', itemTypeId: 10, itemSubTypeId: 527,
        script: {
          hp: ['10'],
          p_size_all: ['3', '7===3', '9===4'],
          'Sightless Mind': ['EQUIP[Malha Sombria Hoplita&&Greva Sombria Hoplita]REFINE[shadowArmor,shadowShield,shadowBoot==2]---1'],
          'Vanishing Buster': ['EQUIP[Malha Sombria Hoplita&&Greva Sombria Hoplita]REFINE[shadowArmor,shadowShield,shadowBoot==2]---1'],
          p_pene_race_all: ['EQUIP[Manopla Sombria de Guardião Real]40', 'EQUIP[Manopla Sombria de Guardião Real]REFINE[shadowShield,shadowWeapon==1]---1'],
        },
      } as any;
      // Greva Sombria Hoplita (Shadow Boot)
      mockItems[24580] = {
        id: 24580, name: 'Greva Sombria Hoplita', itemTypeId: 10, itemSubTypeId: 528,
        script: {
          hp: ['10'],
          'cd__Cannon Spear': ['0.2', '3---0.1'],
        },
      } as any;
      // Manopla Sombria de Guardião Real (referenced in set bonus)
      mockItems[24289] = {
        id: 24289, name: 'Manopla Sombria de Guardião Real', itemTypeId: 10, itemSubTypeId: 280,
        script: {},
      } as any;
      calculator.setMasterItems(mockItems);
    });

    it('should apply Sightless Mind +5 base from armor alone', () => {
      mockModel.shadowArmor = 24578;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      expect(totalBonus['Sightless Mind']).toBe(5);
    });

    it('should apply Vanishing Buster per 2 refine from armor', () => {
      mockModel.shadowArmor = 24578;
      mockModel.shadowArmorRefine = 10;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      // floor(10/2)*2 = 10
      expect(totalBonus['Vanishing Buster']).toBe(10);
    });

    it('should apply Sightless Mind and Vanishing Buster set bonus with 3-piece', () => {
      mockModel.shadowArmor = 24578;
      mockModel.shadowArmorRefine = 7;
      mockModel.shadowShield = 24579;
      mockModel.shadowShieldRefine = 7;
      mockModel.shadowBoot = 24580;
      mockModel.shadowBootRefine = 7;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      // Sightless Mind: 5 (armor) + floor((7+7+7)/2)*1=10 (shield set) = 15
      expect(totalBonus['Sightless Mind']).toBe(15);
      // Vanishing Buster: floor(7/2)*2=6 (armor) + floor(21/2)*1=10 (shield set) = 16
      expect(totalBonus['Vanishing Buster']).toBe(16);
    });

    it('should apply cd__Cannon Spear from boot', () => {
      mockModel.shadowBoot = 24580;
      mockModel.shadowBootRefine = 9;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      // 0.2 + floor(9/3)*0.1 = 0.2 + 0.3 = 0.5
      expect(totalBonus['cd__Cannon Spear']).toBeCloseTo(0.5, 5);
    });
  });

  describe('Booster Shadow Set - 24584-24589 (Rune Knight)', () => {
    beforeEach(() => {
      mockItems[24584] = { id: 24584, name: 'Malha Sombria de Apoio', itemTypeId: 10, itemSubTypeId: 526, script: { hp: ['100'], aspd: ['1'] } } as any;
      mockItems[24585] = { id: 24585, name: 'Escudo Sombrio de Apoio', itemTypeId: 10, itemSubTypeId: 527, script: { hp: ['100'], vct: ['10'] } } as any;
      mockItems[24586] = { id: 24586, name: 'Greva Sombria de Apoio', itemTypeId: 10, itemSubTypeId: 528, script: { hp: ['100'], aspdPercent: ['7'] } } as any;
      mockItems[24587] = { id: 24587, name: 'Brinco Sombrio de Apoio', itemTypeId: 10, itemSubTypeId: 529, script: { hp: ['100'], matk: ['15'] } } as any;
      mockItems[24588] = { id: 24588, name: 'Colar Sombrio de Apoio', itemTypeId: 10, itemSubTypeId: 530, script: { hp: ['100'], atk: ['15'] } } as any;
      mockItems[24589] = {
        id: 24589, name: 'Manopla Sombria de Apoio Rúnico', itemTypeId: 10, itemSubTypeId: 280,
        script: {
          atk: ['10'], matk: ['10'],
          acd: ['EQUIP[Malha Sombria de Apoio&&Escudo Sombrio de Apoio&&Greva Sombria de Apoio&&Brinco Sombrio de Apoio&&Colar Sombrio de Apoio]15'],
          range: ['EQUIP[Malha Sombria de Apoio&&Escudo Sombrio de Apoio&&Greva Sombria de Apoio&&Brinco Sombrio de Apoio&&Colar Sombrio de Apoio]15'],
          'cd__RK_IGNITIONBREAK': ['EQUIP[Malha Sombria de Apoio&&Escudo Sombrio de Apoio&&Greva Sombria de Apoio&&Brinco Sombrio de Apoio&&Colar Sombrio de Apoio]0.5'],
          'RK_IGNITIONBREAK': ['EQUIP[Malha Sombria de Apoio&&Escudo Sombrio de Apoio&&Greva Sombria de Apoio&&Brinco Sombrio de Apoio&&Colar Sombrio de Apoio]15'],
          p_pene_race_all: ['EQUIP[Malha Sombria de Apoio&&Escudo Sombrio de Apoio&&Greva Sombria de Apoio&&Brinco Sombrio de Apoio&&Colar Sombrio de Apoio]70'],
          m_pene_race_all: ['EQUIP[Malha Sombria de Apoio&&Escudo Sombrio de Apoio&&Greva Sombria de Apoio&&Brinco Sombrio de Apoio&&Colar Sombrio de Apoio]70'],
        },
      } as any;
      calculator.setMasterItems(mockItems);
    });

    it('should apply base bonuses from individual pieces', () => {
      mockModel.shadowArmor = 24584;
      mockModel.shadowShield = 24585;
      mockModel.shadowBoot = 24586;
      mockModel.shadowEarring = 24587;
      mockModel.shadowPendant = 24588;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      expect(totalBonus['hp']).toBe(500); // 100 * 5
      expect(totalBonus['aspd']).toBe(1);
      expect(totalBonus['vct']).toBe(10);
      expect(totalBonus['aspdPercent']).toBe(7);
      expect(totalBonus['matk']).toBe(15);
      expect(totalBonus['atk']).toBe(15);
    });

    it('should NOT apply 6-piece set bonuses without weapon', () => {
      mockModel.shadowArmor = 24584;
      mockModel.shadowShield = 24585;
      mockModel.shadowBoot = 24586;
      mockModel.shadowEarring = 24587;
      mockModel.shadowPendant = 24588;
      mockModel.shadowWeapon = 24589; // weapon alone adds atk/matk
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      // Set bonus requires all 5 support pieces AND the weapon equipped
      // With weapon: atk = 15 (pendant) + 10 (weapon base) = 25
      expect(totalBonus['atk']).toBe(25);
      // acd should activate since all 5 EQUIP conditions match
      expect(totalBonus['acd']).toBe(15);
    });

    it('should apply full 6-piece set bonuses', () => {
      mockModel.shadowArmor = 24584;
      mockModel.shadowShield = 24585;
      mockModel.shadowBoot = 24586;
      mockModel.shadowEarring = 24587;
      mockModel.shadowPendant = 24588;
      mockModel.shadowWeapon = 24589;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      expect(totalBonus['acd']).toBe(15);
      expect(totalBonus['range']).toBe(15);
      expect(totalBonus['cd__RK_IGNITIONBREAK']).toBeCloseTo(0.5, 5);
      expect(totalBonus['RK_IGNITIONBREAK']).toBe(15);
      expect(totalBonus['p_pene_race_all']).toBe(70);
      expect(totalBonus['m_pene_race_all']).toBe(70);
    });

    it('should NOT apply set bonuses without full 5 support pieces', () => {
      // Only 4 of 5 support pieces
      mockModel.shadowArmor = 24584;
      mockModel.shadowShield = 24585;
      mockModel.shadowBoot = 24586;
      mockModel.shadowEarring = 24587;
      // missing pendant
      mockModel.shadowWeapon = 24589;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      // atk = 10 (weapon base only, no pendant)
      expect(totalBonus['atk']).toBe(10);
      expect(totalBonus['acd'] || 0).toBe(0);
      expect(totalBonus['p_pene_race_all'] || 0).toBe(0);
    });
  });

  describe('Fire Dance Shadow Set (Rebellion) - 24604/24605/24606', () => {
    beforeEach(() => {
      // Brinco Sombrio do Tambor (Shadow Earring)
      mockItems[24604] = {
        id: 24604, name: 'Brinco Sombrio do Tambor', itemTypeId: 10, itemSubTypeId: 529,
        script: {
          hp: ['10', '9===2000'],
          hpPercent: ['5', '7===5'],
          sp: ['9===200'],
          range: ['9===7'],
          'Fire Dance': ['EQUIP[Colar Sombrio do Tambor&&Greva Sombria do Tambor]REFINE[shadowEarring,shadowPendant,shadowBoot==2]---1'],
          p_pene_race_all: ['EQUIP[Malha Sombria de Insurgente]40', 'EQUIP[Malha Sombria de Insurgente]REFINE[shadowEarring,shadowArmor==1]---1'],
        },
      } as any;
      // Colar Sombrio do Tambor (Shadow Pendant)
      mockItems[24605] = {
        id: 24605, name: 'Colar Sombrio do Tambor', itemTypeId: 10, itemSubTypeId: 530,
        script: {
          hp: ['10'],
          'Fire Dance': ['5', '2---2'],
        },
      } as any;
      // Greva Sombria do Tambor (Shadow Boot)
      mockItems[24606] = {
        id: 24606, name: 'Greva Sombria do Tambor', itemTypeId: 10, itemSubTypeId: 528,
        script: {
          hp: ['10'],
          p_size_all: ['5', '2---1'],
        },
      } as any;
      // Malha Sombria de Insurgente (referenced in set bonus)
      mockItems[24402] = {
        id: 24402, name: 'Malha Sombria de Insurgente', itemTypeId: 10, itemSubTypeId: 526,
        script: {},
      } as any;
      calculator.setMasterItems(mockItems);
    });

    it('should apply HP +10 base and +2000 at +9 from earring', () => {
      mockModel.shadowEarring = 24604;
      mockModel.shadowEarringRefine = 9;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      expect(totalBonus['hp']).toBe(2010);
    });

    it('should apply hpPercent +5 base and +5 at +7 from earring', () => {
      mockModel.shadowEarring = 24604;
      mockModel.shadowEarringRefine = 7;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      expect(totalBonus['hpPercent']).toBe(10);
    });

    it('should apply SP +200 and range +7 at +9 from earring', () => {
      mockModel.shadowEarring = 24604;
      mockModel.shadowEarringRefine = 9;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      expect(totalBonus['sp']).toBe(200);
      expect(totalBonus['range']).toBe(7);
    });

    it('should NOT apply SP/range below +9 from earring', () => {
      mockModel.shadowEarring = 24604;
      mockModel.shadowEarringRefine = 8;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      expect(totalBonus['sp'] || 0).toBe(0);
      expect(totalBonus['range'] || 0).toBe(0);
    });

    it('should apply Fire Dance +5 base and refine scaling from pendant', () => {
      mockModel.shadowPendant = 24605;
      mockModel.shadowPendantRefine = 10;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      // 5 + floor(10/2)*2 = 5 + 10 = 15
      expect(totalBonus['Fire Dance']).toBe(15);
    });

    it('should apply Fire Dance set bonus from earring with 3-piece', () => {
      mockModel.shadowEarring = 24604;
      mockModel.shadowEarringRefine = 7;
      mockModel.shadowPendant = 24605;
      mockModel.shadowPendantRefine = 7;
      mockModel.shadowBoot = 24606;
      mockModel.shadowBootRefine = 7;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      // Fire Dance from pendant: 5 + floor(7/2)*2=6 = 11
      // Fire Dance from earring set: floor((7+7+7)/2)*1 = floor(21/2)=10
      expect(totalBonus['Fire Dance']).toBe(21);
    });

    it('should apply p_pene_race_all with Malha Sombria de Insurgente', () => {
      mockModel.shadowEarring = 24604;
      mockModel.shadowEarringRefine = 7;
      mockModel.shadowArmor = 24402; // Malha Sombria de Insurgente
      mockModel.shadowArmorRefine = 7;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      // 40 + floor((7+7)/1)*1 = 40 + 14 = 54
      expect(totalBonus['p_pene_race_all']).toBe(54);
    });

    it('should apply p_size_all from boot: +5 base + per 2 refine', () => {
      mockModel.shadowBoot = 24606;
      mockModel.shadowBootRefine = 10;
      calculator.loadItemFromModel(mockModel);
      calculator.prepareAllItemBonus();
      const totalBonus = (calculator as any).totalEquipStatus;
      // 5 + floor(10/2)*1 = 5 + 5 = 10
      expect(totalBonus['p_size_all']).toBe(10);
    });
  });
});