import type { Metadata } from "next"
import { FinanceDashboard } from "@/components/finance-dashboard"
export const metadata: Metadata = { title: "Financial Reports | Golden Hornet LLC", description: "Annual financial reporting and customer balances." }
export default function ReportsPage() { return <FinanceDashboard reportsOnly /> }
