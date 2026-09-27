export interface InvoiceItem {
  id: string
  itemNo: string
  description: string
  poRef?: string
  quantity: number
  unitPrice: number
  taxRate: number
  lineTotal: number
}

export interface InvoiceData {
  companyName: string
  companyNameArabic: string
  crNumber: string
  vatin: string
  address: string
  phone: string
  fax: string
  email: string
  website: string

  invoiceNumber: string
  autoInvoiceNumber: boolean
  invoiceDate: string
  dueDate: string
  customerNumber: string

  billToName: string
  billToAddress: string
  billToCity: string
  billToPhone: string
  billToEmail: string
  billToVatin: string

  purchaseOrderNumber: string
  paymentTerms: string
  currency: string
  discount: number
  notes: string

  bankName: string
  bankAccount: string
  bankIban: string
  bankSwift: string
  bankBranch: string

  showStamp: boolean
  showSignature: boolean

  items: InvoiceItem[]
}
