"use client"

import { useEffect, useState } from "react"
import { DOForm, type DOData } from "@/components/do-form"
import { DOPreview } from "@/components/do-preview"
import { Button } from "@/components/ui/button"
import { Download, Printer, RotateCcw, Save, Sparkles, Truck, CheckCircle2 } from "lucide-react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useToast } from "@/hooks/use-toast"
import { DO_PRESETS } from "@/lib/dummy-data"

const defaultDOData: DOData = {
  doNumber: DO_PRESETS[0].doNumber,
  autoDoNumber: true,
  doDate: DO_PRESETS[0].doDate,
  poNumber: DO_PRESETS[0].poNumber,
  terms: DO_PRESETS[0].terms,
  referenceInvoice: DO_PRESETS[0].referenceInvoice,

  customerName: DO_PRESETS[0].customerName,
  customerAddress: DO_PRESETS[0].customerAddress,
  customerCity: DO_PRESETS[0].customerCity,
  customerTel: DO_PRESETS[0].customerTel,
  customerEmail: DO_PRESETS[0].customerEmail,

  shipToName: DO_PRESETS[0].shipToName,
  shipToAddress: DO_PRESETS[0].shipToAddress,
  shipToCity: DO_PRESETS[0].shipToCity,
  vehicleRegNo: DO_PRESETS[0].vehicleRegNo,
  driverName: DO_PRESETS[0].driverName,
  driverPhone: DO_PRESETS[0].driverPhone,

  items: DO_PRESETS[0].items,
  notes: DO_PRESETS[0].notes,
  showStamp: true,
}

export default function DeliveryOrderPage() {
  const [data, setData] = useState<DOData>(defaultDOData)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const draft = localStorage.getItem("do:gh_draft")
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        setData(parsed)
      } catch (e) {
        console.error("Error restoring DO draft:", e)
      }
    }
  }, [])

  const saveDraft = () => {
    localStorage.setItem("do:gh_draft", JSON.stringify(data))
    toast({
      title: "Draft Saved",
      description: "Delivery Order draft saved to local storage.",
    })
  }

  const loadPreset = (presetId: string) => {
    const preset = DO_PRESETS.find((p) => p.id === presetId)
    if (preset) {
      setData({
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
      })
      toast({
        title: "Dummy Data Loaded",
        description: `Loaded preset: ${preset.name}`,
      })
    }
  }

  const resetToBlank = () => {
    setData({
      doNumber: `GH-DO-${new Date().getFullYear()}-0001`,
      doDate: new Date().toISOString().split("T")[0],
      poNumber: "",
      terms: "Standard Delivery",
      referenceInvoice: "",
      customerName: "",
      customerAddress: "",
      customerCity: "Sultanate of Oman",
      customerTel: "",
      customerEmail: "",
      shipToName: "",
      shipToAddress: "",
      shipToCity: "Sultanate of Oman",
      vehicleRegNo: "",
      driverName: "",
      driverPhone: "",
      items: [
        {
          id: "1",
          itemNo: "01",
          description: "",
          uom: "Unit",
          quantity: 1,
          remarks: "Good condition",
        },
      ],
      notes: "Received the above goods/services in good condition and order.",
      showStamp: true,
    })
    toast({
      title: "Reset Form",
      description: "Delivery order reset to clean blank form.",
    })
  }

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const preview = document.getElementById("do-preview")
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
      pdf.save(`GH_DO_${data.doNumber || "Draft"}.pdf`)

      toast({
        title: "PDF Generated",
        description: "Official Golden Hornet Delivery Order downloaded.",
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
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                Delivery Order Generator
              </h1>
              <p className="text-xs text-slate-500">
                Official Golden Hornet LLC Dispatch & Delivery Note
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loadPreset("ret-tipper-do")}
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
            <DOForm data={data} setData={setData} onLoadPreset={loadPreset} />
          </div>

          {/* Right: Live A4 Document Preview */}
          <div className="lg:col-span-6 lg:sticky lg:top-[128px]">
            <div className="mb-2 flex items-center justify-between px-1 print:hidden">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Live Official Preview (A4)
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                Delivery Note Document
              </span>
            </div>

            <div className="overflow-auto rounded-xl border border-slate-300/80 bg-white p-2 shadow-md">
              <DOPreview data={data} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
