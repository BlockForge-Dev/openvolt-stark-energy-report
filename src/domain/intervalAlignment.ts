import type {
  AlignedInterval,
  CarbonIntensityInterval,
  DataQuality,
  GenerationMixInterval,
  MeterInterval,
  RawMeterInterval,
} from './types.js';
import { addHalfHour, expectedHalfHourStarts, subtractHalfHour } from './time.js';

type MeterTimestampMode = 'start' | 'end';

function countBy<T>(items: T[], keyFn: (item: T) => string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = keyFn(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function duplicateKeys(counts: Map<string, number>): string[] {
  return [...counts.entries()].filter(([, count]) => count > 1).map(([key]) => key).sort();
}

function detectTimestampMode(
  rawMeter: RawMeterInterval[],
  carbonIntensity: CarbonIntensityInterval[],
  generationMix: GenerationMixInterval[],
): MeterTimestampMode {
  const carbonStarts = new Set(carbonIntensity.map((x) => x.start));
  const carbonEnds = new Set(carbonIntensity.map((x) => x.end));
  const mixStarts = new Set(generationMix.map((x) => x.start));
  const mixEnds = new Set(generationMix.map((x) => x.end));

  let startScore = 0;
  let endScore = 0;

  for (const item of rawMeter.slice(0, 20)) {
    if (carbonStarts.has(item.timestamp) || mixStarts.has(item.timestamp)) startScore++;
    if (carbonEnds.has(item.timestamp) || mixEnds.has(item.timestamp)) endScore++;
  }

  return endScore > startScore ? 'end' : 'start';
}

export function normalizeMeterIntervals(
  rawMeter: RawMeterInterval[],
  carbonIntensity: CarbonIntensityInterval[],
  generationMix: GenerationMixInterval[],
): { intervals: MeterInterval[]; mode: MeterTimestampMode } {
  const mode = detectTimestampMode(rawMeter, carbonIntensity, generationMix);

  const intervals = rawMeter.map((item) => {
    const start = mode === 'start' ? item.timestamp : subtractHalfHour(item.timestamp);
    const end = mode === 'start' ? addHalfHour(item.timestamp) : item.timestamp;

    return {
      start,
      end,
      kwh: item.kwh,
      raw: item.raw,
    };
  });

  return { intervals, mode };
}

export function alignIntervals(input: {
  from: string;
  to: string;
  rawMeter: RawMeterInterval[];
  carbonIntensity: CarbonIntensityInterval[];
  generationMix: GenerationMixInterval[];
}): { aligned: AlignedInterval[]; dataQuality: DataQuality } {
  const { intervals: meter, mode } = normalizeMeterIntervals(input.rawMeter, input.carbonIntensity, input.generationMix);
  const expectedStarts = expectedHalfHourStarts(input.from, input.to);
  const expectedSet = new Set(expectedStarts);

  const meterByStart = new Map(meter.map((item) => [item.start, item]));
  const carbonByStart = new Map(input.carbonIntensity.map((item) => [item.start, item]));
  const mixByStart = new Map(input.generationMix.map((item) => [item.start, item]));

  const meterCounts = countBy(meter, (item) => item.start);

  const aligned: AlignedInterval[] = [];
  const missingMeterIntervalStarts: string[] = [];
  const missingCarbonIntensityStarts: string[] = [];
  const missingGenerationMixStarts: string[] = [];

  for (const start of expectedStarts) {
    const meterInterval = meterByStart.get(start);
    const carbonInterval = carbonByStart.get(start);
    const generationInterval = mixByStart.get(start);

    if (!meterInterval) missingMeterIntervalStarts.push(start);
    if (!carbonInterval) missingCarbonIntensityStarts.push(start);
    if (!generationInterval) missingGenerationMixStarts.push(start);

    if (meterInterval && carbonInterval && generationInterval) {
      aligned.push({
        start,
        end: meterInterval.end,
        kwh: meterInterval.kwh,
        carbonIntensityGco2PerKwh: carbonInterval.gco2PerKwh,
        carbonIntensitySource: carbonInterval.source,
        generationMix: generationInterval.mix,
      });
    }
  }

  const outOfRangeMeter = meter.filter((item) => !expectedSet.has(item.start)).length;

  return {
    aligned,
    dataQuality: {
      expectedHalfHourlyIntervals: expectedStarts.length,
      alignedIntervals: aligned.length,
      meterIntervals: meter.length,
      carbonIntensityIntervals: input.carbonIntensity.length,
      generationMixIntervals: input.generationMix.length,
      missingMeterIntervalStarts,
      duplicateMeterIntervalStarts: duplicateKeys(meterCounts),
      missingCarbonIntensityStarts,
      missingGenerationMixStarts,
      notes: [
        `Meter timestamp mode detected as '${mode}'.`,
        outOfRangeMeter > 0 ? `${outOfRangeMeter} meter intervals were outside the requested [from, to) period.` : 'No out-of-range meter intervals detected.',
      ],
    },
  };
}
