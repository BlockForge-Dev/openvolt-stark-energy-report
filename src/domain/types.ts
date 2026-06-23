export type ISODateString = string;

export interface RawMeterInterval {
  /** Timestamp as supplied by Openvolt. Some APIs label this as start_interval. */
  timestamp: ISODateString;
  kwh: number;
  raw: unknown;
}

export interface MeterInterval {
  start: ISODateString;
  end: ISODateString;
  kwh: number;
  raw?: unknown;
}

export interface CarbonIntensityInterval {
  start: ISODateString;
  end: ISODateString;
  gco2PerKwh: number;
  source: 'actual' | 'forecast';
  index?: string;
  raw?: unknown;
}

export interface GenerationMixInterval {
  start: ISODateString;
  end: ISODateString;
  /** fuel -> percentage for the interval, e.g. wind -> 32.4 */
  mix: Record<string, number>;
  raw?: unknown;
}

export interface AlignedInterval {
  start: ISODateString;
  end: ISODateString;
  kwh: number;
  carbonIntensityGco2PerKwh: number;
  carbonIntensitySource: 'actual' | 'forecast';
  generationMix: Record<string, number>;
}

export interface DataQuality {
  expectedHalfHourlyIntervals: number;
  alignedIntervals: number;
  meterIntervals: number;
  carbonIntensityIntervals: number;
  generationMixIntervals: number;
  missingMeterIntervalStarts: ISODateString[];
  duplicateMeterIntervalStarts: ISODateString[];
  missingCarbonIntensityStarts: ISODateString[];
  missingGenerationMixStarts: ISODateString[];
  notes: string[];
}

export interface MonthlyReport {
  building: string;
  meterId: string;
  period: {
    from: ISODateString;
    to: ISODateString;
    timezone: 'UTC';
    intervalSemantics: '[from, to)';
  };
  totals: {
    energyKwh: number;
    co2Kg: number;
    averageCarbonIntensityGco2PerKwh: number;
  };
  fuelMixPercent: Record<string, number>;
  dataQuality: DataQuality;
  assumptions: string[];
  generatedAt: ISODateString;
}
