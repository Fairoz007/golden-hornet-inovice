import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Financial Dashboard | Golden Hornet LLC",
  description: "Tax Financial Dashboard for Golden Hornet LLC.",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
