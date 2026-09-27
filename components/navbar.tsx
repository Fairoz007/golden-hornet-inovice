"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { FileText, ShoppingCart, Truck, FileSpreadsheet, FileCheck, ShieldCheck } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()

  const navLinks = [
    {
      href: "/",
      label: "Tax Invoice",
      arabic: "فاتورة ضريبية",
      icon: FileText,
      active: pathname === "/",
    },
    {
      href: "/purchase-order",
      label: "Purchase Order",
      arabic: "أمر شراء",
      icon: ShoppingCart,
      active: pathname === "/purchase-order",
    },
    {
      href: "/delivery-order",
      label: "Delivery Order",
      arabic: "أمر تسليم",
      icon: Truck,
      active: pathname === "/delivery-order",
    },
    {
      href: "/quotation",
      label: "Quotation",
      arabic: "عرض أسعار",
      icon: FileSpreadsheet,
      active: pathname === "/quotation",
    },
    {
      href: "/proforma-invoice",
      label: "Proforma Invoice",
      arabic: "فاتورة أولية",
      icon: FileCheck,
      active: pathname === "/proforma-invoice",
    },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-amber-200/50 bg-white/95 backdrop-blur-md shadow-xs print:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6">
        {/* Brand & Logo */}
        <Link href="/" className="flex items-center gap-3 group transition-transform hover:opacity-95">
          <div className="relative h-11 w-11 overflow-hidden rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 p-1 border border-amber-300/40 shadow-xs flex items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="Golden Hornet LLC Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-amber-700 transition-colors">
                GOLDEN HORNET LLC
              </span>
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-300/60">
                CR: 1000156
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-800/80 font-medium">
              <span className="font-arabic">الدبور الذهبي ش.م.م</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-500">Document Generator</span>
            </div>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
                  link.active
                    ? "bg-amber-600 text-white shadow-xs shadow-amber-600/20"
                    : "text-slate-600 hover:bg-amber-50 hover:text-amber-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${link.active ? "text-white" : "text-slate-500"}`} />
                <div className="flex flex-col text-left">
                  <span>{link.label}</span>
                  <span className={`text-[9px] -mt-0.5 ${link.active ? "text-amber-100" : "text-slate-400"}`}>
                    {link.arabic}
                  </span>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Oman Tax Badge */}
        <div className="hidden lg:flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 border border-emerald-200/60">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <div className="text-[11px] leading-tight">
            <span className="font-semibold text-emerald-900">VAT Compliant</span>
            <span className="block text-[9px] text-emerald-700">VATIN: OM1100158810</span>
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex md:hidden overflow-x-auto border-t border-slate-100 px-2 py-1.5 gap-1 scrollbar-none">
        {navLinks.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium ${
                link.active
                  ? "bg-amber-600 text-white"
                  : "text-slate-600 bg-slate-50"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{link.label}</span>
            </Link>
          )
        })}
      </div>
    </header>
  )
}
