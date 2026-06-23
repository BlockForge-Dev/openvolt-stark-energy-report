import type { AppConfig } from '../config.js';
import { normalizeCarbonApiDate } from '../domain/time.js';
import type { CarbonIntensityInterval, GenerationMixInterval } from '../domain/types.js';
import { getJson } from './httpClient.js';
import { generateMockCarbonIntensity, generateMockGenerationMix } from '../fixtures/mockData.js';

interface CarbonIntensityApiResponse {
  data: Array<{
    from: string;
    to: string;
    intensity: {
      forecast?: number;
      actual?: number;
      index?: string;
    };
  }>;
}

interface GenerationMixApiResponse {
  data: Array<{
    from: string;
    to: string;
    generationmix: Array<{ fuel: string; perc: number }>;
  }>;
}

export class CarbonIntensityClient {
  constructor(private readonly config: AppConfig) {}

  async getIntensity(from: string, to: string): Promise<CarbonIntensityInterval[]> {
    if (this.config.mockMode) return generateMockCarbonIntensity(from, to);

    const path = `/intensity/${encodeURIComponent(normalizeCarbonApiDate(from))}/${encodeURIComponent(normalizeCarbonApiDate(to))}`;
    const body = await getJson<CarbonIntensityApiResponse>(this.config.carbonIntensityApiHost, path);

    return body.data.map((row) => {
      const actual = row.intensity.actual;
      const forecast = row.intensity.forecast;
      const chosen = typeof actual === 'number' ? actual : forecast;

      if (typeof chosen !== 'number') {
        throw new Error(`Carbon intensity row missing actual/forecast value: ${JSON.stringify(row)}`);
      }

      const normalized: CarbonIntensityInterval = {
        start: new Date(row.from).toISOString(),
        end: new Date(row.to).toISOString(),
        gco2PerKwh: chosen,
        source: typeof actual === 'number' ? 'actual' : 'forecast',
        raw: row,
      };

      if (row.intensity.index) normalized.index = row.intensity.index;
      return normalized;
    });
  }

  async getGenerationMix(from: string, to: string): Promise<GenerationMixInterval[]> {
    if (this.config.mockMode) return generateMockGenerationMix(from, to);

    const path = `/generation/${encodeURIComponent(normalizeCarbonApiDate(from))}/${encodeURIComponent(normalizeCarbonApiDate(to))}`;
    const body = await getJson<GenerationMixApiResponse>(this.config.carbonIntensityApiHost, path);

    return body.data.map((row) => ({
      start: new Date(row.from).toISOString(),
      end: new Date(row.to).toISOString(),
      mix: Object.fromEntries(row.generationmix.map((item) => [item.fuel, item.perc])),
      raw: row,
    }));
  }
}
