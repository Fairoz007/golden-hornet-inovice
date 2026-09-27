"use client"

import Image from "next/image"
import type { DOData } from "./do-form"
import { GOLDEN_HORNET_COMPANY } from "@/lib/dummy-data"

type DOPreviewProps = {
  data: DOData
  documentTitle?: string
}

export function DOPreview({ data, documentTitle = "DELIVERY ORDER" }: DOPreviewProps) {
  const totalQty = data.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)

  return (
    <div
      id="do-preview"
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
        {/* Outer Framed Box matching invoice styling */}
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

            {/* Consignee (Left) & DO Meta (Right) */}
            <div className="grid grid-cols-12 gap-3 mb-3 items-start">
              {/* Customer Box */}
              <div className="col-span-7 border border-slate-900 p-2.5 bg-white text-[11px] min-h-[90px]">
                <div className="text-[10px] uppercase font-bold text-amber-800 mb-1">
                  DELIVER TO / CONSIGNEE:
                </div>
                <div className="font-bold text-[12px] text-slate-950 mb-0.5">
                  {data.customerName || "Customer Name"}
                </div>
                {data.customerAddress && (
                  <div className="whitespace-pre-line text-slate-800">{data.customerAddress}</div>
                )}
                {data.customerCity && <div className="text-slate-800">{data.customerCity}</div>}
                {data.customerTel && (
                  <div className="text-slate-700">Tel: {data.customerTel}</div>
                )}
                {data.customerEmail && (
                  <div className="text-slate-700">Email: {data.customerEmail}</div>
                )}
              </div>

              {/* DO Meta Details */}
              <div className="col-span-5 flex flex-col justify-start text-right text-[11px] space-y-1 pt-1">
                <div>
                  <span className="font-bold text-slate-950">DO Number: </span>
                  <span className="font-semibold text-slate-900">{data.doNumber || "GH-DO-2026-0421"}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-950">DO Date: </span>
                  <span className="text-slate-900">
                    {data.doDate ? data.doDate.split("-").reverse().join("-") : "07-09-2026"}
                  </span>
                </div>
                {data.poNumber && (
                  <div>
                    <span className="font-bold text-slate-950">LPO / PO Ref: </span>
                    <span className="text-slate-900">{data.poNumber}</span>
                  </div>
                )}
                {data.referenceInvoice && (
                  <div>
                    <span className="font-medium text-slate-700">Ref Invoice: </span>
                    <span className="text-slate-900">{data.referenceInvoice}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Destination & Vehicle Info Bar */}
            <div className="grid grid-cols-12 gap-2 border border-slate-900 p-2 mb-3 bg-slate-50/70 text-[10.5px]">
              <div className="col-span-7">
                <span className="font-bold text-slate-950">Site Destination: </span>
                <span className="text-slate-800">
                  {data.shipToAddress
                    ? `${data.shipToName ? data.shipToName + " - " : ""}${data.shipToAddress}`
                    : "Sohar Solar Park Phase 2 Project Site, Plot 42"}
                </span>
              </div>
              <div className="col-span-5 text-right">
                <span className="font-bold text-slate-950">Vehicle / Driver: </span>
                <span className="text-slate-900">
                  {data.vehicleRegNo || "0390"}
                  {data.driverName ? ` (${data.driverName})` : ""}
                </span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="mb-2">
              <table className="w-full border-collapse border border-slate-900 text-[11px]">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-950 font-bold border-b border-slate-900">
                    <th className="border-r border-slate-900 py-1 px-2 text-center w-[7%]">Sl.No</th>
                    <th className="border-r border-slate-900 py-1 px-2 text-center w-[15%]">Item Code</th>
                    <th className="border-r border-slate-900 py-1 px-2 text-center w-[48%]">Description of Goods / Services</th>
                    <th className="border-r border-slate-900 py-1 px-2 text-center w-[10%]">UOM</th>
                    <th className="border-r border-slate-900 py-1 px-2 text-center w-[10%]">Qty</th>
                    <th className="py-1 px-2 text-center w-[10%]">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item, idx) => (
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
                      <td className="border-r border-slate-900 p-2 text-center align-top text-slate-700 font-semibold">
                        {item.uom || "Unit"}
                      </td>
                      <td className="border-r border-slate-900 p-2 text-center align-top font-bold text-slate-950">
                        {item.quantity}
                      </td>
                      <td className="p-2 text-center align-top text-[10px] text-slate-600">
                        {item.remarks || "Good condition"}
                      </td>
                    </tr>
                  ))}

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

              {/* Total Units Summary */}
              <div className="flex justify-between items-center border-x border-b border-slate-900 px-3 py-1.5 bg-slate-50/70 text-[10.5px]">
                <span className="font-bold text-slate-900">Total Quantity Delivered:</span>
                <span className="font-bold text-slate-950 text-xs">{totalQty} Units</span>
              </div>
            </div>

            {/* Delivery Inspection Clause */}
            <div className="my-2 border border-slate-900 p-2 text-[10px] leading-relaxed bg-slate-50/40">
              <div className="font-bold text-slate-950 mb-0.5">GOODS & SERVICES RECEIPT ACKNOWLEDGMENT:</div>
              <p className="text-slate-800">
                {data.notes ||
                  "Received the above mentioned materials/equipment services in satisfactory condition, correct specifications, and full order quantity."}
              </p>
            </div>

            {/* Signatures & Seal Section */}
            <div className="mt-4 pt-2 border-t border-slate-900 grid grid-cols-3 gap-2 items-center text-center text-[10px]">
              {/* Dispatched by */}
              <div className="flex flex-col items-center justify-end h-24 pb-1">
                <div className="w-36 border-b border-slate-800 mb-1"></div>
                <span className="font-bold text-slate-900">
                  Dispatched By (Driver / Logistics)
                </span>
                {data.driverName && (
                  <span className="text-[9px] text-slate-600">{data.driverName}</span>
                )}
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

              {/* Received By (Customer) */}
              <div className="flex flex-col items-center justify-end h-24 pb-1">
                <div className="w-36 border-b border-slate-800 mb-1"></div>
                <span className="font-bold text-slate-900">Received By (Customer Stamp & Sign)</span>
                <span className="text-[9px] text-slate-600">Date: ____ / ____ / 2026</span>
              </div>
            </div>

            <div className="mt-2 text-center text-[11px] font-bold tracking-wider text-slate-900 italic">
              GOLDEN HORNET LLC • TRANSPORT & HEAVY EQUIPMENT FLEET
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
