# Stark Industries UK HQ — January 2023 Energy & Carbon Report

## Executive summary

For the period **2023-01-01T00:00:00.000Z** to **2023-02-01T00:00:00.000Z** ([from, to), UTC), meter **6514167223e3d1424bf82742** consumed:

| Metric | Value |
|---|---:|
| Monthly energy consumed | 66,048 kWh |
| Monthly CO2 emitted | 11,517.725 kg CO2 |
| Consumption-weighted average carbon intensity | 174.38 gCO2/kWh |

## Weighted fuel mix

| Fuel | Weighted monthly share |
|---|---:|
| gas | 50.93% |
| nuclear | 17.00% |
| other | 4.00% |
| solar | 2.86% |
| wind | 25.21% |

## Method

CO2 is calculated at interval level:

```text
interval_co2_kg = interval_kwh * carbon_intensity_gco2_per_kwh / 1000
monthly_co2_kg = sum(interval_co2_kg)
```

Fuel mix is calculated as a consumption-weighted average:

```text
fuel_share[fuel] = sum(interval_kwh * interval_fuel_percentage[fuel]) / total_monthly_kwh
```

This avoids treating a low-consumption half hour and a high-consumption half hour as equal.

## Data quality

| Check | Value |
|---|---:|
| Expected half-hour intervals | 1488 |
| Meter intervals received | 1488 |
| Carbon intensity intervals received | 1488 |
| Generation mix intervals received | 1488 |
| Aligned intervals used | 1488 |
| Missing meter intervals | 0 |
| Duplicate meter intervals | 0 |
| Missing carbon intervals | 0 |
| Missing generation mix intervals | 0 |

### Notes

- Meter timestamp mode detected as 'start'.
- No out-of-range meter intervals detected.

### Missing samples preview

**Missing meter starts**

- None

**Duplicate meter starts**

- None

## Assumptions

- The report period is January 2023 represented as [2023-01-01T00:00:00.000Z, 2023-02-01T00:00:00.000Z).
- No building postcode/region was provided, so national GB carbon intensity and national generation mix are used.
- CO2 is calculated per half-hour interval as kWh * gCO2/kWh / 1000.
- Fuel mix is not a simple average; it is weighted by the building consumption in each half-hour interval.
- If actual carbon intensity is missing, the client falls back to forecast and exposes that via carbonIntensitySource.

## Output contract

The machine-readable JSON report is emitted alongside this Markdown file in `output/stark-january-2023-report.json`.
