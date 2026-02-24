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
      const oratio = JobBuffs.find((b: any) => b.name === 'Oratio');
      expect(oratio).toBeDefined();
      expect(oratio!.isDebuff).toBe(true);
      const yesOption = oratio!.dropdown!.find((d: any) => d.isUse);
      expect(yesOption).toBeDefined();
      expect(yesOption!.bonus.p_element_holy).toBe(20);
      expect(yesOption!.bonus.m_element_holy).toBe(20);
    });
  });
});