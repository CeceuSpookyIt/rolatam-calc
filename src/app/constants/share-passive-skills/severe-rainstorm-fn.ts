import { PassiveSkillModel } from '../../jobs/_character-base.abstract';

export const SevereRainstormFn = (): PassiveSkillModel => ({
  label: 'Severe Rains',
  name: 'WM_SEVERE_RAINSTORM',
  inputType: 'dropdown',
  dropdown: [
    { label: '-', value: 0, isUse: false },
    { label: 'Lv 5', value: 5, skillLv: 5, isUse: true },
  ],
});
