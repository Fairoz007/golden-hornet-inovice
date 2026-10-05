import { jsPDF } from "jspdf"
import type { LedgerEntry } from "./finance-engine"

export interface StatementPdfInput {
  company: { name: string; address: string; vatin: string }
  customer: { companyName: string; address?: string; vatin?: string }
  from: string
  to: string
  openingBalance: number
  closingBalance: number
  rows: LedgerEntry[]
  letterheadData?: string
}

/** A4 account statement, with every transaction preserved in a paginated ledger. */
export function createStatementPdf(input: StatementPdfInput): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true })
  const left = 12
  const widths = [18, 24, 21, 45, 20, 20, 22, 16]
  const xs = widths.map((_, index) => left + widths.slice(0, index).reduce((sum, width) => sum + width, 0))
  const tableWidth = widths.reduce((sum, width) => sum + width, 0)
  const labels = ["Date", "Reference", "Type", "Description", "Debit OMR", "Credit OMR", "Balance OMR", "Status"]
  const bodyBottom = 260
  const lineHeight = 3.3
  let y = 0
  const amount = (value: number) => value.toLocaleString("en-OM", { minimumFractionDigits: 3, maximumFractionDigits: 3 })
  const clean = (text: string) => text.replace(/[–—]/g, "-").replace(/\u00a0/g, " ")
  const wrap = (text: string, width: number): string[] => doc.splitTextToSize(clean(text), width)

  function tableHeader() {
    doc.setFillColor(244, 239, 222)
    doc.setDrawColor(130, 130, 130)
    doc.setLineWidth(0.15)
    doc.rect(left, y, tableWidth, 8, "FD")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7)
    labels.forEach((label, index) => {
      if (index) doc.line(xs[index], y, xs[index], y + 8)
      doc.text(label, xs[index] + 1.3, y + 4.7)
    })
    y += 8
    doc.setFont("helvetica", "normal")
  }

  function newPage(first: boolean) {
    if (!first) doc.addPage()
    if (input.letterheadData) doc.addImage(input.letterheadData, "PNG", 0, 0, 210, 297)
    doc.setTextColor(25, 30, 35)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text(clean(input.company.name), left, 43)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7)
    doc.text(wrap(`${input.company.address} | VATIN: ${input.company.vatin}`, tableWidth).slice(0, 2), left, 47)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("STATEMENT OF ACCOUNT", 105, 57, { align: "center" })
    doc.setFontSize(8)
    const customerLines = wrap(`Customer: ${input.customer.companyName}`, tableWidth)
    doc.text(customerLines, left, 63)
    doc.setFont("helvetica", "normal")
    y = 63 + Math.max(1, customerLines.length) * 3.8
    doc.setFontSize(7)
    doc.text(`Period: ${input.from || "Beginning of account"} to ${input.to || "Present"}`, left, y)
    doc.text(`Customer VATIN: ${input.customer.vatin || "Not supplied"}`, left + tableWidth, y, { align: "right" })
    y += 5
    doc.setFont("helvetica", "bold")
    doc.text(`${first ? "Opening balance" : "Opening balance for selected period"}: OMR ${amount(input.openingBalance)}`, left, y)
    y += 5
    tableHeader()
  }

  newPage(true)
  input.rows.forEach((row, rowIndex) => {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(6.8)
    const cells = [row.date, row.reference, row.type, row.description, amount(row.debit), amount(row.credit), amount(row.runningBalance), row.status]
    const lines = cells.map((cell, index) => wrap(cell, widths[index] - 2.6))
    const lineCount = Math.max(1, ...lines.map(cell => cell.length))
    let offset = 0
    while (offset < lineCount) {
      // Keep an ordinary row together; unusually long descriptions continue on the next page.
      const completeHeight = lineCount * lineHeight + 3
      const keepWithTotals = rowIndex === input.rows.length - 1 ? 23 : 0
      if (offset === 0 && completeHeight + keepWithTotals <= bodyBottom - 85 && y + completeHeight + keepWithTotals > bodyBottom) newPage(false)
      let capacity = Math.floor((bodyBottom - y - 3) / lineHeight)
      if (capacity < 1) { newPage(false); capacity = Math.floor((bodyBottom - y - 3) / lineHeight) }
      const count = Math.min(lineCount - offset, capacity)
      const height = count * lineHeight + 3
      doc.setFillColor(rowIndex % 2 ? 250 : 255, rowIndex % 2 ? 250 : 255, rowIndex % 2 ? 250 : 255)
      doc.setDrawColor(190, 190, 190)
      doc.rect(left, y, tableWidth, height, "FD")
      doc.setFont("helvetica", "normal")
      doc.setFontSize(6.8)
      lines.forEach((cell, index) => {
        if (index) doc.line(xs[index], y, xs[index], y + height)
        const slice = cell.slice(offset, offset + count)
        if (slice.length) doc.text(slice, index >= 4 && index <= 6 ? xs[index] + widths[index] - 1.3 : xs[index] + 1.3, y + 3.4, { align: index >= 4 && index <= 6 ? "right" : "left" })
      })
      y += height
      offset += count
      if (offset < lineCount) newPage(false)
    }
  })
  if (!input.rows.length) {
    doc.setFontSize(8)
    doc.text("No financial transactions in the selected period.", left, y + 7)
    y += 13
  }
  if (y + 23 > bodyBottom) newPage(false)
  const debits = input.rows.reduce((sum, row) => sum + Math.round(row.debit * 1000), 0) / 1000
  const credits = input.rows.reduce((sum, row) => sum + Math.round(row.credit * 1000), 0) / 1000
  doc.setFillColor(244, 239, 222)
  doc.setDrawColor(130, 130, 130)
  doc.rect(left, y, tableWidth, 8, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.text("PERIOD TOTALS / CLOSING BALANCE", left + 2, y + 5)
  ;[debits, credits, input.closingBalance].forEach((value, index) => doc.text(amount(value), xs[index + 4] + widths[index + 4] - 1.3, y + 5, { align: "right" }))
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.text(wrap("Positive closing balance is payable by the customer; negative balance is customer credit. Payment allocations transfer amounts within the account and do not duplicate receipt credits.", tableWidth), left, y + 14)
  const pages = doc.getNumberOfPages()
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7)
    doc.setTextColor(90, 90, 90)
    doc.text(`Statement of Account | Page ${page} of ${pages}`, 105, 269, { align: "center" })
  }
  return doc
}
