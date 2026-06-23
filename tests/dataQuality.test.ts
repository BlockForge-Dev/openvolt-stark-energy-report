import { describe, expect, it } from 'vitest';
import { alignIntervals } from '../src/domain/intervalAlignment.js';
import type { CarbonIntensityInterval, GenerationMixInterval, RawMeterInterval } from '../src/domain/types.js';

const from = '2023-01-01T00:00:00.000Z';
const to = '2023-01-01T01:00:00.000Z';

const carbon: CarbonIntensityInterval[] = [
  { start: '2023-01-01T00:00:00.000Z', end: '2023-01-01T00:30:00.000Z', gco2PerKwh: 100, source: 'actual' },
  { start: '2023-01-01T00:30:00.000Z', end: '2023-01-01T01:00:00.000Z', gco2PerKwh: 200, source: 'actual' },
];

const mix: GenerationMixInterval[] = [
  { start: '2023-01-01T00:00:00.000Z', end: '2023-01-01T00:30:00.000Z', mix: { wind: 100 } },
  { start: '2023-01-01T00:30:00.000Z', end: '2023-01-01T01:00:00.000Z', mix: { gas: 100 } },
];

describe('alignIntervals', () => {
  it('detects missing meter intervals', () => {
    const rawMeter: RawMeterInterval[] = [
      { timestamp: '2023-01-01T00:00:00.000Z', kwh: 10, raw: {} },
    ];

    const result = alignIntervals({ from, to, rawMeter, carbonIntensity: carbon, generationMix: mix });
    expect(result.dataQuality.expectedHalfHourlyIntervals).toBe(2);
    expect(result.dataQuality.alignedIntervals).toBe(1);
    expect(result.dataQuality.missingMeterIntervalStarts).toEqual(['2023-01-01T00:30:00.000Z']);
  });

  it('can align meter timestamps that represent interval end time', () => {
    const rawMeter: RawMeterInterval[] = [
      { timestamp: '2023-01-01T00:30:00.000Z', kwh: 10, raw: {} },
      { timestamp: '2023-01-01T01:00:00.000Z', kwh: 20, raw: {} },
    ];

    const result = alignIntervals({ from, to, rawMeter, carbonIntensity: carbon, generationMix: mix });
    expect(result.dataQuality.alignedIntervals).toBe(2);
    expect(result.aligned[0]?.start).toBe('2023-01-01T00:00:00.000Z');
  });
});
