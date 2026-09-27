import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Proforma Invoice | Golden Hornet LLC",
  description:
    "Issue commercial Proforma Invoices with Golden Hornet LLC banking instructions, advance deposit payment terms, and 5% Oman VAT calculations.",
}

export default function ProformaInvoiceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
