import { loadConfig, assertCanCallOpenvolt } from './config.js';
import { buildReport } from './report/buildReport.js';
import { writeJsonReport } from './report/writeJson.js';
import { writeMarkdownReport } from './report/writeMarkdown.js';

async function main(): Promise<void> {
  const config = loadConfig();
  assertCanCallOpenvolt(config);

  console.log(`Building Stark Industries report for ${config.reportFrom} -> ${config.reportTo}`);
  if (config.mockMode) console.log('MOCK_MODE=true: using generated fixture data. Do not submit mock results as final numbers.');

  const report = await buildReport(config);

  await writeJsonReport('output/stark-january-2023-report.json', report);
  await writeMarkdownReport('output/stark-january-2023-report.md', report);

  console.log('\nReport generated successfully:');
  console.log(`- output/stark-january-2023-report.json`);
  console.log(`- output/stark-january-2023-report.md`);
  console.log('\nSummary:');
  console.table({
    energy_kwh: report.totals.energyKwh,
    co2_kg: report.totals.co2Kg,
    average_carbon_intensity_gco2_per_kwh: report.totals.averageCarbonIntensityGco2PerKwh,
    aligned_intervals: report.dataQuality.alignedIntervals,
    expected_intervals: report.dataQuality.expectedHalfHourlyIntervals,
  });
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
