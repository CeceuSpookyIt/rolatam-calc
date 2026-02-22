export const availableTags = [
  { value: 'leveling_100_to_150', label: 'Levelar 100-150', severity: 'info' },
  { value: 'leveling_150_to_170', label: 'Levelar 150-170', severity: 'info' },
  { value: 'leveling_170_to_185', label: 'Levelar 170-185', severity: 'info' },
  { value: 'leveling_185_to_192', label: 'Levelar 185-192', severity: 'info' },
  { value: 'leveling_192_to_200', label: 'Levelar 192-200', severity: 'info' },
  { value: 'lab_5', label: 'Lab 5', severity: 'warning' },
  { value: 'boss', label: 'BOSS', severity: 'danger' },
  { value: 'boss_lab', label: 'Laboratório Boss', severity: 'danger' },
] as const;

export const tagSeverityMap = availableTags.reduce<Record<string, any>>((pre, cur) => {
  pre[cur.value] = cur;

  return pre;
}, {});
