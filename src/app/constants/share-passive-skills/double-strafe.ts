import { PassiveSkillModel } from '../../jobs/_character-base.abstract';

export const DoubleStrafeFn = (): PassiveSkillModel => ({
  label: 'Rajada de Flechas',
  name: 'AC_DOUBLE',
  inputType: 'dropdown',
  isEquipAtk: true,
  dropdown: [
    { label: '-', value: 0, isUse: false },
    { label: 'Lv 10', value: 10, skillLv: 10, isUse: true },
  ],
});
