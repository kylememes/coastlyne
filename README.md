# GUIDANCE

A public, account-free consumer finance site. Phase 1 includes the ocean-inspired homepage, Horizon retirement calculator, product previews, methodology, privacy, and terms.

## Stack and development

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Radix-based accessible controls, Recharts. Requires Node 22.13+ and pnpm 11.25.0.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm typecheck
pnpm build
pnpm start
```

The development wrapper also accepts the supervised preview host/port flags. Production uses the standard Next.js runtime.

## Architecture

- `app/`: server-rendered routes and metadata, sitemap, robots.
- `components/horizon.tsx`: browser-only interactive calculator UI.
- `lib/projection.ts`: deterministic pure financial projection engine, independent of React.
- `lib/products.ts`: ecosystem route catalog.
- `components/shell.tsx`: responsive shared navigation/footer.
- `components/ui/`: reusable accessible primitives.
- `app/globals.css`: shared colors, typography, spacing, glass surfaces, responsive layouts, reduced-motion support.
- `tests/projection.test.ts`: seven independent correctness and invariant checks.
- `public/ocean.webp`: optimized original generated brand artwork, not a factual location photograph.

## Calculation conventions

Effective periodic growth is `(1 + annualReturn)^(1 / frequency) - 1`. Deposits occur at period end. Annual salary adjustments occur at the start of each subsequent year. Fixed deposits stay fixed; percentage deposits scale with salary. Match is `min(employee annual deposits, salary * cap) * matchRate`. Starting balance is displayed separately from new deposits. No legal contribution limits, taxes, fees, or volatility are modeled.

Inflation deflates each year's point. Estimated income is ending portfolio times editable initial withdrawal rate / 12. This is not a sustainability forecast. Negative growth uses a total portfolio chart instead of misleading stacked negative areas.

## Environment variables

No credentials or environment variables are required for calculations. Set `NEXT_PUBLIC_SITE_URL` to the final canonical HTTPS domain for SEO; alternatively Vercel's `VERCEL_PROJECT_PRODUCTION_URL` is used. Local fallback is `http://localhost:3000`. Never put secrets in `NEXT_PUBLIC_` variables.

## GitHub and Vercel deployment

Create a repository named `guidance`, push this checkout to `main`, and import that repository in Vercel. Choose Next.js, project root `.`, build `pnpm build`, install `pnpm install --frozen-lockfile`. Select the free Hobby plan if eligible. Set the canonical URL and redeploy after assigning the production domain. Future pushes to `main` deploy production; branch pushes generate previews.

No paid integrations, trackers, auth, database, or payment provider are enabled. Future accounts and saved scenarios should store versioned Assumptions records behind a server authentication boundary. Keep projection logic pure and reuse it for premium analysis. Add entitlements server-side when adding premium features; never rely on hiding a UI control. Introduce analytics through a separate consent-aware adapter, and update privacy disclosures before enabling it. Product availability is centralized in the route catalog.

## Validation status

Production build, type checking, and calculator tests are run during delivery. Deployment and Git integration must be verified separately; a local build does not imply a public deployment.

Browser QA: 375px mobile homepage and Horizon render without horizontal overflow; mobile navigation, live contributions, inflation toggle, and reset were verified. Remaining release gates: authenticated GitHub repository creation, Vercel import, deployed desktop/mobile smoke tests, and Lighthouse measurement.
