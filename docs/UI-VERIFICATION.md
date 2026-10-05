# UI upgrade verification

Reviewed application navigation, financial dashboard/registers/reports, standalone payments/allocation, customer directory/workspace, invoice creation/editing, commercial documents and settings.

Changes include functional sidebar page filtering and specific active navigation, dashboard hierarchy/loading/empty states, mobile-safe layouts, persistent field labels, Radix account dialogs, required conditional cheque numbers, bounded attachment uploads, explicit settings storage failures, blank invoice creation defaults and wrapped/paginated customer receipts. The application now mounts save/error notifications; Reports opens the report workspace directly. Customer and financial values retain their shared calculation sources. Persistence remains browser-local; no database was connected.

Verification completed:

- Finance reconciliation scenarios A–H, integrity and local demo initialization tests pass.
- Application and Convex TypeScript checks pass.
- Webpack production build passes for all configured routes.
- Whitespace diff check passes.
- Browser: payment page width equals a 390px viewport; customer workspace width equals a 390px viewport after repairs.
- Browser: choosing Cheque reveals a required cheque-number field.
- Browser: account-entry dialog focuses Close, Escape dismisses it and restores focus to its trigger.
- Desktop dashboard layout inspected visually.

Limitations: these are source/build checks and focused browser workflows, not a claim of exhaustive feature coverage. Some browser approval requests timed out and succeeded on retry. Real phone hardware, mobile keyboard/notch behavior and print on physical printers were not available for verification. The existing documented offline persistence and undeployed Convex limitations remain.
