import type { AppConfig } from '../config.js';
import { getJson } from './httpClient.js';
import type { RawMeterInterval } from '../domain/types.js';
import { generateMockMeterIntervals } from '../fixtures/mockData.js';

interface OpenvoltIntervalResponse {
  data?: unknown[];
  intervals?: unknown[];
  results?: unknown[];
  [key: string]: unknown;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

function pickString(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return undefined;
}

function pickNumber(record: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }
  return undefined;
}

function responseArray(body: OpenvoltIntervalResponse): unknown[] {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body.intervals)) return body.intervals;
  if (Array.isArray(body.results)) return body.results;
  return [];
}

export class OpenvoltClient {
  constructor(private readonly config: AppConfig) {}

  async getRawIntervals(meterId: string, from: string, to: string): Promise<RawMeterInterval[]> {
    if (this.config.mockMode) {
      return generateMockMeterIntervals(from, to);
    }

    // Practical endpoint shape used by Openvolt CLI community examples:
    // /v1/interval-data?meter_id=...&start_date=...&end_date=...&granularity=hh
    // Keep this isolated so it can be changed in one place if Openvolt shares a different challenge endpoint.
    const params = new URLSearchParams({
      meter_id: meterId,
      start_date: from,
      end_date: to,
      granularity: 'hh',
    });

    const body = await getJson<OpenvoltIntervalResponse>(
      this.config.openvoltApiHost,
      `/v1/interval-data?${params.toString()}`,
      { headers: { 'x-api-key': this.config.openvoltApiKey } },
    );

    const rows = responseArray(body);
    if (rows.length === 0) {
      throw new Error('Openvolt interval response had no data array. Inspect the raw API response and update parseOpenvoltIntervalRow.');
    }

    return rows.map(parseOpenvoltIntervalRow).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }
}

export function parseOpenvoltIntervalRow(row: unknown): RawMeterInterval {
  const record = asRecord(row);
  const timestamp = pickString(record, [
    'start_interval',
    'startInterval',
    'interval_start',
    'intervalStart',
    'from',
    'timestamp',
    'date',
  ]);

  const kwh = pickNumber(record, ['consumption', 'kwh', 'value', 'energy_kwh', 'energyKwh']);

  if (!timestamp) {
    throw new Error(`Openvolt interval row missing timestamp: ${JSON.stringify(row)}`);
  }
  if (kwh === undefined) {
    throw new Error(`Openvolt interval row missing kWh/consumption value: ${JSON.stringify(row)}`);
  }

  return {
    timestamp: new Date(timestamp).toISOString(),
    kwh,
    raw: row,
  };
}
