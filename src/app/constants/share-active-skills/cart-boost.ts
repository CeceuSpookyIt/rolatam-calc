import { ActiveSkillModel } from '../../jobs/_character-base.abstract';

export const CartBoost: ActiveSkillModel = {
  label: 'Impulso no Carrinho Lv5',
  name: 'WS_CARTBOOST',
  inputType: 'selectButton',
  isMasteryAtk: true,
  dropdown: [
    { label: 'Yes', value: 5, skillLv: 5, isUse: true, bonus: { atk: 50 } },
    { label: 'No', value: 0, isUse: false },
  ],
};
