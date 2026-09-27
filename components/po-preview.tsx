"use client"

import Image from "next/image"
import type { POData } from "./po-form"
import { amountToWordsOMR } from "@/lib/number-to-words"
import { GOLDEN_HORNET_COMPANY } from "@/lib/dummy-data"

type POPreviewProps = {
  data: POData
  documentTitle?: string
}

export function POPreview({ data, documentTitle = "PURCHASE ORDER" }: POPreviewProps) {
  const subtotal = data.items.reduce(
    (s, it) => s + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0),
    0
  )
  const vat = subtotal * ((Number(data.vatPercent) || 0) / 100)
  const grand = subtotal + vat
  const currency = data.currency || "OMR"
  const amountWords = amountToWordsOMR(grand)

  return (
    <div
      id="po-preview"
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

            {/* Vendor (Left) & PO Meta (Right) */}
            <div className="grid grid-cols-12 gap-3 mb-3 items-start">
              {/* Supplier / Vendor Box */}
              <div className="col-span-7 border border-slate-900 p-2.5 bg-white text-[11px] min-h-[90px]">
                <div className="text-[10px] uppercase font-bold text-amber-800 mb-1">
                  SUPPLIER / VENDOR:
                </div>
                <div className="font-bold text-[12px] text-slate-950 mb-0.5">
                  {data.supplierName || "Supplier Name"}
                </div>
                {data.supplierAddress && (
                  <div className="whitespace-pre-line text-slate-800">{data.supplierAddress}</div>
                )}
                {data.supplierCity && <div className="text-slate-800">{data.supplierCity}</div>}
                {data.supplierPhone && (
                  <div className="text-slate-700">Tel: {data.supplierPhone}</div>
                )}
                {data.supplierEmail && (
                  <div className="text-slate-700">Email: {data.supplierEmail}</div>
                )}
              </div>

              {/* PO Meta Information */}
              <div className="col-span-5 flex flex-col justify-start text-right text-[11px] space-y-1 pt-1">
                <div>
                  <span className="font-bold text-slate-950">PO Number: </span>
                  <span className="font-semibold text-slate-900">{data.poNumber || "GH-PO-2026-0182"}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-950">PO Date: </span>
                  <span className="text-slate-900">
                    {data.poDate ? data.poDate.split("-").reverse().join("-") : "20-09-2026"}
                  </span>
                </div>
                {data.deliveryDate && (
                  <div>
                    <span className="font-bold text-slate-950">Delivery Due: </span>
                    <span className="text-slate-900">
                      {data.deliveryDate.split("-").reverse().join("-")}
                    </span>
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

            {/* Delivery Site Information Bar */}
            {data.deliveryLocation && (
              <div className="border border-slate-900 px-3 py-1.5 mb-3 bg-slate-50/70 text-[10.5px]">
                <span className="font-bold text-slate-950">Deliver To / Site: </span>
                <span className="text-slate-800">{data.deliveryLocation}</span>
              </div>
            )}

            {/* Line Items Table */}
            <div className="mb-2">
              <table className="w-full border-collapse border border-slate-900 text-[11px]">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-950 font-bold border-b border-slate-900">
                    <th className="border-r border-slate-900 py-1 px-2 text-center w-[7%]">Sl.No</th>
                    <th className="border-r border-slate-900 py-1 px-2 text-center w-[15%]">Item Code</th>
                    <th className="border-r border-slate-900 py-1 px-2 text-center w-[46%]">Description & Specifications</th>
                    <th className="border-r border-slate-900 py-1 px-2 text-center w-[8%]">Qty</th>
                    <th className="border-r border-slate-900 py-1 px-2 text-center w-[12%]">Rate</th>
                    <th className="py-1 px-2 text-center w-[12%]">TOTAL</th>
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
                          {item.itemNo || `ITEM-${idx + 1}`}
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
                  {(Number(data.vatPercent) || 0) > 0 && (
                    <div className="flex justify-between border-b border-slate-300 px-2.5 py-1">
                      <span className="font-semibold text-slate-800">
                        Value Added Tax {data.vatPercent}%
                      </span>
                      <span className="font-semibold">
                        {currency} {vat.toFixed(3)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between bg-slate-100 px-2.5 py-1.5 font-bold text-[11px] text-slate-950">
                    <span>ORDER TOTAL</span>
                    <span>
                      {currency} {grand.toFixed(3)}
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

            {/* Terms and Special Instructions */}
            {(data.terms || data.notes) && (
              <div className="my-2 border border-slate-900 p-2 text-[10px] leading-relaxed bg-slate-50/40">
                <div className="font-bold text-slate-950 mb-0.5">PO TERMS & SPECIAL INSTRUCTIONS:</div>
                <div className="whitespace-pre-line text-slate-700">{data.terms || data.notes}</div>
              </div>
            )}

            {/* Signatures & Seal Section */}
            <div className="mt-4 pt-2 border-t border-slate-900 grid grid-cols-3 gap-2 items-center text-center text-[10px]">
              {/* Supplier Acceptance */}
              <div className="flex flex-col items-center justify-end h-24 pb-1">
                <div className="w-36 border-b border-slate-800 mb-1"></div>
                <span className="font-bold text-slate-900">Supplier Acknowledgment & Stamp</span>
              </div>

              {/* Round Stamp */}
              <div className="flex flex-col items-center justify-center h-24">
                {data.showStamp !== false ? (
                  <div className="relative h-20 w-20 transform -rotate-2 hover:rotate-0 transition-transform">
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
                <span className="font-bold text-slate-900">Authorized Procurement Officer</span>
              </div>
            </div>

            <div className="mt-2 text-center text-[11px] font-bold tracking-wider text-slate-900 italic">
              GOLDEN HORNET LLC • SULTANATE OF OMAN
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
