"use client"
import { useEffect, useState } from "react"
import { accountDocuments } from "./account-documents"
import { ensureFinanceDemo } from "./finance-demo"
import { financeStore } from "./finance-store"
import type { FinanceSnapshot } from "./finance-engine"
export function useFinance() {
  const [snapshot, setSnapshot] = useState<FinanceSnapshot | null>(null)
  useEffect(() => { ensureFinanceDemo(); const sync = () => setSnapshot(financeStore.getSnapshot()); sync(); const unsubscribe = financeStore.subscribe(sync); const offRecords = accountDocuments.subscribe(sync); window.addEventListener("storage", sync); return () => { unsubscribe(); offRecords(); window.removeEventListener("storage", sync) } }, [])
  return snapshot
}
export function exportCsv(name: string, headers: string[], rows: unknown[][]) {
  const cell = (value: unknown) => { const raw = String(value ?? ""); const safe = /^[=+@\-]/.test(raw) ? `'${raw}` : raw; return `"${safe.replaceAll('"', '""')}"` }
  const blob = new Blob(["\ufeff" + [headers, ...rows].map(row => row.map(cell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${name}.csv`; anchor.click(); URL.revokeObjectURL(url)
}
export const financeSections = ["Overview", "Revenue", "Receivables", "Payments", "Customer Accounts", "Invoices", "Advances", "Unallocated Payments", "Credit Notes", "Debit Notes", "Expenses", "VAT", "Statements", "Reports", "Audit"]
export const sectionSlug = (s: string) => s.toLowerCase().replaceAll(" ", "-")
