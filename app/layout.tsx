import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const geist = localFont({ src: "../public/fonts/geist-latin.woff2", variable: "--font-geist", display: "swap" })
const geistMono = localFont({ src: "../public/fonts/geist-mono-latin.woff2", variable: "--font-geist-mono", display: "swap" })

import { Navbar } from "@/components/navbar"

export const metadata: Metadata = {
  title: "Golden Hornet LLC | Finance & Customer Accounts",
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
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-[#f4f7f7] font-sans antialiased text-slate-900">
        <Navbar />
        <div className="min-h-screen pt-14 md:ml-[248px] md:pt-0">{children}</div>
      </body>
    </html>
  )
}
