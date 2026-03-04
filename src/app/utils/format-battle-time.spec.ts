import { formatBattleTime } from './format-battle-time';

describe('formatBattleTime', () => {
  describe('edge cases (returns —)', () => {
    it('should return — for 0', () => {
      expect(formatBattleTime(0)).toBe('—');
    });

    it('should return — for negative', () => {
      expect(formatBattleTime(-5)).toBe('—');
    });

    it('should return — for NaN', () => {
      expect(formatBattleTime(NaN)).toBe('—');
    });

    it('should return — for Infinity', () => {
      expect(formatBattleTime(Infinity)).toBe('—');
    });

    it('should return — for undefined/null coerced', () => {
      expect(formatBattleTime(undefined as any)).toBe('—');
      expect(formatBattleTime(null as any)).toBe('—');
    });
  });

  describe('seconds format (<=60s)', () => {
    it('should format small values as Xs', () => {
      expect(formatBattleTime(5)).toBe('5s');
    });

    it('should format with 1 decimal place', () => {
      expect(formatBattleTime(12.5)).toBe('12.5s');
    });

    it('should round to 1 decimal', () => {
      expect(formatBattleTime(3.14159)).toBe('3.1s');
    });

    it('should handle exactly 60s', () => {
      expect(formatBattleTime(60)).toBe('60s');
    });

    it('should format 0.1s', () => {
      expect(formatBattleTime(0.1)).toBe('0.1s');
    });
  });

  describe('minutes format (>60s, <60min)', () => {
    it('should format as Xm Ys', () => {
      expect(formatBattleTime(90)).toBe('1m 30s');
    });

    it('should format 2m 30s', () => {
      expect(formatBattleTime(150)).toBe('2m 30s');
    });

    it('should format 59m 59s', () => {
      expect(formatBattleTime(3599)).toBe('59m 59s');
    });

    it('should handle exact minutes', () => {
      expect(formatBattleTime(120)).toBe('2m 0s');
    });
  });

  describe('hours format (>=60min)', () => {
    it('should format as Xh Ym at exactly 1 hour', () => {
      expect(formatBattleTime(3600)).toBe('1h 0m');
    });

    it('should format 1h 30m', () => {
      expect(formatBattleTime(5400)).toBe('1h 30m');
    });

    it('should handle large values', () => {
      // 2,000,000,000 HP / 915 DPS ≈ 2,185,792s ≈ 607h 9m
      expect(formatBattleTime(2185792)).toBe('607h 9m');
    });
  });
});
