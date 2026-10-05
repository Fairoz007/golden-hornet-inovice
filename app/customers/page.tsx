"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Users,
  Plus,
  Search,
  Building2,
  MapPin,
  Mail,
  Phone,
  FileText,
  Edit2,
  Trash2,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  Receipt,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { invoiceStore, Customer, InvoiceRecord } from "@/lib/invoice-store"
import { formatOMR } from "@/lib/financial-calculator"
import { useFinance } from "@/lib/finance-view"
import { customerSummary } from "@/lib/finance-engine"
import { accountDocuments } from "@/lib/account-documents"

export default function CustomersPage() {
  const router = useRouter()
  const finance = useFinance()
  const [view, setView] = useState("All Customers")
  const [sort, setSort] = useState("Name")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [viewInvoicesCustomer, setViewInvoicesCustomer] = useState<Customer | null>(null)
  const [deleteCustomerCandidate, setDeleteCustomerCandidate] = useState<Customer | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    companyName: "",
    poBox: "",
    address: "",
    city: "Sultanate of Oman",
    vatin: "",
    phone: "",
    email: "",
    notes: "",
  })

  // Load store
  useEffect(() => {
    const load = () => {
      setCustomers(invoiceStore.getCustomers())
      setInvoices(invoiceStore.getInvoices())
    }
    load()
    return invoiceStore.subscribe(load)
  }, [])

  const lastActivity = useMemo(() => {
    const dates: Record<string, number> = Object.fromEntries(customers.map(c=>[c.id,c.updatedAt]))
    if(finance) {
      for(const i of finance.invoices) if(i.customerId) dates[i.customerId]=Math.max(dates[i.customerId]||0,i.updatedAt)
      for(const p of finance.payments) dates[p.customerId]=Math.max(dates[p.customerId]||0,p.createdAt,p.reversedAt?Date.parse(p.reversedAt):0)
      for(const t of finance.transactions) dates[t.customerId]=Math.max(dates[t.customerId]||0,t.createdAt)
    }
    for(const c of customers) for(const a of accountDocuments.getActivity(c.id)) dates[c.id]=Math.max(dates[c.id],a.timestamp)
    return dates
  },[customers,finance])
  // Account views use the same derived balances as customer profiles and finance.
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    let rows = customers.filter(c => [c.companyName,c.vatin,c.email,c.phone,c.address,c.poBox].some(v=>v?.toLowerCase().includes(q)))
    if(finance) rows = rows.filter(c => {
      const s=customerSummary(finance,c.id)
      const last=finance.payments.filter(p=>p.customerId===c.id&&!p.reversedAt).sort((a,b)=>b.date.localeCompare(a.date))[0]
      if(dateFrom && new Date(lastActivity[c.id]||c.updatedAt).toISOString().slice(0,10)<dateFrom) return false
      if(dateTo && new Date(lastActivity[c.id]||c.updatedAt).toISOString().slice(0,10)>dateTo) return false
      if(view==="Active Customers") return (accountDocuments.getProfile(c.id).accountStatus||"Active")==="Active"
      if(view==="Customers With Balance") return s.totalOutstanding>0
      if(view==="Customers With Credit") return s.creditBalance>0
      if(view==="Customers With Advance Payments") return s.advanceBalance>0
      if(view==="Customers With Overdue Amounts") return s.totalOverdue>0
      if(view==="Customers Without Recent Payments") return !last || Date.now()-new Date(last.date).getTime()>90*86400000
      return true
    })
    return rows.sort((a,b)=>{
      if((sort==="Revenue"||view==="Top Revenue Customers")&&finance) return customerSummary(finance,b.id).totalRevenue-customerSummary(finance,a.id).totalRevenue
      if((sort==="Outstanding"||view==="Top Outstanding Customers")&&finance)return customerSummary(finance,b.id).totalOutstanding-customerSummary(finance,a.id).totalOutstanding
      if(sort==="Recent Activity"||view==="Recently Active Customers")return (lastActivity[b.id]||b.updatedAt)-(lastActivity[a.id]||a.updatedAt)
      return a.companyName.localeCompare(b.companyName)
    })
  }, [customers, searchQuery,finance,view,sort,dateFrom,dateTo,lastActivity])

  // Customer metrics helper
  const customerStats = useMemo(() => {
    const statsMap: Record<
      string,
      { count: number; totalBilled: number; invoices: InvoiceRecord[] }
    > = {}

    customers.forEach((c) => {
      statsMap[c.id] = { count: 0, totalBilled: 0, invoices: [] }
    })

    invoices.forEach((inv) => {
      if (inv.customerId && statsMap[inv.customerId]) {
        statsMap[inv.customerId].count += 1
        statsMap[inv.customerId].totalBilled += inv.total
        statsMap[inv.customerId].invoices.push(inv)
      } else {
        // match by name snapshot if customerId was empty
        const matched = customers.find(
          (c) => c.companyName.toLowerCase() === inv.customerSnapshot.companyName.toLowerCase()
        )
        if (matched && statsMap[matched.id]) {
          statsMap[matched.id].count += 1
          statsMap[matched.id].totalBilled += inv.total
          statsMap[matched.id].invoices.push(inv)
        }
      }
    })

    if(finance) customers.forEach(c=>{statsMap[c.id].totalBilled=customerSummary(finance,c.id).totalInvoiced})
    return statsMap
  }, [customers, invoices, finance])

  const totalRevenue = useMemo(() => finance ? customers.reduce((sum,c)=>sum+Math.round(customerSummary(finance,c.id).totalInvoiced*1000),0)/1000 : 0, [customers,finance])

  // Reset form
  const resetForm = () => {
    setFormData({
      companyName: "",
      poBox: "",
      address: "",
      city: "Sultanate of Oman",
      vatin: "",
      phone: "",
      email: "",
      notes: "",
    })
  }

  // Open Create Modal
  const handleOpenCreate = () => {
    resetForm()
    setIsCreateOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData({
      companyName: customer.companyName,
      poBox: customer.poBox || "",
      address: customer.address || "",
      city: customer.city || "Sultanate of Oman",
      vatin: customer.vatin || "",
      phone: customer.phone || "",
      email: customer.email || "",
      notes: customer.notes || "",
    })
  }

  // Save new customer
  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.companyName.trim()) return

    invoiceStore.createCustomer({
      companyName: formData.companyName.trim(),
      poBox: formData.poBox.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      vatin: formData.vatin.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      notes: formData.notes.trim(),
    })

    setIsCreateOpen(false)
    resetForm()
  }

  // Save edit customer
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCustomer || !formData.companyName.trim()) return

    invoiceStore.updateCustomer(editingCustomer.id, {
      companyName: formData.companyName.trim(),
      poBox: formData.poBox.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      vatin: formData.vatin.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      notes: formData.notes.trim(),
    })

    setEditingCustomer(null)
    resetForm()
  }

  // Delete customer check
  const handleDeleteCustomer = (customer: Customer) => {
    setDeleteError(null)
    const linked = customerStats[customer.id]?.count || 0
    if (linked > 0) {
      setDeleteError(
        `Cannot delete "${customer.companyName}" because ${linked} invoice(s) are associated with this client. In accordance with Omani financial compliance and audit regulations, customer records linked to invoices must remain in the system.`
      )
      setDeleteCustomerCandidate(customer)
      return
    }
    setDeleteCustomerCandidate(customer)
  }

  const confirmDelete = () => {
    if (!deleteCustomerCandidate) return
    try {
      invoiceStore.deleteCustomer(deleteCustomerCandidate.id)
      setDeleteCustomerCandidate(null)
      setDeleteError(null)
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete customer")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Users className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Customer Directory
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Manage Golden Hornet LLC commercial clients, tax identifiers (VATIN), billing contacts, and historical invoice ledgers.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleOpenCreate}
              className="bg-amber-600 hover:bg-amber-700 text-white shadow-xs font-semibold gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Customer</span>
            </Button>
          </div>
        </div>

        {/* Informational Regulatory Banner */}
        <div className="rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/50 p-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 space-y-1">
              <span className="font-bold text-amber-900">
                Customer details and issued documents
              </span>
              <p className="text-slate-600 leading-relaxed">
                Updates apply to new invoices. Issued invoices retain the customer details recorded when they were created. Open a customer to review their payments, balance and documents.
              </p>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Clients</span>
              <Users className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{customers.length}</span>
              <span className="text-[11px] text-slate-400">customer accounts</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Clients with Invoices</span>
              <Receipt className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {
                  Object.values(customerStats).filter((s) => s.count > 0).length
                }
              </span>
              <span className="text-[11px] text-emerald-600 font-medium">with billing history</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Invoiced (All Clients)</span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {formatOMR(totalRevenue)}
              </span>
              <span className="text-xs font-semibold text-amber-800">OMR</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Oman VAT Registered</span>
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {customers.filter((c) => c.vatin && c.vatin.trim().length > 0).length}
              </span>
              <span className="text-[11px] text-slate-400">clients with VATIN</span>
            </div>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              aria-label="Search customers"
              placeholder="Search by name, VATIN, phone, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <div className="text-xs text-slate-500 w-full sm:w-auto text-right">
            Showing <strong className="text-slate-900">{filteredCustomers.length}</strong> of {customers.length} clients
          </div>
        </div>

        <div className="flex flex-wrap gap-3 rounded-xl border bg-white p-4">
          <select aria-label="Customer account view" className="rounded border p-2 text-sm" value={view} onChange={e=>setView(e.target.value)}>{["All Customers","Active Customers","Customers With Balance","Customers With Credit","Customers With Advance Payments","Customers With Overdue Amounts","Customers Without Recent Payments","Top Revenue Customers","Top Outstanding Customers","Recently Active Customers"].map(v=><option key={v}>{v}</option>)}</select>
          <select aria-label="Sort customers" className="rounded border p-2 text-sm" value={sort} onChange={e=>setSort(e.target.value)}>{["Name","Revenue","Outstanding","Recent Activity"].map(v=><option key={v}>{v}</option>)}</select>
          <label className="text-xs">Activity From <Input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)}/></label>
          <label className="text-xs">Activity To <Input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)}/></label>
        </div>
        {/* Customers Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Client Company</th>
                  <th className="py-3 px-4">Location / P.O. Box</th>
                  <th className="py-3 px-4">Tax ID (VATIN)</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4 text-center">Invoices</th>
                  <th className="py-3 px-4 text-right">Total Billed</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="h-8 w-8 text-slate-300" />
                        <p className="font-semibold text-slate-600">No customers found</p>
                        <p className="text-[11px] text-slate-400">
                          Try adjusting your search criteria or add a new customer.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => {
                    const stats = customerStats[cust.id] || { count: 0, totalBilled: 0, invoices: [] }
                    return (
                      <tr key={cust.id} className="hover:bg-amber-50/30 transition-colors">
                        {/* Company Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-start gap-2.5">
                            <div className="h-8 w-8 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                              <Building2 className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 hover:text-amber-700 transition-colors text-xs sm:text-sm">
                                <Link href={`/customers/${cust.id}`}>{cust.companyName}</Link>
                              </div>
                              {cust.notes && (
                                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                  {cust.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-3.5 px-4 text-slate-600">
                          <div className="flex items-start gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                              {cust.poBox && <div className="font-medium text-slate-800">{cust.poBox}</div>}
                              <div className="text-[11px] text-slate-500">{cust.address}</div>
                              {cust.city && <div className="text-[10px] text-slate-400">{cust.city}</div>}
                            </div>
                          </div>
                        </td>

                        {/* VATIN */}
                        <td className="py-3.5 px-4">
                          {cust.vatin ? (
                            <span className="inline-flex items-center gap-1 font-mono font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                              <ShieldCheck className="h-3 w-3 text-emerald-600" />
                              {cust.vatin}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Not Provided</span>
                          )}
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4 text-slate-600 space-y-1">
                          {cust.phone ? (
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <Phone className="h-3 w-3 text-slate-400" />
                              <span className="font-mono">{cust.phone}</span>
                            </div>
                          ) : null}
                          {cust.email ? (
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <Mail className="h-3 w-3 text-slate-400" />
                              <span className="text-blue-600 hover:underline">{cust.email}</span>
                            </div>
                          ) : null}
                          {!cust.phone && !cust.email && (
                            <span className="text-slate-400 italic text-[11px]">—</span>
                          )}
                        </td>

                        {/* Invoices Count */}
                        <td className="py-3.5 px-4 text-center">
                          {stats.count > 0 ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewInvoicesCustomer(cust)}
                              className="h-6 px-2 text-[11px] font-semibold border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 gap-1"
                            >
                              <FileText className="h-3 w-3" />
                              <span>{stats.count} inv</span>
                            </Button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">0</span>
                          )}
                        </td>

                        {/* Total Billed */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                          {stats.totalBilled > 0 ? (
                            <div>
                              <span>{formatOMR(stats.totalBilled)}</span>{" "}
                              <span className="text-[10px] text-amber-700">OMR</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-normal">0.000 OMR</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Create new invoice for this customer"
                              onClick={() => router.push(`/invoices/create?customerId=${cust.id}`)}
                              className="h-7 w-7 p-0 text-slate-600 hover:text-amber-700 hover:bg-amber-100"
                            >
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Edit customer details"
                              onClick={() => handleOpenEdit(cust)}
                              className="h-7 w-7 p-0 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Delete customer"
                              onClick={() => handleDeleteCustomer(cust)}
                              className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Customer Invoices Side Sheet */}
        <Sheet
          open={!!viewInvoicesCustomer}
          onOpenChange={(open) => {
            if (!open) setViewInvoicesCustomer(null)
          }}
        >
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader className="border-b pb-4">
              <SheetTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-amber-600" />
                <span>Client Invoices</span>
              </SheetTitle>
              <SheetDescription className="text-xs text-slate-500">
                {viewInvoicesCustomer?.companyName}
              </SheetDescription>
            </SheetHeader>

            {viewInvoicesCustomer && (
              <div className="py-4 space-y-4">
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 text-xs space-y-1">
                  <div className="font-semibold text-slate-800">
                    {viewInvoicesCustomer.companyName}
                  </div>
                  {viewInvoicesCustomer.vatin && (
                    <div className="text-emerald-700 font-mono text-[11px]">
                      VATIN: {viewInvoicesCustomer.vatin}
                    </div>
                  )}
                  <div className="text-slate-500 text-[11px]">
                    {viewInvoicesCustomer.address}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Issued Invoices ({customerStats[viewInvoicesCustomer.id]?.invoices.length || 0})
                  </h4>

                  {customerStats[viewInvoicesCustomer.id]?.invoices.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      No invoices issued for this client yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {customerStats[viewInvoicesCustomer.id]?.invoices.map((inv) => (
                        <div
                          key={inv.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all bg-white"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900 text-xs">
                                #{inv.invoiceNumber}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 ${
                                  inv.status === "Paid"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                    : inv.status === "Finalized"
                                    ? "bg-blue-50 text-blue-700 border-blue-300"
                                    : inv.status === "Draft"
                                    ? "bg-slate-100 text-slate-700 border-slate-300"
                                    : "bg-rose-50 text-rose-700 border-rose-300"
                                }`}
                              >
                                {inv.status}
                              </Badge>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                              Date: {inv.invoiceDate} • Due: {inv.dueDate}
                            </div>
                            {inv.poNumber && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                PO: {inv.poNumber}
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <div className="font-mono font-bold text-xs text-slate-900">
                              {formatOMR(inv.total)} OMR
                            </div>
                            <Link
                              href={`/invoices/${inv.id}`}
                              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:underline"
                            >
                              <span>View</span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => {
                      setViewInvoicesCustomer(null)
                      router.push(`/invoices/create?customerId=${viewInvoicesCustomer.id}`)
                    }}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Invoice for this Client</span>
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Create Customer Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900">
                Add New Customer
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Register a new commercial client profile for Golden Hornet LLC invoices.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveNew} className="space-y-3.5 py-2 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="create-name" className="text-xs font-semibold text-slate-700">
                  Company Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="create-name"
                  placeholder="e.g. Petroleum Development Oman LLC"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="create-pobox" className="text-xs font-semibold text-slate-700">
                    P.O. Box & Postal Code
                  </Label>
                  <Input
                    id="create-pobox"
                    placeholder="e.g. P.O. Box 81, P.C. 100"
                    value={formData.poBox}
                    onChange={(e) => setFormData({ ...formData, poBox: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="create-vatin" className="text-xs font-semibold text-slate-700">
                    VATIN / Tax Identification
                  </Label>
                  <Input
                    id="create-vatin"
                    placeholder="e.g. OM1100012345"
                    value={formData.vatin}
                    onChange={(e) => setFormData({ ...formData, vatin: e.target.value })}
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-address" className="text-xs font-semibold text-slate-700">
                  Physical / Project Address <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="create-address"
                  placeholder="e.g. Mina Al Fahal, Muscat Governorate"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="create-phone" className="text-xs font-semibold text-slate-700">
                    Phone / Telephone
                  </Label>
                  <Input
                    id="create-phone"
                    placeholder="+968 24000000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="create-email" className="text-xs font-semibold text-slate-700">
                    Email Address
                  </Label>
                  <Input
                    id="create-email"
                    type="email"
                    placeholder="accounts@client.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-notes" className="text-xs font-semibold text-slate-700">
                  Internal Notes / Contract Reference
                </Label>
                <Textarea
                  id="create-notes"
                  rows={2}
                  placeholder="Optional billing terms, project reference, or site supervisor details"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="text-xs"
                />
              </div>

              <DialogFooter className="pt-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
                >
                  Save Customer
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Customer Dialog */}
        <Dialog
          open={!!editingCustomer}
          onOpenChange={(open) => {
            if (!open) {
              setEditingCustomer(null)
              resetForm()
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900">
                Edit Customer Record
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Updates will apply to future invoices. Historical finalized invoices remain immutable.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 py-2 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name" className="text-xs font-semibold text-slate-700">
                  Company Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="edit-name"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-pobox" className="text-xs font-semibold text-slate-700">
                    P.O. Box & Postal Code
                  </Label>
                  <Input
                    id="edit-pobox"
                    value={formData.poBox}
                    onChange={(e) => setFormData({ ...formData, poBox: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-vatin" className="text-xs font-semibold text-slate-700">
                    VATIN / Tax Identification
                  </Label>
                  <Input
                    id="edit-vatin"
                    value={formData.vatin}
                    onChange={(e) => setFormData({ ...formData, vatin: e.target.value })}
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-address" className="text-xs font-semibold text-slate-700">
                  Physical / Project Address <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-phone" className="text-xs font-semibold text-slate-700">
                    Phone / Telephone
                  </Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-email" className="text-xs font-semibold text-slate-700">
                    Email Address
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-notes" className="text-xs font-semibold text-slate-700">
                  Internal Notes / Contract Reference
                </Label>
                <Textarea
                  id="edit-notes"
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="text-xs"
                />
              </div>

              <DialogFooter className="pt-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingCustomer(null)
                    resetForm()
                  }}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
                >
                  Update Customer
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation / Ineligibility Dialog */}
        <Dialog
          open={!!deleteCustomerCandidate}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteCustomerCandidate(null)
              setDeleteError(null)
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    deleteError ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                  }`}
                >
                  <AlertCircle className="h-5 w-5" />
                </div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  {deleteError ? "Cannot Delete Customer" : "Delete Customer"}
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-slate-600 pt-2">
                {deleteError ? (
                  deleteError
                ) : (
                  <>
                    Are you sure you want to delete customer{" "}
                    <strong>&quot;{deleteCustomerCandidate?.companyName}&quot;</strong>? This action
                    will be logged in the permanent audit ledger.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="pt-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeleteCustomerCandidate(null)
                  setDeleteError(null)
                }}
                className="text-xs"
              >
                {deleteError ? "Close" : "Cancel"}
              </Button>
              {!deleteError && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={confirmDelete}
                  className="text-xs font-semibold"
                >
                  Confirm Delete
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
