import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "System Audit Ledger | Golden Hornet LLC",
  description:
    "Append-only, immutable regulatory log recording all invoice state transitions, customer changes, settings adjustments, and asset replacements in accordance with Oman commercial audit regulations.",
}

export default function AuditLogsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
