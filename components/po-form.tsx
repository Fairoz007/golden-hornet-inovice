"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"

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

  items: POItem[]
  vatPercent?: number
  notes?: string
  terms?: string
}

type POFormProps = {
  data: POData
  setData: (d: POData) => void
}

export function POForm({ data, setData }: POFormProps) {
  const generateProvisionalNumber = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const random = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")
    return `FFE-PO-${year}-${month}-${random}`
  }

  const handleChange = (field: keyof POData, value: string | number | boolean) => {
    setData({ ...data, [field]: value } as any)
  }

  const handleItemChange = (id: string, field: keyof POItem, value: string | number) => {
    const updated = data.items.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    setData({ ...data, items: updated })
  }

  const addItem = () => {
    const nextIdx = data.items.length + 1
    const item: POItem = {
      id: Date.now().toString(),
      itemNo: `00${nextIdx}0`.slice(-6),
      description: "",
      quantity: 1,
      unitPrice: 0,
    }
    setData({ ...data, items: [...data.items, item] })
  }

  const removeItem = (id: string) => {
    if (data.items.length === 1) return
    setData({ ...data, items: data.items.filter((it) => it.id !== id) })
  }

  return (
    <div className="space-y-6">
      {/* Purchase Order Details */}
      <Card className="border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#1F2937]">Purchase Order Details</h3>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-[#1F2937]">PO Number</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6B7280]">Auto</span>
                  <Switch
                    checked={data.autoPoNumber}
                    onCheckedChange={(val) => {
                      if (val) {
                        setData({ ...data, poNumber: generateProvisionalNumber(), autoPoNumber: true })
                      } else {
                        setData({ ...data, autoPoNumber: false })
                      }
                    }}
                  />
                </div>
              </div>
              <Input
                value={data.poNumber}
                readOnly={data.autoPoNumber}
                onChange={(e) => {
                  if (data.autoPoNumber) {
                    setData({ ...data, autoPoNumber: false, poNumber: e.target.value })
                  } else {
                    handleChange("poNumber", e.target.value)
                  }
                }}
                className={
                  "mt-2 border-[#E5E7EB] text-[#1F2937] " +
                  (data.autoPoNumber ? "bg-[#F3F4F6] cursor-not-allowed" : "bg-white")
                }
                placeholder="e.g. FFE-PO-2026-08-001"
                title={data.autoPoNumber ? "PO number is automatically generated" : "Enter PO number manually"}
              />
            </div>

            <div>
              <Label className="text-[#1F2937]">PO Date</Label>
              <Input
                type="date"
                value={data.poDate}
                onChange={(e) => handleChange("poDate", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
              />
            </div>

            <div>
              <Label className="text-[#1F2937]">Delivery Location</Label>
              <Input
                value={data.deliveryLocation}
                onChange={(e) => handleChange("deliveryLocation", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                placeholder="Muscat, Oman"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-[#1F2937]">Payment Terms</Label>
              <Input
                value={data.paymentTerms || ""}
                onChange={(e) => handleChange("paymentTerms", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                placeholder="e.g. Net 30 days / 50% Advance"
              />
            </div>

            <div>
              <Label className="text-[#1F2937]">Expected Delivery Date (Optional)</Label>
              <Input
                type="date"
                value={data.deliveryDate || ""}
                onChange={(e) => handleChange("deliveryDate", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Supplier Information */}
      <Card className="border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#1F2937]">Supplier Information</h3>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="text-[#1F2937]">Supplier / Vendor Name</Label>
              <Input
                value={data.supplierName}
                onChange={(e) => handleChange("supplierName", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                placeholder="e.g. Al Hashmi Trading LLC"
              />
            </div>

            <div className="sm:col-span-2">
              <Label className="text-[#1F2937]">Supplier Address</Label>
              <Textarea
                value={data.supplierAddress || ""}
                onChange={(e) => handleChange("supplierAddress", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                rows={2}
                placeholder="Street address, city"
              />
            </div>

            <div>
              <Label className="text-[#1F2937]">City / State</Label>
              <Input
                value={data.supplierCity || ""}
                onChange={(e) => handleChange("supplierCity", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                placeholder="e.g. Ruwi, Muscat"
              />
            </div>

            <div>
              <Label className="text-[#1F2937]">Phone / Mobile</Label>
              <Input
                value={data.supplierPhone || ""}
                onChange={(e) => handleChange("supplierPhone", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                placeholder="+968 2412 3456"
              />
            </div>

            <div>
              <Label className="text-[#1F2937]">Email</Label>
              <Input
                value={data.supplierEmail || ""}
                onChange={(e) => handleChange("supplierEmail", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                placeholder="vendor@example.com"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Items Section */}
      <Card className="border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#1F2937]">Items</h3>
          <Button onClick={addItem} size="sm" className="bg-[#2563EB] text-white hover:bg-[#1D4ED8] border-0">
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        <div className="space-y-4">
          {data.items.map((item, idx) => (
            <div key={item.id} className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#1F2937]">Item {idx + 1}</span>
                {data.items.length > 1 && (
                  <Button
                    onClick={() => removeItem(item.id)}
                    size="sm"
                    variant="ghost"
                    className="h-8 text-[#DC2626] hover:bg-[#FEE2E2] hover:text-[#DC2626]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-4">
                  <div>
                    <Label className="text-xs text-[#1F2937]">Item No</Label>
                    <Input
                      value={item.itemNo || `00${idx + 1}0`.slice(-6)}
                      onChange={(e) => handleItemChange(item.id, "itemNo", e.target.value)}
                      className="mt-1 border-[#E5E7EB] bg-white text-[#1F2937]"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <Label className="text-xs text-[#1F2937]">Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                      className="mt-1 border-[#E5E7EB] bg-white text-[#1F2937]"
                      placeholder="Product / Service description"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs text-[#1F2937]">Quantity</Label>
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(item.id, "quantity", Number.parseFloat(e.target.value) || 0)
                      }
                      className="mt-1 border-[#E5E7EB] bg-white text-[#1F2937]"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-[#1F2937]">Unit Price (OMR)</Label>
                    <Input
                      type="number"
                      step="0.001"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)
                      }
                      className="mt-1 border-[#E5E7EB] bg-white text-[#1F2937]"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tax & Additional Terms */}
      <Card className="border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#1F2937]">Tax & Terms</h3>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-[#1F2937]">VAT / Tax %</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={data.vatPercent || 0}
                onChange={(e) => handleChange("vatPercent", Number.parseFloat(e.target.value) || 0)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
              />
            </div>

            <div>
              <Label className="text-[#1F2937]">Currency</Label>
              <Input
                value={data.currency || "OMR"}
                onChange={(e) => handleChange("currency", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                placeholder="OMR"
              />
            </div>
          </div>

          <div>
            <Label className="text-[#1F2937]">Terms & Conditions</Label>
            <Textarea
              value={data.terms || ""}
              onChange={(e) => handleChange("terms", e.target.value)}
              className="mt-2 border-[#E5E7EB] text-[#1F2937]"
              rows={3}
              placeholder="1. Delivery must be made within specified dates. 2. Invoices must reference PO number."
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
