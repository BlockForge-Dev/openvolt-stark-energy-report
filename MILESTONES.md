# Implementation Milestones

This is the intentional build plan for the Openvolt founding engineer challenge.

The goal is not to show that I can write a script. The goal is to show that I can understand a product problem, respect the data, make assumptions explicit, and ship a developer-friendly solution.

---

## Milestone 0 — Frame the problem like a product engineer

### Implement

- Clarify the business question:
  - How much electricity did Stark Industries UK HQ consume in January 2023?
  - How much CO2 did that electricity generation emit?
  - What fuel mix powered that consumption?
- Define report period as `[2023-01-01T00:00:00Z, 2023-02-01T00:00:00Z)`.
- Decide that all calculations happen at half-hour interval level.
- Document assumptions in README.

### Done means

- README explains the problem in human language.
- README explains why interval-level calculations matter.
- README explains why the fuel mix must be consumption-weighted.
- The repo has a clear command to run the report.

---

## Milestone 1 — Project foundation and developer experience

### Implement

- Node.js + TypeScript project.
- `npm run report` command for real APIs.
- `npm run report:mock` command for local testing without APIs.
- `.env.example` file.
- Output directory for JSON and Markdown reports.
- Strict TypeScript config.

### Done means

- A reviewer can run:

```bash
npm install
npm run report:mock
```

- The command generates:
  - `output/stark-january-2023-report.json`
  - `output/stark-january-2023-report.md`
- The project opens cleanly in VS Code.

---

## Milestone 2 — Openvolt smart-meter data ingestion

### Implement

- Openvolt client in `src/clients/openvoltClient.ts`.
- Fetch half-hourly interval data using:
  - `meter_id`
  - `start_date`
  - `end_date`
  - `granularity=hh`
- Use `x-api-key` header.
- Parse common response shapes defensively.
- Normalize consumption values into `kWh`.

### Done means

- The Openvolt client returns a normalized list of:

```ts
{
  timestamp: string;
  kwh: number;
  raw: unknown;
}
```

- Openvolt-specific response details do not leak into calculation code.
- If the API response changes shape, only the client/parser needs to change.

---

## Milestone 3 — Carbon Intensity API ingestion

### Implement

- Carbon Intensity client in `src/clients/carbonIntensityClient.ts`.
- Fetch national carbon intensity for the period.
- Fetch national generation mix for the period.
- Prefer `actual` intensity when available.
- Fall back to `forecast` only when actual is missing.
- Normalize all timestamps to UTC ISO strings.

### Done means

- The carbon client returns clean domain objects:
  - `CarbonIntensityInterval[]`
  - `GenerationMixInterval[]`
- The rest of the app does not depend on raw external API structure.

---

## Milestone 4 — Interval alignment and data quality

### Implement

- Generate expected half-hour interval starts for January 2023.
- Expected interval count:

```text
31 days * 24 hours * 2 half-hours = 1488 intervals
```

- Align meter intervals, carbon intensity intervals, and generation mix intervals by timestamp.
- Detect:
  - missing meter intervals
  - duplicate meter intervals
  - missing carbon intensity intervals
  - missing generation mix intervals
- Support both timestamp conventions:
  - meter timestamp means interval start
  - meter timestamp means interval end

### Done means

- Report includes a `dataQuality` section.
- If there are missing/duplicate intervals, the report exposes them instead of silently hiding them.
- Calculation code only uses aligned intervals.

---

## Milestone 5 — Correct calculations

### Implement

- Monthly energy:

```text
monthly_kwh = sum(interval_kwh)
```

- Monthly CO2:

```text
interval_co2_kg = interval_kwh * carbon_intensity_gco2_per_kwh / 1000
monthly_co2_kg = sum(interval_co2_kg)
```

- Weighted fuel mix:

```text
fuel_share[fuel] = sum(interval_kwh * fuel_percentage[fuel]) / total_monthly_kwh
```

### Done means

- Calculations are implemented in small isolated domain files.
- Unit tests prove:
  - CO2 calculation is interval-level.
  - fuel mix is weighted by consumption, not simple average.
  - data quality catches missing intervals.

---

## Milestone 6 — Human and machine reports

### Implement

- JSON report for machines.
- Markdown report for humans.
- Executive summary.
- Fuel mix table.
- Data-quality table.
- Assumptions section.

### Done means

- Reviewer can inspect the JSON output programmatically.
- Reviewer can read the Markdown report without opening the code.
- README links the output files and explains the method.

---

## Milestone 7 — Final submission polish

### Implement

- Run `npm run test`.
- Run `npm run typecheck`.
- Run `npm run report` with real API key.
- Replace mock output with real output.
- Check that `.env` is not committed.
- Add a short final note in the application email explaining the engineering decisions.

### Done means

- The repo is submit-ready.
- The README reads like a product/platform engineer wrote it.
- The output shows both result numbers and calculation trustworthiness.

---

## Optional Milestone 8 — Vue dashboard polish

Only do this after the core report is correct.

### Implement

- Small Vue page that reads the generated JSON.
- Show three cards:
  - monthly kWh
  - monthly CO2 kg
  - average carbon intensity
- Show fuel mix table.
- Show data-quality warnings.

### Done means

- The dashboard is a visual layer over the same JSON output.
- It does not duplicate calculation logic.
- It improves reviewer experience without weakening correctness.
