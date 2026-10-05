# Existing application audit — 5 October 2026

Routes inspected: /, /dashboard, /reports, /customers, /invoices, /invoices/create, /invoices/[id], /invoices/[id]/edit, /quotation, /proforma-invoice, /delivery-order, /purchase-order, /settings, /audit-logs and their layouts.

The rendered application uses `lib/invoice-store.ts` and browser localStorage; no Convex provider is mounted. Convex schema/mutations are a disconnected alternate backend. These modes must never be silently combined.

Problems found:
- Customer reads accidentally appended DEMO_INVOICES to customers.
- Invoice reads appended seed invoices to persisted copies, duplicating financial totals. Generated demo edits were not persisted.
- `Paid` and `paidAmount` acted as receipts without payment dates, methods or allocations. Dashboard collections were inferred from invoice status.
- Dashboard counted drafts as revenue/receivables, combined all years in monthly charts and counted entire overdue invoice instead of residual.
- Discount reduced taxable value but did not reduce item VAT.
- Invoice items exist embedded and as a separate legacy Convex table; the latter must not become another financial source.
- Commercial document forms use separate temporary form state and presets; no persisted customer relationship.
- No account transactions, expenses, credit/debit notes, receipt reversals, or advances.

Target: invoices are source documents; standalone receipts and allocation records own payment history. Invoice paid status becomes a derived compatibility field. Account and company reports use the shared integer-baisa finance engine. Legacy inferred receipts are explicitly identified during migration. Drafts/cancellations do not create revenue. Allocation changes invoice settlement without creating new cash or ledger credit. Expense data alone does not demonstrate complete costs; profit remains unavailable.

Browser data is an offline workspace, not a shared deployed accounting database. Convex deployment/configuration and access-control review are separate operational requirements.
