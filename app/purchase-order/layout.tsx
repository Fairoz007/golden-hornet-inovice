import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Official Purchase Order (PO) | Golden Hornet LLC",
  description:
    "Issue and manage official Golden Hornet LLC Purchase Orders for suppliers, equipment hire, and subcontractors with Oman VAT compliance and sequential tracking.",
  keywords: [
    "Purchase Order",
    "PO",
    "Golden Hornet LLC",
    "Procurement",
    "Supplier Order",
    "Subcontractor Agreement",
    "Sohar",
    "Sultanate of Oman",
    "Oman VAT",
  ],
  openGraph: {
    title: "Official Purchase Order (PO) | Golden Hornet LLC",
    description:
      "Generate official Golden Hornet LLC Purchase Orders with complete itemized specifications, delivery schedules, and authorized executive sign-offs.",
    type: "website",
    locale: "en_OM",
    siteName: "Golden Hornet LLC Document Management",
  },
}

export default function POLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
