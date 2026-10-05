# Golden Hornet LLC — Finance & Customer Accounts

Next.js 16 application for company finance, customer receivables, standalone receipts, allocations and official commercial documents. The existing browser workspace remains the active persistence mode. No hosted database is silently mixed with browser data.

## Run and verify

```sh
npm install
npm run dev
npm run typecheck
npm run test:finance
npm run build
```

Build uses the documented Webpack option; the managed local environment blocks the process port Turbopack's CSS worker requires. Fonts are bundled locally, so building does not need Google Fonts access. TypeScript errors fail the build.

## Workspace

- `/dashboard`: company KPIs, monthly revenue/collections, historical outstanding, aging, customer rankings, VAT and payment methods. Values open their supporting registers.
- `/finance`: overview and navigable revenue, receivables, payments, account, advance, unallocated, note, expense, VAT, statement, report and audit views. Search/date/customer filters and CSV exports.
- `/finance/payments/new`: customer-first OMR receipts; invoice optional. Invoice/partial treatments require an allocation. Opening-balance receipts target a real opening entry. Receipt references are normalized and unique per customer.
- `/customers/[id]`: Customer 360, complete ledger, all documents, contacts/projects/notes, issues, dated official statements, PDF/print/CSV/native sharing, receipts and applying existing advances.
- Existing commercial forms can save a customer-linked document snapshot. Projects assign posted invoices without duplicating money.

## Financial integrity

The shared `lib/finance-engine.ts` derives accounts, invoices, company metrics and statements using integer baisa. Draft/cancelled documents do not post revenue. Receipts are independent cash records; allocations are transfers within the customer account, not additional receipts. Reversals are dated and retain original history. Credits/debits, opening balances, adjustments and refunds are account transactions. Profit is unavailable without complete cost data; net cash is receipts less reversals, refunds and recorded expenses. VAT payable is an estimate of output less recorded input VAT, before settlements and eligibility adjustments.

Historical `Paid`/`paidAmount` fields migrate once as flagged settlement adjustments. They do **not** fabricate payment dates, cash collections or VAT collected. Review their account exceptions against real receipt evidence. The bundled portfolio is synthetic demo data.

Mandatory A–H tests cover no-invoice advances, partial/split/full settlements, future advance allocation, credits, dated reversals and mixed reconciliation. Additional tests cover date/method/reference/currency/customer isolation, allocation limits, legacy migration, cash-versus-revenue, discounts, later-month reversals, refunds, and actual Convex handler guards. Tests use isolated memory, not real company accounts. Browser QA used one clearly labelled synthetic customer, with its receipt reversed and history retained.

## Deployment boundary

The new Convex backend is schema/type/handler tested but no `CONVEX_DEPLOYMENT` is configured. The active UI stores data in this browser's localStorage. Before production or multi-user use, configure an authenticated deployment, connect a hosted adapter, and migrate validated opening/receipt evidence. LocalStorage is not an authenticated accounting database or backup service. OMR is the supported accounting currency; foreign-currency receipts require an explicit exchange-rate policy.

See `docs/FINANCE-AUDIT.md` for the original architecture findings and `docs/CONVEX_FINANCE.md` for backend setup and safeguards.

### Local dummy finance data

Opening the dashboard, finance module or customer workspace seeds synthetic receipts, advances (including a customer without invoices), unallocated payments, opening settlements, credit/debit notes, a reversal, expenses and customer documents once. All data stays in localStorage; no database or network is used. Existing records are preserved. Demo references are prefixed `DEMO-`; repeated initialization does not duplicate financial postings.
