import type { AppConfig } from '../config.js';
import { OpenvoltClient } from '../clients/openvoltClient.js';
import { CarbonIntensityClient } from '../clients/carbonIntensityClient.js';
import { alignIntervals } from '../domain/intervalAlignment.js';
import { calculateMonthlyEnergyKwh } from '../domain/energyCalculator.js';
import { calculateCo2Kg, calculateAverageCarbonIntensity } from '../domain/emissionsCalculator.js';
import { calculateWeightedFuelMixPercent } from '../domain/fuelMixCalculator.js';
import type { MonthlyReport } from '../domain/types.js';

export async function buildReport(config: AppConfig): Promise<MonthlyReport> {
  const openvolt = new OpenvoltClient(config);
  const carbon = new CarbonIntensityClient(config);

  const [rawMeter, carbonIntensity, generationMix] = await Promise.all([
    openvolt.getRawIntervals(config.meterId, config.reportFrom, config.reportTo),
    carbon.getIntensity(config.reportFrom, config.reportTo),
    carbon.getGenerationMix(config.reportFrom, config.reportTo),
  ]);

  const { aligned, dataQuality } = alignIntervals({
    from: config.reportFrom,
    to: config.reportTo,
    rawMeter,
    carbonIntensity,
    generationMix,
  });

  const energyKwh = calculateMonthlyEnergyKwh(aligned);
  const co2Kg = calculateCo2Kg(aligned);
  const fuelMixPercent = calculateWeightedFuelMixPercent(aligned);

  return {
    building: 'Stark Industries UK HQ',
    meterId: config.meterId,
    period: {
      from: config.reportFrom,
      to: config.reportTo,
      timezone: 'UTC',
      intervalSemantics: '[from, to)',
    },
    totals: {
      energyKwh,
      co2Kg,
      averageCarbonIntensityGco2PerKwh: calculateAverageCarbonIntensity(aligned),
    },
    fuelMixPercent,
    dataQuality,
    assumptions: [
      'The report period is January 2023 represented as [2023-01-01T00:00:00.000Z, 2023-02-01T00:00:00.000Z).',
      'No building postcode/region was provided, so national GB carbon intensity and national generation mix are used.',
      'CO2 is calculated per half-hour interval as kWh * gCO2/kWh / 1000.',
      'Fuel mix is not a simple average; it is weighted by the building consumption in each half-hour interval.',
      'If actual carbon intensity is missing, the client falls back to forecast and exposes that via carbonIntensitySource.',
    ],
    generatedAt: new Date().toISOString(),
  };
}
