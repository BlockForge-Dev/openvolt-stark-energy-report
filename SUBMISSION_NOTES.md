# Submission Notes

## What to send

Send either:

1. A GitHub repository link, or
2. A zip of this folder after running the real report.

If using GitHub, do not commit `.env`.

## Before submitting

Run:

```bash
npm install
npm run test
npm run typecheck
npm run report
```

Then confirm these files exist:

```text
output/stark-january-2023-report.json
output/stark-january-2023-report.md
```

Open the Markdown report and check:

- energy kWh is not zero
- CO2 kg is not zero
- expected intervals is 1488
- aligned intervals is close to 1488
- missing interval counts are explained if non-zero
- fuel mix roughly sums to 100%

## Email positioning

Do not write: "I completed the challenge."

Write something closer to:

> I treated the challenge as a small product/data-correctness exercise rather than a one-off script. The implementation calculates the requested January 2023 metrics, but also exposes interval alignment, assumptions, and data-quality checks because those are the parts that determine whether an energy/carbon report can be trusted.

## Why this stands out

This solution shows:

- product thinking
- correctness thinking
- API integration
- TypeScript discipline
- clear written communication
- respect for climate/energy data
- developer experience
