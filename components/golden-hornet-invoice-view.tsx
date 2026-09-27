"use client"

import Image from "next/image"
import type { InvoiceRecord } from "@/lib/invoice-store"
import { formatOMR } from "@/lib/financial-calculator"

interface GoldenHornetInvoiceViewProps {
  invoice: InvoiceRecord
  showLetterhead?: boolean
}

export function GoldenHornetInvoiceView({
  invoice,
  showLetterhead = true,
}: GoldenHornetInvoiceViewProps) {
  const letterheadUrl = invoice.letterheadAsset || "/images/letter_head.png"
  const stampUrl = invoice.stampAsset || "/images/stamp.png"
  const signatureUrl = invoice.signatureAsset || "/images/signature.png"
  const currency = invoice.currency || "OMR"

  // Date formatting DD-MM-YYYY
  const formatDate = (dStr?: string) => {
    if (!dStr) return ""
    const parts = dStr.split("-")
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`
    return dStr
  }

  return (
    <div
      id="invoice-document"
      className="relative mx-auto w-full max-w-[210mm] bg-white text-slate-900 shadow-xl print:shadow-none print:m-0 print:p-0 overflow-hidden"
      style={{
        minHeight: "297mm",
        boxSizing: "border-box",
        fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* 1. Official Golden Hornet Letterhead Full-Page Background */}
      {showLetterhead && (
        <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
          <img
            src={letterheadUrl}
            alt="Letterhead Template"
            className="w-full h-full object-fill block"
          />
        </div>
      )}

      {/* 2. Printable Content Layer: strictly positioned between header banner and footer banner */}
      <div className="relative z-10 pt-[108px] pb-[70px] px-8 flex flex-col justify-between" style={{ minHeight: "297mm" }}>
        {/* Outer Framed Box matching sample_invoice.png */}
        <div className="border border-slate-900 flex flex-col justify-between p-3.5 bg-white/95" style={{ minHeight: "238mm" }}>
          <div>
            {/* Company Credentials */}
            <div className="text-[10.5px] leading-tight text-slate-900 mb-2">
              <div className="font-bold text-[12.5px] tracking-wide text-slate-950">
                {invoice.companyDetailsSnapshot?.name || "Golden Hornet LLC"}
              </div>
              <div>{invoice.companyDetailsSnapshot?.address || "P.O. Box: 680, P.C:121, Sultanate of Oman"}</div>
              <div className="font-semibold">VATIN :- {invoice.companyDetailsSnapshot?.vatin || "OM1100158810"}</div>
              <div>Sultanate of Oman</div>
              <div>
                Tel: {invoice.companyDetailsSnapshot?.tel || "+968 24813684"}, Fax: {invoice.companyDetailsSnapshot?.fax || "+(968) 24813200"}
              </div>
              <div>
                Email: {invoice.companyDetailsSnapshot?.email || "info@goldenhornet.net"}, website: {invoice.companyDetailsSnapshot?.website || "www.goldenhornet.net"}
              </div>
            </div>

            {/* Document Title with subtle top & bottom rules */}
            <div className="my-1.5 text-center border-t border-b border-slate-900 py-1">
              <h1 className="text-base font-extrabold tracking-widest text-slate-950 uppercase">
                TAX INVOICE
              </h1>
            </div>

            {/* Customer Box (Left) & Invoice Meta (Right) */}
            <div className="grid grid-cols-12 gap-3 mb-2.5 items-start">
              {/* Customer Box */}
              <div className="col-span-8 border border-slate-900 p-2.5 bg-white text-[11px] min-h-[85px]">
                <div className="font-bold text-[12px] text-slate-950 mb-0.5">
                  {invoice.customerSnapshot?.companyName || "Customer Name"}
                </div>
                {invoice.customerSnapshot?.poBox && (
                  <div className="text-slate-800">{invoice.customerSnapshot.poBox}</div>
                )}
                {invoice.customerSnapshot?.address && invoice.customerSnapshot.address !== invoice.customerSnapshot.poBox && (
                  <div className="whitespace-pre-line text-slate-800">{invoice.customerSnapshot.address}</div>
                )}
                {invoice.customerSnapshot?.city && (
                  <div className="text-slate-800">{invoice.customerSnapshot.city}</div>
                )}
                {invoice.customerSnapshot?.vatin && (
                  <div className="font-semibold text-slate-900 mt-1">
                    VATIN: {invoice.customerSnapshot.vatin}
                  </div>
                )}
                {invoice.customerSnapshot?.phone && (
                  <div className="text-slate-700">Tel: {invoice.customerSnapshot.phone}</div>
                )}
              </div>

              {/* Invoice Meta */}
              <div className="col-span-4 flex flex-col justify-start text-right text-[11px] space-y-1 pt-1">
                <div>
                  <span className="font-bold text-slate-950">Invoice No: </span>
                  <span className="font-semibold text-slate-900">{invoice.invoiceNumber}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-950">Date: </span>
                  <span className="text-slate-900">{formatDate(invoice.invoiceDate)}</span>
                </div>
                {invoice.dueDate && (
                  <div>
                    <span className="font-medium text-slate-700">Due Date: </span>
                    <span className="text-slate-900">{formatDate(invoice.dueDate)}</span>
                  </div>
                )}
                {invoice.poNumber && (
                  <div>
                    <span className="font-bold text-slate-950">PO Ref: </span>
                    <span className="text-slate-900">{invoice.poNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="mb-2">
              <table className="w-full border-collapse border border-slate-900 text-[11px]">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-950 font-bold border-b border-slate-900">
                    <th className="border-r border-slate-900 py-1.5 px-2 text-center w-[6%]">Sl.No</th>
                    <th className="border-r border-slate-900 py-1.5 px-2 text-center w-[46%]">Description</th>
                    <th className="border-r border-slate-900 py-1.5 px-2 text-center w-[16%]">PO</th>
                    <th className="border-r border-slate-900 py-1.5 px-2 text-center w-[10%]">Qty</th>
                    <th className="border-r border-slate-900 py-1.5 px-2 text-center w-[11%]">Rate</th>
                    <th className="py-1.5 px-2 text-center w-[11%]">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, idx) => (
                    <tr key={item.id || idx} className="border-b border-slate-300 min-h-[36px]">
                      <td className="border-r border-slate-900 p-2 text-center align-top font-medium">
                        {item.serialNumber || idx + 1}
                      </td>
                      <td className="border-r border-slate-900 p-2 align-top text-left font-medium text-slate-900 whitespace-pre-line leading-snug">
                        {item.description}
                      </td>
                      <td className="border-r border-slate-900 p-2 text-center align-top text-[10px] font-semibold text-slate-800 break-words">
                        {item.poReference || invoice.poNumber || "-"}
                      </td>
                      <td className="border-r border-slate-900 p-2 text-center align-top font-semibold">
                        {item.quantity} {item.unit ? <span className="text-[10px] text-slate-600 block">{item.unit}</span> : null}
                      </td>
                      <td className="border-r border-slate-900 p-2 text-right align-top whitespace-nowrap">
                        <span className="text-[9px] text-slate-600 mr-1">{currency}</span>
                        <span className="font-medium">{formatOMR(item.rate)}</span>
                      </td>
                      <td className="p-2 text-right align-top whitespace-nowrap font-semibold">
                        <span className="text-[9px] text-slate-600 mr-1">{currency}</span>
                        <span>{formatOMR(item.amount)}</span>
                      </td>
                    </tr>
                  ))}

                  {/* Filler rows to ensure authentic invoice height */}
                  {invoice.items.length < 3 && (
                    <tr style={{ height: `${(3 - invoice.items.length) * 45}px` }}>
                      <td className="border-r border-slate-900"></td>
                      <td className="border-r border-slate-900"></td>
                      <td className="border-r border-slate-900"></td>
                      <td className="border-r border-slate-900"></td>
                      <td className="border-r border-slate-900"></td>
                      <td></td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Totals Table */}
              <div className="flex justify-end border-x border-b border-slate-900 bg-white">
                <div className="w-[45%] text-[10px] leading-tight">
                  <div className="flex justify-between border-b border-slate-300 px-2.5 py-1">
                    <span className="font-semibold text-slate-800">Sub Total</span>
                    <span className="font-semibold">
                      {currency} {formatOMR(invoice.subtotal)}
                    </span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between border-b border-slate-300 px-2.5 py-1 text-red-600">
                      <span className="font-semibold">Discount</span>
                      <span className="font-semibold">
                        -{currency} {formatOMR(invoice.discount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-slate-300 px-2.5 py-1">
                    <span className="font-semibold text-slate-800">Taxable Value</span>
                    <span className="font-semibold">
                      {currency} {formatOMR(invoice.taxableValue)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-300 px-2.5 py-1">
                    <span className="font-semibold text-slate-800">Value Added Tax {invoice.vatRate}%</span>
                    <span className="font-semibold">
                      {currency} {formatOMR(invoice.vatAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-300 px-2.5 py-1">
                    <span className="font-semibold text-slate-800">Value of the Tax due</span>
                    <span className="font-semibold">
                      {currency} {formatOMR(invoice.vatAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between bg-slate-100 px-2.5 py-1.5 font-bold text-[11px] text-slate-950">
                    <span>TOTAL</span>
                    <span>
                      {currency} {formatOMR(invoice.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* In Words Row */}
              <div className="border-x border-b border-slate-900 px-3 py-1.5 bg-slate-50/70 text-[10.5px]">
                <span className="font-bold text-slate-950">In Words : </span>
                <span className="font-semibold text-slate-900">{invoice.amountInWords}</span>
              </div>
            </div>

            {/* Bank Details & Payment Terms Section */}
            <div className="grid grid-cols-12 gap-3 my-2 items-center">
              {/* Bank Details Box */}
              <div className="col-span-6 border border-slate-900 p-2 text-[10px] leading-relaxed">
                <div className="font-bold text-slate-950 border-b border-slate-300 pb-0.5 mb-1 tracking-wide">
                  BANK DETAILS
                </div>
                <div className="grid grid-cols-12">
                  <span className="col-span-5 text-slate-700">Bank Name</span>
                  <span className="col-span-7 font-semibold text-slate-950">
                    : {invoice.bankDetailsSnapshot?.bankName || "Sohar International"}
                  </span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="col-span-5 text-slate-700">Company Name</span>
                  <span className="col-span-7 font-semibold text-slate-950">
                    : {invoice.bankDetailsSnapshot?.companyName || "Golden Hornet LLC"}
                  </span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="col-span-5 text-slate-700">Account Number</span>
                  <span className="col-span-7 font-bold text-slate-950">
                    : {invoice.bankDetailsSnapshot?.accountNumber || "001030002918"}
                  </span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="col-span-5 text-slate-700">Swift Code</span>
                  <span className="col-span-7 font-semibold text-slate-950">
                    : {invoice.bankDetailsSnapshot?.swiftCode || "BSHROMRU"}
                  </span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="col-span-5 text-slate-700">IBAN</span>
                  <span className="col-span-7 font-semibold text-slate-950">
                    : {invoice.bankDetailsSnapshot?.iban || "OM210300000001030002918"}
                  </span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="col-span-5 text-slate-700">Branch</span>
                  <span className="col-span-7 font-semibold text-slate-950">
                    : {invoice.bankDetailsSnapshot?.branch || "CBD"}
                  </span>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="col-span-6 text-center text-[10.5px] p-2 border border-dashed border-slate-400 bg-slate-50/50 rounded-xs">
                <span className="font-bold text-slate-900">Payment Terms: </span>
                <span className="text-slate-800 font-medium">
                  {invoice.paymentTerms || "30 Days After Submission of the invoice."}
                </span>
                {invoice.notes && (
                  <div className="mt-1 text-[9.5px] text-slate-600 italic">
                    {invoice.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Signatures & Seal Section */}
            <div className="mt-4 pt-2 border-t border-slate-900 grid grid-cols-3 gap-2 items-center text-center text-[10px]">
              {/* Receiver signature */}
              <div className="flex flex-col items-center justify-end h-24 pb-1">
                <div className="w-36 border-b border-slate-800 mb-1"></div>
                <span className="font-bold text-slate-900">Receiver's Signature with stamp</span>
              </div>

              {/* Official Round Stamp */}
              <div className="flex flex-col items-center justify-center h-24">
                {invoice.enableStamp && stampUrl ? (
                  <div className="relative h-20 w-20 transform -rotate-3 hover:rotate-0 transition-transform">
                    <img
                      src={stampUrl}
                      alt="Golden Hornet Official Stamp"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 border border-dashed border-slate-300 rounded-full flex items-center justify-center text-[9px] text-slate-400">
                    Stamp
                  </div>
                )}
              </div>

              {/* Authorized Signatory */}
              <div className="flex flex-col items-center justify-end h-24 pb-1">
                <span className="font-bold text-slate-950 mb-0.5">For Golden Hornet LLC</span>
                {invoice.enableSignature && signatureUrl ? (
                  <div className="relative h-12 w-28 my-0.5">
                    <img
                      src={signatureUrl}
                      alt="Authorized Signature"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-10 w-28 border-b border-slate-800"></div>
                )}
                <span className="font-bold text-slate-900">Authorized Signatory</span>
              </div>
            </div>

            {/* Thank you text */}
            <div className="mt-2 text-center text-[11px] font-bold tracking-wider text-slate-900 italic">
              THANK YOU FOR YOUR BUSINESS !
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
