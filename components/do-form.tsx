"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Sparkles, Truck, User, MapPin, Landmark } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { DO_PRESETS } from "@/lib/dummy-data"

export type DOItem = {
  id: string
  itemNo?: string
  description: string
  uom: string
  quantity: number
  remarks?: string
}

export type DOData = {
  doNumber: string
  autoDoNumber?: boolean
  doDate: string
  poNumber?: string
  terms?: string
  referenceInvoice?: string

  // Customer
  customerName: string
  customerAddress?: string
  customerCity?: string
  customerTel?: string
  customerEmail?: string
  customerFax?: string

  // Destination / Vehicle
  shipToName?: string
  shipToAddress?: string
  shipToCity?: string
  vehicleRegNo?: string
  driverName?: string
  driverPhone?: string

  items: DOItem[]
  notes?: string
  showStamp?: boolean
}

type DOFormProps = {
  data: DOData
  setData: (d: DOData | ((prev: DOData) => DOData)) => void
  onLoadPreset?: (presetId: string) => void
}

export function DOForm({ data, setData, onLoadPreset }: DOFormProps) {
  const generateProvisionalNumber = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const random = String(Math.floor(Math.random() * 900) + 100)
    return `GH-DO-${year}-${month}-${random}`
  }

  const handleChange = (field: keyof DOData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  const handleItemChange = (id: string, field: keyof DOItem, value: any) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === id ? { ...it, [field]: value } : it)),
    }))
  }

  const addItem = () => {
    const nextIdx = data.items.length + 1
    const item: DOItem = {
      id: Date.now().toString(),
      itemNo: `0000${nextIdx}0`.slice(-6),
      description: "",
      uom: "Unit",
      quantity: 1,
      remarks: "Good condition",
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
    const preset = DO_PRESETS.find((p) => p.id === presetId)
    if (preset) {
      setData((prev) => ({
        ...prev,
        doNumber: preset.doNumber,
        doDate: preset.doDate,
        poNumber: preset.poNumber,
        terms: preset.terms,
        referenceInvoice: preset.referenceInvoice,
        customerName: preset.customerName,
        customerAddress: preset.customerAddress,
        customerCity: preset.customerCity,
        customerTel: preset.customerTel,
        customerEmail: preset.customerEmail,
        shipToName: preset.shipToName,
        shipToAddress: preset.shipToAddress,
        shipToCity: preset.shipToCity,
        vehicleRegNo: preset.vehicleRegNo,
        driverName: preset.driverName,
        driverPhone: preset.driverPhone,
        notes: preset.notes,
        items: preset.items,
        showStamp: preset.showStamp,
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
              Dummy Data Presets (Delivery Order)
            </span>
          </div>
          <span className="text-[11px] font-medium text-amber-800">
            Logistics & Fleet Samples
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DO_PRESETS.map((preset) => (
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
                  DO #{preset.doNumber} • {preset.vehicleRegNo}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* 2. DO Meta Details */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2.5">
          <Truck className="h-4 w-4 text-amber-600" />
          <h2 className="text-sm font-bold text-slate-900">Delivery Order Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="doNumber" className="text-xs font-semibold text-slate-700">
                DO Number *
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleChange("doNumber", generateProvisionalNumber())}
                className="h-5 px-1.5 text-[10px] text-amber-700 hover:text-amber-800 hover:bg-amber-50"
              >
                Auto Generate
              </Button>
            </div>
            <Input
              id="doNumber"
              value={data.doNumber}
              onChange={(e) => handleChange("doNumber", e.target.value)}
              placeholder="e.g. GH-DO-2026-0421"
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="doDate" className="text-xs font-semibold text-slate-700">
              DO Date *
            </Label>
            <Input
              id="doDate"
              type="date"
              value={data.doDate}
              onChange={(e) => handleChange("doDate", e.target.value)}
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="poNumber" className="text-xs font-semibold text-slate-700">
              PO / LPO Reference
            </Label>
            <Input
              id="poNumber"
              value={data.poNumber || ""}
              onChange={(e) => handleChange("poNumber", e.target.value)}
              placeholder="e.g. RT-OM-PRJ-O-304-2026-0063"
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="referenceInvoice" className="text-xs font-semibold text-slate-700">
              Reference Invoice
            </Label>
            <Input
              id="referenceInvoice"
              value={data.referenceInvoice || ""}
              onChange={(e) => handleChange("referenceInvoice", e.target.value)}
              placeholder="e.g. 1250-2026"
              className="mt-1 text-xs"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="terms" className="text-xs font-semibold text-slate-700">
              Delivery Terms / Contract
            </Label>
            <Input
              id="terms"
              value={data.terms || ""}
              onChange={(e) => handleChange("terms", e.target.value)}
              placeholder="e.g. As per contract terms"
              className="mt-1 text-xs"
            />
          </div>
        </div>
      </div>

      {/* 3. Customer (Consignee) Details */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2.5">
          <User className="h-4 w-4 text-amber-600" />
          <h2 className="text-sm font-bold text-slate-900">Consignee (Deliver To)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="customerName" className="text-xs font-semibold text-slate-700">
              Customer Name *
            </Label>
            <Input
              id="customerName"
              value={data.customerName}
              onChange={(e) => handleChange("customerName", e.target.value)}
              placeholder="e.g. Renewable Energy Technology Investment"
              className="mt-1 text-xs font-medium"
            />
          </div>
          <div>
            <Label htmlFor="customerAddress" className="text-xs font-semibold text-slate-700">
              Address
            </Label>
            <Input
              id="customerAddress"
              value={data.customerAddress || ""}
              onChange={(e) => handleChange("customerAddress", e.target.value)}
              placeholder="e.g. P.O.BOX: 311, Sohar"
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="customerCity" className="text-xs font-semibold text-slate-700">
              City / Country
            </Label>
            <Input
              id="customerCity"
              value={data.customerCity || ""}
              onChange={(e) => handleChange("customerCity", e.target.value)}
              placeholder="e.g. Sultanate of Oman"
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="customerTel" className="text-xs font-semibold text-slate-700">
              Phone / Contact
            </Label>
            <Input
              id="customerTel"
              value={data.customerTel || ""}
              onChange={(e) => handleChange("customerTel", e.target.value)}
              placeholder="e.g. +968 26845200"
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="customerEmail" className="text-xs font-semibold text-slate-700">
              Email
            </Label>
            <Input
              id="customerEmail"
              value={data.customerEmail || ""}
              onChange={(e) => handleChange("customerEmail", e.target.value)}
              placeholder="e.g. info@client.om"
              className="mt-1 text-xs"
            />
          </div>
        </div>
      </div>

      {/* 4. Transport & Site Details */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2.5">
          <MapPin className="h-4 w-4 text-amber-600" />
          <h2 className="text-sm font-bold text-slate-900">Destination Site & Fleet Transport</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <Label htmlFor="shipToAddress" className="text-xs font-semibold text-slate-700">
              Site Destination Address
            </Label>
            <Input
              id="shipToAddress"
              value={data.shipToAddress || ""}
              onChange={(e) => handleChange("shipToAddress", e.target.value)}
              placeholder="e.g. Plot 42, Sohar Industrial Area Phase 2 Solar Park Site"
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="vehicleRegNo" className="text-xs font-semibold text-slate-700">
              Vehicle Reg No / Type
            </Label>
            <Input
              id="vehicleRegNo"
              value={data.vehicleRegNo || ""}
              onChange={(e) => handleChange("vehicleRegNo", e.target.value)}
              placeholder="e.g. 0390 (Tipper Truck 24m³)"
              className="mt-1 text-xs font-medium"
            />
          </div>
          <div>
            <Label htmlFor="driverName" className="text-xs font-semibold text-slate-700">
              Driver Name
            </Label>
            <Input
              id="driverName"
              value={data.driverName || ""}
              onChange={(e) => handleChange("driverName", e.target.value)}
              placeholder="e.g. Mohammed Al-Balushi"
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="driverPhone" className="text-xs font-semibold text-slate-700">
              Driver Mobile
            </Label>
            <Input
              id="driverPhone"
              value={data.driverPhone || ""}
              onChange={(e) => handleChange("driverPhone", e.target.value)}
              placeholder="e.g. +968 98765432"
              className="mt-1 text-xs"
            />
          </div>
        </div>
      </div>

      {/* 5. Delivered Items */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2.5">
          <h2 className="text-sm font-bold text-slate-900">Delivered Items / Equipment Work</h2>
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
                  <Label className="text-[11px] text-slate-600 font-medium">Item Code</Label>
                  <Input
                    value={item.itemNo || ""}
                    onChange={(e) => handleItemChange(item.id, "itemNo", e.target.value)}
                    placeholder="e.g. 01"
                    className="h-8 text-xs mt-0.5"
                  />
                </div>
                <div className="sm:col-span-5">
                  <Label className="text-[11px] text-slate-600 font-medium">Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                    placeholder="e.g. Tipper Truck Services with Driver (Attached log sheet)"
                    className="h-8 text-xs mt-0.5"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-[11px] text-slate-600 font-medium">Unit (UOM)</Label>
                  <Input
                    value={item.uom}
                    onChange={(e) => handleItemChange(item.id, "uom", e.target.value)}
                    placeholder="e.g. Hrs / Tons / Trips"
                    className="h-8 text-xs mt-0.5"
                  />
                </div>
                <div className="sm:col-span-1">
                  <Label className="text-[11px] text-slate-600 font-medium">Qty</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(item.id, "quantity", parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs mt-0.5"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-[11px] text-slate-600 font-medium">Remarks</Label>
                  <Input
                    value={item.remarks || ""}
                    onChange={(e) => handleItemChange(item.id, "remarks", e.target.value)}
                    placeholder="e.g. Inspected & ok"
                    className="h-8 text-xs mt-0.5"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Goods Receipt Clause */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <Label htmlFor="notes" className="text-xs font-semibold text-slate-700">
            Receipt Acknowledgment Statement
          </Label>
          <Textarea
            id="notes"
            rows={2}
            value={data.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="e.g. Received the above mentioned goods/services in good condition and order."
            className="mt-1 text-xs"
          />
        </div>
      </div>

      {/* 6. Document Stamp */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
          <Landmark className="h-4 w-4 text-amber-600" />
          <h2 className="text-sm font-bold text-slate-900">Stamp Option</h2>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 bg-slate-50/50">
          <div>
            <Label className="text-xs font-semibold text-slate-900 block">
              Official Golden Hornet Stamp
            </Label>
            <span className="text-[11px] text-slate-500">
              Display official C.R. 1000156 round seal on Delivery Order
            </span>
          </div>
          <Switch
            checked={data.showStamp !== false}
            onCheckedChange={(checked) => handleChange("showStamp", checked)}
          />
        </div>
      </div>
    </div>
  )
}
