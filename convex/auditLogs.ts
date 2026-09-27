import { query } from "./_generated/server"
import { v } from "convex/values"

export const list = query({
  args: {
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
    action: v.optional(v.string()),
    invoiceNumber: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let logs = await ctx.db.query("auditLogs").order("desc").collect()

    if (args.entityId) {
      logs = logs.filter((l) => l.entityId === args.entityId)
    }

    if (args.entityType && args.entityType !== "All") {
      logs = logs.filter((l) => l.entityType === args.entityType)
    }

    if (args.action && args.action !== "All") {
      logs = logs.filter((l) => l.action === args.action)
    }

    if (args.invoiceNumber) {
      logs = logs.filter(
        (l) => l.invoiceNumber && l.invoiceNumber.toLowerCase().includes(args.invoiceNumber!.toLowerCase())
      )
    }

    if (args.startDate) {
      logs = logs.filter((l) => l.timestamp >= args.startDate!)
    }

    if (args.endDate) {
      logs = logs.filter((l) => l.timestamp <= args.endDate!)
    }

    if (args.search) {
      const q = args.search.toLowerCase()
      logs = logs.filter(
        (l) =>
          l.description.toLowerCase().includes(q) ||
          (l.invoiceNumber && l.invoiceNumber.toLowerCase().includes(q)) ||
          l.action.toLowerCase().includes(q)
      )
    }

    return logs
  },
})
