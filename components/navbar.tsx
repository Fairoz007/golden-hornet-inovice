"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { BarChart3, FileSpreadsheet, FileText, History, LayoutDashboard, Landmark, PlusCircle, Settings, ShoppingCart, Truck, Users } from "lucide-react"

const primaryLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }, { href: "/finance", label: "Finance", icon: Landmark }, { href: "/finance/payments", label: "Payments", icon: Landmark }, { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/invoices", label: "Invoices", icon: FileText }, { href: "/invoices/create", label: "New Invoice", icon: PlusCircle }, { href: "/customers", label: "Customers", icon: Users },
]
const documentLinks = [
  { href: "/quotation", label: "Quotation", icon: FileSpreadsheet }, { href: "/purchase-order", label: "Purchase Order", icon: ShoppingCart },
  { href: "/delivery-order", label: "Delivery Order", icon: Truck }, { href: "/proforma-invoice", label: "Proforma Invoice", icon: FileText },
]
const utilityLinks = [{ href: "/settings", label: "Settings & Assets", icon: Settings }, { href: "/audit-logs", label: "Audit Logs", icon: History }]

function NavItem({ href, label, icon: Icon, active }: { href: string; label: string; icon: typeof LayoutDashboard; active: boolean }) {
  return <Link href={href} className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all ${active ? "bg-slate-950 text-white shadow-lg shadow-slate-950/15" : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-800"}`}><Icon className={`h-[17px] w-[17px] ${active ? "text-white" : "text-slate-400 group-hover:text-emerald-700"}`} /><span>{label}</span>{label === "Invoices" && <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] ${active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-400"}`}>Demo</span>}</Link>
}

export function Navbar() {
  const pathname = usePathname()
  const isActive = (href: string) => href === "/invoices" ? pathname === "/invoices" || (pathname.startsWith("/invoices/") && !pathname.includes("/create")) : pathname === href || pathname.startsWith(`${href}/`)
  const renderGroup = (links: typeof primaryLinks) => links.map((link) => <NavItem key={link.href} {...link} active={isActive(link.href)} />)
  const allLinks = [...primaryLinks, ...documentLinks, ...utilityLinks]
  return <>
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-[248px] border-r border-slate-200 bg-white px-4 py-5 md:flex md:flex-col print:hidden">
      <Link href="/dashboard" className="mb-8 flex items-center gap-3 px-2"><div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-emerald-700 p-1.5 shadow-sm"><Image src="/images/logo.png" alt="Golden Hornet LLC" width={32} height={32} className="object-contain" priority /></div><div><p className="text-[15px] font-bold tracking-tight text-slate-900">Golden Hornet</p><p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">Finance & accounts</p></div></Link>
      <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-400">⌕ <span className="ml-2">Search workspace</span><span className="float-right text-[10px]">⌘ K</span></div>
      <nav className="flex-1 space-y-6 overflow-y-auto"><div><p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Main menu</p><div className="space-y-1">{renderGroup(primaryLinks)}</div></div><div><p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Documents</p><div className="space-y-1">{renderGroup(documentLinks)}</div></div><div><p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">General</p><div className="space-y-1">{renderGroup(utilityLinks)}</div></div></nav>
      <div className="mt-5 rounded-2xl bg-emerald-50 p-3"><p className="text-xs font-bold text-emerald-950">Offline workspace</p><p className="mt-1 text-[11px] leading-4 text-emerald-800/70">Local data only. No account or database required.</p><Link href="/settings" className="mt-3 block text-[11px] font-bold text-emerald-700">Manage settings →</Link></div><a href="https://deerflow.tech" target="_blank" rel="noreferrer" className="mt-4 text-center text-[10px] text-slate-300 hover:text-emerald-700">Created By Deerflow</a>
    </aside>
    <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:hidden print:hidden"><Link href="/dashboard" className="flex items-center gap-2"><Image src="/images/logo.png" alt="Golden Hornet" width={30} height={30} /><span className="text-sm font-bold">Golden Hornet</span></Link><Link href="/invoices/create" className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white">New invoice</Link></div>
    <div className="fixed inset-x-0 top-14 z-30 flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 md:hidden print:hidden">{allLinks.map((link) => <Link key={link.href} href={link.href} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs ${isActive(link.href) ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-600"}`}>{link.label}</Link>)}</div>
  </>
}
