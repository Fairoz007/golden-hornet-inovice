"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { InvoiceForm } from "@/components/invoice-form"
import { InvoicePreview } from "@/components/invoice-preview"
import { Button } from "@/components/ui/button"
import { Download, Printer, RotateCcw } from "lucide-react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import type { InvoiceData } from "@/app/page"

const generateProvisionalNumber = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const random = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")
  return `FFE-PI-${year}-${month}-${random}`
}

const defaultInvoiceData: InvoiceData = {
  companyName: "",
  crNumber: "",
  address: "",
  phone: "",
  email: "",
  invoiceNumber: "",
  autoInvoiceNumber: true,
  isReserved: false,
  invoiceDate: new Date().toISOString().split("T")[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  customerNumber: "",
  billToName: "",
  billToAddress: "",
  billToCity: "",
  billToPhone: "",
  billToEmail: "",
  shipToName: "",
  shipToAddress: "",
  shipToCity: "",
  shipToPhone: "",
  items: [
    {
      id: "1",
      itemNo: "000010",
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 0,
      lineTotal: 0,
    },
  ],
  currency: "OMR",
  discount: 0,
  paymentTerms: "Bank Transfer",
  paymentMethod: "Bank Transfer",
  purchaseOrderNumber: "",
  notes: "",
}

export default function ProformaInvoicePage() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(defaultInvoiceData)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  useEffect(() => {
    const draft = localStorage.getItem("pi:draft")
    if (draft) {
      setInvoiceData(JSON.parse(draft))
    } else {
      setInvoiceData((prev) => {
        if (prev.invoiceNumber || prev.autoInvoiceNumber === false) return prev
        return { ...prev, invoiceNumber: generateProvisionalNumber(), isReserved: false }
      })
    }
  }, [])

  const saveDraft = () => {
    localStorage.setItem("pi:draft", JSON.stringify(invoiceData))
    alert("Draft saved successfully!")
  }

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)
    try {
      const previewElement = document.getElementById("invoice-preview")
      if (!previewElement) {
        throw new Error("Invoice preview element not found")
      }

      const cloned = previewElement.cloneNode(true) as HTMLElement
      const allElements = cloned.querySelectorAll("*")
      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement
        const computedStyle = window.getComputedStyle(el)
        try {
          if (computedStyle.backgroundColor) htmlEl.style.backgroundColor = computedStyle.backgroundColor
          if (computedStyle.color) htmlEl.style.color = computedStyle.color
          if (computedStyle.borderColor) htmlEl.style.borderColor = computedStyle.borderColor
        } catch (e) {}
      })

      cloned.style.width = "210mm"
      cloned.style.minHeight = "297mm"
      cloned.style.boxSizing = "border-box"
      cloned.style.background = "#ffffff"
      cloned.style.padding = "12mm"
      cloned.style.position = "absolute"
      cloned.style.left = "-9999px"

      document.body.appendChild(cloned)

      const canvas = await html2canvas(cloned, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      })

      document.body.removeChild(cloned)

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const scale = 2
      const dpi = 96 * scale
      const pxToMm = 25.4 / dpi

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidthPx = canvas.width
      const imgHeightPx = canvas.height
      const imgWidthMm = imgWidthPx * pxToMm
      const imgHeightMm = imgHeightPx * pxToMm

      const zoomFactor = 1.12
      const baseRatio = Math.min(pdfWidth / imgWidthMm, pdfHeight / imgHeightMm)
      let ratio = baseRatio * zoomFactor
      if (imgWidthMm * ratio > pdfWidth || imgHeightMm * ratio > pdfHeight) {
        ratio = baseRatio
      }

      const finalWidth = imgWidthMm * ratio
      const finalHeight = imgHeightMm * ratio
      const imgX = (pdfWidth - finalWidth) / 2
      const imgY = 0

      pdf.addImage(imgData, "PNG", imgX, imgY, finalWidth, finalHeight)
      pdf.save(`Proforma-Invoice-${invoiceData.invoiceNumber}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleReset = async () => {
    setInvoiceData({
      ...defaultInvoiceData,
      invoiceNumber: generateProvisionalNumber(),
      isReserved: false,
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    })
    localStorage.removeItem("pi:draft")
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB]">
      <div className="mx-auto max-w-[1800px] px-4 py-8 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-balance text-3xl font-bold tracking-tight text-[#1F2937] lg:text-4xl">
              Proforma Invoice Generator
            </h1>
            <p className="mt-2 text-[#6B7280]">Create professional proforma invoices in seconds</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link href="/">
                <Button variant="outline" className="bg-white border-[#E5E7EB] text-[#1F2937]">Invoice</Button>
              </Link>
              <Link href="/quotation">
                <Button variant="outline" className="bg-white border-[#E5E7EB] text-[#1F2937]">Quotation</Button>
              </Link>
              <Link href="/delivery-order">
                <Button variant="outline" className="bg-white border-[#E5E7EB] text-[#1F2937]">Delivery Order</Button>
              </Link>
              <Link href="/purchase-order">
                <Button variant="outline" className="bg-white border-[#E5E7EB] text-[#1F2937]">Purchase Order</Button>
              </Link>
              <Link href="/proforma-invoice">
                <Button className="bg-[#2563EB] text-white">Proforma Invoice</Button>
              </Link>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="default"
              onClick={handleReset}
              className="hidden sm:flex bg-white border-[#E5E7EB] text-[#1F2937] hover:bg-[#F9FAFB]"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button
              variant="outline"
              size="default"
              onClick={handlePrint}
              className="hidden sm:flex bg-white border-[#E5E7EB] text-[#1F2937] hover:bg-[#F9FAFB]"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button
              variant="outline"
              size="default"
              onClick={saveDraft}
              className="hidden sm:flex bg-white border-[#E5E7EB] text-[#1F2937] hover:bg-[#F9FAFB]"
            >
              Save Draft
            </Button>
            <Button
              size="default"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="bg-[#2563EB] text-white hover:bg-[#1D4ED8] border-0"
            >
              <Download className="mr-2 h-4 w-4" />
              {isGeneratingPDF ? "Generating..." : "Download PDF"}
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <InvoiceForm invoiceData={invoiceData} setInvoiceData={setInvoiceData} />
          </div>

          <div className="lg:sticky lg:top-8 lg:h-fit">
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">Live Preview</h2>
              <div className="overflow-auto">
                <InvoicePreview invoiceData={invoiceData} documentTitle="Proforma Invoice" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3 sm:hidden">
          <Button
            variant="outline"
            size="default"
            onClick={handleReset}
            className="flex-1 bg-white border-[#E5E7EB] text-[#1F2937]"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={handlePrint}
            className="flex-1 bg-white border-[#E5E7EB] text-[#1F2937]"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={saveDraft}
            className="flex-1 bg-white border-[#E5E7EB] text-[#1F2937]"
          >
            Save Draft
          </Button>
        </div>
      </div>

      <style jsx global>{`
        /* Print layout: show only the invoice preview and fit to A4. */
        @page {
          size: A4;
          margin: 0;
        }

        @media print {
          html, body {
            height: 100%;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
          }

          /* Hide everything except the invoice preview */
          body * {
            visibility: hidden !important;
          }
          #invoice-preview,
          #invoice-preview * {
            visibility: visible !important;
          }

          /* Position the preview to the top-left and size to A4 */
          #invoice-preview {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            /* To visually match the downloaded PDF (slight zoom), we scale the content
               and reduce the container width so the scaled content fits an A4 page. */
            transform: scale(1.12);
            transform-origin: top left;
            width: 187.5mm !important; /* 210mm / 1.12 */
            min-height: 265.179mm !important; /* 297mm / 1.12 */
            box-shadow: none !important;
            background: #ffffff !important;
            margin: 0 !important;
            padding: 10.714mm !important; /* 12mm / 1.12 */
          }

          @page { margin: 0; }
        }
      `}</style>
    </main>
  )
}
