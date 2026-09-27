"use client"

import { useEffect, useState } from "react"
import { QuotationForm, type QuotationData } from "@/components/quotation-form"
import { QuotationPreview } from "@/components/quotation-preview"
import { Button } from "@/components/ui/button"
import { Download, Printer, RotateCcw, Save, Sparkles, FileSpreadsheet, CheckCircle2 } from "lucide-react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useToast } from "@/hooks/use-toast"
import { QUOTATION_PRESETS } from "@/lib/dummy-data"

const defaultQuotationData: QuotationData = {
  quotationNumber: QUOTATION_PRESETS[0].quotationNumber,
  autoQuotationNumber: true,
  quotationDate: QUOTATION_PRESETS[0].quotationDate,
  validUntil: QUOTATION_PRESETS[0].validUntil,
  rfqNumber: QUOTATION_PRESETS[0].rfqNumber,
  paymentTerms: QUOTATION_PRESETS[0].paymentTerms,
  currency: "OMR",
  discount: QUOTATION_PRESETS[0].discount,

  billToName: QUOTATION_PRESETS[0].billToName,
  billToAddress: QUOTATION_PRESETS[0].billToAddress,
  billToCity: QUOTATION_PRESETS[0].billToCity,
  billToPhone: QUOTATION_PRESETS[0].billToPhone,
  billToEmail: QUOTATION_PRESETS[0].billToEmail,
  billToVatin: QUOTATION_PRESETS[0].billToVatin,

  items: QUOTATION_PRESETS[0].items,
  notes: QUOTATION_PRESETS[0].notes,
  showStamp: true,
  showSignature: true,
}

export default function QuotationPage() {
  const [data, setData] = useState<QuotationData>(defaultQuotationData)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const draft = localStorage.getItem("quotation:gh_draft")
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        setData(parsed)
      } catch (e) {
        console.error("Error restoring quotation draft:", e)
      }
    }
  }, [])

  const saveDraft = () => {
    localStorage.setItem("quotation:gh_draft", JSON.stringify(data))
    toast({
      title: "Draft Saved",
      description: "Quotation draft saved to local storage.",
    })
  }

  const loadPreset = (presetId: string) => {
    const preset = QUOTATION_PRESETS.find((p) => p.id === presetId)
    if (preset) {
      setData({
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
        items: preset.items,
        notes: preset.notes,
        showStamp: preset.showStamp,
        showSignature: preset.showSignature,
      })
      toast({
        title: "Dummy Data Loaded",
        description: `Loaded preset: ${preset.name}`,
      })
    }
  }

  const resetToBlank = () => {
    setData({
      quotationNumber: `GH-QT-${new Date().getFullYear()}-0001`,
      quotationDate: new Date().toISOString().split("T")[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      rfqNumber: "",
      paymentTerms: "30 Days from invoice submission",
      currency: "OMR",
      discount: 0,
      billToName: "",
      billToAddress: "",
      billToCity: "Sultanate of Oman",
      billToPhone: "",
      billToEmail: "",
      billToVatin: "",
      items: [
        {
          id: "1",
          itemNo: "01",
          description: "",
          quantity: 1,
          unitPrice: 0,
          taxRate: 5.0,
          lineTotal: 0,
        },
      ],
      notes: "1. Quotation is valid for 30 calendar days.\n2. Rates include operator, fuel, and standard maintenance.",
      showStamp: true,
      showSignature: true,
    })
    toast({
      title: "Reset Form",
      description: "Quotation reset to clean blank form.",
    })
  }

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const preview = document.getElementById("quotation-preview")
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
      pdf.save(`GH_Quotation_${data.quotationNumber || "Draft"}.pdf`)

      toast({
        title: "PDF Generated",
        description: "Official Golden Hornet Quotation downloaded.",
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
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                Quotation Generator
              </h1>
              <p className="text-xs text-slate-500">
                Official Golden Hornet LLC Commercial Proposal
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loadPreset("ret-quote")}
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
            <QuotationForm data={data} setData={setData} onLoadPreset={loadPreset} />
          </div>

          {/* Right: Live A4 Document Preview */}
          <div className="lg:col-span-6 lg:sticky lg:top-[128px]">
            <div className="mb-2 flex items-center justify-between px-1 print:hidden">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Live Official Preview (A4)
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                Commercial Quotation Proposal
              </span>
            </div>

            <div className="overflow-auto rounded-xl border border-slate-300/80 bg-white p-2 shadow-md">
              <QuotationPreview data={data} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
