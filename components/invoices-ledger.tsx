"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  FileText,
  Search,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  CheckCircle,
  XCircle,
  History,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { invoiceStore, type InvoiceRecord, type InvoiceStatus } from "@/lib/invoice-store"
import { formatOMR } from "@/lib/financial-calculator"

export function InvoicesLedger() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null)
  const [cancelReason, setCancelReason] = useState("")

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    setInvoices(invoiceStore.getInvoices())
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const querySearch = urlParams.get("search")
      if (querySearch) {
        setSearch(querySearch)
      }
    }
    const unsubscribe = invoiceStore.subscribe(() => {
      setInvoices(invoiceStore.getInvoices())
    })
    return () => {
      unsubscribe()
    }
  }, [])

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Status
      if (statusFilter !== "All" && inv.status !== statusFilter) return false

      // Date range
      if (startDate && inv.invoiceDate < startDate) return false
      if (endDate && inv.invoiceDate > endDate) return false

      // Search
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchesNumber = inv.invoiceNumber.toLowerCase().includes(q)
        const matchesCustomer = inv.customerSnapshot?.companyName?.toLowerCase().includes(q)
        const matchesPo = inv.poNumber?.toLowerCase().includes(q)
        if (!matchesNumber && !matchesCustomer && !matchesPo) return false
      }

      return true
    })
  }, [invoices, search, statusFilter, startDate, endDate])

  const handleFinalize = (id: string) => {
    try {
      invoiceStore.finalizeInvoice(id)
      toast({
        title: "Invoice Finalized",
        description: "The invoice has been locked and snapshot permanently saved.",
      })
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  const handleMarkPaid = (id: string) => {
    try {
      invoiceStore.markInvoicePaid(id)
      toast({
        title: "Marked as Paid",
        description: "Payment status recorded.",
      })
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  const handleDuplicate = (id: string) => {
    try {
      const duplicated = invoiceStore.duplicateInvoice(id)
      toast({
        title: "Invoice Duplicated",
        description: `Created new draft invoice ${duplicated.invoiceNumber}.`,
      })
      router.push(`/invoices/${duplicated.id}/edit`)
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  const openCancelModal = (inv: InvoiceRecord) => {
    setSelectedInvoice(inv)
    setCancelReason("")
    setCancelModalOpen(true)
  }

  const confirmCancel = () => {
    if (!selectedInvoice) return
    try {
      invoiceStore.cancelInvoice(selectedInvoice.id, cancelReason)
      setCancelModalOpen(false)
      toast({
        title: "Invoice Cancelled",
        description: `Invoice ${selectedInvoice.invoiceNumber} has been marked as cancelled. Record preserved.`,
      })
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case "Finalized":
        return <Badge className="bg-blue-600 text-white hover:bg-blue-700">Finalized</Badge>
      case "Paid":
        return <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">Paid</Badge>
      case "Cancelled":
        return <Badge className="bg-red-600 text-white hover:bg-red-700">Cancelled</Badge>
      default:
        return <Badge variant="outline" className="text-amber-800 border-amber-300 bg-amber-50">Draft</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Header */}
      <div className="border-b border-slate-200/80 bg-white px-4 py-6 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Invoice Ledger
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">Golden Hornet LLC</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
              Tax Invoices Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Create, review, finalize, print, and audit all corporate invoices.
            </p>
          </div>

          <Link href="/invoices/create">
            <Button className="h-9 gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs">
              <Plus className="h-4 w-4" />
              Create New Invoice
            </Button>
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-8 space-y-6">
        {/* Filters Bar */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by invoice number, customer, PO..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="md:col-span-4 flex items-center gap-1 overflow-x-auto">
              {["All", "Draft", "Finalized", "Paid", "Cancelled"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    statusFilter === st
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Date Pickers */}
            <div className="md:col-span-3 flex items-center gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs h-8"
                title="Start Date"
              />
              <span className="text-slate-400 text-xs">to</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs h-8"
                title="End Date"
              />
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">PO Reference</th>
                  <th className="py-3 px-4 text-right">Taxable (OMR)</th>
                  <th className="py-3 px-4 text-right">VAT 5%</th>
                  <th className="py-3 px-4 text-right">Total (OMR)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="text-amber-700 hover:text-amber-800 hover:underline"
                      >
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {inv.invoiceDate.split("-").reverse().join("-")}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 max-w-[220px] truncate">
                        {inv.customerSnapshot.companyName}
                      </div>
                      {inv.customerSnapshot.vatin && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          VATIN: {inv.customerSnapshot.vatin}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-mono text-[11px]">
                      {inv.poNumber || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700 whitespace-nowrap">
                      {formatOMR(inv.taxableValue)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700 whitespace-nowrap">
                      {formatOMR(inv.vatAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-950 whitespace-nowrap">
                      {formatOMR(inv.total)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(inv.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 shadow-md">
                          <DropdownMenuItem asChild>
                            <Link href={`/invoices/${inv.id}`} className="flex items-center gap-2 cursor-pointer">
                              <Eye className="h-4 w-4 text-slate-500" />
                              <span>View Invoice</span>
                            </Link>
                          </DropdownMenuItem>

                          {inv.status === "Draft" && (
                            <DropdownMenuItem asChild>
                              <Link href={`/invoices/${inv.id}/edit`} className="flex items-center gap-2 cursor-pointer">
                                <Edit className="h-4 w-4 text-amber-600" />
                                <span>Edit Draft</span>
                              </Link>
                            </DropdownMenuItem>
                          )}

                          {inv.status === "Draft" && (
                            <DropdownMenuItem
                              onClick={() => handleFinalize(inv.id)}
                              className="flex items-center gap-2 cursor-pointer text-blue-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Finalize Invoice</span>
                            </DropdownMenuItem>
                          )}

                          {inv.status === "Finalized" && (
                            <DropdownMenuItem
                              onClick={() => handleMarkPaid(inv.id)}
                              className="flex items-center gap-2 cursor-pointer text-emerald-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Mark as Paid</span>
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem
                            onClick={() => handleDuplicate(inv.id)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Copy className="h-4 w-4 text-slate-500" />
                            <span>Duplicate Invoice</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem asChild>
                            <Link href={`/invoices/${inv.id}?tab=history`} className="flex items-center gap-2 cursor-pointer">
                              <History className="h-4 w-4 text-slate-500" />
                              <span>View History / Audit</span>
                            </Link>
                          </DropdownMenuItem>

                          {inv.status !== "Cancelled" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => openCancelModal(inv)}
                                className="flex items-center gap-2 cursor-pointer text-red-600"
                              >
                                <XCircle className="h-4 w-4" />
                                <span>Cancel Invoice</span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}

                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                      <p className="text-sm font-semibold text-slate-600">No invoices found</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Try adjusting your search criteria or create a new invoice.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Cancel Invoice Modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Cancel Invoice {selectedInvoice?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Cancelling will change the invoice status to <strong>Cancelled</strong>. The record and
              its entire audit history will be permanently preserved as required by accounting regulations.
            </p>
            <div>
              <Label htmlFor="cancelReason" className="text-xs font-semibold text-slate-700">
                Cancellation Reason *
              </Label>
              <Textarea
                id="cancelReason"
                rows={3}
                placeholder="e.g. Client requested revised scope, project postponed, erroneous line item..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCancelModalOpen(false)}
              className="text-xs"
            >
              Back
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={confirmCancel}
              className="text-xs font-bold"
            >
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
