const CannotEDP = {
  'ASC_METEORASSAULT': false,
} as const;

export const isSkillCanEDP = (skillName: string) => {
  return CannotEDP[skillName] !== false;
};
