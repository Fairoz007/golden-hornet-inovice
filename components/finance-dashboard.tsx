"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowUpRight, BarChart3, CheckCircle2, Clock3, FileText, Plus, RotateCcw, WalletCards } from "lucide-react"
import { invoiceStore, type InvoiceRecord } from "@/lib/invoice-store"
import { formatOMR } from "@/lib/financial-calculator"
import { Button } from "@/components/ui/button"

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function FinanceDashboard({ reportsOnly = false }: { reportsOnly?: boolean }) {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])
  useEffect(() => {
    const sync = () => setInvoices(invoiceStore.getInvoices())
    sync()
    return invoiceStore.subscribe(sync)
  }, [])

  const resetDemoData = () => {
    invoiceStore.resetDemoData()
    window.location.reload()
  }

  const metrics = useMemo(() => {
    const active = invoices.filter((i) => i.status !== "Cancelled")
    const billed = active.reduce((sum, i) => sum + i.total, 0)
    const paid = active.reduce((sum, i) => sum + (i.paidAmount ?? (i.status === "Paid" ? i.total : 0)), 0)
    const outstanding = Math.max(0, billed - paid)
    const overdue = active.filter((i) => i.status !== "Paid" && i.dueDate < new Date().toISOString().slice(0, 10)).reduce((sum, i) => sum + i.total, 0)
    const byMonth = months.map((_, index) => active.filter((i) => new Date(i.invoiceDate).getMonth() === index).reduce((sum, i) => sum + i.total, 0))
    const max = Math.max(...byMonth, 1)
    const customers = Array.from(new Set(active.map((i) => i.customerSnapshot.companyName))).map((name) => {
      const rows = active.filter((i) => i.customerSnapshot.companyName === name)
      const total = rows.reduce((sum, i) => sum + i.total, 0)
      const received = rows.reduce((sum, i) => sum + (i.paidAmount ?? (i.status === "Paid" ? i.total : 0)), 0)
      return { name, total, received, balance: total - received, count: rows.length }
    }).sort((a, b) => b.balance - a.balance)
    return { billed, paid, outstanding, overdue, byMonth, max, customers }
  }, [invoices])

  return <main className="min-h-[calc(100vh-72px)] bg-[#f4f7f7] px-4 py-6 text-slate-950 sm:px-8">
    <div className="mx-auto max-w-[1440px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Golden Hornet Finance</p><h1 className="mt-1 text-3xl font-bold tracking-tight">{reportsOnly ? "Financial reports" : "Overview"}</h1><p className="mt-1 text-sm text-slate-500">Live view of invoices, collections, and customer balances.</p></div>
        <div className="flex flex-wrap gap-2"><Button variant="outline" className="bg-white" onClick={resetDemoData}><RotateCcw className="mr-2 h-4 w-4" />Reset demo data</Button><Link href="/invoices"><Button variant="outline" className="bg-white">View invoices</Button></Link><Link href="/invoices/create"><Button className="gap-2 bg-emerald-700 hover:bg-emerald-800"><Plus className="h-4 w-4" />New invoice</Button></Link></div>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[{label:"Total billed",value:metrics.billed,icon:WalletCards,tone:"bg-emerald-700 text-white"},{label:"Collected",value:metrics.paid,icon:CheckCircle2,tone:"bg-white"},{label:"Outstanding",value:metrics.outstanding,icon:Clock3,tone:"bg-white"},{label:"Overdue",value:metrics.overdue,icon:FileText,tone:"bg-white"}].map((card) => { const Icon=card.icon; return <div key={card.label} className={`rounded-2xl border border-slate-200 p-5 shadow-sm ${card.tone}`}><div className="flex items-center justify-between"><span className="text-sm opacity-80">{card.label}</span><Icon className="h-5 w-5 opacity-80" /></div><p className="mt-5 text-2xl font-bold">{formatOMR(card.value)}</p><p className="mt-1 text-xs opacity-70">OMR · current portfolio</p></div> })}
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Cash flow</h2><p className="text-xs text-slate-500">Annual billed value by month</p></div><BarChart3 className="h-5 w-5 text-emerald-700" /></div><div className="mt-8 flex h-56 items-end gap-2 sm:gap-4">{metrics.byMonth.map((value, i) => <div key={months[i]} className="flex flex-1 flex-col items-center gap-2"><div className={`w-full rounded-t-lg transition-all ${value === Math.max(...metrics.byMonth) && value > 0 ? "bg-emerald-700" : "bg-emerald-100"}`} style={{height:`${Math.max(value / metrics.max * 100, value ? 8 : 2)}%`}} title={`${months[i]}: ${formatOMR(value)}`} /><span className="text-[10px] text-slate-400">{months[i]}</span></div>)}</div></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Portfolio health</h2><p className="text-xs text-slate-500">Collection performance</p></div><span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">{metrics.billed ? Math.round(metrics.paid / metrics.billed * 100) : 0}% collected</span></div><div className="mt-8 space-y-5"><div><div className="mb-2 flex justify-between text-xs"><span>Paid</span><strong>{formatOMR(metrics.paid)}</strong></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-emerald-600" style={{width:`${metrics.billed ? metrics.paid/metrics.billed*100 : 0}%`}} /></div></div><div><div className="mb-2 flex justify-between text-xs"><span>Outstanding</span><strong>{formatOMR(metrics.outstanding)}</strong></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-amber-500" style={{width:`${metrics.billed ? metrics.outstanding/metrics.billed*100 : 0}%`}} /></div></div></div></div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h2 className="font-semibold">Customer balances</h2><p className="text-xs text-slate-500">Invoices, payments, and remaining balance by company</p></div><Link href="/customers" className="flex items-center gap-1 text-xs font-semibold text-emerald-700">Customer directory <ArrowUpRight className="h-3.5 w-3.5" /></Link></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Company</th><th className="px-5 py-3">Invoices</th><th className="px-5 py-3 text-right">Billed</th><th className="px-5 py-3 text-right">Paid</th><th className="px-5 py-3 text-right">Balance</th></tr></thead><tbody className="divide-y divide-slate-100">{metrics.customers.map((c) => <tr key={c.name} className="hover:bg-emerald-50/40"><td className="px-5 py-4 font-medium">{c.name}</td><td className="px-5 py-4 text-slate-500">{c.count}</td><td className="px-5 py-4 text-right">{formatOMR(c.total)}</td><td className="px-5 py-4 text-right text-emerald-700">{formatOMR(c.received)}</td><td className="px-5 py-4 text-right font-semibold">{formatOMR(c.balance)}</td></tr>)}{metrics.customers.length===0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500">No customer activity yet.</td></tr>}</tbody></table></div></section>
      <p className="pb-2 text-center text-[11px] text-slate-400">Local demo mode · data is stored in this browser only · no login or database connection required</p>
    </div>
  </main>
}
