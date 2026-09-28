"use client"

import { calculateInvoiceFinancials, roundOMR } from "./financial-calculator"
import { amountToWordsOMR } from "./number-to-words"
import { GOLDEN_HORNET_COMPANY } from "./dummy-data"

export interface Customer {
  id: string
  companyName: string
  poBox?: string
  address: string
  city?: string
  vatin?: string
  phone?: string
  email?: string
  notes?: string
  createdAt: number
  updatedAt: number
}

export interface InvoiceItem {
  id: string
  serialNumber: number
  description: string
  poReference?: string
  quantity: number
  unit: string
  rate: number
  taxRate: number
  amount: number
}

export type InvoiceStatus = "Draft" | "Finalized" | "Paid" | "Partially Paid" | "Cancelled"

export interface InvoiceRecord {
  id: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  customerId?: string
  customerSnapshot: {
    companyName: string
    poBox?: string
    address: string
    city?: string
    vatin?: string
    phone?: string
    email?: string
  }
  poNumber?: string
  currency: string
  subtotal: number
  discount: number
  taxableValue: number
  vatRate: number
  vatAmount: number
  total: number
  paidAmount?: number
  amountInWords: string
  paymentTerms: string
  bankDetailsSnapshot: {
    bankName: string
    companyName: string
    accountNumber: string
    swiftCode: string
    iban: string
    branch: string
  }
  companyDetailsSnapshot: {
    name: string
    arabicName: string
    crNumber: string
    vatin: string
    address: string
    tel: string
    fax: string
    email: string
    website: string
  }
  letterheadAsset?: string
  logoAsset?: string
  stampAsset?: string
  signatureAsset?: string
  enableStamp: boolean
  enableSignature: boolean
  status: InvoiceStatus
  notes?: string
  items: InvoiceItem[]
  createdAt: number
  updatedAt: number
  finalizedAt?: number
}

export interface AppSettings {
  defaultVatRate: number
  currency: string
  startingInvoiceSequence: number
  invoiceFormat: string
  enableStamp: boolean
  enableSignature: boolean
  logoUrl: string
  letterheadUrl: string
  stampUrl: string
  signatureUrl: string
  companyDetails: {
    name: string
    arabicName: string
    crNumber: string
    vatin: string
    address: string
    tel: string
    fax: string
    email: string
    website: string
  }
  bankDetails: {
    bankName: string
    companyName: string
    accountNumber: string
    swiftCode: string
    iban: string
    branch: string
  }
  paymentTerms: string
  updatedAt: number
}

export interface AuditLogEntry {
  id: string
  timestamp: number
  action: string
  entityType: "invoice" | "customer" | "settings" | "asset"
  entityId: string
  invoiceNumber?: string
  user?: string
  previousValues?: any
  newValues?: any
  changedFields?: string[]
  description: string
}

const DEFAULT_SETTINGS: AppSettings = {
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
    name: GOLDEN_HORNET_COMPANY.name,
    arabicName: GOLDEN_HORNET_COMPANY.arabicName,
    crNumber: GOLDEN_HORNET_COMPANY.crNumber,
    vatin: GOLDEN_HORNET_COMPANY.vatin,
    address: GOLDEN_HORNET_COMPANY.address,
    tel: GOLDEN_HORNET_COMPANY.tel,
    fax: GOLDEN_HORNET_COMPANY.fax,
    email: GOLDEN_HORNET_COMPANY.email,
    website: GOLDEN_HORNET_COMPANY.website,
  },
  bankDetails: {
    bankName: GOLDEN_HORNET_COMPANY.bankName,
    companyName: GOLDEN_HORNET_COMPANY.name,
    accountNumber: GOLDEN_HORNET_COMPANY.accountNumber,
    swiftCode: GOLDEN_HORNET_COMPANY.swiftCode,
    iban: GOLDEN_HORNET_COMPANY.iban,
    branch: GOLDEN_HORNET_COMPANY.branch,
  },
  paymentTerms: GOLDEN_HORNET_COMPANY.paymentTerms,
  updatedAt: Date.now(),
}

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "cust-1",
    companyName: "Renewable Energy Technology Investment",
    poBox: "P.O.BOX: 311, Sohar",
    address: "Plot 42, Sohar Industrial Area Phase 2",
    city: "Sultanate of Oman",
    vatin: "OM110038464X",
    phone: "+968 26845200",
    email: "procurement@renewable-energy.om",
    notes: "Main EPC contractor for Solar Park Project.",
    createdAt: Date.now() - 30 * 86400000,
    updatedAt: Date.now() - 30 * 86400000,
  },
  {
    id: "cust-2",
    companyName: "Oman Flour Mills Company (S.A.O.G.)",
    poBox: "P.O. Box 566, P.C. 112 Ruwi",
    address: "Port Sultan Qaboos Commercial Area, Muttrah",
    city: "Muscat, Sultanate of Oman",
    vatin: "OM1100021458",
    phone: "+968 24712000",
    email: "finance@omanflourmills.com",
    notes: "Annual logistics and bulk cargo contract.",
    createdAt: Date.now() - 45 * 86400000,
    updatedAt: Date.now() - 45 * 86400000,
  },
  {
    id: "cust-3",
    companyName: "Galfar Engineering & Contracting SAOG",
    poBox: "P.O. Box 533, P.C. 100",
    address: "Ghala Industrial Area Road 4",
    city: "Muscat, Sultanate of Oman",
    vatin: "OM1100019234",
    phone: "+968 24525000",
    email: "accounts.payable@galfar.com",
    notes: "Infrastructure and sub-base earthworks aggregate supply.",
    createdAt: Date.now() - 20 * 86400000,
    updatedAt: Date.now() - 20 * 86400000,
  },
]

const INITIAL_INVOICES: InvoiceRecord[] = [
  {
    id: "inv-1250-2026",
    invoiceNumber: "1250-2026",
    invoiceDate: "2026-09-07",
    dueDate: "2026-10-07",
    customerId: "cust-1",
    customerSnapshot: {
      companyName: "Renewable Energy Technology Investment",
      poBox: "P.O.BOX: 311, Sohar",
      address: "P.O.BOX: 311, Sohar",
      city: "Sultanate of Oman",
      vatin: "OM110038464X",
      phone: "+968 26845200",
      email: "procurement@renewable-energy.om",
    },
    poNumber: "RT-OM-PRJ-O-304-2026-0063",
    currency: "OMR",
    subtotal: 1330.0,
    discount: 0,
    taxableValue: 1330.0,
    vatRate: 5.0,
    vatAmount: 66.5,
    total: 1396.5,
    amountInWords:
      "TOTAL RIYAL OMANI One Thousand Three Hundred Ninety Six and Baisas Five Hundred Only.",
    paymentTerms: "30 Days After Submission of the invoice.",
    bankDetailsSnapshot: DEFAULT_SETTINGS.bankDetails,
    companyDetailsSnapshot: DEFAULT_SETTINGS.companyDetails,
    letterheadAsset: "/images/letter_head.png",
    logoAsset: "/images/logo.png",
    stampAsset: "/images/stamp.png",
    signatureAsset: "/images/signature.png",
    enableStamp: true,
    enableSignature: true,
    status: "Finalized",
    notes: "Rental charges certified as per site supervisor work logs.",
    items: [
      {
        id: "it-1",
        serialNumber: 1,
        description:
          "Rental Charges for Hiring NON PDO Tipper With Driver\nReg.NO : 0390",
        poReference: "RT-OM-PRJ-O-304-2026-0063",
        quantity: 266,
        unit: "Hrs",
        rate: 5.0,
        taxRate: 5.0,
        amount: 1330.0,
      },
    ],
    createdAt: Date.now() - 20 * 86400000,
    updatedAt: Date.now() - 20 * 86400000,
    finalizedAt: Date.now() - 20 * 86400000,
  },
  {
    id: "inv-913-2024",
    invoiceNumber: "913-2024",
    invoiceDate: "2026-08-15",
    dueDate: "2026-09-15",
    customerId: "cust-2",
    customerSnapshot: {
      companyName: "Oman Flour Mills Company (S.A.O.G.)",
      poBox: "P.O. Box 566, P.C. 112 Ruwi",
      address: "P.O. Box 566, P.C. 112 Ruwi",
      city: "Muscat, Sultanate of Oman",
      vatin: "OM1100021458",
      phone: "+968 24712000",
      email: "finance@omanflourmills.com",
    },
    poNumber: "OFM-LOG-2026-0812",
    currency: "OMR",
    subtotal: 7290.0,
    discount: 0,
    taxableValue: 7290.0,
    vatRate: 5.0,
    vatAmount: 364.5,
    total: 7654.5,
    amountInWords:
      "TOTAL RIYAL OMANI Seven Thousand Six Hundred Fifty Four and Baisas Five Hundred Only.",
    paymentTerms: "upon invoice submission",
    bankDetailsSnapshot: DEFAULT_SETTINGS.bankDetails,
    companyDetailsSnapshot: DEFAULT_SETTINGS.companyDetails,
    letterheadAsset: "/images/letter_head.png",
    logoAsset: "/images/logo.png",
    stampAsset: "/images/stamp.png",
    signatureAsset: "/images/signature.png",
    enableStamp: true,
    enableSignature: true,
    status: "Paid",
    notes: "20% advance invoice for heavy grain transport fleet logistics.",
    items: [
      {
        id: "it-2",
        serialNumber: 1,
        description: "Bulk Grain Long-haul Transportation Services (42 Trips)",
        poReference: "OFM-LOG-2026-0812",
        quantity: 42,
        unit: "Trips",
        rate: 120.0,
        taxRate: 5.0,
        amount: 5040.0,
      },
      {
        id: "it-3",
        serialNumber: 2,
        description: "Heavy Equipment Silo Loading & Stevedoring Support",
        poReference: "OFM-LOG-2026-0812",
        quantity: 150,
        unit: "Hrs",
        rate: 15.0,
        taxRate: 5.0,
        amount: 2250.0,
      },
    ],
    createdAt: Date.now() - 42 * 86400000,
    updatedAt: Date.now() - 10 * 86400000,
    finalizedAt: Date.now() - 40 * 86400000,
  },
  {
    id: "inv-1251-2026",
    invoiceNumber: "1251-2026",
    invoiceDate: "2026-09-22",
    dueDate: "2026-11-06",
    customerId: "cust-3",
    customerSnapshot: {
      companyName: "Galfar Engineering & Contracting SAOG",
      poBox: "P.O. Box 533, P.C. 100",
      address: "Ghala Industrial Area Road 4",
      city: "Muscat, Sultanate of Oman",
      vatin: "OM1100019234",
      phone: "+968 24525000",
      email: "accounts.payable@galfar.com",
    },
    poNumber: "GLF-DX-2026-9041",
    currency: "OMR",
    subtotal: 5145.0,
    discount: 0,
    taxableValue: 5145.0,
    vatRate: 5.0,
    vatAmount: 257.25,
    total: 5402.25,
    amountInWords:
      "TOTAL RIYAL OMANI Five Thousand Four Hundred Two and Baisas Two Hundred Fifty Only.",
    paymentTerms: "45 Days PDC",
    bankDetailsSnapshot: DEFAULT_SETTINGS.bankDetails,
    companyDetailsSnapshot: DEFAULT_SETTINGS.companyDetails,
    letterheadAsset: "/images/letter_head.png",
    logoAsset: "/images/logo.png",
    stampAsset: "/images/stamp.png",
    signatureAsset: "/images/signature.png",
    enableStamp: true,
    enableSignature: true,
    status: "Draft",
    notes: "Materials tested and compliant with Ministry of Transport specifications.",
    items: [
      {
        id: "it-4",
        serialNumber: 1,
        description: "Supply of Crushed Aggregate 20mm (Sub-base Grade A)",
        poReference: "GLF-DX-2026-9041",
        quantity: 850,
        unit: "Tons",
        rate: 4.2,
        taxRate: 5.0,
        amount: 3570.0,
      },
      {
        id: "it-5",
        serialNumber: 2,
        description: "Haulage and Site Dumping Charges (Rusayl Zone)",
        poReference: "GLF-DX-2026-9041",
        quantity: 35,
        unit: "Trips",
        rate: 45.0,
        taxRate: 5.0,
        amount: 1575.0,
      },
    ],
    createdAt: Date.now() - 5 * 86400000,
    updatedAt: Date.now() - 5 * 86400000,
  },
]

// A sizeable but deterministic offline dataset keeps the demo useful without a database.
const DEMO_CUSTOMERS: Customer[] = [
  ...INITIAL_CUSTOMERS,
  ...Array.from({ length: 7 }, (_, index) => ({
    id: `cust-${index + 4}`,
    companyName: ["Al Noor Trading LLC", "Muscat Infrastructure SAOC", "Sohar Logistics Co.", "Oman Solar Systems", "Gulf Marine Services", "Rusayl Manufacturing", "Nizwa Building Materials"][index],
    poBox: `P.O. Box ${220 + index}, Oman`, address: `${["Al Khuwair", "Al Hail", "Sohar", "Barka", "Muttrah", "Rusayl", "Nizwa"][index]} Commercial Area`, city: "Sultanate of Oman",
    vatin: `OM11000${32000 + index}`, phone: `+968 24${String(500000 + index * 911).slice(0, 6)}`, email: `accounts${index + 4}@goldenhornet.demo`, notes: "Offline demo customer.", createdAt: Date.now() - (index + 10) * 86400000, updatedAt: Date.now() - (index + 10) * 86400000,
  })),
]

const DEMO_INVOICES: InvoiceRecord[] = (() => {
  const seed = INITIAL_INVOICES
  const generated: InvoiceRecord[] = []
  const customers = DEMO_CUSTOMERS
  const today = new Date()
  for (let monthOffset = 0; monthOffset < 36; monthOffset++) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, 15)
    for (let sequence = 0; sequence < 100; sequence++) {
      const customer = customers[(monthOffset * 100 + sequence) % customers.length]
      const total = Math.round((180 + ((sequence * 73 + monthOffset * 41) % 6800)) * 1.05 * 1000) / 1000
      const status: InvoiceStatus = sequence % 11 === 0 ? "Partially Paid" : sequence % 4 === 0 ? "Paid" : sequence % 7 === 0 ? "Draft" : "Finalized"
      const paidAmount = status === "Paid" ? total : status === "Partially Paid" ? Math.round(total * (0.25 + (sequence % 4) * 0.1) * 1000) / 1000 : 0
      const date = monthDate.toISOString().slice(0, 10)
      generated.push({ ...seed[0], id: `demo-${monthDate.getFullYear()}-${monthDate.getMonth()}-${sequence}`, invoiceNumber: `${3000 + monthOffset * 100 + sequence}-${monthDate.getFullYear()}`, invoiceDate: date, dueDate: new Date(monthDate.getTime() + 30 * 86400000).toISOString().slice(0, 10), customerId: customer.id, customerSnapshot: { companyName: customer.companyName, poBox: customer.poBox, address: customer.address, city: customer.city, vatin: customer.vatin, phone: customer.phone, email: customer.email }, poNumber: `DEMO-${monthDate.getFullYear()}-${String(sequence + 1).padStart(3, "0")}`, subtotal: Math.round((total / 1.05) * 1000) / 1000, taxableValue: Math.round((total / 1.05) * 1000) / 1000, vatAmount: Math.round((total - total / 1.05) * 1000) / 1000, total, paidAmount, status, createdAt: monthDate.getTime(), updatedAt: monthDate.getTime(), finalizedAt: status === "Draft" ? undefined : monthDate.getTime() })
    }
  }
  return [...seed, ...generated]
})()

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "log-1",
    timestamp: Date.now() - 42 * 86400000,
    action: "INVOICE_CREATED",
    entityType: "invoice",
    entityId: "inv-913-2024",
    invoiceNumber: "913-2024",
    user: "Finance Admin",
    newValues: { status: "Draft", total: 7654.5 },
    description: "Invoice 913-2024 created as Draft for Oman Flour Mills.",
  },
  {
    id: "log-2",
    timestamp: Date.now() - 40 * 86400000,
    action: "INVOICE_FINALIZED",
    entityType: "invoice",
    entityId: "inv-913-2024",
    invoiceNumber: "913-2024",
    user: "Finance Admin",
    previousValues: { status: "Draft" },
    newValues: { status: "Finalized" },
    changedFields: ["status", "finalizedAt"],
    description: "Invoice 913-2024 finalized. Customer and asset snapshots locked.",
  },
  {
    id: "log-3",
    timestamp: Date.now() - 20 * 86400000,
    action: "INVOICE_CREATED",
    entityType: "invoice",
    entityId: "inv-1250-2026",
    invoiceNumber: "1250-2026",
    user: "Finance Admin",
    newValues: { status: "Finalized", total: 1396.5 },
    description: "Invoice 1250-2026 created and finalized for Renewable Energy Technology Investment.",
  },
  {
    id: "log-4",
    timestamp: Date.now() - 10 * 86400000,
    action: "INVOICE_MARKED_PAID",
    entityType: "invoice",
    entityId: "inv-913-2024",
    invoiceNumber: "913-2024",
    user: "Accounts Team",
    previousValues: { status: "Finalized" },
    newValues: { status: "Paid" },
    changedFields: ["status"],
    description: "Invoice 913-2024 payment received via Sohar International Bank Transfer.",
  },
  {
    id: "log-5",
    timestamp: Date.now() - 5 * 86400000,
    action: "INVOICE_CREATED",
    entityType: "invoice",
    entityId: "inv-1251-2026",
    invoiceNumber: "1251-2026",
    user: "Finance Admin",
    newValues: { status: "Draft", total: 5402.25 },
    description: "Draft invoice 1251-2026 created for Galfar Engineering.",
  },
]

class InvoiceStore {
  private static STORAGE_KEY_INVOICES = "gh:invoices:v2"
  private static STORAGE_KEY_CUSTOMERS = "gh:customers:v2"
  private static STORAGE_KEY_SETTINGS = "gh:settings:v1"
  private static STORAGE_KEY_AUDIT = "gh:audit:v1"

  private listeners: Set<() => void> = new Set()

  /** Restore the bundled demo dataset. No network, database, or authentication is involved. */
  resetDemoData(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(InvoiceStore.STORAGE_KEY_INVOICES)
    localStorage.removeItem(InvoiceStore.STORAGE_KEY_CUSTOMERS)
    localStorage.removeItem(InvoiceStore.STORAGE_KEY_SETTINGS)
    localStorage.removeItem(InvoiceStore.STORAGE_KEY_AUDIT)
    this.notify()
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    this.listeners.forEach((l) => l())
  }

  // --- Settings ---
  getSettings(): AppSettings {
    if (typeof window === "undefined") return DEFAULT_SETTINGS
    try {
      const stored = localStorage.getItem(InvoiceStore.STORAGE_KEY_SETTINGS)
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.error(e)
    }
    return DEFAULT_SETTINGS
  }

  updateSettings(
    patch: Partial<AppSettings>,
    customLog?: { action: string; description: string }
  ): AppSettings {
    const current = this.getSettings()
    const updated = { ...current, ...patch, updatedAt: Date.now() }
    localStorage.setItem(InvoiceStore.STORAGE_KEY_SETTINGS, JSON.stringify(updated))

    let action = "SETTINGS_CHANGED"
    let description = "Application settings updated."

    if (customLog) {
      action = customLog.action
      description = customLog.description
    } else if (patch.logoUrl && patch.logoUrl !== current.logoUrl) {
      action = "LOGO_CHANGED"
      description = "Official company logo asset updated."
    } else if (patch.letterheadUrl && patch.letterheadUrl !== current.letterheadUrl) {
      action = "LETTERHEAD_CHANGED"
      description = "Official Golden Hornet letterhead template background updated."
    } else if (patch.stampUrl && patch.stampUrl !== current.stampUrl) {
      action = "STAMP_CHANGED"
      description = "Official company seal/stamp asset updated."
    } else if (patch.signatureUrl && patch.signatureUrl !== current.signatureUrl) {
      action = "SIGNATURE_CHANGED"
      description = "Authorized signature asset updated."
    } else if (patch.companyDetails) {
      action = "COMPANY_SETTINGS_CHANGED"
      description = "Company profile details (CR, VATIN, address, contact) updated."
    } else if (patch.bankDetails) {
      action = "BANK_DETAILS_CHANGED"
      description = "Official bank disbursement details updated."
    } else if (patch.defaultVatRate !== undefined || patch.startingInvoiceSequence !== undefined) {
      action = "INVOICE_CONFIG_CHANGED"
      description = "Default VAT rate and sequential numbering configuration updated."
    }

    // Audit log
    this.addAuditLog({
      action,
      entityType: "settings",
      entityId: "global",
      previousValues: current,
      newValues: updated,
      changedFields: Object.keys(patch),
      description,
    })

    this.notify()
    return updated
  }

  // --- Customers ---
  getCustomers(): Customer[] {
    if (typeof window === "undefined") return INITIAL_CUSTOMERS
    try {
      const stored = localStorage.getItem(InvoiceStore.STORAGE_KEY_CUSTOMERS)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {
      console.error(e)
    }
    localStorage.setItem(InvoiceStore.STORAGE_KEY_CUSTOMERS, JSON.stringify(DEMO_CUSTOMERS))
    return DEMO_CUSTOMERS
  }

  createCustomer(data: Omit<Customer, "id" | "createdAt" | "updatedAt">): Customer {
    const customers = this.getCustomers()
    const newCustomer: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    const updated = [newCustomer, ...customers]
    localStorage.setItem(InvoiceStore.STORAGE_KEY_CUSTOMERS, JSON.stringify(updated))

    this.addAuditLog({
      action: "CUSTOMER_CREATED",
      entityType: "customer",
      entityId: newCustomer.id,
      newValues: { companyName: newCustomer.companyName, vatin: newCustomer.vatin },
      description: `Customer "${newCustomer.companyName}" created.`,
    })

    this.notify()
    return newCustomer
  }

  updateCustomer(id: string, data: Partial<Customer>): Customer {
    const customers = this.getCustomers()
    const prev = customers.find((c) => c.id === id)
    if (!prev) throw new Error("Customer not found")

    const updatedCust = { ...prev, ...data, updatedAt: Date.now() }
    const updatedList = customers.map((c) => (c.id === id ? updatedCust : c))
    localStorage.setItem(InvoiceStore.STORAGE_KEY_CUSTOMERS, JSON.stringify(updatedList))

    this.addAuditLog({
      action: "CUSTOMER_EDITED",
      entityType: "customer",
      entityId: id,
      previousValues: prev,
      newValues: updatedCust,
      changedFields: Object.keys(data),
      description: `Customer record "${updatedCust.companyName}" modified. Existing finalized invoices remain unchanged.`,
    })

    this.notify()
    return updatedCust
  }

  deleteCustomer(id: string): { success: boolean; message?: string } {
    const invoices = this.getInvoices()
    const linked = invoices.filter((i) => i.customerId === id)
    if (linked.length > 0) {
      throw new Error(
        `Cannot delete customer: "${linked.length}" linked invoice(s) exist. Historical invoices must remain intact.`
      )
    }
    const customers = this.getCustomers()
    const cust = customers.find((c) => c.id === id)
    if (!cust) throw new Error("Customer not found")

    const updatedList = customers.filter((c) => c.id !== id)
    localStorage.setItem(InvoiceStore.STORAGE_KEY_CUSTOMERS, JSON.stringify(updatedList))

    this.addAuditLog({
      action: "CUSTOMER_DELETED",
      entityType: "customer",
      entityId: id,
      previousValues: { companyName: cust.companyName, vatin: cust.vatin },
      description: `Customer record "${cust.companyName}" deleted from master directory.`,
    })

    this.notify()
    return { success: true }
  }

  // --- Invoices ---
  getInvoices(): InvoiceRecord[] {
    if (typeof window === "undefined") return INITIAL_INVOICES
    try {
      const stored = localStorage.getItem(InvoiceStore.STORAGE_KEY_INVOICES)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {
      console.error(e)
    }
    localStorage.setItem(InvoiceStore.STORAGE_KEY_INVOICES, JSON.stringify(DEMO_INVOICES))
    return DEMO_INVOICES
  }

  getInvoiceById(id: string): InvoiceRecord | undefined {
    return this.getInvoices().find((i) => i.id === id)
  }

  getNextInvoiceNumber(): string {
    const invoices = this.getInvoices()
    const year = new Date().getFullYear()
    let maxSeq = 1249
    for (const inv of invoices) {
      const parts = inv.invoiceNumber.split("-")
      if (parts.length === 2 && parts[1] === String(year)) {
        const seq = parseInt(parts[0], 10)
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq
        }
      }
    }
    return `${maxSeq + 1}-${year}`
  }

  createInvoice(
    invoiceData: Omit<
      InvoiceRecord,
      | "id"
      | "subtotal"
      | "taxableValue"
      | "vatAmount"
      | "total"
      | "amountInWords"
      | "createdAt"
      | "updatedAt"
    > & { finalizeImmediately?: boolean }
  ): InvoiceRecord {
    const invoices = this.getInvoices()

    // Uniqueness validation
    if (invoices.some((i) => i.invoiceNumber === invoiceData.invoiceNumber)) {
      throw new Error(`Invoice number "${invoiceData.invoiceNumber}" already exists.`)
    }

    // Backend financial validation
    const financials = calculateInvoiceFinancials(
      invoiceData.items.map((it) => ({
        quantity: it.quantity,
        unitPrice: it.rate,
        taxRate: it.taxRate,
      })),
      invoiceData.discount,
      invoiceData.vatRate || 5
    )

    const now = Date.now()
    const status: InvoiceStatus = invoiceData.finalizeImmediately ? "Finalized" : "Draft"

    const newInvoice: InvoiceRecord = {
      ...invoiceData,
      id: `inv-${Date.now()}`,
      subtotal: financials.subtotal,
      discount: financials.discount,
      taxableValue: financials.taxableValue,
      vatRate: financials.vatRate,
      vatAmount: financials.vatAmount,
      total: financials.total,
      amountInWords: amountToWordsOMR(financials.total),
      status,
      createdAt: now,
      updatedAt: now,
      finalizedAt: invoiceData.finalizeImmediately ? now : undefined,
    }

    const updated = [newInvoice, ...invoices]
    localStorage.setItem(InvoiceStore.STORAGE_KEY_INVOICES, JSON.stringify(updated))

    this.addAuditLog({
      action: invoiceData.finalizeImmediately ? "INVOICE_FINALIZED" : "INVOICE_CREATED",
      entityType: "invoice",
      entityId: newInvoice.id,
      invoiceNumber: newInvoice.invoiceNumber,
      newValues: {
        invoiceNumber: newInvoice.invoiceNumber,
        customer: newInvoice.customerSnapshot.companyName,
        total: financials.total,
        status,
      },
      description: `Invoice ${newInvoice.invoiceNumber} created as ${status} for ${newInvoice.customerSnapshot.companyName} (${financials.total.toFixed(3)} OMR).`,
    })

    this.notify()
    return newInvoice
  }

  updateDraftInvoice(
    id: string,
    invoiceData: Partial<InvoiceRecord>
  ): InvoiceRecord {
    const invoices = this.getInvoices()
    const existing = invoices.find((i) => i.id === id)
    if (!existing) throw new Error("Invoice not found")
    if (existing.status !== "Draft") {
      throw new Error(
        `Invoice ${existing.invoiceNumber} is ${existing.status} and cannot be edited. Only Drafts can be edited.`
      )
    }

    const items = invoiceData.items || existing.items
    const discount =
      invoiceData.discount !== undefined ? invoiceData.discount : existing.discount
    const vatRate =
      invoiceData.vatRate !== undefined ? invoiceData.vatRate : existing.vatRate

    const financials = calculateInvoiceFinancials(
      items.map((it) => ({
        quantity: it.quantity,
        unitPrice: it.rate,
        taxRate: it.taxRate,
      })),
      discount,
      vatRate
    )

    const now = Date.now()
    const updatedInvoice: InvoiceRecord = {
      ...existing,
      ...invoiceData,
      subtotal: financials.subtotal,
      discount: financials.discount,
      taxableValue: financials.taxableValue,
      vatAmount: financials.vatAmount,
      total: financials.total,
      amountInWords: amountToWordsOMR(financials.total),
      updatedAt: now,
    }

    const updatedList = invoices.map((i) => (i.id === id ? updatedInvoice : i))
    localStorage.setItem(InvoiceStore.STORAGE_KEY_INVOICES, JSON.stringify(updatedList))

    this.addAuditLog({
      action: "INVOICE_EDITED",
      entityType: "invoice",
      entityId: id,
      invoiceNumber: existing.invoiceNumber,
      previousValues: {
        total: existing.total,
        itemsCount: existing.items.length,
      },
      newValues: {
        total: financials.total,
        itemsCount: items.length,
      },
      changedFields: ["items", "total", "subtotal"],
      description: `Draft invoice ${existing.invoiceNumber} edited. Total: ${existing.total.toFixed(3)} -> ${financials.total.toFixed(3)} OMR.`,
    })

    this.notify()
    return updatedInvoice
  }

  finalizeInvoice(id: string): InvoiceRecord {
    const invoices = this.getInvoices()
    const existing = invoices.find((i) => i.id === id)
    if (!existing) throw new Error("Invoice not found")
    if (existing.status !== "Draft") {
      throw new Error(`Invoice is already ${existing.status}`)
    }

    const now = Date.now()
    const updatedInvoice: InvoiceRecord = {
      ...existing,
      status: "Finalized",
      finalizedAt: now,
      updatedAt: now,
    }

    const updatedList = invoices.map((i) => (i.id === id ? updatedInvoice : i))
    localStorage.setItem(InvoiceStore.STORAGE_KEY_INVOICES, JSON.stringify(updatedList))

    this.addAuditLog({
      action: "INVOICE_FINALIZED",
      entityType: "invoice",
      entityId: id,
      invoiceNumber: existing.invoiceNumber,
      previousValues: { status: "Draft" },
      newValues: { status: "Finalized", finalizedAt: now },
      changedFields: ["status", "finalizedAt"],
      description: `Invoice ${existing.invoiceNumber} finalized. Customer, company, bank & asset snapshots permanently frozen.`,
    })

    this.notify()
    return updatedInvoice
  }

  markInvoicePaid(id: string): InvoiceRecord {
    const invoices = this.getInvoices()
    const existing = invoices.find((i) => i.id === id)
    if (!existing) throw new Error("Invoice not found")
    if (existing.status === "Cancelled") {
      throw new Error("Cannot mark a cancelled invoice as paid.")
    }

    const now = Date.now()
    const updatedInvoice: InvoiceRecord = {
      ...existing,
      status: "Paid",
      updatedAt: now,
    }

    const updatedList = invoices.map((i) => (i.id === id ? updatedInvoice : i))
    localStorage.setItem(InvoiceStore.STORAGE_KEY_INVOICES, JSON.stringify(updatedList))

    this.addAuditLog({
      action: "INVOICE_MARKED_PAID",
      entityType: "invoice",
      entityId: id,
      invoiceNumber: existing.invoiceNumber,
      previousValues: { status: existing.status },
      newValues: { status: "Paid" },
      changedFields: ["status"],
      description: `Invoice ${existing.invoiceNumber} marked as Paid.`,
    })

    this.notify()
    return updatedInvoice
  }

  markInvoicePartiallyPaid(id: string, paidAmount: number): InvoiceRecord {
    const invoices = this.getInvoices()
    const existing = invoices.find((i) => i.id === id)
    if (!existing) throw new Error("Invoice not found")
    if (existing.status === "Cancelled") throw new Error("Cannot record payment on a cancelled invoice.")
    const amount = Math.min(existing.total, Math.max(0, Number(paidAmount) || 0))
    const updatedInvoice: InvoiceRecord = { ...existing, paidAmount: amount, status: amount >= existing.total ? "Paid" : "Partially Paid", updatedAt: Date.now() }
    localStorage.setItem(InvoiceStore.STORAGE_KEY_INVOICES, JSON.stringify(invoices.map((i) => i.id === id ? updatedInvoice : i)))
    this.addAuditLog({ action: amount >= existing.total ? "INVOICE_MARKED_PAID" : "INVOICE_PARTIALLY_PAID", entityType: "invoice", entityId: id, invoiceNumber: existing.invoiceNumber, previousValues: { status: existing.status, paidAmount: existing.paidAmount || 0 }, newValues: { status: updatedInvoice.status, paidAmount: amount }, changedFields: ["status", "paidAmount"], description: `Invoice ${existing.invoiceNumber} payment updated to ${amount.toFixed(3)} OMR.` })
    this.notify()
    return updatedInvoice
  }

  cancelInvoice(id: string, reason?: string): InvoiceRecord {
    const invoices = this.getInvoices()
    const existing = invoices.find((i) => i.id === id)
    if (!existing) throw new Error("Invoice not found")

    const now = Date.now()
    const updatedInvoice: InvoiceRecord = {
      ...existing,
      status: "Cancelled",
      updatedAt: now,
    }

    const updatedList = invoices.map((i) => (i.id === id ? updatedInvoice : i))
    localStorage.setItem(InvoiceStore.STORAGE_KEY_INVOICES, JSON.stringify(updatedList))

    this.addAuditLog({
      action: "INVOICE_CANCELLED",
      entityType: "invoice",
      entityId: id,
      invoiceNumber: existing.invoiceNumber,
      previousValues: { status: existing.status },
      newValues: { status: "Cancelled", reason },
      changedFields: ["status"],
      description: `Invoice ${existing.invoiceNumber} cancelled. Reason: ${reason || "Not specified"}. Historical record preserved.`,
    })

    this.notify()
    return updatedInvoice
  }

  duplicateInvoice(id: string): InvoiceRecord {
    const invoices = this.getInvoices()
    const original = invoices.find((i) => i.id === id)
    if (!original) throw new Error("Invoice not found")

    const newNumber = this.getNextInvoiceNumber()
    const today = new Date().toISOString().split("T")[0]
    const due = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]

    const newInvoice: InvoiceRecord = {
      ...original,
      id: `inv-${Date.now()}`,
      invoiceNumber: newNumber,
      invoiceDate: today,
      dueDate: due,
      status: "Draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      finalizedAt: undefined,
    }

    const updated = [newInvoice, ...invoices]
    localStorage.setItem(InvoiceStore.STORAGE_KEY_INVOICES, JSON.stringify(updated))

    this.addAuditLog({
      action: "INVOICE_DUPLICATED",
      entityType: "invoice",
      entityId: newInvoice.id,
      invoiceNumber: newNumber,
      previousValues: { sourceInvoice: original.invoiceNumber },
      newValues: { newInvoice: newNumber, status: "Draft" },
      description: `Duplicated invoice ${original.invoiceNumber} into new draft ${newNumber}.`,
    })

    this.notify()
    return newInvoice
  }

  logInvoiceActivity(
    invoiceId: string,
    action: "INVOICE_DOWNLOADED" | "INVOICE_PRINTED",
    description: string
  ) {
    const invoice = this.getInvoiceById(invoiceId)
    this.addAuditLog({
      action,
      entityType: "invoice",
      entityId: invoiceId,
      invoiceNumber: invoice?.invoiceNumber,
      description,
    })
    this.notify()
  }

  // --- Audit Logs (Append-Only) ---
  getAuditLogs(): AuditLogEntry[] {
    if (typeof window === "undefined") return INITIAL_AUDIT_LOGS
    try {
      const stored = localStorage.getItem(InvoiceStore.STORAGE_KEY_AUDIT)
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.error(e)
    }
    localStorage.setItem(InvoiceStore.STORAGE_KEY_AUDIT, JSON.stringify(INITIAL_AUDIT_LOGS))
    return INITIAL_AUDIT_LOGS
  }

  private addAuditLog(entry: Omit<AuditLogEntry, "id" | "timestamp">) {
    const logs = this.getAuditLogs()
    const newLog: AuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
      user: entry.user || "Finance User",
    }
    const updated = [newLog, ...logs]
    localStorage.setItem(InvoiceStore.STORAGE_KEY_AUDIT, JSON.stringify(updated))
  }
}

export const invoiceStore = new InvoiceStore()
