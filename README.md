# GUIDANCE

**Your financial future, crystal clear.**

Production: https://guidance-nine.vercel.app · Repository: https://github.com/kylememes/guidance

An account-free financial planning platform with device-local saving. Phase 2 expands the original retirement calculator into six connected products.

## Features and routes

| Route | Experience |
| --- | --- |
| `/bay` | Local overview of monthly cash flow, retirement projection and goal progress |
| `/current` | Editable income, expense and savings categories, live totals and proportional flow ribbons |
| `/investment-horizon` | Retirement projection, employer match, inflation adjustment and interactive year exploration in a tropical sunset environment |
| `/islands` | Multiple destination goals with progress, contribution requirements, arrival estimates and accessible detail panels |
| `/in-depth` | Alternative retirement scenarios, real-dollar comparison and fee impact |
| `/compass` | Calculator discovery |
| `/calculators/compound-interest` | Growth with periodic end-of-period contributions |
| `/calculators/investment-goal` | Required monthly contributions for a target |
| `/calculators/investment-growth` | Simple growth with recurring contributions |
| `/calculators/inflation` | Purchasing power and equivalent future cost |
| `/calculators/fire` | FI number, real-return timeline, estimated age and progress |

`/horizon` and `/depth` permanently redirect to the renamed routes. About, Privacy and Terms remain available.

## Development

Next.js 16 App Router, React 19, TypeScript, Tailwind 4, Radix accessible controls and Recharts. Requires Node 22.13+ and pnpm 11.25.0.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm typecheck
pnpm build
pnpm start
```

The development wrapper accepts supervised preview host/port flags. Production uses standard Next.js.

## Architecture

- `lib/projection.ts`: pure retirement calculation engine and formatting.
- `lib/finance.ts`: compound growth, contribution targets, inflation, FIRE, cash-flow totals and goal calculations.
- `lib/storage.ts`: one versioned device-local persistence adapter and React hook. `lib/saved-data.ts` validates records with Zod and recovers safely from corrupt or incompatible data. Replace this adapter with authenticated storage for future cloud saving; preserve the pure data models.
- `lib/products.ts` and `lib/calculators.ts`: discovery catalogs.
- `components/horizon.tsx`, `planning.tsx`, `analytics.tsx`: product interfaces; `number-field.tsx`: accessible numeric entry with draft handling.
- `components/ui/`: reusable Radix-based primitives including sheets, confirmations, selectors, sliders and progress.
- `app/`: server route metadata, explanatory content, permanent redirects, sitemap and robots.
- `app/globals.css`: shared glass surfaces and responsive environment-specific designs. Reduced motion is respected. Charts render after mounting and include numeric summaries.
- `public/*.webp`: optimized original generated ocean, sunset and island artwork, not factual location photography.

## Calculation conventions

Annual returns are effective annual returns. Periodic growth is `(1 + annualReturn)^(1 / frequency) - 1`; contributions arrive at period end. Changing compound frequency also changes deposit timing, with total annual deposits held constant.

Investment Horizon grows salary annually. Percentage contributions scale with salary; fixed deposits stay fixed. Employer match is `min(employee annual deposits, salary * cap) * matchRate`. Equal current and retirement ages return the current balance. The income estimate is portfolio × withdrawal rate / 12, not a sustainability forecast.

Goal requirements use an ordinary monthly annuity formula, including the zero-return case. Partial calendar months round up. Completion is searched monthly for up to 100 years; unattainable and past-date goals are explicitly labeled. Inflation divides future values by `(1 + inflation)^years`. FIRE uses `(1 + return)/(1 + inflation) - 1`, level real contributions, and annual spending / withdrawal rate. Fee impact applies `(1 + return) * (1 - fee) - 1` to the baseline scenario.

Current uses monthly take-home income. Savings already deducted from income should not be entered again. Remaining cash may be negative. Annualization assumes 12 identical months.

No volatility, taxes, contribution limits or guaranteed outcomes are modeled. The fees module explicitly models only its selected fee.

## Persistence and privacy

Records use `guidance:v2:<key>` and `{version: 2, value}`. Goals, cash-flow categories, assumptions and scenarios stay in this browser. Storage errors surface in the UI; invalid saved records fall back safely. Privacy includes a clear-all-data control. No accounts, banking integrations, trackers, payments or cross-device sync are introduced.

The Current-to-calculator handoff uses a URL fragment, which is not sent in the HTTP request. Other product summaries use the shared local adapter. Future authentication should associate these records with a server-verified user; future paid features require server-side entitlements.

## Environment and deployment

No secrets are required. `NEXT_PUBLIC_SITE_URL` can specify a canonical HTTPS domain. Otherwise `VERCEL_PROJECT_PRODUCTION_URL` supplies the production origin; local fallback is `http://localhost:3000`.

The existing GitHub `main` branch deploys to the existing Vercel `guidance` project. Build: `pnpm build`; install: `pnpm install --frozen-lockfile`; framework: Next.js. No new project or paid integration is needed.

## Verification

Automated tests cover retirement reconciliation, matching, zero returns, effective compounding, goal requirements and dates, negative cash flow, FIRE, inflation, scenario comparisons, equal retirement/current age and malformed storage. Run `pnpm test`, `pnpm typecheck` and `pnpm build` before release.

Browser checks cover editable categories and accurate totals, refresh persistence, goal editing and progress, responsive cards/details/charts, cross-product summaries, direct routes and redirects. Mobile checks use a 390px embedded viewport; this is not a physical-device touch or orientation test. Production deployment status and live routes are verified separately from local build success.
