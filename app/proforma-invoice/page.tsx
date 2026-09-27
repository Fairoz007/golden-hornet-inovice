"use client"

import { useState, useEffect } from "react"
import { InvoiceForm } from "@/components/invoice-form"
import { InvoicePreview } from "@/components/invoice-preview"
import { Button } from "@/components/ui/button"
import { Download, Printer, RotateCcw, Save, Sparkles, FileCheck, CheckCircle2 } from "lucide-react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useToast } from "@/hooks/use-toast"
import type { InvoiceData } from "@/lib/doc-types"
import { INVOICE_PRESETS, GOLDEN_HORNET_COMPANY } from "@/lib/dummy-data"

const defaultProformaData: InvoiceData = {
  companyName: GOLDEN_HORNET_COMPANY.name,
  companyNameArabic: GOLDEN_HORNET_COMPANY.arabicName,
  crNumber: GOLDEN_HORNET_COMPANY.crNumber,
  vatin: GOLDEN_HORNET_COMPANY.vatin,
  address: GOLDEN_HORNET_COMPANY.address,
  phone: GOLDEN_HORNET_COMPANY.tel,
  fax: GOLDEN_HORNET_COMPANY.fax,
  email: GOLDEN_HORNET_COMPANY.email,
  website: GOLDEN_HORNET_COMPANY.website,

  invoiceNumber: "GH-PI-2026-0044",
  autoInvoiceNumber: true,
  invoiceDate: new Date().toISOString().split("T")[0],
  dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  customerNumber: "CUST-RET-0304",

  billToName: "Renewable Energy Technology Investment",
  billToAddress: "P.O.BOX: 311, Sohar",
  billToCity: "Sultanate of Oman",
  billToPhone: "+968 26845200",
  billToEmail: "procurement@renewable-energy.om",
  billToVatin: "OM110038464X",

  purchaseOrderNumber: "RT-OM-PRJ-O-304-2026-0063",
  paymentTerms: "100% Advance Payment Against Proforma Invoice",
  currency: "OMR",
  discount: 0,
  notes: "Proforma Invoice for mobilization advance of heavy equipment fleet and tipper trucks for Sohar Solar Park Project.",

  bankName: GOLDEN_HORNET_COMPANY.bankName,
  bankAccount: GOLDEN_HORNET_COMPANY.accountNumber,
  bankIban: GOLDEN_HORNET_COMPANY.iban,
  bankSwift: GOLDEN_HORNET_COMPANY.swiftCode,
  bankBranch: GOLDEN_HORNET_COMPANY.branch,

  showStamp: true,
  showSignature: true,

  items: [
    {
      id: "1",
      itemNo: "01",
      description: "Advance Mobilization Deposit for 4x Tipper Trucks (24 CBM Fleet)\nProject Site: Sohar Solar Park Phase 2",
      poRef: "RT-OM-PRJ-O-304-2026-0063",
      quantity: 1,
      unitPrice: 2000.0,
      taxRate: 5.0,
      lineTotal: 2000.0,
    },
    {
      id: "2",
      itemNo: "02",
      description: "Site Setup and Certified Heavy Equipment Operator Mobilization",
      poRef: "RT-OM-PRJ-O-304-2026-0063",
      quantity: 1,
      unitPrice: 500.0,
      taxRate: 5.0,
      lineTotal: 500.0,
    },
  ],
}

export default function ProformaInvoicePage() {
  const [data, setData] = useState<InvoiceData>(defaultProformaData)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const draft = localStorage.getItem("pi:gh_draft")
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        setData(parsed)
      } catch (e) {
        console.error("Error restoring PI draft:", e)
      }
    }
  }, [])

  const saveDraft = () => {
    localStorage.setItem("pi:gh_draft", JSON.stringify(data))
    toast({
      title: "Draft Saved",
      description: "Proforma Invoice draft saved to local storage.",
    })
  }

  const loadPreset = (presetId: string) => {
    const preset = INVOICE_PRESETS.find((p) => p.id === presetId)
    if (preset) {
      setData((prev: InvoiceData) => ({
        ...prev,
        invoiceNumber: `GH-PI-2026-${preset.invoiceNumber.split("-")[0]}`,
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
        paymentTerms: "Advance Payment Against Proforma Invoice",
        currency: preset.currency,
        discount: preset.discount,
        notes: `Proforma for ${preset.name}`,
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
      ...defaultProformaData,
      invoiceNumber: `GH-PI-${new Date().getFullYear()}-0001`,
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
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
      description: "Proforma invoice reset to clean blank form.",
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
      pdf.save(`GH_Proforma_${data.invoiceNumber || "Draft"}.pdf`)

      toast({
        title: "PDF Generated",
        description: "Official Golden Hornet Proforma Invoice downloaded.",
      })
    } catch (error) {
      console.error("PDF generation failed:", error)
      toast({
        title: "Export Failed",
        description: "Could not generate PDF. Please try Print.",
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
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                Proforma Invoice Generator
              </h1>
              <p className="text-xs text-slate-500">
                Official Golden Hornet LLC Advance & Proforma Billing
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
          {/* Left: Input Form */}
          <div className="lg:col-span-6 space-y-6 print:hidden">
            <InvoiceForm
              invoiceData={data}
              setInvoiceData={setData}
              onLoadPreset={loadPreset}
            />
          </div>

          {/* Right: Live A4 Document Preview */}
          <div className="lg:col-span-6 lg:sticky lg:top-[128px]">
            <div className="mb-2 flex items-center justify-between px-1 print:hidden">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Live Official Preview (A4)
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                Proforma Invoice Document
              </span>
            </div>

            <div className="overflow-auto rounded-xl border border-slate-300/80 bg-white p-2 shadow-md">
              <InvoicePreview invoiceData={data} documentTitle="PROFORMA INVOICE" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
