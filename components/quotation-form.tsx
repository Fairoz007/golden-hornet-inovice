"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Sparkles, FileSpreadsheet, User, Landmark } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { QUOTATION_PRESETS } from "@/lib/dummy-data"

export type QuotationItem = {
  id: string
  itemNo?: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  lineTotal: number
}

export type QuotationData = {
  quotationNumber: string
  autoQuotationNumber?: boolean
  quotationDate: string
  validUntil: string
  rfqNumber?: string
  paymentTerms?: string
  currency?: string
  discount?: number

  // Client
  billToName: string
  billToAddress?: string
  billToCity?: string
  billToPhone?: string
  billToEmail?: string
  billToVatin?: string

  shipToName?: string
  shipToAddress?: string
  shipToCity?: string

  items: QuotationItem[]
  notes?: string
  showStamp?: boolean
  showSignature?: boolean
}

type QuotationFormProps = {
  data: QuotationData
  setData: (d: QuotationData | ((prev: QuotationData) => QuotationData)) => void
  onLoadPreset?: (presetId: string) => void
}

export function QuotationForm({ data, setData, onLoadPreset }: QuotationFormProps) {
  const generateProvisionalNumber = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const random = String(Math.floor(Math.random() * 900) + 100)
    return `GH-QT-${year}-${month}-${random}`
  }

  const handleChange = (field: keyof QuotationData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  const handleItemChange = (id: string, field: keyof QuotationItem, value: any) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((it) => {
        if (it.id !== id) return it
        const updated = { ...it, [field]: value }
        const q = field === "quantity" ? parseFloat(value) || 0 : it.quantity
        const p = field === "unitPrice" ? parseFloat(value) || 0 : it.unitPrice
        updated.lineTotal = q * p
        return updated
      }),
    }))
  }

  const addItem = () => {
    const nextIdx = data.items.length + 1
    const item: QuotationItem = {
      id: Date.now().toString(),
      itemNo: `0${nextIdx}`,
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 5.0,
      lineTotal: 0,
    }
    setData((prev) => ({ ...prev, items: [...prev.items, item] }))
  }

  const removeItem = (id: string) => {
    if (data.items.length === 1) return
    setData((prev) => ({ ...prev, items: prev.items.filter((it) => it.id !== id) }))
  }

  const loadPreset = (presetId: string) => {
    if (onLoadPreset) {
      onLoadPreset(presetId)
      return
    }
    const preset = QUOTATION_PRESETS.find((p) => p.id === presetId)
    if (preset) {
      setData((prev) => ({
        ...prev,
        quotationNumber: preset.quotationNumber,
        quotationDate: preset.quotationDate,
        validUntil: preset.validUntil,
        rfqNumber: preset.rfqNumber,
        paymentTerms: preset.paymentTerms,
        currency: preset.currency,
        discount: preset.discount,
        billToName: preset.billToName,
        billToAddress: preset.billToAddress,
        billToCity: preset.billToCity,
        billToPhone: preset.billToPhone,
        billToEmail: preset.billToEmail,
        billToVatin: preset.billToVatin,
        shipToName: preset.shipToName,
        shipToAddress: preset.shipToAddress,
        shipToCity: preset.shipToCity,
        notes: preset.notes,
        items: preset.items,
        showStamp: preset.showStamp,
        showSignature: preset.showSignature,
      }))
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Quick Dummy Data Presets Bar */}
      <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-600 animate-pulse" />
            <span className="text-xs font-bold text-amber-950 uppercase tracking-wide">
              Dummy Data Presets (Quotation)
            </span>
          </div>
          <span className="text-[11px] font-medium text-amber-800">
            Machinery & Contracting Quotes
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {QUOTATION_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loadPreset(preset.id)}
              className="text-left justify-start h-auto py-2 px-2.5 bg-white border-amber-300/80 hover:bg-amber-100 hover:text-amber-950 text-slate-800 text-[11px] transition-all"
            >
              <div className="truncate">
                <span className="font-semibold block truncate">{preset.name}</span>
                <span className="text-[10px] text-slate-500 block truncate">
                  QT #{preset.quotationNumber} • {preset.billToName.split(" ")[0]}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* 2. Quotation Meta Details */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2.5">
          <FileSpreadsheet className="h-4 w-4 text-amber-600" />
          <h2 className="text-sm font-bold text-slate-900">Quotation Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="quotationNumber" className="text-xs font-semibold text-slate-700">
                Quotation Number *
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleChange("quotationNumber", generateProvisionalNumber())}
                className="h-5 px-1.5 text-[10px] text-amber-700 hover:text-amber-800 hover:bg-amber-50"
              >
                Auto Generate
              </Button>
            </div>
            <Input
              id="quotationNumber"
              value={data.quotationNumber}
              onChange={(e) => handleChange("quotationNumber", e.target.value)}
              placeholder="e.g. GH-QT-2026-0089"
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="quotationDate" className="text-xs font-semibold text-slate-700">
              Quotation Date *
            </Label>
            <Input
              id="quotationDate"
              type="date"
              value={data.quotationDate}
              onChange={(e) => handleChange("quotationDate", e.target.value)}
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="validUntil" className="text-xs font-semibold text-slate-700">
              Valid Until *
            </Label>
            <Input
              id="validUntil"
              type="date"
              value={data.validUntil}
              onChange={(e) => handleChange("validUntil", e.target.value)}
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="rfqNumber" className="text-xs font-semibold text-slate-700">
              RFQ / Client Tender Ref
            </Label>
            <Input
              id="rfqNumber"
              value={data.rfqNumber || ""}
              onChange={(e) => handleChange("rfqNumber", e.target.value)}
              placeholder="e.g. RFQ-RET-2026-04"
              className="mt-1 text-xs"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="paymentTerms" className="text-xs font-semibold text-slate-700">
              Proposed Payment Terms
            </Label>
            <Input
              id="paymentTerms"
              value={data.paymentTerms || ""}
              onChange={(e) => handleChange("paymentTerms", e.target.value)}
              placeholder="e.g. 30 Days from invoice submission"
              className="mt-1 text-xs"
            />
          </div>
        </div>
      </div>

      {/* 3. Client Details */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2.5">
          <User className="h-4 w-4 text-amber-600" />
          <h2 className="text-sm font-bold text-slate-900">Client / Prospective Customer</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="billToName" className="text-xs font-semibold text-slate-700">
              Company / Client Name *
            </Label>
            <Input
              id="billToName"
              value={data.billToName}
              onChange={(e) => handleChange("billToName", e.target.value)}
              placeholder="e.g. Renewable Energy Technology Investment"
              className="mt-1 text-xs font-medium"
            />
          </div>
          <div>
            <Label htmlFor="billToAddress" className="text-xs font-semibold text-slate-700">
              Address
            </Label>
            <Input
              id="billToAddress"
              value={data.billToAddress || ""}
              onChange={(e) => handleChange("billToAddress", e.target.value)}
              placeholder="e.g. P.O.BOX: 311, Sohar"
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="billToCity" className="text-xs font-semibold text-slate-700">
              City / Country
            </Label>
            <Input
              id="billToCity"
              value={data.billToCity || ""}
              onChange={(e) => handleChange("billToCity", e.target.value)}
              placeholder="e.g. Sultanate of Oman"
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="billToVatin" className="text-xs font-semibold text-slate-700">
              Customer VATIN
            </Label>
            <Input
              id="billToVatin"
              value={data.billToVatin || ""}
              onChange={(e) => handleChange("billToVatin", e.target.value)}
              placeholder="e.g. OM110038464X"
              className="mt-1 text-xs font-mono"
            />
          </div>
          <div>
            <Label htmlFor="billToPhone" className="text-xs font-semibold text-slate-700">
              Phone / Contact
            </Label>
            <Input
              id="billToPhone"
              value={data.billToPhone || ""}
              onChange={(e) => handleChange("billToPhone", e.target.value)}
              placeholder="e.g. +968 26845200"
              className="mt-1 text-xs"
            />
          </div>
        </div>
      </div>

      {/* 4. Quoted Items */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2.5">
          <h2 className="text-sm font-bold text-slate-900">Proposed Machinery & Services</h2>
          <Button
            type="button"
            size="sm"
            onClick={addItem}
            className="h-8 gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {data.items.map((item, index) => (
            <div
              key={item.id}
              className="rounded-lg border border-slate-200 p-3 bg-slate-50/70 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">Item #{index + 1}</span>
                {data.items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-2">
                  <Label className="text-[11px] text-slate-600 font-medium">Item No</Label>
                  <Input
                    value={item.itemNo || ""}
                    onChange={(e) => handleItemChange(item.id, "itemNo", e.target.value)}
                    placeholder="01"
                    className="h-8 text-xs mt-0.5"
                  />
                </div>
                <div className="sm:col-span-5">
                  <Label className="text-[11px] text-slate-600 font-medium">Description</Label>
                  <Textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                    placeholder="e.g. Hiring of 24 CBM Tipper with Driver"
                    className="text-xs mt-0.5"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-[11px] text-slate-600 font-medium">Quantity</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(item.id, "quantity", parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs mt-0.5"
                  />
                </div>
                <div className="sm:col-span-3">
                  <Label className="text-[11px] text-slate-600 font-medium">Unit Rate (OMR)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs mt-0.5 font-semibold text-right"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Discount & Terms */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
          <div>
            <Label htmlFor="discount" className="text-xs font-semibold text-slate-700">
              Discount (OMR)
            </Label>
            <Input
              id="discount"
              type="number"
              step="0.001"
              value={data.discount || 0}
              onChange={(e) => handleChange("discount", parseFloat(e.target.value) || 0)}
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="notes" className="text-xs font-semibold text-slate-700">
              Quotation Terms & Conditions
            </Label>
            <Textarea
              id="notes"
              rows={3}
              value={data.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="1. Validity 30 days\n2. Rates include operator\n3. Working hours 10h/day"
              className="mt-1 text-xs"
            />
          </div>
        </div>
      </div>

      {/* 5. Document Stamp & Signature */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
          <Landmark className="h-4 w-4 text-amber-600" />
          <h2 className="text-sm font-bold text-slate-900">Stamp & Signature Options</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 bg-slate-50/50">
            <div>
              <Label className="text-xs font-semibold text-slate-900 block">
                Official Golden Hornet Stamp
              </Label>
              <span className="text-[11px] text-slate-500">
                Display official C.R. 1000156 round seal
              </span>
            </div>
            <Switch
              checked={data.showStamp !== false}
              onCheckedChange={(checked) => handleChange("showStamp", checked)}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 bg-slate-50/50">
            <div>
              <Label className="text-xs font-semibold text-slate-900 block">
                Authorized Signatory
              </Label>
              <span className="text-[11px] text-slate-500">
                Display official authorized sign
              </span>
            </div>
            <Switch
              checked={data.showSignature !== false}
              onCheckedChange={(checked) => handleChange("showSignature", checked)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
