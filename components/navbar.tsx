"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Users,
  Settings,
  History,
  FileSpreadsheet,
  Truck,
  ShoppingCart,
  ChevronDown,
  ShieldCheck,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const pathname = usePathname()

  const mainLinks = [
    {
      href: "/invoices",
      label: "Invoices",
      icon: FileText,
      active: pathname.startsWith("/invoices") && pathname !== "/invoices/create",
    },
    {
      href: "/invoices/create",
      label: "New Invoice",
      icon: PlusCircle,
      active: pathname === "/invoices/create",
    },
    {
      href: "/quotation",
      label: "Quotation",
      icon: FileSpreadsheet,
      active: pathname.startsWith("/quotation"),
    },
    {
      href: "/purchase-order",
      label: "Purchase Order",
      icon: ShoppingCart,
      active: pathname.startsWith("/purchase-order"),
    },
    {
      href: "/customers",
      label: "Customers",
      icon: Users,
      active: pathname.startsWith("/customers"),
    },
    {
      href: "/settings",
      label: "Settings & Assets",
      icon: Settings,
      active: pathname.startsWith("/settings"),
    },
    {
      href: "/audit-logs",
      label: "Audit Logs",
      icon: History,
      active: pathname.startsWith("/audit-logs"),
    },
  ]

  const otherDocs = [
    { href: "/delivery-order", label: "Delivery Order", icon: Truck },
    { href: "/proforma-invoice", label: "Proforma Invoice", icon: FileText },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-amber-200/60 bg-white/95 backdrop-blur-md shadow-xs print:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6">
        {/* Brand & Logo */}
        <Link href="/invoices" className="flex items-center gap-3 group transition-transform hover:opacity-95">
          <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 p-1 border border-amber-300/40 shadow-xs flex items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="Golden Hornet LLC Logo"
              width={36}
              height={36}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 group-hover:text-amber-700 transition-colors">
                GOLDEN HORNET LLC
              </span>
              <span className="hidden sm:inline-flex rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-300/60">
                CR: 1000156
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-800/80 font-medium">
              <span className="font-arabic text-[11px]">الدبور الذهبي ش.م.م</span>
              <span className="text-slate-300">•</span>
              <span className="text-[10.5px] text-slate-500">Invoice Management</span>
            </div>
          </div>
        </Link>

        {/* Desktop Main Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {mainLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  link.active
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-amber-50 hover:text-amber-900"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${link.active ? "text-white" : "text-slate-500"}`} />
                <span>{link.label}</span>
              </Link>
            )
          })}

          {/* Other Documents Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 px-2.5 text-xs font-medium text-slate-600 hover:text-amber-900 hover:bg-amber-50"
              >
                <span>Other Docs</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white shadow-lg border border-slate-200">
              {otherDocs.map((doc) => {
                const DocIcon = doc.icon
                const isActive = pathname === doc.href
                return (
                  <DropdownMenuItem key={doc.href} asChild>
                    <Link
                      href={doc.href}
                      className={`flex items-center gap-2 cursor-pointer text-xs ${
                        isActive ? "font-bold text-amber-600 bg-amber-50" : "text-slate-700"
                      }`}
                    >
                      <DocIcon className="h-4 w-4 text-slate-500" />
                      <span>{doc.label}</span>
                    </Link>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Right Info: VAT Badge */}
        <div className="hidden sm:flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 border border-emerald-200/60">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <div className="text-[11px] leading-tight">
            <span className="font-semibold text-emerald-900">Oman VAT 5%</span>
            <span className="block text-[9px] text-emerald-700">OM1100158810</span>
          </div>
        </div>
      </div>

      {/* Subnav for Mobile & Tablet */}
      <div className="flex lg:hidden overflow-x-auto border-t border-slate-100 px-2 py-1.5 gap-1 scrollbar-none bg-slate-50/50">
        {mainLinks.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${
                link.active ? "bg-amber-600 text-white" : "text-slate-600 bg-white border border-slate-200"
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
