import type { AlignedInterval } from './types.js';
import { round } from './time.js';

export function calculateCo2Kg(intervals: AlignedInterval[]): number {
  const kg = intervals.reduce((sum, interval) => {
    return sum + (interval.kwh * interval.carbonIntensityGco2PerKwh) / 1000;
  }, 0);

  return round(kg, 3);
}

export function calculateAverageCarbonIntensity(intervals: AlignedInterval[]): number {
  const totalKwh = intervals.reduce((sum, interval) => sum + interval.kwh, 0);
  if (totalKwh === 0) return 0;

  const weightedGrams = intervals.reduce((sum, interval) => {
    return sum + interval.kwh * interval.carbonIntensityGco2PerKwh;
  }, 0);

  return round(weightedGrams / totalKwh, 2);
}
