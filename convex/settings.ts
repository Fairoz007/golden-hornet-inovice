import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

const DEFAULT_SETTINGS = {
  key: "global",
  defaultVatRate: 5.0,
  currency: "OMR",
  startingInvoiceSequence: 1250,
  invoiceFormat: "{seq}-{year}",
  enableStamp: true,
  enableSignature: true,
  logoUrl: "/images/logo.png",
  letterheadUrl: "/images/letter_head.png",
  stampUrl: "/images/stamp.png",
  signatureUrl: "/images/signature.png",
  companyDetails: {
    name: "Golden Hornet LLC",
    arabicName: "الدبور الذهبي ش.م.م",
    crNumber: "1000156",
    vatin: "OM1100158810",
    address: "P.O. Box: 680, P.C:121, Sultanate of Oman",
    tel: "+968 24813684",
    fax: "+(968) 24813200",
    email: "info@goldenhornet.net",
    website: "www.goldenhornet.net",
  },
  bankDetails: {
    bankName: "Sohar International",
    companyName: "Golden Hornet LLC",
    accountNumber: "001030002918",
    swiftCode: "BSHROMRU",
    iban: "OM210300000001030002918",
    branch: "CBD",
  },
  paymentTerms: "30 Days After Submission of the invoice.",
}

export const get = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .first()

    return settings || { ...DEFAULT_SETTINGS, updatedAt: Date.now() }
  },
})

export const updateCompany = mutation({
  args: {
    companyDetails: v.object({
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
    paymentTerms: v.string(),
    defaultVatRate: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .first()

    const now = Date.now()
    if (existing) {
      const prev = existing.companyDetails
      await ctx.db.patch(existing._id, {
        companyDetails: args.companyDetails,
        paymentTerms: args.paymentTerms,
        defaultVatRate: args.defaultVatRate,
        updatedAt: now,
      })

      await ctx.db.insert("auditLogs", {
        timestamp: now,
        action: "COMPANY_SETTINGS_CHANGED",
        entityType: "settings",
        entityId: existing._id,
        user: "System User",
        previousValues: prev,
        newValues: args.companyDetails,
        changedFields: ["companyDetails", "paymentTerms", "defaultVatRate"],
        description: "Company details and VAT settings updated.",
      })
    } else {
      const id = await ctx.db.insert("settings", {
        ...DEFAULT_SETTINGS,
        companyDetails: args.companyDetails,
        paymentTerms: args.paymentTerms,
        defaultVatRate: args.defaultVatRate,
        updatedAt: now,
      })

      await ctx.db.insert("auditLogs", {
        timestamp: now,
        action: "COMPANY_SETTINGS_CHANGED",
        entityType: "settings",
        entityId: id,
        user: "System User",
        newValues: args.companyDetails,
        description: "Company settings initialized.",
      })
    }
  },
})

export const updateBank = mutation({
  args: {
    bankDetails: v.object({
      bankName: v.string(),
      companyName: v.string(),
      accountNumber: v.string(),
      swiftCode: v.string(),
      iban: v.string(),
      branch: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .first()

    const now = Date.now()
    if (existing) {
      const prev = existing.bankDetails
      await ctx.db.patch(existing._id, {
        bankDetails: args.bankDetails,
        updatedAt: now,
      })

      await ctx.db.insert("auditLogs", {
        timestamp: now,
        action: "BANK_DETAILS_CHANGED",
        entityType: "settings",
        entityId: existing._id,
        user: "System User",
        previousValues: prev,
        newValues: args.bankDetails,
        changedFields: ["bankDetails"],
        description: `Bank details updated to ${args.bankDetails.bankName} (${args.bankDetails.accountNumber}).`,
      })
    } else {
      const id = await ctx.db.insert("settings", {
        ...DEFAULT_SETTINGS,
        bankDetails: args.bankDetails,
        updatedAt: now,
      })

      await ctx.db.insert("auditLogs", {
        timestamp: now,
        action: "BANK_DETAILS_CHANGED",
        entityType: "settings",
        entityId: id,
        user: "System User",
        newValues: args.bankDetails,
        description: "Bank details initialized.",
      })
    }
  },
})

export const updateAsset = mutation({
  args: {
    assetType: v.string(), // "logo" | "letterhead" | "stamp" | "signature"
    url: v.string(),
    enabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .first()

    const now = Date.now()
    const patchData: Record<string, any> = { updatedAt: now }
    let action = "LOGO_CHANGED"

    if (args.assetType === "logo") {
      patchData.logoUrl = args.url
      action = "LOGO_CHANGED"
    } else if (args.assetType === "letterhead") {
      patchData.letterheadUrl = args.url
      action = "LETTERHEAD_CHANGED"
    } else if (args.assetType === "stamp") {
      patchData.stampUrl = args.url
      if (args.enabled !== undefined) patchData.enableStamp = args.enabled
      action = "STAMP_CHANGED"
    } else if (args.assetType === "signature") {
      patchData.signatureUrl = args.url
      if (args.enabled !== undefined) patchData.enableSignature = args.enabled
      action = "SIGNATURE_CHANGED"
    }

    if (existing) {
      await ctx.db.patch(existing._id, patchData)
      await ctx.db.insert("auditLogs", {
        timestamp: now,
        action,
        entityType: "asset",
        entityId: existing._id,
        user: "System User",
        newValues: patchData,
        description: `Company asset for ${args.assetType} updated. Future invoices will use the new asset.`,
      })
    } else {
      const id = await ctx.db.insert("settings", {
        ...DEFAULT_SETTINGS,
        ...patchData,
        updatedAt: now,
      })
      await ctx.db.insert("auditLogs", {
        timestamp: now,
        action,
        entityType: "asset",
        entityId: id,
        user: "System User",
        newValues: patchData,
        description: `Company asset for ${args.assetType} created.`,
      })
    }
  },
})
