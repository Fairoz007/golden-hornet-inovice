import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const list = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let customers = await ctx.db.query("customers").order("desc").collect()
    if (args.search) {
      const q = args.search.toLowerCase()
      customers = customers.filter(
        (c) =>
          c.companyName.toLowerCase().includes(q) ||
          (c.vatin && c.vatin.toLowerCase().includes(q)) ||
          (c.phone && c.phone.includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q))
      )
    }
    return customers
  },
})

export const getById = query({
  args: { id: v.id("customers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

export const create = mutation({
  args: {
    companyName: v.string(),
    poBox: v.optional(v.string()),
    address: v.string(),
    city: v.optional(v.string()),
    vatin: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const customerId = await ctx.db.insert("customers", {
      ...args,
      createdAt: now,
      updatedAt: now,
    })

    await ctx.db.insert("auditLogs", {
      timestamp: now,
      action: "CUSTOMER_CREATED",
      entityType: "customer",
      entityId: customerId,
      user: "System User",
      newValues: { companyName: args.companyName, vatin: args.vatin },
      description: `Customer "${args.companyName}" created.`,
    })

    return customerId
  },
})

export const update = mutation({
  args: {
    id: v.id("customers"),
    companyName: v.string(),
    poBox: v.optional(v.string()),
    address: v.string(),
    city: v.optional(v.string()),
    vatin: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const prev = await ctx.db.get(args.id)
    if (!prev) throw new Error("Customer not found")

    const now = Date.now()
    const { id, ...data } = args
    await ctx.db.patch(id, {
      ...data,
      updatedAt: now,
    })

    await ctx.db.insert("auditLogs", {
      timestamp: now,
      action: "CUSTOMER_EDITED",
      entityType: "customer",
      entityId: id,
      user: "System User",
      previousValues: { companyName: prev.companyName, vatin: prev.vatin, phone: prev.phone },
      newValues: { companyName: args.companyName, vatin: args.vatin, phone: args.phone },
      changedFields: ["companyName", "address", "vatin", "phone", "email"],
      description: `Customer record "${args.companyName}" updated. Historical invoices remain unaffected.`,
    })

    return id
  },
})
