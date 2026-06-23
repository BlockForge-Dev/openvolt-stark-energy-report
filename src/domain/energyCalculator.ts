import type { AlignedInterval } from './types.js';
import { round } from './time.js';

export function calculateMonthlyEnergyKwh(intervals: AlignedInterval[]): number {
  return round(intervals.reduce((sum, interval) => sum + interval.kwh, 0), 3);
}
