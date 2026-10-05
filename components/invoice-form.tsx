"use client"

import type { InvoiceData, InvoiceItem } from "@/lib/doc-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, Sparkles, Building2, User, FileText, Landmark, RefreshCw } from "lucide-react"
import { INVOICE_PRESETS, GOLDEN_HORNET_COMPANY } from "@/lib/dummy-data"

type InvoiceFormProps = {
  invoiceData: InvoiceData
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>
  onLoadPreset?: (presetId: string) => void
}

export function InvoiceForm({ invoiceData, setInvoiceData, onLoadPreset }: InvoiceFormProps) {
  const handleInputChange = (field: keyof InvoiceData, value: any) => {
    setInvoiceData((prev: InvoiceData) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...invoiceData.items]
    const item = { ...updatedItems[index], [field]: value }

    // Recalculate lineTotal
    const qty = field === "quantity" ? Number(value) || 0 : Number(item.quantity) || 0
    const price = field === "unitPrice" ? Number(value) || 0 : Number(item.unitPrice) || 0
    item.lineTotal = qty * price

    updatedItems[index] = item
    setInvoiceData((prev: InvoiceData) => ({
      ...prev,
      items: updatedItems,
    }))
  }

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      itemNo: String(invoiceData.items.length + 1).padStart(2, "0"),
      description: "",
      poRef: invoiceData.purchaseOrderNumber || "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 5.0,
      lineTotal: 0,
    }
    setInvoiceData((prev: InvoiceData) => ({
      ...prev,
      items: [...prev.items, newItem],
    }))
  }

  const removeItem = (index: number) => {
    if (invoiceData.items.length === 1) return
    const updatedItems = invoiceData.items.filter((_: InvoiceItem, i: number) => i !== index)
    setInvoiceData((prev: InvoiceData) => ({
      ...prev,
      items: updatedItems,
    }))
  }

  const loadPreset = (presetId: string) => {
    if (onLoadPreset) {
      onLoadPreset(presetId)
      return
    }
    const preset = INVOICE_PRESETS.find((p) => p.id === presetId)
    if (preset) {
      setInvoiceData((prev: InvoiceData) => ({
        ...prev,
        invoiceNumber: preset.invoiceNumber,
        invoiceDate: preset.invoiceDate,
        dueDate: preset.dueDate,
        customerNumber: preset.customerNumber,
        billToName: preset.billToName,
        billToAddress: preset.billToAddress,
        billToCity: preset.billToCity,
        billToPhone: preset.billToPhone,
        billToEmail: preset.billToEmail,
        billToVatin: preset.billToVatin,
        purchaseOrderNumber: preset.purchaseOrderNumber,
        paymentTerms: preset.paymentTerms,
        currency: preset.currency,
        discount: preset.discount,
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
              Dummy Data Presets (Golden Hornet LLC)
            </span>
          </div>
          <span className="text-[11px] font-medium text-amber-800">
            Instant 1-Click Samples
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {INVOICE_PRESETS.map((preset) => (
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
                  Inv #{preset.invoiceNumber} • {preset.billToName.split(" ")[0]}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* 2. Document Information */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2.5">
          <FileText className="h-4 w-4 text-amber-600" />
          <h2 className="text-sm font-bold text-slate-900">Invoice Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="invoiceNumber" className="text-xs font-semibold text-slate-700">
              Invoice Number *
            </Label>
            <Input
              id="invoiceNumber"
              value={invoiceData.invoiceNumber}
              onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
              placeholder="e.g. 1250-2026"
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="invoiceDate" className="text-xs font-semibold text-slate-700">
              Invoice Date *
            </Label>
            <Input
              id="invoiceDate"
              type="date"
              value={invoiceData.invoiceDate}
              onChange={(e) => handleInputChange("invoiceDate", e.target.value)}
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="dueDate" className="text-xs font-semibold text-slate-700">
              Due Date
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={invoiceData.dueDate}
              onChange={(e) => handleInputChange("dueDate", e.target.value)}
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="purchaseOrderNumber" className="text-xs font-semibold text-slate-700">
              LPO / PO Reference
            </Label>
            <Input
              id="purchaseOrderNumber"
              value={invoiceData.purchaseOrderNumber}
              onChange={(e) => handleInputChange("purchaseOrderNumber", e.target.value)}
              placeholder="e.g. RT-OM-PRJ-O-304-2026-0063"
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="customerNumber" className="text-xs font-semibold text-slate-700">
              Customer Code
            </Label>
            <Input
              id="customerNumber"
              value={invoiceData.customerNumber || ""}
              onChange={(e) => handleInputChange("customerNumber", e.target.value)}
              placeholder="e.g. CUST-RET-0304"
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="paymentTerms" className="text-xs font-semibold text-slate-700">
              Payment Terms
            </Label>
            <Input
              id="paymentTerms"
              value={invoiceData.paymentTerms}
              onChange={(e) => handleInputChange("paymentTerms", e.target.value)}
              placeholder="e.g. 30 Days After Submission of the invoice."
              className="mt-1 text-xs"
            />
          </div>
        </div>
      </div>

      {/* 3. Customer (Bill To) Information */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2.5">
          <User className="h-4 w-4 text-amber-600" />
          <h2 className="text-sm font-bold text-slate-900">Customer (Bill To)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="billToName" className="text-xs font-semibold text-slate-700">
              Client / Company Name *
            </Label>
            <Input
              id="billToName"
              value={invoiceData.billToName}
              onChange={(e) => handleInputChange("billToName", e.target.value)}
              placeholder="e.g. Renewable Energy Technology Investment"
              className="mt-1 text-xs font-medium"
            />
          </div>
          <div>
            <Label htmlFor="billToAddress" className="text-xs font-semibold text-slate-700">
              P.O. Box & Address
            </Label>
            <Input
              id="billToAddress"
              value={invoiceData.billToAddress}
              onChange={(e) => handleInputChange("billToAddress", e.target.value)}
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
              value={invoiceData.billToCity}
              onChange={(e) => handleInputChange("billToCity", e.target.value)}
              placeholder="e.g. Sultanate of Oman"
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="billToVatin" className="text-xs font-semibold text-slate-700">
              Customer VATIN (Tax ID)
            </Label>
            <Input
              id="billToVatin"
              value={invoiceData.billToVatin || ""}
              onChange={(e) => handleInputChange("billToVatin", e.target.value)}
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
              value={invoiceData.billToPhone}
              onChange={(e) => handleInputChange("billToPhone", e.target.value)}
              placeholder="e.g. +968 26845200"
              className="mt-1 text-xs"
            />
          </div>
        </div>
      </div>

      {/* 4. Line Items Table */}
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
            className="h-11 gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {invoiceData.items.map((item: InvoiceItem, index: number) => (
            <div
              key={item.id || index}
              className="rounded-lg border border-slate-200 p-3 bg-slate-50/70 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">
                  Item #{index + 1}
                </span>
                {invoiceData.items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    aria-label={`Remove item ${index + 1}`}
                    className="h-11 w-11 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-2">
                  <Label htmlFor={`invoice-line-${index}-itemNo`} className="text-xs text-slate-600 font-medium">Sl. No</Label>
                  <Input
                    id={`invoice-line-${index}-itemNo`}
                    value={item.itemNo}
                    onChange={(e) => handleItemChange(index, "itemNo", e.target.value)}
                    className="h-11 text-sm mt-0.5"
                  />
                </div>
                <div className="sm:col-span-5">
                  <Label htmlFor={`invoice-line-${index}-description`} className="text-xs text-slate-600 font-medium">Description</Label>
                  <Textarea
                    rows={2}
                    id={`invoice-line-${index}-description`}
                    value={item.description}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    placeholder="e.g. Rental Charges for Hiring NON PDO Tipper With Driver Reg.NO : 0390"
                    className="text-xs mt-0.5"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor={`invoice-line-${index}-poRef`} className="text-xs text-slate-600 font-medium">PO Ref</Label>
                  <Input
                    id={`invoice-line-${index}-poRef`}
                    value={item.poRef || ""}
                    onChange={(e) => handleItemChange(index, "poRef", e.target.value)}
                    placeholder="PO Ref"
                    className="h-11 text-sm mt-0.5"
                  />
                </div>
                <div className="sm:col-span-1">
                  <Label htmlFor={`invoice-line-${index}-quantity`} className="text-xs text-slate-600 font-medium">Qty</Label>
                  <Input
                    type="number"
                    id={`invoice-line-${index}-quantity`}
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                    className="h-11 text-sm mt-0.5"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor={`invoice-line-${index}-unitPrice`} className="text-xs text-slate-600 font-medium">Rate (OMR)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    id={`invoice-line-${index}-unitPrice`}
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                    className="h-11 text-sm mt-0.5 font-semibold text-right"
                  />
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
              value={invoiceData.discount}
              onChange={(e) => handleInputChange("discount", parseFloat(e.target.value) || 0)}
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="notes" className="text-xs font-semibold text-slate-700">
              Special Notes / Instructions
            </Label>
            <Input
              id="notes"
              value={invoiceData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="e.g. Rental charges certified as per site supervisor work logs."
              className="mt-1 text-xs"
            />
          </div>
        </div>
      </div>

      {/* 5. Document Controls (Stamp & Signature) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
          <Landmark className="h-4 w-4 text-amber-600" />
          <h2 className="text-sm font-bold text-slate-900">Document Stamp & Signature Options</h2>
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
              checked={invoiceData.showStamp !== false}
              onCheckedChange={(checked) => handleInputChange("showStamp", checked)}
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
              checked={invoiceData.showSignature !== false}
              onCheckedChange={(checked) => handleInputChange("showSignature", checked)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
