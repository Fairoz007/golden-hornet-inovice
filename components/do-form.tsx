"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2 } from "lucide-react"

export type DOItem = {
  id: string
  itemNo?: string
  description: string
  uom: string
  quantity: number
  notes?: string
}

export type DOData = {
  doNumber: string
  autoDoNumber?: boolean
  doDate: string
  poNumber?: string
  terms?: string
  referenceInvoice?: string

  // Deliver To
  customerName: string
  customerAddress?: string
  customerCity?: string
  customerTel?: string
  customerEmail?: string
  customerFax?: string

  // Ship To / Attention
  shipToName?: string
  shipToAddress?: string
  shipToCity?: string

  // Items
  items: DOItem[]

  // Notes
  notes?: string
}

type DOFormProps = {
  data: DOData
  setData: (d: DOData) => void
}

const COMMON_UOMS = ["UNIT", "PCS", "SET", "BOX", "PKT", "ROLL", "KG", "LOT"]

export function DOForm({ data, setData }: DOFormProps) {
  const generateProvisionalNumber = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const random = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")
    return `FFE-DO-${year}-${month}-${random}`
  }

  const handleChange = (field: keyof DOData, value: string | boolean) => {
    setData({ ...data, [field]: value } as any)
  }

  const handleItemChange = (id: string, field: keyof DOItem, value: string | number) => {
    const updated = data.items.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    setData({ ...data, items: updated })
  }

  const addItem = () => {
    const nextIndex = data.items.length + 1
    const item: DOItem = {
      id: Date.now().toString(),
      itemNo: `00${nextIndex}0`.slice(-6),
      description: "",
      uom: "UNIT",
      quantity: 1,
    }
    setData({ ...data, items: [...data.items, item] })
  }

  const removeItem = (id: string) => {
    if (data.items.length === 1) return
    setData({ ...data, items: data.items.filter((it) => it.id !== id) })
  }

  return (
    <div className="space-y-6">
      {/* Delivery Order Details */}
      <Card className="border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#1F2937]">Delivery Order Details</h3>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-[#1F2937]">DO Number</Label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-[#6B7280]">Auto</span>
                  <Switch
                    checked={data.autoDoNumber}
                    onCheckedChange={(val) => {
                      handleChange("autoDoNumber", val)
                      if (val) {
                        handleChange("doNumber", generateProvisionalNumber())
                      }
                    }}
                  />
                </div>
              </div>
              <Input
                value={data.doNumber}
                readOnly={data.autoDoNumber}
                onChange={(e) => {
                  if (data.autoDoNumber) {
                    setData({ ...data, autoDoNumber: false, doNumber: e.target.value })
                  } else {
                    handleChange("doNumber", e.target.value)
                  }
                }}
                className={
                  "mt-2 border-[#E5E7EB] text-[#1F2937] " +
                  (data.autoDoNumber ? "bg-[#F3F4F6] cursor-not-allowed" : "bg-white")
                }
                placeholder="e.g. FFE-DO-2026-08-001"
                title={data.autoDoNumber ? "DO number is automatically generated" : "Enter DO number manually"}
              />
            </div>

            <div>
              <Label className="text-[#1F2937]">DO Date</Label>
              <Input
                type="date"
                value={data.doDate}
                onChange={(e) => handleChange("doDate", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
              />
            </div>

            <div>
              <Label className="text-[#1F2937]">PO Number (Optional)</Label>
              <Input
                value={data.poNumber || ""}
                onChange={(e) => handleChange("poNumber", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                placeholder="e.g. PO-2026-001"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-[#1F2937]">Payment Terms</Label>
              <Input
                value={data.terms || ""}
                onChange={(e) => handleChange("terms", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                placeholder="e.g. Credit Card / Net 30 days"
              />
            </div>

            <div>
              <Label className="text-[#1F2937]">Reference Invoice (Optional)</Label>
              <Input
                value={data.referenceInvoice || ""}
                onChange={(e) => handleChange("referenceInvoice", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                placeholder="e.g. FFE-INV-2026-08-410"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Customer / Deliver To Information */}
      <Card className="border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#1F2937]">Deliver To (Customer)</h3>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="text-[#1F2937]">Customer / Company Name</Label>
              <Input
                value={data.customerName}
                onChange={(e) => handleChange("customerName", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                placeholder="Customer Name"
              />
            </div>

            <div className="sm:col-span-2">
              <Label className="text-[#1F2937]">Delivery Address</Label>
              <Textarea
                value={data.customerAddress || ""}
                onChange={(e) => handleChange("customerAddress", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                rows={2}
                placeholder="Street address, building, floor"
              />
            </div>

            <div>
              <Label className="text-[#1F2937]">City / State</Label>
              <Input
                value={data.customerCity || ""}
                onChange={(e) => handleChange("customerCity", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                placeholder="e.g. Muscat, Oman"
              />
            </div>

            <div>
              <Label className="text-[#1F2937]">Phone / Mobile</Label>
              <Input
                value={data.customerTel || ""}
                onChange={(e) => handleChange("customerTel", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                placeholder="+968 9123 4567"
              />
            </div>

            <div>
              <Label className="text-[#1F2937]">Email</Label>
              <Input
                value={data.customerEmail || ""}
                onChange={(e) => handleChange("customerEmail", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                placeholder="customer@example.com"
              />
            </div>

            <div>
              <Label className="text-[#1F2937]">Attention / Receiver Name (Optional)</Label>
              <Input
                value={data.shipToName || ""}
                onChange={(e) => handleChange("shipToName", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                placeholder="e.g. Mr. Ahmed"
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
                    <Label className="text-xs text-[#1F2937]">UOM (Unit of Measure)</Label>
                    <Input
                      value={item.uom}
                      onChange={(e) => handleItemChange(item.id, "uom", e.target.value.toUpperCase())}
                      className="mt-1 border-[#E5E7EB] bg-white text-[#1F2937] uppercase"
                      placeholder="UNIT"
                    />
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {COMMON_UOMS.map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => handleItemChange(item.id, "uom", u)}
                          className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition ${
                            item.uom === u
                              ? "bg-[#2563EB] text-white"
                              : "bg-[#E5E7EB] text-[#4B5563] hover:bg-[#D1D5DB]"
                          }`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>

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
                </div>

                <div>
                  <Label className="text-xs text-[#1F2937]">Notes / Item Remarks (Optional)</Label>
                  <Input
                    value={item.notes || ""}
                    onChange={(e) => handleItemChange(item.id, "notes", e.target.value)}
                    className="mt-1 border-[#E5E7EB] bg-white text-[#1F2937]"
                    placeholder="e.g. Serial numbers, condition, batch code"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Notes & Delivery Remarks */}
      <Card className="border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#1F2937]">Additional Remarks</h3>
        <div>
          <Label className="text-[#1F2937]">Notes / Terms & Conditions</Label>
          <Textarea
            value={data.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value)}
            className="mt-2 border-[#E5E7EB] text-[#1F2937]"
            rows={3}
            placeholder="Received above goods in good order and condition."
          />
        </div>
      </Card>
    </div>
  )
}
