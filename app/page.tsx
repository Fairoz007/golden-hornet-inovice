"use client"

import { useState, useEffect } from "react"
import { InvoiceForm } from "@/components/invoice-form"
import { InvoicePreview } from "@/components/invoice-preview"
import { Button } from "@/components/ui/button"
import { Download, Printer, RotateCcw, Save, Sparkles, FileText, CheckCircle2 } from "lucide-react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useToast } from "@/hooks/use-toast"
import { INVOICE_PRESETS, GOLDEN_HORNET_COMPANY } from "@/lib/dummy-data"

export type InvoiceItem = {
  id: string
  itemNo: string
  description: string
  poRef?: string
  quantity: number
  unitPrice: number
  taxRate: number
  lineTotal: number
}

export type InvoiceData = {
  logo?: string
  companyName: string
  companyNameArabic?: string
  crNumber: string
  vatin: string
  address: string
  phone: string
  fax?: string
  email: string
  website?: string
  
  invoiceNumber: string
  autoInvoiceNumber?: boolean
  invoiceDate: string
  dueDate: string
  customerNumber?: string
  
  billToName: string
  billToAddress: string
  billToCity: string
  billToPhone: string
  billToEmail: string
  billToVatin?: string
  
  shipToName?: string
  shipToAddress?: string
  shipToCity?: string
  
  purchaseOrderNumber: string
  paymentTerms: string
  currency: string
  discount: number
  notes: string
  paymentMethod?: string
  
  // Bank Details
  bankName: string
  bankAccount: string
  bankIban: string
  bankSwift: string
  bankBranch: string
  
  // Toggles
  showStamp: boolean
  showSignature: boolean
  
  items: InvoiceItem[]
}

const defaultInvoiceData: InvoiceData = {
  companyName: GOLDEN_HORNET_COMPANY.name,
  companyNameArabic: GOLDEN_HORNET_COMPANY.arabicName,
  crNumber: GOLDEN_HORNET_COMPANY.crNumber,
  vatin: GOLDEN_HORNET_COMPANY.vatin,
  address: GOLDEN_HORNET_COMPANY.address,
  phone: GOLDEN_HORNET_COMPANY.tel,
  fax: GOLDEN_HORNET_COMPANY.fax,
  email: GOLDEN_HORNET_COMPANY.email,
  website: GOLDEN_HORNET_COMPANY.website,
  
  // Default to Preset 0 (Renewable Energy Technology Investment matching sample_invoice.png)
  invoiceNumber: INVOICE_PRESETS[0].invoiceNumber,
  invoiceDate: INVOICE_PRESETS[0].invoiceDate,
  dueDate: INVOICE_PRESETS[0].dueDate,
  customerNumber: INVOICE_PRESETS[0].customerNumber,
  
  billToName: INVOICE_PRESETS[0].billToName,
  billToAddress: INVOICE_PRESETS[0].billToAddress,
  billToCity: INVOICE_PRESETS[0].billToCity,
  billToPhone: INVOICE_PRESETS[0].billToPhone,
  billToEmail: INVOICE_PRESETS[0].billToEmail,
  billToVatin: INVOICE_PRESETS[0].billToVatin,
  
  purchaseOrderNumber: INVOICE_PRESETS[0].purchaseOrderNumber,
  paymentTerms: INVOICE_PRESETS[0].paymentTerms,
  currency: "OMR",
  discount: 0,
  notes: INVOICE_PRESETS[0].notes,
  
  bankName: GOLDEN_HORNET_COMPANY.bankName,
  bankAccount: GOLDEN_HORNET_COMPANY.accountNumber,
  bankIban: GOLDEN_HORNET_COMPANY.iban,
  bankSwift: GOLDEN_HORNET_COMPANY.swiftCode,
  bankBranch: GOLDEN_HORNET_COMPANY.branch,
  
  showStamp: true,
  showSignature: true,
  
  items: INVOICE_PRESETS[0].items,
}

export default function InvoicePage() {
  const [data, setData] = useState<InvoiceData>(defaultInvoiceData)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const draft = localStorage.getItem("invoice:gh_draft")
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        setData(parsed)
      } catch (e) {
        console.error("Error restoring draft:", e)
      }
    }
  }, [])

  const saveDraft = () => {
    localStorage.setItem("invoice:gh_draft", JSON.stringify(data))
    toast({
      title: "Draft Saved",
      description: "Golden Hornet invoice draft saved to local storage.",
    })
  }

  const loadPreset = (presetId: string) => {
    const preset = INVOICE_PRESETS.find((p) => p.id === presetId)
    if (preset) {
      setData((prev) => ({
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
      toast({
        title: "Dummy Data Loaded",
        description: `Loaded preset: ${preset.name}`,
      })
    }
  }

  const resetToBlank = () => {
    setData({
      ...defaultInvoiceData,
      invoiceNumber: `1251-${new Date().getFullYear()}`,
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      customerNumber: "",
      billToName: "",
      billToAddress: "",
      billToCity: "Sultanate of Oman",
      billToPhone: "",
      billToEmail: "",
      billToVatin: "",
      purchaseOrderNumber: "",
      items: [
        {
          id: "1",
          itemNo: "01",
          description: "",
          poRef: "",
          quantity: 1,
          unitPrice: 0,
          taxRate: 5.0,
          lineTotal: 0,
        },
      ],
      notes: "",
    })
    toast({
      title: "Reset Form",
      description: "Invoice reset to clean blank form.",
    })
  }

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const preview = document.getElementById("invoice-preview")
      if (!preview) throw new Error("Preview element not found")

      const canvas = await html2canvas(preview, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, Math.min(imgHeight, 297))
      pdf.save(`GH_Invoice_${data.invoiceNumber || "Draft"}.pdf`)

      toast({
        title: "PDF Generated",
        description: "Official Golden Hornet Invoice downloaded successfully.",
      })
    } catch (error) {
      console.error("PDF generation failed:", error)
      toast({
        title: "Export Failed",
        description: "Could not generate PDF. Please try the Print option.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-slate-100/70 pb-16">
      {/* Top Banner Actions Toolbar */}
      <div className="sticky top-[61px] z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md shadow-xs print:hidden">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-800 border border-amber-300/50">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                Tax Invoice Generator
              </h1>
              <p className="text-xs text-slate-500">
                Official Golden Hornet LLC Billing & VAT Form
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loadPreset("ret-tipper")}
              className="gap-1.5 border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 text-xs font-semibold"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              Load Dummy Data
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={saveDraft}
              className="gap-1.5 text-xs border-slate-300 hover:bg-slate-50"
            >
              <Save className="h-3.5 w-3.5" />
              Save Draft
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetToBlank}
              className="gap-1.5 text-xs border-slate-300 hover:bg-slate-50 text-slate-600"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Blank Form
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 text-xs border-slate-300 hover:bg-slate-50"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              {isGenerating ? "Exporting..." : "Download PDF"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Input Form (5 cols on lg) */}
          <div className="lg:col-span-6 space-y-6 print:hidden">
            <InvoiceForm
              invoiceData={data}
              setInvoiceData={setData}
              onLoadPreset={loadPreset}
            />
          </div>

          {/* Right: Live A4 Document Preview (6 cols on lg) */}
          <div className="lg:col-span-6 lg:sticky lg:top-[128px]">
            <div className="mb-2 flex items-center justify-between px-1 print:hidden">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Live Official Preview (A4)
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                Golden Hornet Letterhead & Seal
              </span>
            </div>

            <div className="overflow-auto rounded-xl border border-slate-300/80 bg-white p-2 shadow-md">
              <InvoicePreview invoiceData={data} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
