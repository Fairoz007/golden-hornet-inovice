"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Download,
  Printer,
  Edit,
  CheckCircle,
  Copy,
  XCircle,
  History,
  FileText,
  DollarSign,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  invoiceStore,
  type InvoiceRecord,
  type AuditLogEntry,
  type InvoiceStatus,
} from "@/lib/invoice-store"
import { GoldenHornetInvoiceView } from "@/components/golden-hornet-invoice-view"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const invoiceId = resolvedParams.id
  const router = useRouter()
  const { toast } = useToast()

  const [invoice, setInvoice] = useState<InvoiceRecord | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState("")

  useEffect(() => {
    const inv = invoiceStore.getInvoiceById(invoiceId)
    setInvoice(inv || null)
    setAuditLogs(invoiceStore.getAuditLogs().filter((l) => l.entityId === invoiceId))

    const unsubscribe = invoiceStore.subscribe(() => {
      const updated = invoiceStore.getInvoiceById(invoiceId)
      setInvoice(updated || null)
      setAuditLogs(invoiceStore.getAuditLogs().filter((l) => l.entityId === invoiceId))
    })
    return () => unsubscribe()
  }, [invoiceId])

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800">Invoice Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            The requested invoice does not exist or may have been removed.
          </p>
          <Link href="/invoices">
            <Button variant="outline" size="sm" className="text-xs">
              Back to Invoices
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleFinalize = () => {
    try {
      invoiceStore.finalizeInvoice(invoice.id)
      toast({
        title: "Invoice Finalized",
        description: "The invoice has been finalized and its assets frozen.",
      })
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  const handleMarkPaid = () => {
    try {
      invoiceStore.markInvoicePaid(invoice.id)
      toast({
        title: "Marked as Paid",
        description: "Payment has been recorded successfully.",
      })
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  const handleDuplicate = () => {
    try {
      const duplicated = invoiceStore.duplicateInvoice(invoice.id)
      toast({
        title: "Invoice Duplicated",
        description: `Created new draft ${duplicated.invoiceNumber}.`,
      })
      router.push(`/invoices/${duplicated.id}/edit`)
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  const confirmCancel = () => {
    try {
      invoiceStore.cancelInvoice(invoice.id, cancelReason)
      setCancelModalOpen(false)
      toast({
        title: "Invoice Cancelled",
        description: `Invoice ${invoice.invoiceNumber} has been marked as cancelled. Record preserved.`,
      })
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  const handleDownloadPDF = async () => {
    setIsExporting(true)
    try {
      const element = document.getElementById("invoice-document")
      if (!element) throw new Error("Document preview element not found")

      // Log activity
      invoiceStore.logInvoiceActivity(
        invoice.id,
        "INVOICE_DOWNLOADED",
        `Invoice ${invoice.invoiceNumber} downloaded as PDF.`
      )

      const canvas = await html2canvas(element, {
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
      pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`)

      toast({
        title: "PDF Generated",
        description: `Invoice ${invoice.invoiceNumber} downloaded.`,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Export Error",
        description: "Failed to generate PDF. Please try Print instead.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handlePrint = () => {
    invoiceStore.logInvoiceActivity(
      invoice.id,
      "INVOICE_PRINTED",
      `Invoice ${invoice.invoiceNumber} sent to printer.`
    )
    window.print()
  }

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case "Finalized":
        return <Badge className="bg-blue-600 text-white">Finalized</Badge>
      case "Paid":
        return <Badge className="bg-emerald-600 text-white">Paid</Badge>
      case "Cancelled":
        return <Badge className="bg-red-600 text-white">Cancelled</Badge>
      default:
        return <Badge variant="outline" className="text-amber-800 border-amber-300 bg-amber-50">Draft</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-slate-100/70 pb-16">
      {/* Top Header Actions Toolbar */}
      <div className="sticky top-[61px] z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md shadow-xs print:hidden">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/invoices">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-slate-900 font-mono">
                  Invoice {invoice.invoiceNumber}
                </h1>
                {getStatusBadge(invoice.status)}
              </div>
              <p className="text-xs text-slate-500 truncate max-w-sm">
                {invoice.customerSnapshot.companyName}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {invoice.status === "Draft" && (
              <Link href={`/invoices/${invoice.id}/edit`}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 font-semibold">
                  <Edit className="h-3.5 w-3.5 text-amber-700" />
                  Edit Draft
                </Button>
              </Link>
            )}

            {invoice.status === "Draft" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleFinalize}
                className="gap-1.5 text-xs text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100 font-semibold"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Finalize
              </Button>
            )}

            {invoice.status === "Finalized" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkPaid}
                className="gap-1.5 text-xs text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 font-semibold"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Mark as Paid
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleDuplicate}
              className="gap-1.5 text-xs border-slate-300 hover:bg-slate-50"
            >
              <Copy className="h-3.5 w-3.5" />
              Duplicate
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 text-xs border-slate-300 hover:bg-slate-50"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>

            <Button
              size="sm"
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              {isExporting ? "Exporting..." : "Download PDF"}
            </Button>

            {invoice.status !== "Cancelled" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCancelModalOpen(true)}
                className="h-8 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <XCircle className="h-3.5 w-3.5" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <Tabs defaultValue="document" className="w-full">
          <TabsList className="mb-4 bg-white border border-slate-200 print:hidden">
            <TabsTrigger value="document" className="text-xs font-semibold gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Invoice Document (A4)
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs font-semibold gap-1.5">
              <History className="h-3.5 w-3.5" />
              Activity & History ({auditLogs.length})
            </TabsTrigger>
          </TabsList>

          {/* Document Tab */}
          <TabsContent value="document">
            <div className="overflow-auto rounded-xl border border-slate-300/80 bg-white p-4 shadow-md max-w-[214mm] mx-auto">
              <GoldenHornetInvoiceView invoice={invoice} showLetterhead={true} />
            </div>
          </TabsContent>

          {/* Activity / History Tab */}
          <TabsContent value="history">
            <div className="max-w-4xl mx-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                <History className="h-4 w-4 text-amber-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Audit Trail & History for Invoice {invoice.invoiceNumber}
                </h2>
              </div>

              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-lg border border-slate-200 p-3 bg-slate-50/60"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[10px] font-bold text-amber-800 uppercase px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                        {log.action}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(log.timestamp).toLocaleString("en-GB")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 font-medium">
                      {log.description}
                    </p>
                    {log.user && (
                      <div className="mt-1 text-[11px] text-slate-500">
                        Action performed by: <span className="font-semibold">{log.user}</span>
                      </div>
                    )}
                    {log.changedFields && log.changedFields.length > 0 && (
                      <div className="mt-1.5 text-[10.5px] text-slate-600">
                        <span className="font-semibold">Modified Fields: </span>
                        {log.changedFields.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
                {auditLogs.length === 0 && (
                  <p className="py-8 text-center text-xs text-slate-400">
                    No historical logs recorded for this invoice yet.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Cancel Modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Cancel Invoice {invoice.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <p className="text-slate-600 leading-relaxed">
              This invoice will be marked as Cancelled. The invoice and its full audit trail will be
              preserved for compliance.
            </p>
            <div>
              <Label className="text-xs font-semibold text-slate-700">Cancellation Reason</Label>
              <Textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation..."
                className="mt-1 text-xs"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCancelModalOpen(false)}
              className="text-xs"
            >
              Back
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={confirmCancel}
              className="text-xs font-bold"
            >
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
