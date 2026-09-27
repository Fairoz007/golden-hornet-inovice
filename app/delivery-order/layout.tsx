import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Delivery Order (DO) | Golden Hornet LLC",
  description:
    "Generate and track official Golden Hornet LLC Delivery Orders with itemized cargo quantities, receiver signatures, and vehicle registration references.",
}

export default function DeliveryOrderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
