import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Official Quotation Generator | Golden Hornet LLC",
  description:
    "Generate and manage official commercial quotations, RFQs, and price proposals with Golden Hornet LLC letterhead, Oman VAT 5%, and OMR financial calculations.",
  keywords: [
    "Quotation",
    "Golden Hornet LLC",
    "Commercial Quote",
    "Price Estimate",
    "RFQ",
    "Sultanate of Oman",
    "Oman VAT",
    "OMR",
  ],
  openGraph: {
    title: "Official Quotation Generator | Golden Hornet LLC",
    description:
      "Generate commercial quotations and price proposals with authentic Golden Hornet LLC letterhead, official stamp, and signature.",
    type: "website",
    locale: "en_OM",
    siteName: "Golden Hornet LLC Document Management",
  },
}

export default function QuotationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
