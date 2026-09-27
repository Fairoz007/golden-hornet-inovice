"use client"

import Image from "next/image"
import type { InvoiceData } from "@/app/page"
import { amountToWordsOMR } from "@/lib/number-to-words"

type InvoicePreviewProps = {
  invoiceData: InvoiceData
  documentTitle?: string
}

export function InvoicePreview({ invoiceData, documentTitle = "TAX INVOICE" }: InvoicePreviewProps) {
  const subtotal = invoiceData.items.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
  }, 0)

  const taxableValue = subtotal - (Number(invoiceData.discount) || 0)

  const totalTax = invoiceData.items.reduce((sum, item) => {
    const itemSubtotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
    return sum + itemSubtotal * ((Number(item.taxRate) || 0) / 100)
  }, 0)

  const grandTotal = taxableValue + totalTax
  const currency = invoiceData.currency || "OMR"
  const amountWords = amountToWordsOMR(grandTotal)

  return (
    <div
      id="invoice-preview"
      className="mx-auto w-full max-w-[210mm] bg-white text-slate-900 shadow-md print:shadow-none print:m-0 print:p-0"
      style={{
        minHeight: "297mm",
        boxSizing: "border-box",
        fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* Top Golden Hornet Letterhead Header Banner */}
      <div className="w-full">
        <Image
          src="/images/gh_header.png"
          alt="Golden Hornet Letterhead"
          width={1190}
          height={220}
          className="w-full h-auto object-contain block"
          priority
        />
      </div>

      <div className="p-6 pt-2 pb-4">
        {/* Outer Framed Box matching sample_invoice.png */}
        <div className="border border-slate-900 flex flex-col justify-between" style={{ minHeight: "235mm" }}>
          <div className="p-4 pb-2">
            {/* Company Credentials */}
            <div className="text-[11px] leading-tight text-slate-900 mb-2">
              <div className="font-bold text-[13px] tracking-wide text-slate-950">
                {invoiceData.companyName || "Golden Hornet LLC"}
              </div>
              <div>{invoiceData.address || "P.O. Box: 680, P.C:121, Sultanate of Oman"}</div>
              <div className="font-semibold">VATIN :- {invoiceData.vatin || "OM1100158810"}</div>
              <div>Sultanate of Oman</div>
              <div>
                Tel: {invoiceData.phone || "+968 24813684"}, Fax: {invoiceData.fax || "+(968) 24813200"}
              </div>
              <div>
                Email: {invoiceData.email || "info@goldenhornet.net"}, website: {invoiceData.website || "www.goldenhornet.net"}
              </div>
            </div>

            {/* Document Title with gold/charcoal underline */}
            <div className="my-2 text-center border-t border-b border-slate-900 py-1">
              <h1 className="text-base font-extrabold tracking-widest text-slate-950 uppercase">
                {documentTitle}
              </h1>
            </div>

            {/* Customer Box (Left) & Invoice Meta (Right) */}
            <div className="grid grid-cols-12 gap-3 mb-3 items-start">
              {/* Client Box */}
              <div className="col-span-8 border border-slate-900 p-2.5 bg-white text-[11px] min-h-[85px]">
                <div className="font-bold text-[12px] text-slate-950 mb-0.5">
                  {invoiceData.billToName || "Customer Name"}
                </div>
                {invoiceData.billToAddress && (
                  <div className="whitespace-pre-line text-slate-800">{invoiceData.billToAddress}</div>
                )}
                {invoiceData.billToCity && <div className="text-slate-800">{invoiceData.billToCity}</div>}
                {invoiceData.billToVatin && (
                  <div className="font-semibold text-slate-900 mt-1">VATIN: {invoiceData.billToVatin}</div>
                )}
                {invoiceData.billToPhone && (
                  <div className="text-slate-700">Tel: {invoiceData.billToPhone}</div>
                )}
              </div>

              {/* Invoice Number & Date */}
              <div className="col-span-4 flex flex-col justify-start text-right text-[11px] space-y-1 pt-1">
                <div>
                  <span className="font-bold text-slate-950">Invoice No: </span>
                  <span className="font-semibold text-slate-900">{invoiceData.invoiceNumber || "1250-2026"}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-950">Date: </span>
                  <span className="text-slate-900">
                    {invoiceData.invoiceDate ? invoiceData.invoiceDate.split("-").reverse().join("-") : "07-09-2026"}
                  </span>
                </div>
                {invoiceData.dueDate && (
                  <div>
                    <span className="font-medium text-slate-700">Due Date: </span>
                    <span className="text-slate-900">
                      {invoiceData.dueDate.split("-").reverse().join("-")}
                    </span>
                  </div>
                )}
                {invoiceData.customerNumber && (
                  <div>
                    <span className="font-medium text-slate-700">Cust No: </span>
                    <span className="text-slate-900">{invoiceData.customerNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="mb-2">
              <table className="w-full border-collapse border border-slate-900 text-[11px]">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-950 font-bold border-b border-slate-900">
                    <th className="border-r border-slate-900 py-1 px-2 text-center w-[6%]">Sl.No</th>
                    <th className="border-r border-slate-900 py-1 px-2 text-center w-[46%]">Description</th>
                    <th className="border-r border-slate-900 py-1 px-2 text-center w-[16%]">PO</th>
                    <th className="border-r border-slate-900 py-1 px-2 text-center w-[10%]">Qty</th>
                    <th className="border-r border-slate-900 py-1 px-2 text-center w-[11%]">Rate</th>
                    <th className="py-1 px-2 text-center w-[11%]">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item, idx) => (
                    <tr key={item.id || idx} className="border-b border-slate-300 min-h-[36px]">
                      <td className="border-r border-slate-900 p-2 text-center align-top font-medium">
                        {item.itemNo || idx + 1}
                      </td>
                      <td className="border-r border-slate-900 p-2 align-top text-left font-medium text-slate-900 whitespace-pre-line leading-snug">
                        {item.description}
                      </td>
                      <td className="border-r border-slate-900 p-2 text-center align-top text-[10px] font-semibold text-slate-800 break-words">
                        {item.poRef || invoiceData.purchaseOrderNumber || "-"}
                      </td>
                      <td className="border-r border-slate-900 p-2 text-center align-top font-semibold">
                        {item.quantity}
                      </td>
                      <td className="border-r border-slate-900 p-2 text-right align-top whitespace-nowrap">
                        <span className="text-[9px] text-slate-600 mr-1">{currency}</span>
                        <span className="font-medium">{(Number(item.unitPrice) || 0).toFixed(3)}</span>
                      </td>
                      <td className="p-2 text-right align-top whitespace-nowrap font-semibold">
                        <span className="text-[9px] text-slate-600 mr-1">{currency}</span>
                        <span>{((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)).toFixed(3)}</span>
                      </td>
                    </tr>
                  ))}

                  {/* Empty rows filler if few items to maintain traditional Oman invoice look */}
                  {invoiceData.items.length < 3 && (
                    <tr style={{ height: `${(3 - invoiceData.items.length) * 45}px` }}>
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

              {/* Totals Table directly beneath */}
              <div className="flex justify-end border-x border-b border-slate-900 bg-white">
                <div className="w-[45%] text-[10px] leading-tight">
                  <div className="flex justify-between border-b border-slate-300 px-2.5 py-1">
                    <span className="font-semibold text-slate-800">Sub Total</span>
                    <span className="font-semibold">
                      {currency} {subtotal.toFixed(3)}
                    </span>
                  </div>
                  {invoiceData.discount > 0 && (
                    <div className="flex justify-between border-b border-slate-300 px-2.5 py-1 text-red-600">
                      <span className="font-semibold">Discount</span>
                      <span className="font-semibold">
                        -{currency} {(Number(invoiceData.discount) || 0).toFixed(3)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-slate-300 px-2.5 py-1">
                    <span className="font-semibold text-slate-800">Taxable Value</span>
                    <span className="font-semibold">
                      {currency} {taxableValue.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-300 px-2.5 py-1">
                    <span className="font-semibold text-slate-800">Value Added Tax 5 %</span>
                    <span className="font-semibold">
                      {currency} {totalTax.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-300 px-2.5 py-1">
                    <span className="font-semibold text-slate-800">Value of the Tax due</span>
                    <span className="font-semibold">
                      {currency} {totalTax.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex justify-between bg-slate-100 px-2.5 py-1.5 font-bold text-[11px] text-slate-950">
                    <span>TOTAL</span>
                    <span>
                      {currency} {grandTotal.toFixed(3)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount In Words Row */}
              <div className="border-x border-b border-slate-900 px-3 py-1.5 bg-slate-50/70 text-[10.5px]">
                <span className="font-bold text-slate-950">In Words : </span>
                <span className="font-semibold text-slate-900">{amountWords}</span>
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
                    : {invoiceData.bankName || "Sohar International"}
                  </span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="col-span-5 text-slate-700">Company Name</span>
                  <span className="col-span-7 font-semibold text-slate-950">
                    : {invoiceData.companyName || "Golden Hornet LLC"}
                  </span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="col-span-5 text-slate-700">Account Number</span>
                  <span className="col-span-7 font-bold text-slate-950">
                    : {invoiceData.bankAccount || "001030002918"}
                  </span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="col-span-5 text-slate-700">Swift Code</span>
                  <span className="col-span-7 font-semibold text-slate-950">
                    : {invoiceData.bankSwift || "BSHROMRU"}
                  </span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="col-span-5 text-slate-700">IBAN</span>
                  <span className="col-span-7 font-semibold text-slate-950">
                    : {invoiceData.bankIban || "OM210300000001030002918"}
                  </span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="col-span-5 text-slate-700">Branch</span>
                  <span className="col-span-7 font-semibold text-slate-950">
                    : {invoiceData.bankBranch || "CBD"}
                  </span>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="col-span-6 text-center text-[10.5px] p-2 border border-dashed border-slate-400 bg-slate-50/50 rounded-xs">
                <span className="font-bold text-slate-900">Payment Terms: </span>
                <span className="text-slate-800 font-medium">
                  {invoiceData.paymentTerms || "30 Days After Submission of the invoice."}
                </span>
                {invoiceData.notes && (
                  <div className="mt-1 text-[9.5px] text-slate-600 italic">
                    {invoiceData.notes}
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
                {invoiceData.showStamp !== false ? (
                  <div className="relative h-20 w-20 transform -rotate-3 hover:rotate-0 transition-transform">
                    <Image
                      src="/images/stamp.png"
                      alt="Golden Hornet Official Stamp"
                      fill
                      className="object-contain"
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
                {invoiceData.showSignature !== false ? (
                  <div className="relative h-12 w-28 my-0.5">
                    <Image
                      src="/images/signature.png"
                      alt="Authorized Signature"
                      fill
                      className="object-contain"
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

      {/* Bottom Golden Hornet Letterhead Footer Banner */}
      <div className="w-full mt-auto">
        <Image
          src="/images/gh_footer.png"
          alt="Golden Hornet Footer"
          width={1190}
          height={110}
          className="w-full h-auto object-contain block"
          priority
        />
      </div>
    </div>
  )
}
