import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Invoices Management | Golden Hornet LLC",
  description: "Tax Invoices Management for Golden Hornet LLC.",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
