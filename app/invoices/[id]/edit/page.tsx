"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import {
  FileText,
  User,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  ArrowLeft,
  Building2,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  invoiceStore,
  type Customer,
  type InvoiceItem,
  type InvoiceRecord,
} from "@/lib/invoice-store"
import {
  calculateInvoiceFinancials,
  calculateLineAmount,
  formatOMR,
} from "@/lib/financial-calculator"
import { amountToWordsOMR } from "@/lib/number-to-words"
import { GoldenHornetInvoiceView } from "@/components/golden-hornet-invoice-view"

export default function EditDraftInvoicePage() {
  const routeParams = useParams()
  const invoiceId = routeParams?.id as string
  const router = useRouter()
  const { toast } = useToast()

  const [invoice, setInvoice] = useState<InvoiceRecord | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [settings, setSettings] = useState(invoiceStore.getSettings())

  // Form State
  const [invoiceDate, setInvoiceDate] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [poNumber, setPoNumber] = useState("")
  const [paymentTerms, setPaymentTerms] = useState("")
  const [currency, setCurrency] = useState("OMR")

  // Customer State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("")
  const [customerName, setCustomerName] = useState("")
  const [customerPoBox, setCustomerPoBox] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [customerCity, setCustomerCity] = useState("Sultanate of Oman")
  const [customerVatin, setCustomerVatin] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")

  // Line items
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [discount, setDiscount] = useState<number>(0)
  const [notes, setNotes] = useState("")

  useEffect(() => {
    const custs = invoiceStore.getCustomers()
    setCustomers(custs)
    const st = invoiceStore.getSettings()
    setSettings(st)

    const inv = invoiceStore.getInvoiceById(invoiceId)
    if (inv) {
      if (inv.status !== "Draft") {
        toast({
          title: "Cannot Edit",
          description: `Invoice ${inv.invoiceNumber} is ${inv.status}. Only Drafts can be edited.`,
          variant: "destructive",
        })
        router.push(`/invoices/${inv.id}`)
        return
      }

      setInvoice(inv)
      setInvoiceDate(inv.invoiceDate)
      setDueDate(inv.dueDate)
      setPoNumber(inv.poNumber || "")
      setPaymentTerms(inv.paymentTerms)
      setCurrency(inv.currency)

      setSelectedCustomerId(inv.customerId || "")
      setCustomerName(inv.customerSnapshot.companyName)
      setCustomerPoBox(inv.customerSnapshot.poBox || "")
      setCustomerAddress(inv.customerSnapshot.address)
      setCustomerCity(inv.customerSnapshot.city || "Sultanate of Oman")
      setCustomerVatin(inv.customerSnapshot.vatin || "")
      setCustomerPhone(inv.customerSnapshot.phone || "")
      setCustomerEmail(inv.customerSnapshot.email || "")

      setItems(inv.items)
      setDiscount(inv.discount)
      setNotes(inv.notes || "")
    }
  }, [invoiceId, router, toast])

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <p className="text-xs text-slate-500">Loading invoice...</p>
      </div>
    )
  }

  const handleCustomerSelect = (custId: string) => {
    setSelectedCustomerId(custId)
    const c = customers.find((cust) => cust.id === custId)
    if (c) {
      setCustomerName(c.companyName)
      setCustomerPoBox(c.poBox || "")
      setCustomerAddress(c.address)
      setCustomerCity(c.city || "Sultanate of Oman")
      setCustomerVatin(c.vatin || "")
      setCustomerPhone(c.phone || "")
      setCustomerEmail(c.email || "")
    }
  }

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items]
    const current = { ...updated[index], [field]: value }

    const q = field === "quantity" ? parseFloat(value) || 0 : current.quantity
    const r = field === "rate" ? parseFloat(value) || 0 : current.rate
    current.amount = calculateLineAmount(q, r)

    updated[index] = current
    setItems(updated)
  }

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: `it-${Date.now()}-${items.length + 1}`,
      serialNumber: items.length + 1,
      description: "",
      poReference: poNumber || "",
      quantity: 1,
      unit: "Unit",
      rate: 0,
      taxRate: settings.defaultVatRate,
      amount: 0,
    }
    setItems([...items, newItem])
  }

  const removeItem = (index: number) => {
    if (items.length === 1) return
    const updated = items
      .filter((_, i) => i !== index)
      .map((it, idx) => ({ ...it, serialNumber: idx + 1 }))
    setItems(updated)
  }

  const financials = calculateInvoiceFinancials(
    items.map((it) => ({
      quantity: it.quantity,
      unitPrice: it.rate,
      taxRate: it.taxRate,
    })),
    discount,
    settings.defaultVatRate
  )

  const amountInWords = amountToWordsOMR(financials.total)

  const previewInvoice: InvoiceRecord = {
    ...invoice,
    invoiceDate,
    dueDate,
    customerSnapshot: {
      companyName: customerName,
      poBox: customerPoBox,
      address: customerAddress || customerPoBox || "Sultanate of Oman",
      city: customerCity,
      vatin: customerVatin,
      phone: customerPhone,
      email: customerEmail,
    },
    poNumber,
    currency,
    subtotal: financials.subtotal,
    discount: financials.discount,
    taxableValue: financials.taxableValue,
    vatAmount: financials.vatAmount,
    total: financials.total,
    amountInWords,
    paymentTerms,
    notes,
    items,
  }

  const handleSaveDraft = () => {
    try {
      invoiceStore.updateDraftInvoice(invoice.id, {
        invoiceDate,
        dueDate,
        customerId: selectedCustomerId || undefined,
        customerSnapshot: {
          companyName: customerName,
          poBox: customerPoBox,
          address: customerAddress || customerPoBox || "Sultanate of Oman",
          city: customerCity,
          vatin: customerVatin,
          phone: customerPhone,
          email: customerEmail,
        },
        poNumber,
        currency,
        discount,
        paymentTerms,
        notes,
        items,
      })

      toast({
        title: "Draft Updated",
        description: `Invoice ${invoice.invoiceNumber} changes saved.`,
      })
      router.push(`/invoices/${invoice.id}`)
    } catch (e: any) {
      toast({ title: "Save Error", description: e.message, variant: "destructive" })
    }
  }

  const handleFinalize = () => {
    try {
      invoiceStore.updateDraftInvoice(invoice.id, {
        invoiceDate,
        dueDate,
        customerId: selectedCustomerId || undefined,
        customerSnapshot: {
          companyName: customerName,
          poBox: customerPoBox,
          address: customerAddress || customerPoBox || "Sultanate of Oman",
          city: customerCity,
          vatin: customerVatin,
          phone: customerPhone,
          email: customerEmail,
        },
        poNumber,
        currency,
        discount,
        paymentTerms,
        notes,
        items,
      })

      invoiceStore.finalizeInvoice(invoice.id)

      toast({
        title: "Invoice Finalized",
        description: `Invoice ${invoice.invoiceNumber} has been finalized.`,
      })
      router.push(`/invoices/${invoice.id}`)
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  return (
    <div className="min-h-screen bg-slate-100/70 pb-16">
      {/* Top Header */}
      <div className="sticky top-[61px] z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md shadow-xs print:hidden">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href={`/invoices/${invoice.id}`}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                Edit Draft: {invoice.invoiceNumber}
              </h1>
              <p className="text-xs text-slate-500">
                Update draft values prior to formal finalization
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              className="gap-1.5 text-xs font-semibold border-slate-300"
            >
              <Save className="h-3.5 w-3.5" />
              Save Changes
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleFinalize}
              className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Finalize Invoice
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-6 space-y-6 print:hidden">
            {/* 1. Meta */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2.5">
                <FileText className="h-4 w-4 text-amber-600" />
                <h2 className="text-sm font-bold text-slate-900">Invoice Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Invoice #</Label>
                  <Input
                    value={invoice.invoiceNumber}
                    disabled
                    className="mt-1 text-xs font-mono font-bold bg-slate-100 text-slate-600"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Invoice Date *</Label>
                  <Input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Due Date</Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">PO Reference</Label>
                  <Input
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Currency</Label>
                  <Input
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="mt-1 text-xs font-bold"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Payment Terms</Label>
                  <Input
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 2. Customer */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2.5">
                <User className="h-4 w-4 text-amber-600" />
                <h2 className="text-sm font-bold text-slate-900">Customer (Bill To)</h2>
              </div>

              <div className="mb-4">
                <Label className="text-xs font-semibold text-slate-700">Select Existing Customer</Label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-xs focus:border-amber-500 focus:outline-hidden"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} {c.vatin ? `(${c.vatin})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold text-slate-700">Company Name *</Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1 text-xs font-semibold"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">P.O. Box</Label>
                  <Input
                    value={customerPoBox}
                    onChange={(e) => setCustomerPoBox(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">VATIN</Label>
                  <Input
                    value={customerVatin}
                    onChange={(e) => setCustomerVatin(e.target.value)}
                    className="mt-1 text-xs font-mono font-medium"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">City / Country</Label>
                  <Input
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Phone</Label>
                  <Input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 3. Items */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-amber-600" />
                  <h2 className="text-sm font-bold text-slate-900">Items & Charges</h2>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={addItem}
                  className="h-8 gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Line Item
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-slate-200 p-3 bg-slate-50/70"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700">Item #{item.serialNumber}</span>
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                      <div className="sm:col-span-5">
                        <Label className="text-[11px] text-slate-600 font-medium">Description</Label>
                        <Textarea
                          rows={2}
                          value={item.description}
                          onChange={(e) => handleItemChange(index, "description", e.target.value)}
                          className="text-xs mt-0.5"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label className="text-[11px] text-slate-600 font-medium">PO Ref</Label>
                        <Input
                          value={item.poReference || ""}
                          onChange={(e) => handleItemChange(index, "poReference", e.target.value)}
                          className="h-8 text-xs mt-0.5"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <Label className="text-[11px] text-slate-600 font-medium">Qty</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          className="h-8 text-xs mt-0.5 text-center font-bold"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <Label className="text-[11px] text-slate-600 font-medium">Unit</Label>
                        <Input
                          value={item.unit}
                          onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                          className="h-8 text-xs mt-0.5 text-center"
                        />
                      </div>
                      <div className="sm:col-span-1.5">
                        <Label className="text-[11px] text-slate-600 font-medium">Rate (OMR)</Label>
                        <Input
                          type="number"
                          step="0.001"
                          value={item.rate}
                          onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                          className="h-8 text-xs mt-0.5 font-semibold text-right"
                        />
                      </div>
                      <div className="sm:col-span-1.5">
                        <Label className="text-[11px] text-slate-600 font-medium">Total</Label>
                        <div className="h-8 flex items-center justify-end font-bold text-xs text-slate-900 mt-0.5 px-2 bg-slate-200/50 rounded-md">
                          {formatOMR(item.amount)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <div>
                  <Label htmlFor="discount" className="text-xs font-semibold text-slate-700">
                    Discount (OMR)
                  </Label>
                  <Input
                    id="discount"
                    type="number"
                    step="0.001"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="notes" className="text-xs font-semibold text-slate-700">
                    Special Notes
                  </Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="lg:col-span-6 lg:sticky lg:top-[128px]">
            <div className="overflow-auto rounded-xl border border-slate-300/80 bg-white p-2 shadow-md">
              <GoldenHornetInvoiceView invoice={previewInvoice} showLetterhead={true} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
