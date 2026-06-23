import type { ISODateString } from './types.js';

export const HALF_HOUR_MS = 30 * 60 * 1000;

export function toIso(date: Date): ISODateString {
  return date.toISOString();
}

export function addHalfHour(iso: ISODateString): ISODateString {
  return new Date(new Date(iso).getTime() + HALF_HOUR_MS).toISOString();
}

export function subtractHalfHour(iso: ISODateString): ISODateString {
  return new Date(new Date(iso).getTime() - HALF_HOUR_MS).toISOString();
}

export function expectedHalfHourStarts(from: ISODateString, toExclusive: ISODateString): ISODateString[] {
  const out: ISODateString[] = [];
  const start = new Date(from).getTime();
  const end = new Date(toExclusive).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) {
    throw new Error(`Invalid interval: from=${from}, to=${toExclusive}`);
  }

  for (let t = start; t < end; t += HALF_HOUR_MS) {
    out.push(new Date(t).toISOString());
  }

  return out;
}

export function normalizeCarbonApiDate(iso: ISODateString): string {
  // Carbon Intensity examples use compact UTC minute precision, e.g. 2023-01-01T00:00Z.
  // The API also accepts URL-encoded ISO strings, but this keeps generated paths readable.
  return new Date(iso).toISOString().replace(':00.000Z', 'Z');
}

export function round(value: number, places = 2): number {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
