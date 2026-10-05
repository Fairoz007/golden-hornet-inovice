"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  FileText,
  User,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  ArrowLeft,
  UserPlus,
  Sparkles,
  Building2,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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

export default function CreateInvoicePage() {
  const router = useRouter()
  const { toast } = useToast()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [settings, setSettings] = useState(invoiceStore.getSettings())

  // Invoice Form State
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [invoiceDate, setInvoiceDate] = useState(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Muscat" }))
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
  )
  const [poNumber, setPoNumber] = useState("")
  const [paymentTerms, setPaymentTerms] = useState(settings.paymentTerms)
  const [currency, setCurrency] = useState(settings.currency)

  // Customer State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("")
  const [customerName, setCustomerName] = useState("")
  const [customerPoBox, setCustomerPoBox] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [customerCity, setCustomerCity] = useState("Sultanate of Oman")
  const [customerVatin, setCustomerVatin] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")

  // Quick Customer Creation Modal
  const [newCustomerModalOpen, setNewCustomerModalOpen] = useState(false)
  const [newCustName, setNewCustName] = useState("")
  const [newCustPoBox, setNewCustPoBox] = useState("")
  const [newCustAddress, setNewCustAddress] = useState("")
  const [newCustCity, setNewCustCity] = useState("Muscat, Sultanate of Oman")
  const [newCustVatin, setNewCustVatin] = useState("")
  const [newCustPhone, setNewCustPhone] = useState("")
  const [newCustEmail, setNewCustEmail] = useState("")

  // Items
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: "it-init-1",
      serialNumber: 1,
      description: "",
      poReference: "",
      quantity: 1,
      unit: "Hrs",
      rate: 0,
      taxRate: settings.defaultVatRate,
      amount: 0,
    },
  ])

  const [discount, setDiscount] = useState<number>(0)
  const [notes, setNotes] = useState("")

  useEffect(() => {
    const custs = invoiceStore.getCustomers()
    setCustomers(custs)
    const st = invoiceStore.getSettings()
    setSettings(st)
    setPaymentTerms(st.paymentTerms)

    // Check if customerId is passed in URL query
    let targetCust: Customer | null = null
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const queryCustId = urlParams.get("customerId")
      if (queryCustId) {
        targetCust = custs.find((c) => c.id === queryCustId) || null
      }
    }

    if (targetCust) {
      setSelectedCustomerId(targetCust.id)
      setCustomerName(targetCust.companyName)
      setCustomerPoBox(targetCust.poBox || "")
      setCustomerAddress(targetCust.address)
      setCustomerCity(targetCust.city || "Sultanate of Oman")
      setCustomerVatin(targetCust.vatin || "")
      setCustomerPhone(targetCust.phone || "")
      setCustomerEmail(targetCust.email || "")
    }

    // Next sequential invoice number
    setInvoiceNumber(invoiceStore.getNextInvoiceNumber())
  }, [])

  // Auto-populate customer when dropdown selection changes
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
    } else {
      setCustomerName("")
      setCustomerPoBox("")
      setCustomerAddress("")
      setCustomerCity("Sultanate of Oman")
      setCustomerVatin("")
      setCustomerPhone("")
      setCustomerEmail("")
    }
  }

  // Create new customer directly from screen
  const handleSaveNewCustomer = () => {
    if (!newCustName.trim()) {
      toast({ title: "Validation Error", description: "Company name is required.", variant: "destructive" })
      return
    }

    try {
      const created = invoiceStore.createCustomer({
        companyName: newCustName,
        poBox: newCustPoBox,
        address: newCustAddress || newCustCity,
        city: newCustCity,
        vatin: newCustVatin,
        phone: newCustPhone,
        email: newCustEmail,
      })

      setCustomers(invoiceStore.getCustomers())
      setSelectedCustomerId(created.id)
      setCustomerName(created.companyName)
      setCustomerPoBox(created.poBox || "")
      setCustomerAddress(created.address)
      setCustomerCity(created.city || "Sultanate of Oman")
      setCustomerVatin(created.vatin || "")
      setCustomerPhone(created.phone || "")
      setCustomerEmail(created.email || "")

      setNewCustomerModalOpen(false)
      toast({ title: "Customer Added", description: `Customer "${created.companyName}" registered.` })
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  // Line item handlers
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

  // Decimal-safe calculations
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

  // Ephemeral invoice object for live A4 preview
  const previewInvoice: InvoiceRecord = {
    id: "preview-temp",
    invoiceNumber: invoiceNumber || "1250-2026",
    invoiceDate,
    dueDate,
    customerId: selectedCustomerId,
    customerSnapshot: {
      companyName: customerName || "Customer Name",
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
    vatRate: financials.vatRate,
    vatAmount: financials.vatAmount,
    total: financials.total,
    amountInWords,
    paymentTerms,
    bankDetailsSnapshot: settings.bankDetails,
    companyDetailsSnapshot: settings.companyDetails,
    letterheadAsset: settings.letterheadUrl,
    logoAsset: settings.logoUrl,
    stampAsset: settings.stampUrl,
    signatureAsset: settings.signatureUrl,
    enableStamp: settings.enableStamp,
    enableSignature: settings.enableSignature,
    status: "Draft",
    notes,
    items,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  const handleSaveInvoice = (finalizeImmediately = false) => {
    if (!invoiceNumber.trim()) {
      toast({ title: "Validation Error", description: "Invoice number is required.", variant: "destructive" })
      return
    }
    if (!customerName.trim()) {
      toast({ title: "Validation Error", description: "Customer name is required.", variant: "destructive" })
      return
    }
    if (items.length === 0 || items.every((i) => !i.description.trim())) {
      toast({ title: "Validation Error", description: "Please add at least one line item with description.", variant: "destructive" })
      return
    }

    try {
      const created = invoiceStore.createInvoice({
        invoiceNumber,
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
        vatRate: settings.defaultVatRate,
        paymentTerms,
        notes,
        bankDetailsSnapshot: settings.bankDetails,
        companyDetailsSnapshot: settings.companyDetails,
        letterheadAsset: settings.letterheadUrl,
        logoAsset: settings.logoUrl,
        stampAsset: settings.stampUrl,
        signatureAsset: settings.signatureUrl,
        enableStamp: settings.enableStamp,
        enableSignature: settings.enableSignature,
        status: finalizeImmediately ? "Finalized" : "Draft",
        items,
        finalizeImmediately,
      })

      toast({
        title: finalizeImmediately ? "Invoice Finalized" : "Draft Saved",
        description: `Invoice ${created.invoiceNumber} successfully created.`,
      })

      router.push(`/invoices/${created.id}`)
    } catch (e: any) {
      toast({ title: "Save Failed", description: e.message, variant: "destructive" })
    }
  }

  return (
    <div className="min-h-screen bg-slate-100/70 pb-16">
      {/* Top Header Toolbar */}
      <div className="sticky top-[61px] z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md shadow-xs print:hidden">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/invoices">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                Create Tax Invoice
              </h1>
              <p className="text-xs text-slate-500">
                Golden Hornet LLC • Oman VAT Compliant Invoice
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSaveInvoice(false)}
              className="gap-1.5 text-xs font-semibold border-slate-300"
            >
              <Save className="h-3.5 w-3.5" />
              Save as Draft
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => handleSaveInvoice(true)}
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
          {/* Left Column: Form Controls (6 cols) */}
          <div className="lg:col-span-6 space-y-6 print:hidden">
            {/* 1. Invoice Meta */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2.5">
                <FileText className="h-4 w-4 text-amber-600" />
                <h2 className="text-sm font-bold text-slate-900">Invoice Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Invoice # *</Label>
                  <Input
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="e.g. 1251-2026"
                    className="mt-1 text-xs font-mono font-bold"
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
                  <Label className="text-xs font-semibold text-slate-700">LPO / PO Reference</Label>
                  <Input
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    placeholder="e.g. RT-OM-PRJ-O-304-2026-0063"
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
                    placeholder="e.g. 30 Days After Submission"
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 2. Customer Information with Dropdown & Direct Creation */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-amber-600" />
                  <h2 className="text-sm font-bold text-slate-900">Customer (Bill To)</h2>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewCustomerModalOpen(true)}
                  className="h-7 gap-1 text-[11px] font-semibold border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100"
                >
                  <UserPlus className="h-3 w-3 text-amber-700" />
                  + New Customer
                </Button>
              </div>

              {/* Customer Selector Dropdown */}
              <div className="mb-4">
                <Label className="text-xs font-semibold text-slate-700">Select Existing Customer</Label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-xs focus:border-amber-500 focus:outline-hidden"
                >
                  <option value="">-- Choose Customer from Directory --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} {c.vatin ? `(${c.vatin})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold text-slate-700">Company / Client Name *</Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Renewable Energy Technology Investment"
                    className="mt-1 text-xs font-semibold"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">P.O. Box</Label>
                  <Input
                    value={customerPoBox}
                    onChange={(e) => setCustomerPoBox(e.target.value)}
                    placeholder="e.g. P.O.BOX: 311, Sohar"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Customer VATIN (Tax ID)</Label>
                  <Input
                    value={customerVatin}
                    onChange={(e) => setCustomerVatin(e.target.value)}
                    placeholder="e.g. OM110038464X"
                    className="mt-1 text-xs font-mono font-medium"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">City / Country</Label>
                  <Input
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    placeholder="e.g. Sultanate of Oman"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Phone</Label>
                  <Input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. +968 26845200"
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 3. Invoice Items */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-amber-600" />
                  <h2 className="text-sm font-bold text-slate-900">Line Items & Services</h2>
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
                    className="rounded-lg border border-slate-200 p-3 bg-slate-50/70 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700">
                        Item #{item.serialNumber}
                      </span>
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
                        <Label className="text-[11px] text-slate-600 font-medium">Description *</Label>
                        <Textarea
                          rows={2}
                          value={item.description}
                          onChange={(e) => handleItemChange(index, "description", e.target.value)}
                          placeholder="e.g. Rental Charges for Hiring NON PDO Tipper With Driver Reg.NO : 0390"
                          className="text-xs mt-0.5"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label className="text-[11px] text-slate-600 font-medium">PO / Ref</Label>
                        <Input
                          value={item.poReference || ""}
                          onChange={(e) => handleItemChange(index, "poReference", e.target.value)}
                          placeholder="PO Ref"
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
                          placeholder="Hrs"
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

              {/* Discount & Notes */}
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
                    placeholder="e.g. Certified as per site engineer daily logs."
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live A4 Letterhead Preview (6 cols) */}
          <div className="lg:col-span-6 lg:sticky lg:top-[128px]">
            <div className="mb-2 flex items-center justify-between px-1 print:hidden">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Live Official Preview (Letterhead Template)
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                A4 Print-Ready
              </span>
            </div>

            <div className="overflow-auto rounded-xl border border-slate-300/80 bg-white p-2 shadow-md">
              <GoldenHornetInvoiceView invoice={previewInvoice} showLetterhead={true} />
            </div>
          </div>
        </div>
      </main>

      {/* New Customer Modal */}
      <Dialog open={newCustomerModalOpen} onOpenChange={setNewCustomerModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-amber-600" />
              Add New Customer
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div>
              <Label className="text-xs font-semibold text-slate-700">Company Name *</Label>
              <Input
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                placeholder="e.g. Galfar Engineering & Contracting SAOG"
                className="mt-1 text-xs font-medium"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700">P.O. Box & Address</Label>
              <Input
                value={newCustPoBox}
                onChange={(e) => setNewCustPoBox(e.target.value)}
                placeholder="e.g. P.O. Box 533, P.C. 100, Ghala"
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700">Customer VATIN</Label>
              <Input
                value={newCustVatin}
                onChange={(e) => setNewCustVatin(e.target.value)}
                placeholder="e.g. OM1100019234"
                className="mt-1 text-xs font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Phone</Label>
                <Input
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="+968 24525000"
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">City / Country</Label>
                <Input
                  value={newCustCity}
                  onChange={(e) => setNewCustCity(e.target.value)}
                  placeholder="Muscat, Oman"
                  className="mt-1 text-xs"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setNewCustomerModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveNewCustomer}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
            >
              Save Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
