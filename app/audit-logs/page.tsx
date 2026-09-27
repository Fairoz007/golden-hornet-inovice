"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  Calendar,
  FileText,
  Users,
  Settings,
  ArrowRight,
  Eye,
  Download,
  AlertCircle,
  Clock,
  User,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { invoiceStore, AuditLogEntry } from "@/lib/invoice-store"

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAction, setSelectedAction] = useState("ALL")
  const [selectedEntity, setSelectedEntity] = useState("ALL")
  const [timeframe, setTimeframe] = useState("ALL")
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)

  useEffect(() => {
    const load = () => {
      setLogs(invoiceStore.getAuditLogs())
    }
    load()
    return invoiceStore.subscribe(load)
  }, [])

  // Unique actions list
  const uniqueActions = useMemo(() => {
    const set = new Set<string>()
    logs.forEach((l) => set.add(l.action))
    return Array.from(set).sort()
  }, [logs])

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesDesc = log.description.toLowerCase().includes(q)
        const matchesUser = (log.user || "").toLowerCase().includes(q)
        const matchesAction = log.action.toLowerCase().includes(q)
        const matchesInv = (log.invoiceNumber || "").toLowerCase().includes(q)
        const matchesId = log.entityId.toLowerCase().includes(q)
        if (!matchesDesc && !matchesUser && !matchesAction && !matchesInv && !matchesId) {
          return false
        }
      }

      // Action
      if (selectedAction !== "ALL" && log.action !== selectedAction) {
        return false
      }

      // Entity
      if (selectedEntity !== "ALL" && log.entityType !== selectedEntity) {
        return false
      }

      // Timeframe
      if (timeframe !== "ALL") {
        const now = Date.now()
        const logTime = log.timestamp
        if (timeframe === "TODAY") {
          const oneDay = 24 * 60 * 60 * 1000
          if (now - logTime > oneDay) return false
        } else if (timeframe === "WEEK") {
          const sevenDays = 7 * 24 * 60 * 60 * 1000
          if (now - logTime > sevenDays) return false
        } else if (timeframe === "MONTH") {
          const thirtyDays = 30 * 24 * 60 * 60 * 1000
          if (now - logTime > thirtyDays) return false
        }
      }

      return true
    })
  }, [logs, searchQuery, selectedAction, selectedEntity, timeframe])

  // Metrics
  const invoiceLogsCount = useMemo(
    () => logs.filter((l) => l.entityType === "invoice").length,
    [logs]
  )
  const masterDataLogsCount = useMemo(
    () => logs.filter((l) => l.entityType !== "invoice").length,
    [logs]
  )

  // Export audit ledger to JSON
  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2))
    const downloadAnchor = document.createElement("a")
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute(
      "download",
      `golden-hornet-audit-ledger-${new Date().toISOString().split("T")[0]}.json`
    )
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  // Export audit ledger to CSV
  const handleExportCSV = () => {
    const headers = ["Timestamp", "ISO Date", "Action", "Entity Type", "Entity ID", "Invoice No", "User", "Description"]
    const rows = logs.map((l) => [
      l.timestamp,
      new Date(l.timestamp).toISOString(),
      `"${l.action}"`,
      `"${l.entityType}"`,
      `"${l.entityId}"`,
      `"${l.invoiceNumber || ""}"`,
      `"${l.user || "System"}"`,
      `"${l.description.replace(/"/g, '""')}"`,
    ])

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const downloadAnchor = document.createElement("a")
    downloadAnchor.setAttribute("href", encodeURI(csvContent))
    downloadAnchor.setAttribute(
      "download",
      `golden-hornet-audit-trail-${new Date().toISOString().split("T")[0]}.csv`
    )
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  // Badge styling helper
  const getActionBadge = (action: string) => {
    if (action.includes("FINALIZED")) {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
          <CheckCircle2 className="h-3 w-3" />
          {action}
        </span>
      )
    }
    if (action.includes("PAID")) {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="h-3 w-3" />
          {action}
        </span>
      )
    }
    if (action.includes("CANCELLED") || action.includes("DELETED")) {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
          <AlertCircle className="h-3 w-3" />
          {action}
        </span>
      )
    }
    if (action.includes("CREATED") || action.includes("DUPLICATED")) {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-300">
          {action}
        </span>
      )
    }
    if (action.includes("EDITED") || action.includes("CHANGED") || action.includes("TOGGLED")) {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200">
          {action}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 border border-slate-200">
        {action}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <History className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                System Audit Ledger
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Append-only, immutable regulatory log recording all invoice state transitions, customer changes, settings adjustments, and asset replacements.
            </p>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="text-xs font-semibold gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJSON}
              className="text-xs font-semibold gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <Download className="h-3.5 w-3.5 text-amber-600" />
              <span>Export JSON</span>
            </Button>
          </div>
        </div>

        {/* Regulatory Compliance Badge Banner */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 space-y-1">
              <span className="font-bold text-slate-900">
                Oman Tax Authority & Commercial Code Audit Compliance (C.R. 1000156):
              </span>
              <p className="text-slate-500 leading-relaxed">
                Every event in this ledger is permanently recorded with microsecond timestamps, user attribution, and before-and-after state diffs.
                Invoices cannot be permanently deleted once finalized; cancellations preserve the original record alongside a cancellation audit entry with explanation.
              </p>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Audit Events</span>
              <History className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{logs.length}</span>
              <span className="text-[11px] text-slate-400">immutable entries</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Invoice Transitions</span>
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{invoiceLogsCount}</span>
              <span className="text-[11px] text-slate-400">lifecycle events</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Master Data & Settings</span>
              <Settings className="h-4 w-4 text-purple-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{masterDataLogsCount}</span>
              <span className="text-[11px] text-slate-400">clients / assets / config</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Latest Audit Activity</span>
              <Clock className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2">
              <span className="text-xs font-bold text-slate-900 block truncate">
                {logs[0]?.action || "None"}
              </span>
              <span className="text-[10px] text-slate-400">
                {logs[0] ? new Date(logs[0].timestamp).toLocaleString() : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search description, invoice #, user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            {/* Action Filter */}
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Actions ({logs.length})</SelectItem>
                {uniqueActions.map((act) => (
                  <SelectItem key={act} value={act}>
                    {act}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Entity Type Filter */}
            <Select value={selectedEntity} onValueChange={setSelectedEntity}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="All Entities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Entity Types</SelectItem>
                <SelectItem value="invoice">Invoices</SelectItem>
                <SelectItem value="customer">Customers</SelectItem>
                <SelectItem value="settings">Settings & Company</SelectItem>
                <SelectItem value="asset">Assets & Media</SelectItem>
              </SelectContent>
            </Select>

            {/* Timeframe Filter */}
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Time</SelectItem>
                <SelectItem value="TODAY">Last 24 Hours</SelectItem>
                <SelectItem value="WEEK">Last 7 Days</SelectItem>
                <SelectItem value="MONTH">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span>
              Showing <strong className="text-slate-900">{filteredLogs.length}</strong> of {logs.length} events
            </span>
            {(searchQuery || selectedAction !== "ALL" || selectedEntity !== "ALL" || timeframe !== "ALL") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedAction("ALL")
                  setSelectedEntity("ALL")
                  setTimeframe("ALL")
                }}
                className="h-6 px-2 text-[11px] text-amber-700 hover:text-amber-800 hover:bg-amber-50"
              >
                Clear all filters
              </Button>
            )}
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity / Target</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Event Description</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <History className="h-8 w-8 text-slate-300" />
                        <p className="font-semibold text-slate-600">No audit log entries match your filter</p>
                        <p className="text-[11px] text-slate-400">Try clearing filters or search terms.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const dateObj = new Date(log.timestamp)
                    const dateFormatted = dateObj.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                    const timeFormatted = dateObj.toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })

                    return (
                      <tr key={log.id} className="hover:bg-amber-50/20 transition-colors">
                        {/* Timestamp */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-medium text-slate-900">{dateFormatted}</div>
                          <div className="font-mono text-[10px] text-slate-400">{timeFormatted}</div>
                        </td>

                        {/* Action */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {getActionBadge(log.action)}
                        </td>

                        {/* Entity */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {log.entityType === "invoice" ? (
                              <FileText className="h-3.5 w-3.5 text-blue-600" />
                            ) : log.entityType === "customer" ? (
                              <Users className="h-3.5 w-3.5 text-amber-600" />
                            ) : (
                              <Settings className="h-3.5 w-3.5 text-purple-600" />
                            )}
                            <span className="font-semibold capitalize text-slate-800">
                              {log.entityType}
                            </span>
                          </div>
                          {log.invoiceNumber ? (
                            <Link
                              href={`/invoices?search=${log.invoiceNumber}`}
                              className="font-mono text-[11px] font-bold text-amber-700 hover:underline block"
                            >
                              #{log.invoiceNumber}
                            </Link>
                          ) : (
                            <span className="font-mono text-[10px] text-slate-400 block truncate max-w-[120px]">
                              {log.entityId}
                            </span>
                          )}
                        </td>

                        {/* User */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-slate-700 font-medium">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            <span>{log.user || "Finance Admin"}</span>
                          </div>
                        </td>

                        {/* Description */}
                        <td className="py-3 px-4 text-slate-600">
                          <p className="line-clamp-2">{log.description}</p>
                        </td>

                        {/* Details Modal Trigger */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                            className="h-7 px-2 text-xs font-semibold text-amber-800 hover:text-amber-900 hover:bg-amber-100 gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Diff</span>
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log Detail / Diff Modal */}
        <Dialog
          open={!!selectedLog}
          onOpenChange={(open) => {
            if (!open) setSelectedLog(null)
          }}
        >
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-amber-600" />
                  <span>Audit Trail Event Inspection</span>
                </DialogTitle>
                {selectedLog && getActionBadge(selectedLog.action)}
              </div>
              <DialogDescription className="text-xs text-slate-500">
                Event ID: <span className="font-mono">{selectedLog?.id}</span>
              </DialogDescription>
            </DialogHeader>

            {selectedLog && (
              <div className="space-y-4 py-2 text-xs">
                {/* Meta details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-lg bg-slate-50 p-3 border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      Timestamp
                    </span>
                    <div className="font-mono text-[11px] text-slate-800 mt-0.5">
                      {new Date(selectedLog.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">User</span>
                    <div className="font-semibold text-slate-800 mt-0.5">
                      {selectedLog.user || "Finance Admin"}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      Entity Type
                    </span>
                    <div className="font-semibold text-slate-800 capitalize mt-0.5">
                      {selectedLog.entityType}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      Reference
                    </span>
                    <div className="font-mono font-bold text-amber-800 mt-0.5">
                      {selectedLog.invoiceNumber
                        ? `#${selectedLog.invoiceNumber}`
                        : selectedLog.entityId}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="rounded-lg bg-amber-50/60 p-3 border border-amber-200">
                  <span className="text-[10px] uppercase font-bold text-amber-900 block mb-1">
                    Event Description
                  </span>
                  <p className="text-slate-800 leading-relaxed font-medium">
                    {selectedLog.description}
                  </p>
                </div>

                {/* Changed Fields list */}
                {selectedLog.changedFields && selectedLog.changedFields.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-1.5">
                      Modified Attributes:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedLog.changedFields.map((f) => (
                        <Badge
                          key={f}
                          variant="secondary"
                          className="font-mono text-[11px] bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Before vs After Diffs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wide">
                      Previous State (Before)
                    </span>
                    <div className="rounded-lg border border-slate-200 bg-slate-900 text-slate-200 p-3 font-mono text-[10.5px] max-h-56 overflow-auto">
                      {selectedLog.previousValues ? (
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(selectedLog.previousValues, null, 2)}
                        </pre>
                      ) : (
                        <span className="text-slate-500 italic">None (Newly Created / Initial)</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                      New State (After)
                    </span>
                    <div className="rounded-lg border border-slate-200 bg-slate-900 text-emerald-400 p-3 font-mono text-[10.5px] max-h-56 overflow-auto">
                      {selectedLog.newValues ? (
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(selectedLog.newValues, null, 2)}
                        </pre>
                      ) : (
                        <span className="text-slate-500 italic">None (Deleted / Unset)</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedLog(null)}
                    className="text-xs"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
