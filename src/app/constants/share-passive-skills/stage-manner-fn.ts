import { genSkillList } from 'src/app/utils';
import { PassiveSkillModel } from '../../jobs/_character-base.abstract';

export const StageMannerFn = (): PassiveSkillModel => ({
  label: 'Presena de Palco',
  name: 'TR_STAGE_MANNER',
  inputType: 'dropdown',
  dropdown: genSkillList(5),
});
