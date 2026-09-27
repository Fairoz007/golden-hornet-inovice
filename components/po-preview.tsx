"use client"

import Image from "next/image"
import type { POData } from "./po-form"

type POPreviewProps = {
  data: POData
  documentTitle?: string
}

export function POPreview({ data, documentTitle = "PURCHASE ORDER" }: POPreviewProps) {
  const subtotal = data.items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0)
  const vat = subtotal * ((Number(data.vatPercent) || 0) / 100)
  const grand = subtotal + vat
  const currency = data.currency || "OMR"

  return (
    <div
      id="po-preview"
      className="mx-auto w-full max-w-[210mm] bg-white p-8 text-sm text-[#1F2937] shadow-sm"
      style={{ minHeight: "297mm", boxSizing: "border-box" }}
    >
      {/* 1. Header Banner */}
      <div className="mb-8">
        <Image
          src="/images/header.jpg"
          alt="Company Letterhead"
          width={1600}
          height={400}
          className="h-auto w-full"
          priority
        />
      </div>

      {/* 2. Document Title */}
      <div className="mb-4 text-center">
        <h1 className="text-xl font-bold tracking-widest text-[#1e3a8a] uppercase">
          {documentTitle}
        </h1>
      </div>

      {/* 3. PO Details Card */}
      <div className="mb-6 rounded-lg bg-[#DBEAFE] p-4">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <div className="mb-1 font-semibold text-[#1F2937]">PO Number:</div>
            <div className="font-medium text-[#1F2937]">{data.poNumber || "PO-000001"}</div>
          </div>
          <div>
            <div className="mb-1 font-semibold text-[#1F2937]">PO Date:</div>
            <div className="text-[#1F2937]">{data.poDate}</div>
          </div>
          <div>
            <div className="mb-1 font-semibold text-[#1F2937]">Delivery Location:</div>
            <div className="text-[#1F2937]">{data.deliveryLocation || "Muscat, Oman"}</div>
          </div>
        </div>

        {(data.paymentTerms || data.deliveryDate) && (
          <div className="mt-3 grid grid-cols-3 gap-4 border-t border-[#93C5FD] pt-3 text-xs">
            {data.paymentTerms && (
              <div>
                <div className="mb-1 font-semibold text-[#1F2937]">Payment Terms:</div>
                <div className="text-[#1F2937]">{data.paymentTerms}</div>
              </div>
            )}
            {data.deliveryDate && (
              <div>
                <div className="mb-1 font-semibold text-[#1F2937]">Expected Delivery:</div>
                <div className="text-[#1F2937]">{data.deliveryDate}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Supplier & Ship To Info */}
      <div className="mb-6 grid grid-cols-2 gap-6 rounded-lg border-2 border-[#E5E7EB] bg-white p-4 text-xs">
        <div>
          <div className="mb-2 font-bold uppercase text-[#2563EB]">Supplier / Vendor</div>
          {data.supplierName ? (
            <>
              <div className="font-semibold text-[#1F2937]">{data.supplierName}</div>
              {data.supplierAddress && (
                <div className="mt-1 whitespace-pre-wrap text-[#4B5563]">{data.supplierAddress}</div>
              )}
              {data.supplierCity && <div className="text-[#4B5563]">{data.supplierCity}</div>}
              {data.supplierPhone && (
                <div className="mt-1 font-medium text-[#1F2937]">Tel: {data.supplierPhone}</div>
              )}
              {data.supplierEmail && <div className="text-[#4B5563]">{data.supplierEmail}</div>}
            </>
          ) : (
            <div className="text-[#6B7280]">No supplier information provided</div>
          )}
        </div>

        <div>
          <div className="mb-2 font-bold uppercase text-[#2563EB]">Ship To / Deliver To</div>
          <div className="font-semibold text-[#1F2937]">FUTURE FRONT EXCELLENCE LLC</div>
          <div className="text-[#4B5563]">Madinat Al Nahathah Block 452 Way 5229 Building 2100</div>
          <div className="text-[#4B5563]">Al Amerat, Muscat, Oman</div>
          <div className="mt-1 font-medium text-[#1F2937]">Tel: +968 7637 3445</div>
        </div>
      </div>

      {/* 5. Items Table */}
      <div className="mb-6">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-[#2563EB] text-white">
              <th className="border border-[#1D4ED8] p-3 text-left font-bold w-[12%]">Item No</th>
              <th className="border border-[#1D4ED8] p-3 text-left font-bold w-[48%]">Description</th>
              <th className="border border-[#1D4ED8] p-3 text-right font-bold w-[12%]">Qty</th>
              <th className="border border-[#1D4ED8] p-3 text-right font-bold w-[14%]">Unit Price</th>
              <th className="border border-[#1D4ED8] p-3 text-right font-bold w-[14%]">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => {
              const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
              return (
                <tr key={item.id || index} className={index % 2 === 0 ? "bg-[#F9FAFB]" : "bg-white"}>
                  <td className="border border-[#E5E7EB] p-3 text-[#1F2937]">
                    {item.itemNo || `00${index + 1}0`.slice(-6)}
                  </td>
                  <td className="border border-[#E5E7EB] p-3 text-[#1F2937]">
                    <div className="font-medium">{item.description || "-"}</div>
                  </td>
                  <td className="border border-[#E5E7EB] p-3 text-right text-[#1F2937]">
                    {item.quantity}
                  </td>
                  <td className="border border-[#E5E7EB] p-3 text-right text-[#1F2937]">
                    {(Number(item.unitPrice) || 0).toFixed(3)}
                  </td>
                  <td className="border border-[#E5E7EB] p-3 text-right font-bold text-[#1F2937]">
                    {lineTotal.toFixed(3)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 6. Summary Totals */}
      <div className="mb-6 flex justify-end">
        <div className="w-80 space-y-2 text-xs">
          <div className="flex justify-between border-b border-[#E5E7EB] bg-white px-4 py-3">
            <span className="font-medium text-[#4B5563]">Subtotal:</span>
            <span className="font-semibold text-[#1F2937]">
              {currency} {subtotal.toFixed(3)}
            </span>
          </div>
          {(Number(data.vatPercent) || 0) > 0 && (
            <div className="flex justify-between border-b border-[#E5E7EB] bg-white px-4 py-3">
              <span className="font-medium text-[#4B5563]">VAT/Tax ({data.vatPercent}%):</span>
              <span className="font-semibold text-[#1F2937]">
                {currency} {vat.toFixed(3)}
              </span>
            </div>
          )}
          <div className="flex justify-between rounded-md bg-[#DBEAFE] px-4 py-4">
            <span className="text-base font-bold text-[#1F2937]">Grand Total:</span>
            <span className="text-lg font-bold text-[#1F2937]">
              {currency} {grand.toFixed(3)}
            </span>
          </div>
        </div>
      </div>

      {/* 7. Terms & Notes */}
      {(data.terms || data.notes) && (
        <div className="mb-6 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-xs">
          <div className="mb-2 font-bold text-[#1F2937]">Terms & Conditions:</div>
          <div className="whitespace-pre-wrap text-[#4B5563]">{data.terms || data.notes}</div>
        </div>
      )}

      {/* 8. Dual Signatures */}
      <div className="mb-6 flex justify-between items-end gap-8 pt-8 border-t border-[#E5E7EB]">
        <div className="flex flex-col items-center">
          <div className="h-12" />
          <div className="border-t border-[#9CA3AF] pt-1 text-xs font-medium text-[#1F2937] min-w-[160px] text-center">
            Authorized Signature
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="h-12" />
          <div className="border-t border-[#9CA3AF] pt-1 text-xs font-medium text-[#1F2937] min-w-[160px] text-center">
            Official Seal / Supplier Chop
          </div>
        </div>
      </div>

      {/* 9. Footer */}
      <div className="border-t-2 border-[#E5E7EB] pt-4 text-center text-xs text-[#6B7280]">
        <p className="font-semibold">Thank you for your business!</p>
        <p className="mt-1">
          If you have any questions regarding this purchase order, please contact us at +968 7637 3445
        </p>
      </div>
    </div>
  )
}
