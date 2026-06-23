import type { CarbonIntensityInterval, GenerationMixInterval, RawMeterInterval } from '../domain/types.js';
import { addHalfHour, expectedHalfHourStarts } from '../domain/time.js';

export function generateMockMeterIntervals(from: string, to: string): RawMeterInterval[] {
  return expectedHalfHourStarts(from, to).map((start, index) => {
    const dailyShape = 40 + 10 * Math.sin((index % 48) / 48 * Math.PI * 2);
    const weekdayShape = index % (48 * 7) < 48 * 5 ? 8 : -6;
    const kwh = Math.max(1, dailyShape + weekdayShape);
    return {
      timestamp: start,
      kwh: Number(kwh.toFixed(3)),
      raw: { source: 'mock', start_interval: start, consumption: kwh.toFixed(3), consumption_units: 'kWh' },
    };
  });
}

export function generateMockCarbonIntensity(from: string, to: string): CarbonIntensityInterval[] {
  return expectedHalfHourStarts(from, to).map((start, index) => {
    const gco2 = 175 + 35 * Math.sin(index / 17) + 20 * Math.cos(index / 41);
    return {
      start,
      end: addHalfHour(start),
      gco2PerKwh: Math.round(gco2),
      source: 'actual',
      index: gco2 < 160 ? 'low' : gco2 < 220 ? 'moderate' : 'high',
      raw: { source: 'mock' },
    };
  });
}

export function generateMockGenerationMix(from: string, to: string): GenerationMixInterval[] {
  return expectedHalfHourStarts(from, to).map((start, index) => {
    const wind = 25 + 10 * Math.sin(index / 23);
    const solar = Math.max(0, 9 * Math.sin(((index % 48) - 12) / 48 * Math.PI * 2));
    const nuclear = 17;
    const gas = 100 - wind - solar - nuclear - 4;

    return {
      start,
      end: addHalfHour(start),
      mix: {
        wind: Number(wind.toFixed(3)),
        solar: Number(solar.toFixed(3)),
        nuclear,
        gas: Number(gas.toFixed(3)),
        other: 4,
      },
      raw: { source: 'mock' },
    };
  });
}
