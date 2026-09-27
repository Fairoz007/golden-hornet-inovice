"use client"

import Link from "next/link"
import Image from "next/image"
import { FileText, ArrowLeft, PlusCircle, Users, ShoppingCart, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
          <Image
            src="/images/logo.png"
            alt="Golden Hornet LLC"
            width={44}
            height={44}
            className="object-contain"
          />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-amber-700 uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            404 — Page Not Found
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Document or Page Not Found
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            The page or document record you requested does not exist or may have been moved.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <Link href="/invoices" className="w-full">
            <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs gap-1.5">
              <FileText className="h-4 w-4" />
              <span>Go to Invoices Ledger</span>
            </Button>
          </Link>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link href="/quotation">
              <Button variant="outline" size="sm" className="w-full text-xs text-slate-700 gap-1">
                <FileSpreadsheet className="h-3.5 w-3.5 text-amber-600" />
                <span>Quotation</span>
              </Button>
            </Link>
            <Link href="/purchase-order">
              <Button variant="outline" size="sm" className="w-full text-xs text-slate-700 gap-1">
                <ShoppingCart className="h-3.5 w-3.5 text-blue-600" />
                <span>Purchase Order</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
