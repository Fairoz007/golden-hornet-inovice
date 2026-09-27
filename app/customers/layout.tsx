import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Customer Directory | Golden Hornet LLC",
  description:
    "Manage commercial clients, tax identification numbers (VATIN), billing contacts, and historical invoice ledgers for Golden Hornet LLC.",
}

export default function CustomersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
