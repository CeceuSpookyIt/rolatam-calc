import { Pipe, PipeTransform } from '@angular/core';
import { SKILL_REGISTRY } from '../constants/skill-registry';

@Pipe({ name: 'skillName', standalone: true })
export class SkillNamePipe implements PipeTransform {
  transform(aegis: string): string {
    if (!aegis) return '';
    return SKILL_REGISTRY[aegis]?.ptbr || aegis;
  }
}
