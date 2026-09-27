"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Sparkles, ShoppingCart, Truck, Landmark } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { PO_PRESETS } from "@/lib/dummy-data"

export type POItem = {
  id: string
  itemNo?: string
  description: string
  quantity: number
  unitPrice: number
}

export type POData = {
  poNumber: string
  autoPoNumber?: boolean
  poDate: string
  deliveryDate?: string
  deliveryLocation: string
  paymentTerms?: string
  currency?: string

  // Supplier
  supplierName: string
  supplierAddress?: string
  supplierCity?: string
  supplierPhone?: string
  supplierEmail?: string
  supplierVatin?: string

  items: POItem[]
  vatPercent?: number
  notes?: string
  terms?: string
  showStamp?: boolean
  showSignature?: boolean
}

type POFormProps = {
  data: POData
  setData: (d: POData | ((prev: POData) => POData)) => void
  onLoadPreset?: (presetId: string) => void
}

export function POForm({ data, setData, onLoadPreset }: POFormProps) {
  const generateProvisionalNumber = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const random = String(Math.floor(Math.random() * 900) + 100)
    return `GH-PO-${year}-${month}-${random}`
  }

  const handleChange = (field: keyof POData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  const handleItemChange = (id: string, field: keyof POItem, value: any) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === id ? { ...it, [field]: value } : it)),
    }))
  }

  const addItem = () => {
    const nextIdx = data.items.length + 1
    const item: POItem = {
      id: Date.now().toString(),
      itemNo: `0000${nextIdx}0`.slice(-6),
      description: "",
      quantity: 1,
      unitPrice: 0,
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
    const preset = PO_PRESETS.find((p) => p.id === presetId)
    if (preset) {
      setData((prev) => ({
        ...prev,
        poNumber: preset.poNumber,
        poDate: preset.poDate,
        deliveryDate: preset.deliveryDate,
        deliveryLocation: preset.deliveryLocation,
        paymentTerms: preset.paymentTerms,
        currency: preset.currency,
        supplierName: preset.supplierName,
        supplierAddress: preset.supplierAddress,
        supplierCity: preset.supplierCity,
        supplierPhone: preset.supplierPhone,
        supplierEmail: preset.supplierEmail,
        supplierVatin: preset.supplierVatin,
        vatPercent: preset.vatPercent,
        notes: preset.notes,
        terms: preset.terms,
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
              Dummy Data Presets (Purchase Order)
            </span>
          </div>
          <span className="text-[11px] font-medium text-amber-800">
            Pre-loaded Golden Hornet Samples
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PO_PRESETS.map((preset) => (
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
                  PO #{preset.poNumber} • {preset.supplierName.split(" ")[0]}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* 2. PO Meta Details */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2.5">
          <ShoppingCart className="h-4 w-4 text-amber-600" />
          <h2 className="text-sm font-bold text-slate-900">Purchase Order Details</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="poNumber" className="text-xs font-semibold text-slate-700">
                PO Number *
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleChange("poNumber", generateProvisionalNumber())}
                className="h-5 px-1.5 text-[10px] text-amber-700 hover:text-amber-800 hover:bg-amber-50"
              >
                Auto Generate
              </Button>
            </div>
            <Input
              id="poNumber"
              value={data.poNumber}
              onChange={(e) => handleChange("poNumber", e.target.value)}
              placeholder="e.g. GH-PO-2026-0182"
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="poDate" className="text-xs font-semibold text-slate-700">
              PO Date *
            </Label>
            <Input
              id="poDate"
              type="date"
              value={data.poDate}
              onChange={(e) => handleChange("poDate", e.target.value)}
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="deliveryDate" className="text-xs font-semibold text-slate-700">
              Expected Delivery Date
            </Label>
            <Input
              id="deliveryDate"
              type="date"
              value={data.deliveryDate || ""}
              onChange={(e) => handleChange("deliveryDate", e.target.value)}
              className="mt-1 text-xs"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="deliveryLocation" className="text-xs font-semibold text-slate-700">
              Delivery Site / Yard Location
            </Label>
            <Input
              id="deliveryLocation"
              value={data.deliveryLocation}
              onChange={(e) => handleChange("deliveryLocation", e.target.value)}
              placeholder="e.g. Golden Hornet Central Workshop, Yard 14, Al Mabela, Muscat"
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="paymentTerms" className="text-xs font-semibold text-slate-700">
              Payment Terms
            </Label>
            <Input
              id="paymentTerms"
              value={data.paymentTerms || ""}
              onChange={(e) => handleChange("paymentTerms", e.target.value)}
              placeholder="e.g. Net 30 Days"
              className="mt-1 text-xs"
            />
          </div>
        </div>
      </div>

      {/* 3. Supplier / Vendor Details */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2.5">
          <Truck className="h-4 w-4 text-amber-600" />
          <h2 className="text-sm font-bold text-slate-900">Supplier / Vendor Details</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="supplierName" className="text-xs font-semibold text-slate-700">
              Supplier Name *
            </Label>
            <Input
              id="supplierName"
              value={data.supplierName}
              onChange={(e) => handleChange("supplierName", e.target.value)}
              placeholder="e.g. Al Tasnim Heavy Equipment Spares LLC"
              className="mt-1 text-xs font-medium"
            />
          </div>
          <div>
            <Label htmlFor="supplierAddress" className="text-xs font-semibold text-slate-700">
              Address / Industrial Area
            </Label>
            <Input
              id="supplierAddress"
              value={data.supplierAddress || ""}
              onChange={(e) => handleChange("supplierAddress", e.target.value)}
              placeholder="e.g. P.O. Box 118, Mabela Industrial Area"
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="supplierCity" className="text-xs font-semibold text-slate-700">
              City / Country
            </Label>
            <Input
              id="supplierCity"
              value={data.supplierCity || ""}
              onChange={(e) => handleChange("supplierCity", e.target.value)}
              placeholder="e.g. Muscat, Sultanate of Oman"
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="supplierPhone" className="text-xs font-semibold text-slate-700">
              Phone / Contact
            </Label>
            <Input
              id="supplierPhone"
              value={data.supplierPhone || ""}
              onChange={(e) => handleChange("supplierPhone", e.target.value)}
              placeholder="e.g. +968 24458900"
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="supplierEmail" className="text-xs font-semibold text-slate-700">
              Email Address
            </Label>
            <Input
              id="supplierEmail"
              value={data.supplierEmail || ""}
              onChange={(e) => handleChange("supplierEmail", e.target.value)}
              placeholder="e.g. sales@altasnim.com"
              className="mt-1 text-xs"
            />
          </div>
        </div>
      </div>

      {/* 4. Ordered Items */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2.5">
          <h2 className="text-sm font-bold text-slate-900">Ordered Materials & Services</h2>
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
                <div className="sm:col-span-3">
                  <Label className="text-[11px] text-slate-600 font-medium">Part / Item Code</Label>
                  <Input
                    value={item.itemNo || ""}
                    onChange={(e) => handleItemChange(item.id, "itemNo", e.target.value)}
                    placeholder="e.g. 000010"
                    className="h-8 text-xs mt-0.5"
                  />
                </div>
                <div className="sm:col-span-5">
                  <Label className="text-[11px] text-slate-600 font-medium">Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                    placeholder="e.g. Hydraulic Oil ISO VG 68 (208L Drum)"
                    className="h-8 text-xs mt-0.5"
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
                <div className="sm:col-span-2">
                  <Label className="text-[11px] text-slate-600 font-medium">Unit Price (OMR)</Label>
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

        {/* VAT & Terms */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
          <div>
            <Label htmlFor="vatPercent" className="text-xs font-semibold text-slate-700">
              VAT Rate (%)
            </Label>
            <Input
              id="vatPercent"
              type="number"
              step="0.1"
              value={data.vatPercent ?? 5.0}
              onChange={(e) => handleChange("vatPercent", parseFloat(e.target.value) || 0)}
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="terms" className="text-xs font-semibold text-slate-700">
              Terms & Conditions
            </Label>
            <Textarea
              id="terms"
              rows={2}
              value={data.terms || ""}
              onChange={(e) => handleChange("terms", e.target.value)}
              placeholder="e.g. 1. Delivery with formal Delivery Note and original invoice."
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
