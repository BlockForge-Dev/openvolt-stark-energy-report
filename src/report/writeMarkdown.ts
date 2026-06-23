import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { MonthlyReport } from '../domain/types.js';

function list(items: string[]): string {
  if (items.length === 0) return '- None';
  return items.map((item) => `- ${item}`).join('\n');
}

function tableFromRecord(record: Record<string, number>): string {
  const rows = Object.entries(record).map(([key, value]) => `| ${key} | ${value.toFixed(2)}% |`);
  return ['| Fuel | Weighted monthly share |', '|---|---:|', ...rows].join('\n');
}

function firstN(items: string[], n = 8): string[] {
  if (items.length <= n) return items;
  return [...items.slice(0, n), `...and ${items.length - n} more`];
}

export function renderMarkdownReport(report: MonthlyReport): string {
  return `# Stark Industries UK HQ — January 2023 Energy & Carbon Report

## Executive summary

For the period **${report.period.from}** to **${report.period.to}** (${report.period.intervalSemantics}, ${report.period.timezone}), meter **${report.meterId}** consumed:

| Metric | Value |
|---|---:|
| Monthly energy consumed | ${report.totals.energyKwh.toLocaleString('en-GB')} kWh |
| Monthly CO2 emitted | ${report.totals.co2Kg.toLocaleString('en-GB')} kg CO2 |
| Consumption-weighted average carbon intensity | ${report.totals.averageCarbonIntensityGco2PerKwh.toLocaleString('en-GB')} gCO2/kWh |

## Weighted fuel mix

${tableFromRecord(report.fuelMixPercent)}

## Method

CO2 is calculated at interval level:

\`\`\`text
interval_co2_kg = interval_kwh * carbon_intensity_gco2_per_kwh / 1000
monthly_co2_kg = sum(interval_co2_kg)
\`\`\`

Fuel mix is calculated as a consumption-weighted average:

\`\`\`text
fuel_share[fuel] = sum(interval_kwh * interval_fuel_percentage[fuel]) / total_monthly_kwh
\`\`\`

This avoids treating a low-consumption half hour and a high-consumption half hour as equal.

## Data quality

| Check | Value |
|---|---:|
| Expected half-hour intervals | ${report.dataQuality.expectedHalfHourlyIntervals} |
| Meter intervals received | ${report.dataQuality.meterIntervals} |
| Carbon intensity intervals received | ${report.dataQuality.carbonIntensityIntervals} |
| Generation mix intervals received | ${report.dataQuality.generationMixIntervals} |
| Aligned intervals used | ${report.dataQuality.alignedIntervals} |
| Missing meter intervals | ${report.dataQuality.missingMeterIntervalStarts.length} |
| Duplicate meter intervals | ${report.dataQuality.duplicateMeterIntervalStarts.length} |
| Missing carbon intervals | ${report.dataQuality.missingCarbonIntensityStarts.length} |
| Missing generation mix intervals | ${report.dataQuality.missingGenerationMixStarts.length} |

### Notes

${list(report.dataQuality.notes)}

### Missing samples preview

**Missing meter starts**

${list(firstN(report.dataQuality.missingMeterIntervalStarts))}

**Duplicate meter starts**

${list(firstN(report.dataQuality.duplicateMeterIntervalStarts))}

## Assumptions

${list(report.assumptions)}

## Output contract

The machine-readable JSON report is emitted alongside this Markdown file in \`output/stark-january-2023-report.json\`.
`;
}

export async function writeMarkdownReport(path: string, report: MonthlyReport): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, renderMarkdownReport(report), 'utf8');
}
