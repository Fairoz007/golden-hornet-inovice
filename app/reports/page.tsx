import type { Metadata } from "next"
import { FinanceWorkspace } from "@/components/finance-workspace"
export const metadata: Metadata = { title: "Financial Reports | Golden Hornet LLC", description: "Annual financial reporting and customer balances." }
export default function ReportsPage() { return <FinanceWorkspace section="reports" /> }
