# In Depth: data setup and verification

Implemented 2026-09-28. The deployed workspace is intentionally honest when credentials are missing. No demo quotes, financial statements, earnings, news, or AI output are served.

## Provider decision

FMP is the provisional adapter because one stable API covers the requested US universe, quotes, annual/quarterly statements, ratios, price history, earnings and news. A single provider keeps integration and request costs lower. It is not a claim that coverage or commercial rights have been verified for this account.

Official sources reviewed 2026-09-28:
- https://site.financialmodelingprep.com/developer/docs/pricing
- https://site.financialmodelingprep.com/developer/docs
- https://site.financialmodelingprep.com/developer/docs/stable/historical-price-eod-full
- https://site.financialmodelingprep.com/developer/docs/stable/income-statement
- https://site.financialmodelingprep.com/developer/docs/stable/batch-quote
- https://www.alphavantage.co/documentation/
- https://www.alphavantage.co/premium/

FMP lists individual annual-billing rates of $19/month Starter (up to 5 years), $49/month Premium (up to 30 years; comparison table says 30+), $99/month Ultimate (full history and batch delivery). These are NOT public-site license prices. The pricing page explicitly requires a Data Display and Licensing Agreement for display/redistribution; request a commercial quote including all endpoints, symbols, storage/cache rights and AI processing. Historical availability varies with IPO dates, issuer reporting, and subscription; 30 years of quarterly statements is not guaranteed by a marketing headline. Batch access may require a higher entitlement.

Alpha Vantage was also reviewed: broad fundamentals, quotes, news and long price history, with separate real-time/delayed entitlements. Its documentation does not establish 30+ years of complete annual AND quarterly statements for this universe. It is not currently wired in. Price-history length must not be confused with statement history.

## Server environment variables (Vercel production)

| Variable | Purpose |
| --- | --- |
| `FMP_API_KEY` | Licensed FMP API credential, server only |
| `FMP_DISPLAY_LICENSED=true` | Enable only after obtaining display, cache and intended AI-use rights |
| `FMP_QUOTE_LATENCY` | Contract-verified `real-time`, `15-minute delayed`, or `end-of-day`; otherwise unverified |
| `OPENAI_API_KEY` | Optional AI credential, server only |
| `OPENAI_MODEL` | Explicitly chosen model supporting Chat Completions structured JSON; check account price and access first |
| `RESEARCH_AI_ENABLED=true` | Enables on-demand AI only when all dependencies are configured |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Shared AI result cache, in-flight locks and atomic daily usage counter |
| `RESEARCH_AI_DAILY_LIMIT` | Total generated analyses per UTC day, default 20, hard maximum 1000 |

Never use `NEXT_PUBLIC_` for keys. No subscription, paid service or credentials were purchased/provisioned by this implementation. AI has a maximum 1,800 output tokens per request; a request-count ceiling is not a dollar budget. Set provider billing alerts/limits separately. A public visitor can exhaust the shared allowance; add user-level authentication/quota before a larger launch. Errors fail closed; there is no paid AI request if the shared cache is unavailable.

## Endpoints and caching

`GET /api/research?kind=...&symbols=NVDA&period=annual` accepts only the configured symbols and resource names. All quote requests use one shared, cached universe batch and then filter the response. Prices cache for 5 minutes; news 15 minutes; earnings 1 hour; profiles/statements/ratios/daily history 24 hours. Only mounted views fetch. Quote polling pauses when hidden, and periodic polling runs only weekdays 09:30–16:15 America/New_York. This is a refresh window, not a certified exchange calendar: holidays, early closes and pre/post-market data remain explicitly unverified. Initial view visits can fetch outside that window. Real-time entitlement does not imply tick-by-tick UI refresh.

AI uses compact normalized statements or deterministic portfolio weights. No raw article bodies or full statements are sent to the model. Results are keyed to source-data hashes/model/prompt version and expire after seven days. Financial values are calculated by application code. Dates, source links and Facts/Interpretation/Scenario instructions accompany model input; invalid output/source IDs are rejected. Semantic accuracy still requires review. Model is not allowed to invent facts outside the supplied sources; growth/risk cases are conditional hypotheses.

## Supported now

- Configurable company universe: edit `lib/research/config.ts`; no duplicated UI.
- Tesla is TSLA. GOOG and GOOGL share the Alphabet issuer key.
- Research overview, daily-price charts/table, financial statements/chart/table/period comparisons, ratios, earnings and news adapters.
- Manual five-year FCFF/WACC DCF, per-year forecasts, perpetual-growth or FCFF exit multiple, cash/debt/diluted shares, scenarios and sensitivity grid.
- Locally saved, validated fractional holdings; edit/delete; value, cost, unrealized P/L and issuer concentration when all quotes exist.
- Loading, no-data, subscription/error and disabled-AI states.

## Explicit limitations and activation gate

Credentialed feeds and paid AI are NOT verified until valid credentials and display entitlements are configured. Before marking live research complete:
1. Test all configured tickers, currency, timestamps and each endpoint using the purchased plan. Validate FMP response fields against real responses.
2. Record first/last annual AND quarterly period by ticker for each statement. Check missing periods, restatements and reporting currency. Do not synthesize older records.
3. Reconcile a sample company's income/balance/cash flow figures to its SEC filing and document whether cash-flow quarters are standalone or cumulative.
4. Validate split adjustment of price series. Charts are labeled price-only with unverified adjustment basis; not total-return series.
5. Verify quote latency/session with the license and exchange schedule before claiming real-time sessions. Current timestamps are displayed, session status is unverified.
6. Earnings surprise output remains disabled because the current feed does not certify matching fiscal period, currency and GAAP/adjusted basis. The calculation helper is tested but must not be enabled without comparable inputs.
7. Review generated analysis for factual support and verify Redis deduplication/daily limits using a test account.
8. Historical portfolio returns remain unavailable. Dated transactions, cash-flow timing, split events, dividends/reinvestment and reconciled positions must be implemented before enabling historical charts. Average-cost snapshots are insufficient.

DCF inputs are manual and reset on leaving the view; they are not auto-derived from potentially incompatible levered cash-flow fields. Sector-specific models for banks/insurers and distressed companies are not implemented. Existing Investment Horizon/Current/Islands/Compass calculations remain separate.
