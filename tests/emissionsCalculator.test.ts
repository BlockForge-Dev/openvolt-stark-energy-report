import { describe, expect, it } from 'vitest';
import { calculateAverageCarbonIntensity, calculateCo2Kg } from '../src/domain/emissionsCalculator.js';
import type { AlignedInterval } from '../src/domain/types.js';

const intervals: AlignedInterval[] = [
  {
    start: '2023-01-01T00:00:00.000Z',
    end: '2023-01-01T00:30:00.000Z',
    kwh: 10,
    carbonIntensityGco2PerKwh: 100,
    carbonIntensitySource: 'actual',
    generationMix: {},
  },
  {
    start: '2023-01-01T00:30:00.000Z',
    end: '2023-01-01T01:00:00.000Z',
    kwh: 30,
    carbonIntensityGco2PerKwh: 300,
    carbonIntensitySource: 'actual',
    generationMix: {},
  },
];

describe('emissionsCalculator', () => {
  it('calculates interval-level CO2 in kilograms', () => {
    expect(calculateCo2Kg(intervals)).toBe(10);
  });

  it('calculates weighted average carbon intensity', () => {
    expect(calculateAverageCarbonIntensity(intervals)).toBe(250);
  });
});
