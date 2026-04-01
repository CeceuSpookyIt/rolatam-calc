import { ActiveSkillModel } from '../../jobs/_character-base.abstract';

export const BragisPoemFn = (): ActiveSkillModel => ({
  label: 'Poema de Bragi 10',
  name: 'BA_POEMBRAGI',
  inputType: 'selectButton',
  dropdown: [
    { label: 'Yes', value: 10, isUse: true, bonus: { vctBySkill: 20, acd: 30 } },
    { label: 'No', value: 0, isUse: false },
  ],
});
