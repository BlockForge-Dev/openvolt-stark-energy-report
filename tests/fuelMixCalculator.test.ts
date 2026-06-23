import { describe, expect, it } from 'vitest';
import { calculateWeightedFuelMixPercent } from '../src/domain/fuelMixCalculator.js';
import type { AlignedInterval } from '../src/domain/types.js';

const intervals: AlignedInterval[] = [
  {
    start: '2023-01-01T00:00:00.000Z',
    end: '2023-01-01T00:30:00.000Z',
    kwh: 10,
    carbonIntensityGco2PerKwh: 200,
    carbonIntensitySource: 'actual',
    generationMix: { wind: 50, gas: 50 },
  },
  {
    start: '2023-01-01T00:30:00.000Z',
    end: '2023-01-01T01:00:00.000Z',
    kwh: 20,
    carbonIntensityGco2PerKwh: 200,
    carbonIntensitySource: 'actual',
    generationMix: { wind: 25, gas: 75 },
  },
];

describe('calculateWeightedFuelMixPercent', () => {
  it('weights fuel mix by energy consumption, not by interval count', () => {
    expect(calculateWeightedFuelMixPercent(intervals)).toEqual({
      gas: 66.67,
      wind: 33.33,
    });
  });
});
