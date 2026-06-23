import type { AlignedInterval } from './types.js';
import { round } from './time.js';

export function calculateWeightedFuelMixPercent(intervals: AlignedInterval[]): Record<string, number> {
  const totalKwh = intervals.reduce((sum, interval) => sum + interval.kwh, 0);
  const fuelKwh = new Map<string, number>();

  if (totalKwh === 0) return {};

  for (const interval of intervals) {
    for (const [fuel, percentage] of Object.entries(interval.generationMix)) {
      const contributionKwh = interval.kwh * (percentage / 100);
      fuelKwh.set(fuel, (fuelKwh.get(fuel) ?? 0) + contributionKwh);
    }
  }

  return Object.fromEntries(
    [...fuelKwh.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([fuel, kwh]) => [fuel, round((kwh / totalKwh) * 100, 2)]),
  );
}
