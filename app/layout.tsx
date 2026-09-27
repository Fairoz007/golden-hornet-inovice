import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

import { Navbar } from "@/components/navbar"

export const metadata: Metadata = {
  title: "Golden Hornet LLC - Document Generator | Invoice, PO, DO, Quotation",
  description:
    "Official Document Generator for Golden Hornet LLC (Sultanate of Oman). Generate Tax Invoices, Purchase Orders, Delivery Orders, Quotations, and Proforma Invoices with authentic letterhead, stamp, signature, and automatic Oman VAT calculations.",
  generator: "Next.js",
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
        <Navbar />
        {children}
      </body>
    </html>
  )
}
