import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { MonthlyReport } from '../domain/types.js';

export async function writeJsonReport(path: string, report: MonthlyReport): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(report, null, 2), 'utf8');
}
