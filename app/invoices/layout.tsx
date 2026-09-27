import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tax Invoices | Golden Hornet LLC",
  description:
    "Manage, finalize, export, and print official Golden Hornet LLC Tax Invoices with sequential numbering (1250-2026), authentic letterhead, 3-decimal OMR precision, and Oman VAT compliance.",
  keywords: [
    "Tax Invoice",
    "Golden Hornet LLC",
    "Oman Tax Invoice",
    "VATIN OM1100158810",
    "CR 1000156",
    "OMR",
    "Sohar",
  ],
}

export default function InvoicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
