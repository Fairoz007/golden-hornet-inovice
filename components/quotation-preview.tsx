"use client"

import Image from "next/image"
import type { QuotationData } from "./quotation-form"
import { amountToWordsOMR } from "@/lib/number-to-words"
import { GOLDEN_HORNET_COMPANY } from "@/lib/dummy-data"

type QuotationPreviewProps = {
  data: QuotationData
  documentTitle?: string
}

export function QuotationPreview({ data, documentTitle = "QUOTATION" }: QuotationPreviewProps) {
  const subtotal = data.items.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
  }, 0)

  const taxableValue = subtotal - (Number(data.discount) || 0)

  const totalTax = data.items.reduce((sum, item) => {
    const itemSubtotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
    return sum + itemSubtotal * ((Number(item.taxRate) || 0) / 100)
  }, 0)

  const grandTotal = taxableValue + totalTax
  const currency = data.currency || "OMR"
  const amountWords = amountToWordsOMR(grandTotal)

  return (
    <div
      id="quotation-preview"
      className="mx-auto w-full max-w-[210mm] bg-white text-slate-900 shadow-md print:shadow-none print:m-0 print:p-0"
      style={{
        minHeight: "297mm",
        boxSizing: "border-box",
        fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* 1. Golden Hornet Header Banner */}
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
        {/* Outer Framed Box matching invoice design */}
        <div className="border border-slate-900 flex flex-col justify-between" style={{ minHeight: "235mm" }}>
          <div className="p-4 pb-2">
            {/* Company Credentials */}
            <div className="text-[11px] leading-tight text-slate-900 mb-2">
              <div className="font-bold text-[13px] tracking-wide text-slate-950">
                {GOLDEN_HORNET_COMPANY.name}
              </div>
              <div>{GOLDEN_HORNET_COMPANY.address}</div>
              <div className="font-semibold">VATIN :- {GOLDEN_HORNET_COMPANY.vatin}</div>
              <div>Sultanate of Oman</div>
              <div>
                Tel: {GOLDEN_HORNET_COMPANY.tel}, Fax: {GOLDEN_HORNET_COMPANY.fax}
              </div>
              <div>
                Email: {GOLDEN_HORNET_COMPANY.email}, website: {GOLDEN_HORNET_COMPANY.website}
              </div>
            </div>

            {/* Document Title */}
            <div className="my-2 text-center border-t border-b border-slate-900 py-1">
              <h1 className="text-base font-extrabold tracking-widest text-slate-950 uppercase">
                {documentTitle}
              </h1>
            </div>

            {/* Client (Left) & Quotation Meta (Right) */}
            <div className="grid grid-cols-12 gap-3 mb-3 items-start">
              {/* Customer Box */}
              <div className="col-span-7 border border-slate-900 p-2.5 bg-white text-[11px] min-h-[90px]">
                <div className="text-[10px] uppercase font-bold text-amber-800 mb-1">
                  QUOTATION PREPARED FOR:
                </div>
                <div className="font-bold text-[12px] text-slate-950 mb-0.5">
                  {data.billToName || "Customer Name"}
                </div>
                {data.billToAddress && (
                  <div className="whitespace-pre-line text-slate-800">{data.billToAddress}</div>
                )}
                {data.billToCity && <div className="text-slate-800">{data.billToCity}</div>}
                {data.billToVatin && (
                  <div className="font-semibold text-slate-900 mt-1">VATIN: {data.billToVatin}</div>
                )}
                {data.billToPhone && (
                  <div className="text-slate-700">Tel: {data.billToPhone}</div>
                )}
                {data.billToEmail && (
                  <div className="text-slate-700">Email: {data.billToEmail}</div>
                )}
              </div>

              {/* Quotation Meta */}
              <div className="col-span-5 flex flex-col justify-start text-right text-[11px] space-y-1 pt-1">
                <div>
                  <span className="font-bold text-slate-950">Quotation No: </span>
                  <span className="font-semibold text-slate-900">{data.quotationNumber || "GH-QT-2026-0089"}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-950">Date: </span>
                  <span className="text-slate-900">
                    {data.quotationDate ? data.quotationDate.split("-").reverse().join("-") : "25-09-2026"}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-950">Valid Until: </span>
                  <span className="text-slate-900">
                    {data.validUntil ? data.validUntil.split("-").reverse().join("-") : "25-10-2026"}
                  </span>
                </div>
                {data.rfqNumber && (
                  <div>
                    <span className="font-medium text-slate-700">RFQ Ref: </span>
                    <span className="text-slate-900">{data.rfqNumber}</span>
                  </div>
                )}
                {data.paymentTerms && (
                  <div>
                    <span className="font-medium text-slate-700">Payment Terms: </span>
                    <span className="text-slate-900">{data.paymentTerms}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="mb-2">
              <table className="w-full border-collapse border border-slate-900 text-[11px]">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-950 font-bold border-b border-slate-900">
                    <th className="border-r border-slate-900 py-1 px-2 text-center w-[7%]">Sl.No</th>
                    <th className="border-r border-slate-900 py-1 px-2 text-center w-[12%]">Item No</th>
                    <th className="border-r border-slate-900 py-1 px-2 text-center w-[51%]">Description of Machinery / Service</th>
                    <th className="border-r border-slate-900 py-1 px-2 text-center w-[8%]">Qty</th>
                    <th className="border-r border-slate-900 py-1 px-2 text-center w-[11%]">Rate</th>
                    <th className="py-1 px-2 text-center w-[11%]">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item, idx) => {
                    const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
                    return (
                      <tr key={item.id || idx} className="border-b border-slate-300 min-h-[36px]">
                        <td className="border-r border-slate-900 p-2 text-center align-top font-medium">
                          {idx + 1}
                        </td>
                        <td className="border-r border-slate-900 p-2 text-center align-top text-[10px] font-mono text-slate-700">
                          {item.itemNo || `0${idx + 1}`}
                        </td>
                        <td className="border-r border-slate-900 p-2 align-top text-left font-medium text-slate-900 whitespace-pre-line leading-snug">
                          {item.description}
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
                          <span>{lineTotal.toFixed(3)}</span>
                        </td>
                      </tr>
                    )
                  })}

                  {data.items.length < 3 && (
                    <tr style={{ height: `${(3 - data.items.length) * 45}px` }}>
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
                      {currency} {subtotal.toFixed(3)}
                    </span>
                  </div>
                  {Number(data.discount) > 0 && (
                    <div className="flex justify-between border-b border-slate-300 px-2.5 py-1 text-red-600">
                      <span className="font-semibold">Discount</span>
                      <span className="font-semibold">
                        -{currency} {(Number(data.discount) || 0).toFixed(3)}
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
                  <div className="flex justify-between bg-slate-100 px-2.5 py-1.5 font-bold text-[11px] text-slate-950">
                    <span>QUOTATION TOTAL</span>
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

            {/* Terms and Conditions */}
            {data.notes && (
              <div className="my-2 border border-slate-900 p-2 text-[10px] leading-relaxed bg-slate-50/40">
                <div className="font-bold text-slate-950 mb-0.5">QUOTATION TERMS & CONDITIONS:</div>
                <div className="whitespace-pre-line text-slate-700">{data.notes}</div>
              </div>
            )}

            {/* Bank Transfer Details */}
            <div className="my-2 border border-slate-900 p-2 text-[10px] leading-relaxed">
              <div className="font-bold text-slate-950 border-b border-slate-300 pb-0.5 mb-1 tracking-wide">
                BANK DETAILS FOR PAYMENT
              </div>
              <div className="grid grid-cols-12">
                <span className="col-span-4 text-slate-700">Bank Name</span>
                <span className="col-span-8 font-semibold text-slate-950">
                  : {GOLDEN_HORNET_COMPANY.bankName}
                </span>
              </div>
              <div className="grid grid-cols-12">
                <span className="col-span-4 text-slate-700">Beneficiary Name</span>
                <span className="col-span-8 font-semibold text-slate-950">
                  : {GOLDEN_HORNET_COMPANY.name}
                </span>
              </div>
              <div className="grid grid-cols-12">
                <span className="col-span-4 text-slate-700">Account Number</span>
                <span className="col-span-8 font-bold text-slate-950">
                  : {GOLDEN_HORNET_COMPANY.accountNumber}
                </span>
              </div>
              <div className="grid grid-cols-12">
                <span className="col-span-4 text-slate-700">IBAN</span>
                <span className="col-span-8 font-semibold text-slate-950">
                  : {GOLDEN_HORNET_COMPANY.iban}
                </span>
              </div>
              <div className="grid grid-cols-12">
                <span className="col-span-4 text-slate-700">Swift Code / Branch</span>
                <span className="col-span-8 font-semibold text-slate-950">
                  : {GOLDEN_HORNET_COMPANY.swiftCode} ({GOLDEN_HORNET_COMPANY.branch})
                </span>
              </div>
            </div>

            {/* Signatures & Seal Section */}
            <div className="mt-4 pt-2 border-t border-slate-900 grid grid-cols-3 gap-2 items-center text-center text-[10px]">
              {/* Client Acceptance */}
              <div className="flex flex-col items-center justify-end h-24 pb-1">
                <div className="w-36 border-b border-slate-800 mb-1"></div>
                <span className="font-bold text-slate-900">Client Acceptance & Signature</span>
              </div>

              {/* Round Stamp */}
              <div className="flex flex-col items-center justify-center h-24">
                {data.showStamp !== false ? (
                  <div className="relative h-20 w-20 transform -rotate-1 hover:rotate-0 transition-transform">
                    <Image
                      src="/images/stamp.png"
                      alt="Golden Hornet Official Stamp"
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 border border-dashed border-slate-300 rounded-full flex items-center justify-center text-[9px] text-slate-400">
                    Official Stamp
                  </div>
                )}
              </div>

              {/* Authorized Signatory */}
              <div className="flex flex-col items-center justify-end h-24 pb-1">
                <span className="font-bold text-slate-950 mb-0.5">For Golden Hornet LLC</span>
                {data.showSignature !== false ? (
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
                <span className="font-bold text-slate-900">Commercial Manager</span>
              </div>
            </div>

            <div className="mt-2 text-center text-[11px] font-bold tracking-wider text-slate-900 italic">
              THANK YOU FOR THE OPPORTUNITY TO QUOTE!
            </div>
          </div>
        </div>
      </div>

      {/* Footer Banner */}
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
