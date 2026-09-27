"use client"

import Image from "next/image"
import type { DOData } from "./do-form"

type DOPreviewProps = {
  data: DOData
  documentTitle?: string
}

export function DOPreview({ data, documentTitle = "DELIVERY ORDER" }: DOPreviewProps) {
  const totalQty = data.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)

  return (
    <div
      id="do-preview"
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

      {/* 3. Delivery Order Details Card (Light Blue) */}
      <div className="mb-6 rounded-lg bg-[#DBEAFE] p-4">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <div className="mb-1 font-semibold text-[#1F2937]">DO Number:</div>
            <div className="font-medium text-[#1F2937]">{data.doNumber || "DO-000001"}</div>
          </div>
          <div>
            <div className="mb-1 font-semibold text-[#1F2937]">DO Date:</div>
            <div className="text-[#1F2937]">{data.doDate}</div>
          </div>
          <div>
            <div className="mb-1 font-semibold text-[#1F2937]">PO Number:</div>
            <div className="text-[#1F2937]">{data.poNumber || "-"}</div>
          </div>
        </div>

        {(data.terms || data.referenceInvoice) && (
          <div className="mt-3 grid grid-cols-3 gap-4 border-t border-[#93C5FD] pt-3 text-xs">
            {data.terms && (
              <div>
                <div className="mb-1 font-semibold text-[#1F2937]">Payment Terms:</div>
                <div className="text-[#1F2937]">{data.terms}</div>
              </div>
            )}
            {data.referenceInvoice && (
              <div>
                <div className="mb-1 font-semibold text-[#1F2937]">Reference Invoice:</div>
                <div className="text-[#1F2937]">{data.referenceInvoice}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Customer Information Card ("DELIVER TO") */}
      <div className="mb-6 grid grid-cols-2 gap-6 rounded-lg border-2 border-[#E5E7EB] bg-white p-4 text-xs">
        <div>
          <div className="mb-2 font-bold uppercase text-[#2563EB]">Deliver To</div>
          {data.customerName ? (
            <>
              <div className="font-semibold text-[#1F2937]">{data.customerName}</div>
              {data.customerAddress && (
                <div className="mt-1 whitespace-pre-wrap text-[#4B5563]">{data.customerAddress}</div>
              )}
              {data.customerCity && <div className="text-[#4B5563]">{data.customerCity}</div>}
              {data.customerTel && (
                <div className="mt-1 font-medium text-[#1F2937]">Tel: {data.customerTel}</div>
              )}
              {data.customerEmail && <div className="text-[#4B5563]">{data.customerEmail}</div>}
            </>
          ) : (
            <div className="text-[#6B7280]">No delivery information provided</div>
          )}
        </div>

        {(data.shipToName || data.shipToAddress || data.shipToCity || data.customerFax) && (
          <div>
            <div className="mb-2 font-bold uppercase text-[#2563EB]">Ship To / Attention</div>
            {data.shipToName && (
              <div className="font-semibold text-[#1F2937]">{data.shipToName}</div>
            )}
            {data.shipToAddress && (
              <div className="mt-1 whitespace-pre-wrap text-[#4B5563]">{data.shipToAddress}</div>
            )}
            {data.shipToCity && <div className="text-[#4B5563]">{data.shipToCity}</div>}
            {data.customerFax && (
              <div className="mt-1 text-[#4B5563]">Fax: {data.customerFax}</div>
            )}
          </div>
        )}
      </div>

      {/* 5. Items Table */}
      <div className="mb-6">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-[#2563EB] text-white">
              <th className="border border-[#1D4ED8] p-3 text-left font-bold w-[12%]">Item No</th>
              <th className="border border-[#1D4ED8] p-3 text-left font-bold w-[58%]">Description</th>
              <th className="border border-[#1D4ED8] p-3 text-center font-bold w-[15%]">UOM</th>
              <th className="border border-[#1D4ED8] p-3 text-right font-bold w-[15%]">Qty</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={item.id || index} className={index % 2 === 0 ? "bg-[#F9FAFB]" : "bg-white"}>
                <td className="border border-[#E5E7EB] p-3 text-[#1F2937]">
                  {item.itemNo || `00${index + 1}0`.slice(-6)}
                </td>
                <td className="border border-[#E5E7EB] p-3 text-[#1F2937]">
                  <div className="font-medium">{item.description || "-"}</div>
                  {item.notes && (
                    <div className="mt-0.5 text-[11px] text-[#6B7280] whitespace-pre-wrap">
                      {item.notes}
                    </div>
                  )}
                </td>
                <td className="border border-[#E5E7EB] p-3 text-center text-[#1F2937] uppercase">
                  {item.uom || "UNIT"}
                </td>
                <td className="border border-[#E5E7EB] p-3 text-right font-bold text-[#1F2937]">
                  {item.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 6. Summary Total Qty Box */}
      <div className="mb-6 flex justify-end">
        <div className="w-80 space-y-2 text-xs">
          <div className="flex justify-between border-b border-[#E5E7EB] bg-white px-4 py-3">
            <span className="font-medium text-[#4B5563]">Total Items:</span>
            <span className="font-semibold text-[#1F2937]">{data.items.length}</span>
          </div>
          <div className="flex justify-between rounded-md bg-[#DBEAFE] px-4 py-4">
            <span className="text-base font-bold text-[#1F2937]">Total Quantity:</span>
            <span className="text-lg font-bold text-[#1F2937]">{totalQty}</span>
          </div>
        </div>
      </div>

      {/* 7. Notes / Remarks Card */}
      {data.notes && (
        <div className="mb-6 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-xs">
          <div className="mb-2 font-bold text-[#1F2937]">Notes / Delivery Remarks:</div>
          <div className="whitespace-pre-wrap text-[#4B5563]">{data.notes}</div>
        </div>
      )}

      {/* 8. Dual Signatures Section */}
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
            Receiver Signature
          </div>
        </div>
      </div>

      {/* 9. Bottom Contact & Thank You Footer */}
      <div className="border-t-2 border-[#E5E7EB] pt-4 text-center text-xs text-[#6B7280]">
        <p className="font-semibold">Thank you for your business!</p>
        <p className="mt-1">
          If you have any questions regarding this delivery order, please contact us at +968 7637 3445
        </p>
      </div>
    </div>
  )
}
