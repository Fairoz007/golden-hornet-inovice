import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings & Asset Management | Golden Hornet LLC",
  description:
    "Configure Golden Hornet LLC corporate identity, official banking disbursement details, asset files (logo, letterhead, seal, sign), and Oman VAT compliance defaults.",
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
