"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"

export type QuotationItem = {
  id: string
  itemNo: string
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
  customerNumber?: string
  rfqNumber?: string
  paymentTerms?: string
  paymentMethod?: string
  currency: string
  discount: number

  // Bill To
  billToName: string
  billToAddress?: string
  billToCity?: string
  billToPhone?: string
  billToEmail?: string

  // Ship To / Attention
  shipToName?: string
  shipToAddress?: string
  shipToCity?: string

  items: QuotationItem[]
  notes?: string
}

type QuotationFormProps = {
  data: QuotationData
  setData: (d: QuotationData) => void
}

export function QuotationForm({ data, setData }: QuotationFormProps) {
  const generateProvisionalNumber = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const random = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")
    return `FFE-QT-${year}-${month}-${random}`
  }

  const handleChange = (field: keyof QuotationData, value: string | number | boolean) => {
    setData({ ...data, [field]: value } as any)
  }

  const handleItemChange = (id: string, field: keyof QuotationItem, value: string | number) => {
    const updated = data.items.map((item) => {
      if (item.id === id) {
        const nextItem = { ...item, [field]: value }
        if (field === "quantity" || field === "unitPrice" || field === "taxRate") {
          const sub = (Number(nextItem.quantity) || 0) * (Number(nextItem.unitPrice) || 0)
          const tax = sub * ((Number(nextItem.taxRate) || 0) / 100)
          nextItem.lineTotal = sub + tax
        }
        return nextItem
      }
      return item
    })
    setData({ ...data, items: updated })
  }

  const addItem = () => {
    const nextIdx = data.items.length + 1
    const item: QuotationItem = {
      id: Date.now().toString(),
      itemNo: `00${nextIdx}0`.slice(-6),
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 0,
      lineTotal: 0,
    }
    setData({ ...data, items: [...data.items, item] })
  }

  const removeItem = (id: string) => {
    if (data.items.length === 1) return
    setData({ ...data, items: data.items.filter((it) => it.id !== id) })
  }

  return (
    <div className="space-y-6">
      {/* Quotation Details */}
      <Card className="border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#1F2937]">Quotation Details</h3>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-[#1F2937]">Quotation Number</Label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-[#6B7280]">Auto</span>
                  <Switch
                    checked={data.autoQuotationNumber}
                    onCheckedChange={(val) => {
                      if (val) {
                        setData({
                          ...data,
                          quotationNumber: generateProvisionalNumber(),
                          autoQuotationNumber: true,
                        })
                      } else {
                        setData({ ...data, autoQuotationNumber: false })
                      }
                    }}
                  />
                </div>
              </div>
              <Input
                value={data.quotationNumber}
                readOnly={data.autoQuotationNumber}
                onChange={(e) => {
                  if (data.autoQuotationNumber) {
                    setData({
                      ...data,
                      autoQuotationNumber: false,
                      quotationNumber: e.target.value,
                    })
                  } else {
                    handleChange("quotationNumber", e.target.value)
                  }
                }}
                className={
                  "mt-2 border-[#E5E7EB] text-[#1F2937] " +
                  (data.autoQuotationNumber ? "bg-[#F3F4F6] cursor-not-allowed" : "bg-white")
                }
                placeholder="e.g. FFE-QT-2026-08-001"
                title={
                  data.autoQuotationNumber
                    ? "Quotation number is automatically generated"
                    : "Enter quotation number manually"
                }
              />
            </div>

            <div>
              <Label className="text-[#1F2937]">Quotation Date</Label>
              <Input
                type="date"
                value={data.quotationDate}
                onChange={(e) => handleChange("quotationDate", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
              />
            </div>

            <div>
              <Label className="text-[#1F2937]">Valid Until / Expiry Date</Label>
              <Input
                type="date"
                value={data.validUntil}
                onChange={(e) => handleChange("validUntil", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label className="text-[#1F2937]">Customer / RFQ Reference</Label>
              <Input
                value={data.rfqNumber || ""}
                onChange={(e) => handleChange("rfqNumber", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                placeholder="e.g. RFQ-9912 / Email Ref"
              />
            </div>

            <div>
              <Label className="text-[#1F2937]">Payment Terms</Label>
              <Input
                value={data.paymentTerms || ""}
                onChange={(e) => handleChange("paymentTerms", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                placeholder="e.g. 50% Advance, 50% on Delivery"
              />
            </div>

            <div>
              <Label className="text-[#1F2937]">Currency</Label>
              <Input
                value={data.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                placeholder="OMR"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Client / Bill To Information */}
      <Card className="border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#1F2937]">Client / Quote To</h3>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="text-[#1F2937]">Client / Company Name</Label>
              <Input
                value={data.billToName}
                onChange={(e) => handleChange("billToName", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                placeholder="Client or Company Name"
              />
            </div>

            <div className="sm:col-span-2">
              <Label className="text-[#1F2937]">Address</Label>
              <Textarea
                value={data.billToAddress || ""}
                onChange={(e) => handleChange("billToAddress", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                rows={2}
                placeholder="Street address, building, floor"
              />
            </div>

            <div>
              <Label className="text-[#1F2937]">City / State</Label>
              <Input
                value={data.billToCity || ""}
                onChange={(e) => handleChange("billToCity", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                placeholder="Muscat, Oman"
              />
            </div>

            <div>
              <Label className="text-[#1F2937]">Phone / Mobile</Label>
              <Input
                value={data.billToPhone || ""}
                onChange={(e) => handleChange("billToPhone", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                placeholder="+968 9123 4567"
              />
            </div>

            <div>
              <Label className="text-[#1F2937]">Email</Label>
              <Input
                value={data.billToEmail || ""}
                onChange={(e) => handleChange("billToEmail", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                placeholder="client@example.com"
              />
            </div>

            <div>
              <Label className="text-[#1F2937]">Attention / Contact Person</Label>
              <Input
                value={data.shipToName || ""}
                onChange={(e) => handleChange("shipToName", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                placeholder="e.g. Procurement Manager"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Items Section */}
      <Card className="border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#1F2937]">Items / Scope of Work</h3>
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
                      placeholder="Product or service description"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
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
                    <Label className="text-xs text-[#1F2937]">Unit Price ({data.currency})</Label>
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

                  <div>
                    <Label className="text-xs text-[#1F2937]">Tax %</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.taxRate}
                      onChange={(e) =>
                        handleItemChange(item.id, "taxRate", Number.parseFloat(e.target.value) || 0)
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

      {/* Discount & Terms */}
      <Card className="border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#1F2937]">Discount & Terms</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-[#1F2937]">Discount ({data.currency})</Label>
            <Input
              type="number"
              step="0.001"
              min="0"
              value={data.discount}
              onChange={(e) => handleChange("discount", Number.parseFloat(e.target.value) || 0)}
              className="mt-2 border-[#E5E7EB] text-[#1F2937]"
            />
          </div>

          <div>
            <Label className="text-[#1F2937]">Terms & Conditions / Remarks</Label>
            <Textarea
              value={data.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="mt-2 border-[#E5E7EB] text-[#1F2937]"
              rows={3}
              placeholder="1. Prices valid for 30 days. 2. 50% advance on order confirmation."
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
