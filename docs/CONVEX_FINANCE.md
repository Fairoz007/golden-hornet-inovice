# Convex finance backend

Invoice documents remain the sole source for invoiced revenue; draft/cancelled invoices do not post revenue. Payments record actual cash independently of documents, and allocations only link cash to debts. No invoice rows or stored balances are duplicated. Financial transactions contain opening entries, notes, adjustments, refunds, and immutable compensating reversals. All new amounts use integer baisa (1 OMR = 1,000 baisa).

`finance.addPayment` accepts optional allocations. `finance.allocatePayment` applies existing receipts. Allocation validates customer, currency, posting date, available receipt, invoice remaining value, and account debit capacity inside one serializable mutation. Reversing a payment preserves its original receipt and allocations, marking the reversal with a reason and audit entry. Derivation must ignore allocations whose receipts have been reversed. `invoices.markPaid` is intentionally disabled: status cannot create cash. Cancellation rejects live allocations and financial notes. Legacy Paid invoices require explicit migration reconciliation and cannot be cancelled as an unallocated draft.

Customer support records (contacts, projects, documents, notes) have customer indexes. Financial balance queries should use `finance.snapshot` and the same derived finance engine as dashboard/reports; currency is currently restricted to OMR rather than silently mixing currencies.

## Verification and deployment

`npx tsc -p convex/tsconfig.json --noEmit` validates the schema and handlers. Registration bindings use the installed Convex generic builders and schema-derived types. Replace/regenerate these using `npx convex codegen` once a deployment is configured.

This checkout has no configured `CONVEX_DEPLOYMENT`; running codegen reports this explicitly. No remote deployment or migrated production data was changed. The current application still needs an explicit authenticated Convex connection and migration strategy before switching local data to hosted persistence. Existing public Convex handlers do not implement tenant/auth restrictions; deployment must apply access policy consistently across the existing invoice/customer/settings endpoints and finance endpoints. Local changes must not be described as deployed or multi-user secured.

Migration must retain historical receipts and confirm any legacy Paid status against actual cash evidence; never invent receipts or fake invoices. Existing invoiceItems is retained for compatibility, while the existing invoice document items remain canonical. Never introduce a second invoice posting into financialTransactions.
