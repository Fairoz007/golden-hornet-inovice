"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DOForm, type DOData } from "@/components/do-form"
import { DOPreview } from "@/components/do-preview"
import { Button } from "@/components/ui/button"
import { Download, Printer, RotateCcw, Save, History } from "lucide-react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

const generateProvisionalNumber = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const random = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")
  return `FFE-DO-${year}-${month}-${random}`
}

const defaultDOData: DOData = {
  doNumber: "",
  autoDoNumber: true,
  doDate: new Date().toISOString().split("T")[0],
  poNumber: "",
  terms: "Credit Card",
  referenceInvoice: "",

  customerName: "",
  customerAddress: "",
  customerCity: "",
  customerTel: "",
  customerEmail: "",
  customerFax: "",

  shipToName: "",
  shipToAddress: "",
  shipToCity: "",

  items: [
    {
      id: "1",
      itemNo: "000010",
      description: "",
      uom: "UNIT",
      quantity: 1,
    },
  ],

  notes: "",
}

export default function DeliveryOrderPage() {
  const [data, setData] = useState<DOData>(defaultDOData)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const draft = localStorage.getItem("do:draft")
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        setData((prev) => ({ ...prev, ...parsed }))
      } catch (e) {
        console.error("Error restoring DO draft:", e)
      }
    } else {
      setData((prev) => {
        if (prev.doNumber || prev.autoDoNumber === false) return prev
        return { ...prev, doNumber: generateProvisionalNumber() }
      })
    }
  }, [])

  const saveDraft = () => {
    localStorage.setItem("do:draft", JSON.stringify(data))
    toast({
      title: "Draft Saved",
      description: "Delivery Order draft has been saved successfully.",
    })
  }

  const reset = () => {
    setData({
      ...defaultDOData,
      doNumber: generateProvisionalNumber(),
      doDate: new Date().toISOString().split("T")[0],
    })
    toast({
      title: "Reset",
      description: "Delivery Order reset to default.",
    })
  }

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const preview = document.getElementById("do-preview")
      if (!preview) throw new Error("Preview element not found")

      const cloned = preview.cloneNode(true) as HTMLElement
      const all = cloned.querySelectorAll("*")
      all.forEach((el) => {
        try {
          const s = window.getComputedStyle(el as Element)
          if (s.backgroundColor) (el as HTMLElement).style.backgroundColor = s.backgroundColor
          if (s.color) (el as HTMLElement).style.color = s.color
          if (s.borderColor) (el as HTMLElement).style.borderColor = s.borderColor
        } catch (e) {}
      })

      cloned.style.width = "210mm"
      cloned.style.minHeight = "297mm"
      cloned.style.boxSizing = "border-box"
      cloned.style.background = "#ffffff"
      cloned.style.padding = "12mm"
      cloned.style.position = "absolute"
      cloned.style.left = "-9999px"
      cloned.style.top = "0"
      document.body.appendChild(cloned)

      const canvas = await html2canvas(cloned, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      })
      document.body.removeChild(cloned)

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
      const scale = 2
      const dpi = 96 * scale
      const pxToMm = 25.4 / dpi
      const imgWidthMm = canvas.width * pxToMm
      const imgHeightMm = canvas.height * pxToMm
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const zoom = 1.12
      const baseRatio = Math.min(pdfWidth / imgWidthMm, pdfHeight / imgHeightMm)
      let ratio = baseRatio * zoom
      if (imgWidthMm * ratio > pdfWidth || imgHeightMm * ratio > pdfHeight) ratio = baseRatio

      const finalWidth = imgWidthMm * ratio
      const finalHeight = imgHeightMm * ratio
      const imgX = (pdfWidth - finalWidth) / 2

      pdf.addImage(imgData, "PNG", imgX, 0, finalWidth, finalHeight)
      pdf.save(`DO-${data.doNumber || "draft"}.pdf`)

      toast({
        title: "PDF Downloaded",
        description: `Delivery Order ${data.doNumber || ""} has been downloaded successfully.`,
      })
    } catch (e) {
      console.error("Error downloading PDF:", e)
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrint = () => window.print()

  return (
    <main className="min-h-screen bg-[#F9FAFB]">
      <div className="mx-auto max-w-[1800px] px-4 py-8 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-balance text-3xl font-bold tracking-tight text-[#1F2937] lg:text-4xl">
              Delivery Order
            </h1>
            <p className="mt-2 text-[#6B7280]">Create professional delivery orders in seconds</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link href="/">
                <Button variant="outline" className="bg-white border-[#E5E7EB] text-[#1F2937]">
                  Invoice
                </Button>
              </Link>
              <Link href="/quotation">
                <Button variant="outline" className="bg-white border-[#E5E7EB] text-[#1F2937]">
                  Quotation
                </Button>
              </Link>
              <Link href="/delivery-order">
                <Button className="bg-[#2563EB] text-white">Delivery Order</Button>
              </Link>
              <Link href="/purchase-order">
                <Button variant="outline" className="bg-white border-[#E5E7EB] text-[#1F2937]">
                  Purchase Order
                </Button>
              </Link>
              <Link href="/proforma-invoice">
                <Button variant="outline" className="bg-white border-[#E5E7EB] text-[#1F2937]">
                  Proforma Invoice
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="default"
              onClick={() => router.push("/invoices")}
              className="hidden sm:flex bg-white border-[#E5E7EB] text-[#1F2937] hover:bg-[#F9FAFB]"
            >
              <History className="mr-2 h-4 w-4" />
              History
            </Button>
            <Button
              variant="outline"
              onClick={reset}
              className="bg-white border-[#E5E7EB] text-[#1F2937] hover:bg-[#F9FAFB]"
              title="Reset"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button
              variant="outline"
              onClick={saveDraft}
              className="bg-white border-[#E5E7EB] text-[#1F2937] hover:bg-[#F9FAFB]"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              className="bg-white border-[#E5E7EB] text-[#1F2937] hover:bg-[#F9FAFB]"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="bg-[#2563EB] text-white hover:bg-[#1D4ED8] border-0"
            >
              <Download className="mr-2 h-4 w-4" />
              {isGenerating ? "Generating..." : "Download PDF"}
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <DOForm data={data} setData={setData} />
          </div>
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">Live Preview</h2>
              <div className="overflow-auto">
                <DOPreview data={data} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          html,
          body {
            height: 100%;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Hide everything except the DO preview */
          body * {
            visibility: hidden !important;
          }
          #do-preview,
          #do-preview * {
            visibility: visible !important;
          }

          #do-preview {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            transform: scale(1.12);
            transform-origin: top left;
            width: 187.5mm !important; /* 210mm / 1.12 */
            min-height: 265.179mm !important; /* 297mm / 1.12 */
            box-shadow: none !important;
            background: #ffffff !important;
            margin: 0 !important;
            padding: 10.714mm !important;
          }

          @page {
            margin: 0;
            size: A4 portrait;
          }
        }
      `}</style>
    </main>
  )
}
