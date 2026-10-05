import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  companies: defineTable({
    name: v.string(),
    arabicName: v.string(),
    crNumber: v.string(),
    vatin: v.string(),
    poBox: v.string(),
    pc: v.string(),
    address: v.string(),
    location: v.string(),
    tel: v.string(),
    fax: v.string(),
    email: v.string(),
    website: v.string(),
    bankName: v.string(),
    accountNumber: v.string(),
    swiftCode: v.string(),
    iban: v.string(),
    branch: v.string(),
    defaultPaymentTerms: v.string(),
  }),

  customers: defineTable({
    companyName: v.string(),
    customerCode: v.optional(v.string()),
    crNumber: v.optional(v.string()),
    customerType: v.optional(v.string()),
    contactPerson: v.optional(v.string()),
    paymentTerms: v.optional(v.string()),
    creditLimit: v.optional(v.number()),
    accountStatus: v.optional(v.string()),
    poBox: v.optional(v.string()),
    address: v.string(),
    city: v.optional(v.string()),
    vatin: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_company_name", ["companyName"]),

  invoices: defineTable({
    invoiceNumber: v.string(),
    invoiceDate: v.string(),
    sourceDocumentId: v.optional(v.id("customerDocuments")),
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
    subtotal: v.number(),
    discount: v.number(),
    taxableValue: v.number(),
    vatRate: v.number(),
    vatAmount: v.number(),
    total: v.number(),
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
    status: v.string(), // "Draft" | "Finalized" | "Paid" | "Cancelled"
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
    createdAt: v.number(),
    updatedAt: v.number(),
    finalizedAt: v.optional(v.number()),
  })
    .index("by_invoice_number", ["invoiceNumber"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"])
    .index("by_customer", ["customerId"]),

  // Amounts below are integer baisa; balances are always derived, never stored.
  customerAccounts: defineTable({
    customerId: v.id("customers"), currency: v.string(), createdAt: v.number(),
  }).index("by_customer_currency", ["customerId", "currency"]),
  payments: defineTable({
    accountId: v.id("customerAccounts"), customerId: v.id("customers"),
    date: v.string(), amountBaisa: v.number(), currency: v.string(), method: v.string(),
    treatment: v.string(), reference: v.string(), bankReference: v.optional(v.string()),
    chequeNumber: v.optional(v.string()), description: v.string(), notes: v.optional(v.string()),
    attachmentId: v.optional(v.id("_storage")), createdAt: v.number(),
    reversedAt: v.optional(v.number()), reversalReason: v.optional(v.string()),
  }).index("by_customer", ["customerId"]).index("by_reference", ["reference"]),
  paymentAllocations: defineTable({
    paymentId: v.id("payments"), customerId: v.id("customers"),
    invoiceId: v.optional(v.id("invoices")), transactionId: v.optional(v.id("financialTransactions")),
    amountBaisa: v.number(), date: v.string(), createdAt: v.number(),
  }).index("by_payment", ["paymentId"]).index("by_invoice", ["invoiceId"]),
  financialTransactions: defineTable({
    accountId: v.id("customerAccounts"), customerId: v.id("customers"), currency: v.string(),
    date: v.string(), type: v.string(), reference: v.string(), description: v.string(),
    debitBaisa: v.number(), creditBaisa: v.number(), vatBaisa: v.optional(v.number()),
    invoiceId: v.optional(v.id("invoices")), paymentId: v.optional(v.id("payments")),
    reversesId: v.optional(v.id("financialTransactions")), createdAt: v.number(),
  }).index("by_customer", ["customerId"]).index("by_account", ["accountId"]),
  expenses: defineTable({
    date: v.string(), reference: v.string(), description: v.string(), currency: v.string(),
    amountBaisa: v.number(), inputVatBaisa: v.number(), createdAt: v.number(),
  }).index("by_date", ["date"]),
  customerContacts: defineTable({ customerId: v.id("customers"), name: v.string(), role: v.optional(v.string()), phone: v.optional(v.string()), email: v.optional(v.string()) }).index("by_customer", ["customerId"]),
  customerProjects: defineTable({ customerId: v.id("customers"), name: v.string(), site: v.optional(v.string()), status: v.string(), createdAt: v.number() }).index("by_customer", ["customerId"]),
  customerDocuments: defineTable({ parentRecordId: v.optional(v.id("customerDocuments")), customerId: v.id("customers"), type: v.string(), reference: v.string(), date: v.string(), storageId: v.optional(v.id("_storage")), notes: v.optional(v.string()), createdAt: v.number() }).index("by_customer", ["customerId"]),
  customerNotes: defineTable({ customerId: v.id("customers"), text: v.string(), createdAt: v.number() }).index("by_customer", ["customerId"]),

  invoiceItems: defineTable({
    invoiceId: v.string(),
    serialNumber: v.number(),
    description: v.string(),
    poReference: v.optional(v.string()),
    quantity: v.number(),
    unit: v.string(),
    rate: v.number(),
    amount: v.number(),
    taxRate: v.number(),
  }).index("by_invoice_id", ["invoiceId"]),

  invoiceAssets: defineTable({
    type: v.string(), // "logo" | "letterhead" | "stamp" | "signature"
    storageId: v.optional(v.string()),
    url: v.string(),
    name: v.string(),
    enabled: v.boolean(),
    updatedAt: v.number(),
  }).index("by_type", ["type"]),

  settings: defineTable({
    key: v.string(), // "global"
    defaultVatRate: v.number(),
    currency: v.string(),
    startingInvoiceSequence: v.number(),
    invoiceFormat: v.string(),
    enableStamp: v.boolean(),
    enableSignature: v.boolean(),
    logoUrl: v.string(),
    letterheadUrl: v.string(),
    stampUrl: v.string(),
    signatureUrl: v.string(),
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
    bankDetails: v.object({
      bankName: v.string(),
      companyName: v.string(),
      accountNumber: v.string(),
      swiftCode: v.string(),
      iban: v.string(),
      branch: v.string(),
    }),
    paymentTerms: v.string(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  auditLogs: defineTable({
    timestamp: v.number(),
    action: v.string(),
    entityType: v.string(), // "invoice" | "customer" | "settings" | "asset"
    entityId: v.string(),
    invoiceNumber: v.optional(v.string()),
    user: v.optional(v.string()),
    previousValues: v.optional(v.any()),
    newValues: v.optional(v.any()),
    changedFields: v.optional(v.array(v.string())),
    description: v.string(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_entity_id", ["entityId"])
    .index("by_action", ["action"]),
})
