import { PassiveSkillModel } from '../../jobs/_character-base.abstract';

export const DebufSonicBrandFn = (): PassiveSkillModel => ({
  label: 'Sonic Brand',
  name: '_CALC_DEBUF_SONIC_BRAND',
  isDebuff: true,
  inputType: 'selectButton',
  dropdown: [
    { label: 'Yes', value: 1, isUse: true, bonus: { p_race_fish: 50, p_race_demihuman: 50, m_race_fish: 50, m_race_demihuman: 50 } },
    { label: 'No', value: 0, isUse: false },
  ],
});
