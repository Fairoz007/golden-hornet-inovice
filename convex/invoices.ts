import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

// Financial calculator for backend validation
function calculateFinancials(
  items: Array<{ quantity: number; rate: number; taxRate?: number }>,
  discountAmount = 0,
  vatRate = 5
) {
  let subtotalBaisas = 0
  let vatBaisas = 0

  for (const item of items) {
    const q = Math.max(0, Number(item.quantity) || 0)
    const r = Math.max(0, Number(item.rate) || 0)
    const rate = item.taxRate !== undefined ? Number(item.taxRate) : vatRate
    const lineAmount = Math.round(q * r * 1000) / 1000
    subtotalBaisas += Math.round(lineAmount * 1000)
    const taxAmount = Math.round(((lineAmount * rate) / 100) * 1000) / 1000
    vatBaisas += Math.round(taxAmount * 1000)
  }

  const subtotal = subtotalBaisas / 1000
  const discount = Math.min(subtotal, Math.max(0, discountAmount))
  const taxableValue = (subtotalBaisas - Math.round(discount * 1000)) / 1000
  const vatAmount = vatBaisas / 1000
  const total = (Math.round(taxableValue * 1000) + Math.round(vatAmount * 1000)) / 1000

  return { subtotal, discount, taxableValue, vatRate, vatAmount, total }
}

export const list = query({
  args: {
    status: v.optional(v.string()),
    search: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let invoices = await ctx.db.query("invoices").order("desc").collect()

    if (args.status && args.status !== "All") {
      invoices = invoices.filter((inv) => inv.status === args.status)
    }

    if (args.search) {
      const q = args.search.toLowerCase()
      invoices = invoices.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.customerSnapshot.companyName.toLowerCase().includes(q) ||
          (inv.poNumber && inv.poNumber.toLowerCase().includes(q))
      )
    }

    if (args.startDate) {
      invoices = invoices.filter((inv) => inv.invoiceDate >= args.startDate!)
    }

    if (args.endDate) {
      invoices = invoices.filter((inv) => inv.invoiceDate <= args.endDate!)
    }

    return invoices
  },
})

export const getById = query({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

export const getNextInvoiceNumber = query({
  args: {},
  handler: async (ctx) => {
    const currentYear = new Date().getFullYear()
    const allInvoices = await ctx.db.query("invoices").collect()

    // Find highest sequence number for this year
    let maxSeq = 1249
    for (const inv of allInvoices) {
      const parts = inv.invoiceNumber.split("-")
      if (parts.length === 2 && parts[1] === String(currentYear)) {
        const seq = parseInt(parts[0], 10)
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq
        }
      }
    }

    return `${maxSeq + 1}-${currentYear}`
  },
})

export const create = mutation({
  args: {
    invoiceNumber: v.string(),
    invoiceDate: v.string(),
    dueDate: v.string(),
    customerId: v.optional(v.string()),
    customerSnapshot: v.object({
      companyName: v.string(),
      poBox: v.optional(v.string()),
      address: v.string(),
      city: v.optional(v.string()),
      vatin: v.optional(v.string()),
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
    }),
    poNumber: v.optional(v.string()),
    currency: v.string(),
    discount: v.number(),
    amountInWords: v.string(),
    paymentTerms: v.string(),
    bankDetailsSnapshot: v.object({
      bankName: v.string(),
      companyName: v.string(),
      accountNumber: v.string(),
      swiftCode: v.string(),
      iban: v.string(),
      branch: v.string(),
    }),
    companyDetailsSnapshot: v.object({
      name: v.string(),
      arabicName: v.string(),
      crNumber: v.string(),
      vatin: v.string(),
      address: v.string(),
      tel: v.string(),
      fax: v.string(),
      email: v.string(),
      website: v.string(),
    }),
    letterheadAsset: v.optional(v.string()),
    logoAsset: v.optional(v.string()),
    stampAsset: v.optional(v.string()),
    signatureAsset: v.optional(v.string()),
    enableStamp: v.boolean(),
    enableSignature: v.boolean(),
    notes: v.optional(v.string()),
    items: v.array(
      v.object({
        id: v.string(),
        serialNumber: v.number(),
        description: v.string(),
        poReference: v.optional(v.string()),
        quantity: v.number(),
        unit: v.string(),
        rate: v.number(),
        amount: v.number(),
        taxRate: v.number(),
      })
    ),
    finalizeImmediately: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Check invoice number uniqueness
    const existing = await ctx.db
      .query("invoices")
      .withIndex("by_invoice_number", (q) => q.eq("invoiceNumber", args.invoiceNumber))
      .first()

    if (existing) {
      throw new Error(`Invoice number ${args.invoiceNumber} already exists.`)
    }

    // Backend financial validation
    const financials = calculateFinancials(args.items, args.discount, 5)

    const now = Date.now()
    const status = args.finalizeImmediately ? "Finalized" : "Draft"

    const invoiceId = await ctx.db.insert("invoices", {
      invoiceNumber: args.invoiceNumber,
      invoiceDate: args.invoiceDate,
      dueDate: args.dueDate,
      customerId: args.customerId,
      customerSnapshot: args.customerSnapshot,
      poNumber: args.poNumber,
      currency: args.currency || "OMR",
      subtotal: financials.subtotal,
      discount: financials.discount,
      taxableValue: financials.taxableValue,
      vatRate: financials.vatRate,
      vatAmount: financials.vatAmount,
      total: financials.total,
      amountInWords: args.amountInWords,
      paymentTerms: args.paymentTerms,
      bankDetailsSnapshot: args.bankDetailsSnapshot,
      companyDetailsSnapshot: args.companyDetailsSnapshot,
      letterheadAsset: args.letterheadAsset,
      logoAsset: args.logoAsset,
      stampAsset: args.stampAsset,
      signatureAsset: args.signatureAsset,
      enableStamp: args.enableStamp,
      enableSignature: args.enableSignature,
      status,
      notes: args.notes,
      items: args.items,
      createdAt: now,
      updatedAt: now,
      finalizedAt: args.finalizeImmediately ? now : undefined,
    })

    // Audit log
    await ctx.db.insert("auditLogs", {
      timestamp: now,
      action: args.finalizeImmediately ? "INVOICE_FINALIZED" : "INVOICE_CREATED",
      entityType: "invoice",
      entityId: invoiceId,
      invoiceNumber: args.invoiceNumber,
      user: "System User",
      newValues: {
        invoiceNumber: args.invoiceNumber,
        customer: args.customerSnapshot.companyName,
        total: financials.total,
        status,
      },
      description: `Invoice ${args.invoiceNumber} created as ${status} with total ${financials.total.toFixed(3)} OMR.`,
    })

    return invoiceId
  },
})

export const updateDraft = mutation({
  args: {
    id: v.id("invoices"),
    invoiceDate: v.string(),
    dueDate: v.string(),
    customerSnapshot: v.object({
      companyName: v.string(),
      poBox: v.optional(v.string()),
      address: v.string(),
      city: v.optional(v.string()),
      vatin: v.optional(v.string()),
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
    }),
    poNumber: v.optional(v.string()),
    currency: v.string(),
    discount: v.number(),
    amountInWords: v.string(),
    paymentTerms: v.string(),
    notes: v.optional(v.string()),
    items: v.array(
      v.object({
        id: v.string(),
        serialNumber: v.number(),
        description: v.string(),
        poReference: v.optional(v.string()),
        quantity: v.number(),
        unit: v.string(),
        rate: v.number(),
        amount: v.number(),
        taxRate: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.id)
    if (!invoice) throw new Error("Invoice not found")
    if (invoice.status !== "Draft") {
      throw new Error(`Cannot edit an invoice with status ${invoice.status}. Only Drafts can be edited.`)
    }

    const previousValues = {
      subtotal: invoice.subtotal,
      total: invoice.total,
      itemsCount: invoice.items.length,
      dueDate: invoice.dueDate,
    }

    const financials = calculateFinancials(args.items, args.discount, invoice.vatRate)
    const now = Date.now()

    await ctx.db.patch(args.id, {
      invoiceDate: args.invoiceDate,
      dueDate: args.dueDate,
      customerSnapshot: args.customerSnapshot,
      poNumber: args.poNumber,
      currency: args.currency,
      subtotal: financials.subtotal,
      discount: financials.discount,
      taxableValue: financials.taxableValue,
      vatAmount: financials.vatAmount,
      total: financials.total,
      amountInWords: args.amountInWords,
      paymentTerms: args.paymentTerms,
      notes: args.notes,
      items: args.items,
      updatedAt: now,
    })

    const newValues = {
      subtotal: financials.subtotal,
      total: financials.total,
      itemsCount: args.items.length,
      dueDate: args.dueDate,
    }

    await ctx.db.insert("auditLogs", {
      timestamp: now,
      action: "INVOICE_EDITED",
      entityType: "invoice",
      entityId: args.id,
      invoiceNumber: invoice.invoiceNumber,
      user: "System User",
      previousValues,
      newValues,
      changedFields: ["items", "total", "subtotal", "dueDate"],
      description: `Draft invoice ${invoice.invoiceNumber} edited. Total changed from ${previousValues.total.toFixed(3)} to ${newValues.total.toFixed(3)} OMR.`,
    })

    return args.id
  },
})

export const finalize = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.id)
    if (!invoice) throw new Error("Invoice not found")
    if (invoice.status !== "Draft") {
      throw new Error(`Invoice is already ${invoice.status}`)
    }

    const now = Date.now()
    await ctx.db.patch(args.id, {
      status: "Finalized",
      finalizedAt: now,
      updatedAt: now,
    })

    await ctx.db.insert("auditLogs", {
      timestamp: now,
      action: "INVOICE_FINALIZED",
      entityType: "invoice",
      entityId: args.id,
      invoiceNumber: invoice.invoiceNumber,
      user: "System User",
      previousValues: { status: "Draft" },
      newValues: { status: "Finalized", finalizedAt: now },
      changedFields: ["status", "finalizedAt"],
      description: `Invoice ${invoice.invoiceNumber} finalized. Asset & customer snapshots permanently frozen.`,
    })

    return args.id
  },
})

export const markPaid = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.id)
    if (!invoice) throw new Error("Invoice not found")
    if (invoice.status === "Cancelled") {
      throw new Error("Cannot mark a cancelled invoice as paid")
    }

    const now = Date.now()
    const prevStatus = invoice.status
    await ctx.db.patch(args.id, {
      status: "Paid",
      updatedAt: now,
    })

    await ctx.db.insert("auditLogs", {
      timestamp: now,
      action: "INVOICE_MARKED_PAID",
      entityType: "invoice",
      entityId: args.id,
      invoiceNumber: invoice.invoiceNumber,
      user: "System User",
      previousValues: { status: prevStatus },
      newValues: { status: "Paid" },
      changedFields: ["status"],
      description: `Invoice ${invoice.invoiceNumber} marked as Paid.`,
    })

    return args.id
  },
})

export const cancel = mutation({
  args: { id: v.id("invoices"), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.id)
    if (!invoice) throw new Error("Invoice not found")

    const now = Date.now()
    const prevStatus = invoice.status
    await ctx.db.patch(args.id, {
      status: "Cancelled",
      updatedAt: now,
    })

    await ctx.db.insert("auditLogs", {
      timestamp: now,
      action: "INVOICE_CANCELLED",
      entityType: "invoice",
      entityId: args.id,
      invoiceNumber: invoice.invoiceNumber,
      user: "System User",
      previousValues: { status: prevStatus },
      newValues: { status: "Cancelled", reason: args.reason },
      changedFields: ["status"],
      description: `Invoice ${invoice.invoiceNumber} cancelled. Reason: ${args.reason || "Not specified"}. Record preserved.`,
    })

    return args.id
  },
})

export const duplicate = mutation({
  args: { id: v.id("invoices"), newInvoiceNumber: v.string() },
  handler: async (ctx, args) => {
    const original = await ctx.db.get(args.id)
    if (!original) throw new Error("Original invoice not found")

    const now = Date.now()
    const today = new Date().toISOString().split("T")[0]
    const due = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    const newId = await ctx.db.insert("invoices", {
      ...original,
      invoiceNumber: args.newInvoiceNumber,
      invoiceDate: today,
      dueDate: due,
      status: "Draft",
      createdAt: now,
      updatedAt: now,
      finalizedAt: undefined,
    })

    await ctx.db.insert("auditLogs", {
      timestamp: now,
      action: "INVOICE_DUPLICATED",
      entityType: "invoice",
      entityId: newId,
      invoiceNumber: args.newInvoiceNumber,
      user: "System User",
      previousValues: { sourceInvoice: original.invoiceNumber },
      newValues: { newInvoice: args.newInvoiceNumber, status: "Draft" },
      description: `Duplicated invoice ${original.invoiceNumber} into new draft ${args.newInvoiceNumber}.`,
    })

    return newId
  },
})

export const logActivity = mutation({
  args: {
    invoiceId: v.id("invoices"),
    action: v.string(), // "INVOICE_DOWNLOADED" | "INVOICE_PRINTED"
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.invoiceId)
    if (!invoice) return

    await ctx.db.insert("auditLogs", {
      timestamp: Date.now(),
      action: args.action,
      entityType: "invoice",
      entityId: args.invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      user: "System User",
      description: args.description,
    })
  },
})
