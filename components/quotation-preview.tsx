"use client"

import Image from "next/image"
import type { QuotationData } from "./quotation-form"

type QuotationPreviewProps = {
  data: QuotationData
  documentTitle?: string
}

export function QuotationPreview({ data, documentTitle = "QUOTATION" }: QuotationPreviewProps) {
  const subtotal = data.items.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
  }, 0)

  const totalTax = data.items.reduce((sum, item) => {
    const itemSubtotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
    return sum + itemSubtotal * ((Number(item.taxRate) || 0) / 100)
  }, 0)

  const grandTotal = subtotal + totalTax - (Number(data.discount) || 0)
  const currency = data.currency || "OMR"

  return (
    <div
      id="quotation-preview"
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

      {/* 3. Quotation Details Card */}
      <div className="mb-6 rounded-lg bg-[#DBEAFE] p-4">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <div className="mb-1 font-semibold text-[#1F2937]">Quotation No:</div>
            <div className="font-medium text-[#1F2937]">{data.quotationNumber || "FFE-QT-000001"}</div>
          </div>
          <div>
            <div className="mb-1 font-semibold text-[#1F2937]">Quotation Date:</div>
            <div className="text-[#1F2937]">{data.quotationDate}</div>
          </div>
          <div>
            <div className="mb-1 font-semibold text-[#1F2937]">Valid Until:</div>
            <div className="text-[#1F2937]">{data.validUntil}</div>
          </div>
        </div>

        {(data.rfqNumber || data.paymentTerms) && (
          <div className="mt-3 grid grid-cols-3 gap-4 border-t border-[#93C5FD] pt-3 text-xs">
            {data.rfqNumber && (
              <div>
                <div className="mb-1 font-semibold text-[#1F2937]">Reference / RFQ:</div>
                <div className="text-[#1F2937]">{data.rfqNumber}</div>
              </div>
            )}
            {data.paymentTerms && (
              <div>
                <div className="mb-1 font-semibold text-[#1F2937]">Payment Terms:</div>
                <div className="text-[#1F2937]">{data.paymentTerms}</div>
              </div>
            )}
            <div>
              <div className="mb-1 font-semibold text-[#1F2937]">Currency:</div>
              <div className="text-[#1F2937]">{currency}</div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Client / Bill To Card */}
      <div className="mb-6 grid grid-cols-2 gap-6 rounded-lg border-2 border-[#E5E7EB] bg-white p-4 text-xs">
        <div>
          <div className="mb-2 font-bold uppercase text-[#2563EB]">Quotation For</div>
          {data.billToName ? (
            <>
              <div className="font-semibold text-[#1F2937]">{data.billToName}</div>
              {data.billToAddress && (
                <div className="mt-1 whitespace-pre-wrap text-[#4B5563]">{data.billToAddress}</div>
              )}
              {data.billToCity && <div className="text-[#4B5563]">{data.billToCity}</div>}
              {data.billToPhone && (
                <div className="mt-1 font-medium text-[#1F2937]">Tel: {data.billToPhone}</div>
              )}
              {data.billToEmail && <div className="text-[#4B5563]">{data.billToEmail}</div>}
            </>
          ) : (
            <div className="text-[#6B7280]">No client information provided</div>
          )}
        </div>

        {(data.shipToName || data.shipToAddress || data.shipToCity) && (
          <div>
            <div className="mb-2 font-bold uppercase text-[#2563EB]">Attention / Site</div>
            {data.shipToName && (
              <div className="font-semibold text-[#1F2937]">{data.shipToName}</div>
            )}
            {data.shipToAddress && (
              <div className="mt-1 whitespace-pre-wrap text-[#4B5563]">{data.shipToAddress}</div>
            )}
            {data.shipToCity && <div className="text-[#4B5563]">{data.shipToCity}</div>}
          </div>
        )}
      </div>

      {/* 5. Items Table */}
      <div className="mb-6">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-[#2563EB] text-white">
              <th className="border border-[#1D4ED8] p-3 text-left font-bold w-[12%]">Item No</th>
              <th className="border border-[#1D4ED8] p-3 text-left font-bold w-[46%]">Description</th>
              <th className="border border-[#1D4ED8] p-3 text-right font-bold w-[10%]">Qty</th>
              <th className="border border-[#1D4ED8] p-3 text-right font-bold w-[16%]">Unit Price</th>
              <th className="border border-[#1D4ED8] p-3 text-right font-bold w-[16%]">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => {
              const itemTotal =
                (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0) * (1 + (Number(item.taxRate) || 0) / 100)
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
                    {itemTotal.toFixed(3)}
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
          {totalTax > 0 && (
            <div className="flex justify-between border-b border-[#E5E7EB] bg-white px-4 py-3">
              <span className="font-medium text-[#4B5563]">VAT/Tax:</span>
              <span className="font-semibold text-[#1F2937]">
                {currency} {totalTax.toFixed(3)}
              </span>
            </div>
          )}
          {Number(data.discount) > 0 && (
            <div className="flex justify-between border-b border-[#E5E7EB] bg-white px-4 py-3">
              <span className="font-medium text-[#4B5563]">Discount:</span>
              <span className="font-semibold text-[#DC2626]">
                -{currency} {Number(data.discount).toFixed(3)}
              </span>
            </div>
          )}
          <div className="flex justify-between rounded-md bg-[#DBEAFE] px-4 py-4">
            <span className="text-base font-bold text-[#1F2937]">Grand Total:</span>
            <span className="text-lg font-bold text-[#1F2937]">
              {currency} {grandTotal.toFixed(3)}
            </span>
          </div>
        </div>
      </div>

      {/* 7. Notes & Terms */}
      {data.notes && (
        <div className="mb-6 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-xs">
          <div className="mb-2 font-bold text-[#1F2937]">Terms & Conditions:</div>
          <div className="whitespace-pre-wrap text-[#4B5563]">{data.notes}</div>
        </div>
      )}

      {/* 8. Bank Details Card */}
      <div className="mb-6 rounded-lg border-2 border-[#2563EB] bg-[#DBEAFE] p-4 text-xs">
        <div className="mb-2 font-bold text-[#2563EB]">BANK TRANSFER DETAILS</div>
        <div className="space-y-1 text-[#1F2937]">
          <div className="flex">
            <span className="w-32 font-semibold">Company Name:</span>
            <span>FUTURE FRONT EXCELLENCE LLC</span>
          </div>
          <div className="flex">
            <span className="w-32 font-semibold">Account Number:</span>
            <span>0338080791430018</span>
          </div>
          <div className="flex">
            <span className="w-32 font-semibold">IBAN No:</span>
            <span>OM430270338080791430018</span>
          </div>
          <div className="flex">
            <span className="w-32 font-semibold">Branch Name:</span>
            <span>0338 - Br Al Amerat</span>
          </div>
        </div>
      </div>

      {/* 9. Dual Signatures */}
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
            Client Acceptance & Seal
          </div>
        </div>
      </div>

      {/* 10. Footer */}
      <div className="border-t-2 border-[#E5E7EB] pt-4 text-center text-xs text-[#6B7280]">
        <p className="font-semibold">Thank you for the opportunity to quote!</p>
        <p className="mt-1">
          If you have any questions regarding this quotation, please contact us at +968 7637 3445
        </p>
      </div>
    </div>
  )
}
