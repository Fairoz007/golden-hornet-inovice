export interface CompanyInfo {
  name: string
  arabicName: string
  crNumber: string
  vatin: string
  poBox: string
  pc: string
  address: string
  location: string
  tel: string
  fax: string
  email: string
  website: string
  bankName: string
  accountNumber: string
  swiftCode: string
  iban: string
  branch: string
  paymentTerms: string
}

export const GOLDEN_HORNET_COMPANY: CompanyInfo = {
  name: "Golden Hornet LLC",
  arabicName: "الدبور الذهبي ش.م.م",
  crNumber: "1000156",
  vatin: "OM1100158810",
  poBox: "680",
  pc: "121",
  address: "P.O. Box: 680, P.C:121, Sultanate of Oman",
  location: "Al Seeb, Muscat, Sultanate of Oman",
  tel: "+968 24813684",
  fax: "+(968) 24813200",
  email: "info@goldenhornet.net",
  website: "www.goldenhornet.net",
  bankName: "Sohar International",
  accountNumber: "001030002918",
  swiftCode: "BSHROMRU",
  iban: "OM210300000001030002918",
  branch: "CBD",
  paymentTerms: "30 Days After Submission of the invoice.",
}

// ----------------------------------------------------
// INVOICE DUMMY DATA PRESETS
// ----------------------------------------------------
export interface InvoicePresetItem {
  id: string
  itemNo: string
  description: string
  poRef?: string
  quantity: number
  unitPrice: number
  taxRate: number
  lineTotal: number
}

export interface InvoicePreset {
  id: string
  name: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  customerNumber: string
  billToName: string
  billToAddress: string
  billToCity: string
  billToPhone: string
  billToEmail: string
  billToVatin: string
  shipToName?: string
  shipToAddress?: string
  shipToCity?: string
  purchaseOrderNumber: string
  paymentTerms: string
  currency: string
  discount: number
  notes: string
  items: InvoicePresetItem[]
  showStamp: boolean
  showSignature: boolean
}

export const INVOICE_PRESETS: InvoicePreset[] = [
  {
    id: "ret-tipper",
    name: "Renewable Energy Tech (Tipper Rental - Sample)",
    invoiceNumber: "1250-2026",
    invoiceDate: "2026-09-07",
    dueDate: "2026-10-07",
    customerNumber: "CUST-RET-0304",
    billToName: "Renewable Energy Technology Investment",
    billToAddress: "P.O.BOX: 311, Sohar",
    billToCity: "Sultanate of Oman",
    billToPhone: "+968 26845200",
    billToEmail: "procurement@renewable-energy.om",
    billToVatin: "OM110038464X",
    shipToName: "Renewable Energy Solar Park Site",
    shipToAddress: "Plot 42, Sohar Industrial Area Phase 2",
    shipToCity: "Sohar, Sultanate of Oman",
    purchaseOrderNumber: "RT-OM-PRJ-O-304-2026-0063",
    paymentTerms: "30 Days After Submission of the invoice.",
    currency: "OMR",
    discount: 0,
    notes: "Rental charges certified as per site supervisor work logs. All rates inclusive of fuel and certified PDO-standard driver.",
    showStamp: true,
    showSignature: true,
    items: [
      {
        id: "1",
        itemNo: "01",
        description: "Rental Charges for Hiring NON PDO Tipper With Driver\nReg.NO : 0390",
        poRef: "RT-OM-PRJ-O-304-2026-0063",
        quantity: 266,
        unitPrice: 5.0,
        taxRate: 5.0,
        lineTotal: 1330.0,
      },
    ],
  },
  {
    id: "oman-flour-mills",
    name: "Oman Flour Mills SAOG (Bulk Grain Transport)",
    invoiceNumber: "913-2024",
    invoiceDate: "2026-08-15",
    dueDate: "2026-09-15",
    customerNumber: "CUST-OFM-0081",
    billToName: "Oman Flour Mills Company (S.A.O.G.)",
    billToAddress: "P.O. Box 566, P.C. 112 Ruwi",
    billToCity: "Muscat, Sultanate of Oman",
    billToPhone: "+968 24712000",
    billToEmail: "finance@omanflourmills.com",
    billToVatin: "OM1100021458",
    shipToName: "OFM Grain Terminal & Silos",
    shipToAddress: "Port Sultan Qaboos, Muttrah",
    shipToCity: "Muscat, Sultanate of Oman",
    purchaseOrderNumber: "OFM-LOG-2026-0812",
    paymentTerms: "upon invoice submission",
    currency: "OMR",
    discount: 0,
    notes: "20% advance invoice for heavy grain transport fleet logistics and silo offloading management.",
    showStamp: true,
    showSignature: true,
    items: [
      {
        id: "1",
        itemNo: "01",
        description: "Bulk Grain Long-haul Transportation Services\nFleet: 45 Ton Heavy Duty Grain Carriers (42 Trips)",
        poRef: "OFM-LOG-2026-0812",
        quantity: 42,
        unitPrice: 120.0,
        taxRate: 5.0,
        lineTotal: 5040.0,
      },
      {
        id: "2",
        itemNo: "02",
        description: "Heavy Equipment Silo Loading & Stevedoring Support\nWheel Loader CAT 966 with Skilled Operator",
        poRef: "OFM-LOG-2026-0812",
        quantity: 150,
        unitPrice: 15.0,
        taxRate: 5.0,
        lineTotal: 2250.0,
      },
    ],
  },
  {
    id: "galfar-aggregate",
    name: "Galfar Engineering (Aggregate Supply & Haulage)",
    invoiceNumber: "1288-2026",
    invoiceDate: "2026-09-22",
    dueDate: "2026-11-06",
    customerNumber: "CUST-GLF-902",
    billToName: "Galfar Engineering & Contracting SAOG",
    billToAddress: "Ghala Industrial Area, P.O. Box 533, P.C. 100",
    billToCity: "Muscat, Sultanate of Oman",
    billToPhone: "+968 24525000",
    billToEmail: "accounts.payable@galfar.com",
    billToVatin: "OM1100019234",
    shipToName: "Galfar Rusayl Infrastructure Expansion Project",
    shipToAddress: "Rusayl Industrial Estate Site #12",
    shipToCity: "Rusayl, Sultanate of Oman",
    purchaseOrderNumber: "GLF-DX-2026-9041",
    paymentTerms: "45 Days PDC",
    currency: "OMR",
    discount: 0,
    notes: "Materials tested and certified compliant with Ministry of Transport road base standards.",
    showStamp: true,
    showSignature: true,
    items: [
      {
        id: "1",
        itemNo: "01",
        description: "Supply of Crushed Aggregate 20mm (Sub-base Grade A)\nDelivery via 40-Ton Tipper Fleet",
        poRef: "GLF-DX-2026-9041",
        quantity: 850,
        unitPrice: 4.2,
        taxRate: 5.0,
        lineTotal: 3570.0,
      },
      {
        id: "2",
        itemNo: "02",
        description: "Haulage and Site Dumping Charges (Rusayl Zone)\n35 Tipper Trips including site spotter",
        poRef: "GLF-DX-2026-9041",
        quantity: 35,
        unitPrice: 45.0,
        taxRate: 5.0,
        lineTotal: 1575.0,
      },
    ],
  },
]

// ----------------------------------------------------
// PURCHASE ORDER DUMMY DATA PRESETS
// ----------------------------------------------------
export interface POPresetItem {
  id: string
  itemNo: string
  description: string
  quantity: number
  unitPrice: number
}

export interface POPreset {
  id: string
  name: string
  poNumber: string
  poDate: string
  deliveryDate: string
  deliveryLocation: string
  paymentTerms: string
  currency: string
  supplierName: string
  supplierAddress: string
  supplierCity: string
  supplierPhone: string
  supplierEmail: string
  supplierVatin?: string
  vatPercent: number
  notes: string
  terms: string
  items: POPresetItem[]
  showStamp: boolean
  showSignature: boolean
}

export const PO_PRESETS: POPreset[] = [
  {
    id: "tasnim-spares",
    name: "Al Tasnim Spares (Heavy Fleet Spares & Oil)",
    poNumber: "GH-PO-2026-0182",
    poDate: "2026-09-20",
    deliveryDate: "2026-09-28",
    deliveryLocation: "Golden Hornet Central Workshop, Yard 14, Al Mabela Industrial Area, Muscat",
    paymentTerms: "Net 30 Days",
    currency: "OMR",
    supplierName: "Al Tasnim Heavy Equipment Spares LLC",
    supplierAddress: "P.O. Box 118, Mabela Industrial Area",
    supplierCity: "Muscat, Sultanate of Oman",
    supplierPhone: "+968 24458900",
    supplierEmail: "sales@altasnim.com",
    supplierVatin: "OM1100452391",
    vatPercent: 5.0,
    notes: "All parts must be genuine OEM with manufacturer certificate of origin. Deliver during workshop operating hours (7:00 AM - 5:00 PM).",
    terms: "1. Goods to be delivered with formal Delivery Note and original invoice.\n2. 6 Months replacement warranty on mechanical spare parts.\n3. Defective items will be returned immediately at supplier's expense.",
    showStamp: true,
    showSignature: true,
    items: [
      {
        id: "1",
        itemNo: "000010",
        description: "Heavy Duty Hydraulic Oil ISO VG 68 (208L Sealed Steel Drum)",
        quantity: 4,
        unitPrice: 165.0,
      },
      {
        id: "2",
        itemNo: "000020",
        description: "Caterpillar 330 Excavator Main Hydraulic Return Filter Set",
        quantity: 6,
        unitPrice: 42.5,
      },
      {
        id: "3",
        itemNo: "000030",
        description: "Mercedes Actros 3340 Tipper Heavy Duty Brake Shoe Liners (Full Axle Kit)",
        quantity: 8,
        unitPrice: 58.0,
      },
      {
        id: "4",
        itemNo: "000040",
        description: "Automotive Heavy Duty Grease EP-2 (18 kg Pail)",
        quantity: 5,
        unitPrice: 28.0,
      },
    ],
  },
  {
    id: "shell-fuel",
    name: "Shell Oman Marketing (Site Bulk Diesel Supply)",
    poNumber: "GH-PO-2026-0185",
    poDate: "2026-09-24",
    deliveryDate: "2026-09-26",
    deliveryLocation: "Golden Hornet Sohar Solar Park Site Tank #2, Sohar Industrial Area",
    paymentTerms: "15 Days from delivery",
    currency: "OMR",
    supplierName: "Shell Oman Marketing Company SAOG",
    supplierAddress: "Mina Al Fahal Commercial Centre, P.O. Box 38, P.C. 116",
    supplierCity: "Muscat, Sultanate of Oman",
    supplierPhone: "+968 24570100",
    supplierEmail: "commercial.sales@shelloman.com.om",
    supplierVatin: "OM1100009876",
    vatPercent: 5.0,
    notes: "Direct pumping into on-site bulk storage fuel tanks with certified meter reading tickets.",
    terms: "1. Delivery driver must possess certified PDO safety passport.\n2. Fuel quality must conform to Oman standard OES-15 specifications.",
    showStamp: true,
    showSignature: true,
    items: [
      {
        id: "1",
        itemNo: "FL-001",
        description: "Commercial Grade High-Speed Diesel Fuel (Bulk Tanker Discharge)",
        quantity: 12000,
        unitPrice: 0.258,
      },
      {
        id: "2",
        itemNo: "FL-002",
        description: "Heavy Duty Diesel Engine Oil 15W-40 Rimula R4X (209L Drum)",
        quantity: 2,
        unitPrice: 195.0,
      },
    ],
  },
]

// ----------------------------------------------------
// DELIVERY ORDER DUMMY DATA PRESETS
// ----------------------------------------------------
export interface DOPresetItem {
  id: string
  itemNo: string
  description: string
  uom: string
  quantity: number
  remarks?: string
}

export interface DOPreset {
  id: string
  name: string
  doNumber: string
  doDate: string
  poNumber: string
  terms: string
  referenceInvoice: string
  customerName: string
  customerAddress: string
  customerCity: string
  customerTel: string
  customerEmail: string
  shipToName: string
  shipToAddress: string
  shipToCity: string
  vehicleRegNo: string
  driverName: string
  driverPhone: string
  notes: string
  items: DOPresetItem[]
  showStamp: boolean
  showSignature: boolean
}

export const DO_PRESETS: DOPreset[] = [
  {
    id: "ret-tipper-do",
    name: "Renewable Energy (Tipper Service Log Delivery)",
    doNumber: "GH-DO-2026-0421",
    doDate: "2026-09-07",
    poNumber: "RT-OM-PRJ-O-304-2026-0063",
    terms: "As per Contract Agreement",
    referenceInvoice: "1250-2026",
    customerName: "Renewable Energy Technology Investment",
    customerAddress: "P.O.BOX: 311, Sohar",
    customerCity: "Sultanate of Oman",
    customerTel: "+968 26845200",
    customerEmail: "procurement@renewable-energy.om",
    shipToName: "Renewable Energy Solar Park Project Site Gate 4",
    shipToAddress: "Plot 42, Sohar Industrial Area Phase 2",
    shipToCity: "Sohar, Sultanate of Oman",
    vehicleRegNo: "0390 (Tipper Truck 24m³)",
    driverName: "Mohammed Al-Balushi",
    driverPhone: "+968 98765432",
    notes: "Received the above equipment and certified services in good working condition and order without any objections.",
    showStamp: true,
    showSignature: true,
    items: [
      {
        id: "1",
        itemNo: "01",
        description: "Heavy Tipper with Certified Driver Service Log - August 2026\nVehicle Reg: 0390 (Attached certified daily timesheets)",
        uom: "Hrs",
        quantity: 266,
        remarks: "Approved by Site Engineer",
      },
      {
        id: "2",
        itemNo: "02",
        description: "Daily Equipment Health & Safety Inspection Checklist Sheets",
        uom: "Set",
        quantity: 1,
        remarks: "Compliant with PDO Safety Standards",
      },
    ],
  },
  {
    id: "ofm-grain-do",
    name: "Oman Flour Mills (Bulk Grain Delivery)",
    doNumber: "GH-DO-2026-0399",
    doDate: "2026-08-16",
    poNumber: "OFM-LOG-2026-0812",
    terms: "Net 30 Days",
    referenceInvoice: "913-2024",
    customerName: "Oman Flour Mills Company (S.A.O.G.)",
    customerAddress: "P.O. Box 566, P.C. 112 Ruwi",
    customerCity: "Muscat, Sultanate of Oman",
    customerTel: "+968 24712000",
    customerEmail: "logistics@omanflourmills.com",
    shipToName: "Port Sultan Qaboos Silos Terminal",
    shipToAddress: "Gate 2, Commercial Port Area, Muttrah",
    shipToCity: "Muscat, Sultanate of Oman",
    vehicleRegNo: "5421 (Bulk Grain Carrier 45T)",
    driverName: "Salim Al-Harthy",
    driverPhone: "+968 92345678",
    notes: "Weighbridge bridge tickets #WB-8812 & #WB-8813 attached. Grain seals intact upon arrival.",
    showStamp: true,
    showSignature: true,
    items: [
      {
        id: "1",
        itemNo: "01",
        description: "Bulk Hard Amber Durum Wheat Grain - Consignment Lot #OFM-44",
        uom: "Tons",
        quantity: 44.8,
        remarks: "Discharged into Silo Cell 4",
      },
      {
        id: "2",
        itemNo: "02",
        description: "Sanitary & Moisture Certificate Copy",
        uom: "Doc",
        quantity: 1,
        remarks: "Tested Grade 1",
      },
    ],
  },
]

// ----------------------------------------------------
// QUOTATION DUMMY DATA PRESETS
// ----------------------------------------------------
export interface QuotationPresetItem {
  id: string
  itemNo: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  lineTotal: number
}

export interface QuotationPreset {
  id: string
  name: string
  quotationNumber: string
  quotationDate: string
  validUntil: string
  rfqNumber: string
  paymentTerms: string
  currency: string
  discount: number
  billToName: string
  billToAddress: string
  billToCity: string
  billToPhone: string
  billToEmail: string
  billToVatin?: string
  shipToName?: string
  shipToAddress?: string
  shipToCity?: string
  notes: string
  items: QuotationPresetItem[]
  showStamp: boolean
  showSignature: boolean
}

export const QUOTATION_PRESETS: QuotationPreset[] = [
  {
    id: "ret-quote",
    name: "Renewable Energy (Machinery & Tipper Fleet Hire)",
    quotationNumber: "GH-QT-2026-0089",
    quotationDate: "2026-09-25",
    validUntil: "2026-10-25",
    rfqNumber: "RFQ-RET-2026-04",
    paymentTerms: "30 Days from invoice submission",
    currency: "OMR",
    discount: 0,
    billToName: "Renewable Energy Technology Investment",
    billToAddress: "P.O.BOX: 311, Sohar",
    billToCity: "Sultanate of Oman",
    billToPhone: "+968 26845200",
    billToEmail: "procurement@renewable-energy.om",
    billToVatin: "OM110038464X",
    shipToName: "Renewable Energy Solar Park Site",
    shipToAddress: "Plot 42, Sohar Industrial Area Phase 2",
    shipToCity: "Sohar, Sultanate of Oman",
    notes:
      "1. Quotation is valid for 30 calendar days from the date of issue.\n2. Rates include certified skilled operators, routine preventive maintenance, and third-party insurance.\n3. Working hours: 10 Hours/Day, 26 Days/Month. Overtime charged pro-rata.\n4. Fuel to be provided by the client on site, or charged at actual Oman fuel price.",
    showStamp: true,
    showSignature: true,
    items: [
      {
        id: "1",
        itemNo: "01",
        description: "Hiring of 24 CBM Heavy Duty Tipper with Certified Driver (Monthly 260 Hours basis)",
        quantity: 2,
        unitPrice: 1300.0,
        taxRate: 5.0,
        lineTotal: 2600.0,
      },
      {
        id: "2",
        itemNo: "02",
        description: "Hiring of Caterpillar 320 GC Hydraulic Excavator with Certified Skilled Operator",
        quantity: 1,
        unitPrice: 1850.0,
        taxRate: 5.0,
        lineTotal: 1850.0,
      },
      {
        id: "3",
        itemNo: "03",
        description: "Lowbed Heavy Transporter Mobilization & Demobilization (Muscat Yard to Sohar Site)",
        quantity: 2,
        unitPrice: 180.0,
        taxRate: 5.0,
        lineTotal: 360.0,
      },
    ],
  },
  {
    id: "galfar-quote",
    name: "Galfar Engineering (Aggregate Haulage & Supply)",
    quotationNumber: "GH-QT-2026-0092",
    quotationDate: "2026-09-26",
    validUntil: "2026-10-26",
    rfqNumber: "GLF-RFQ-AGG-771",
    paymentTerms: "45 Days PDC",
    currency: "OMR",
    discount: 50.0,
    billToName: "Galfar Engineering & Contracting SAOG",
    billToAddress: "Ghala Industrial Area, P.O. Box 533",
    billToCity: "Muscat, Sultanate of Oman",
    billToPhone: "+968 24525000",
    billToEmail: "tenders@galfar.com",
    billToVatin: "OM1100019234",
    shipToName: "Rusayl Industrial Expansion Project Site",
    shipToAddress: "Rusayl Industrial Zone Road 4",
    shipToCity: "Rusayl, Sultanate of Oman",
    notes:
      "1. Price based on delivery to Rusayl Industrial Zone.\n2. Sub-base material compliant with DGC specification standards.\n3. Continuous fleet availability guaranteed to match contractor daily placement schedule.",
    showStamp: true,
    showSignature: true,
    items: [
      {
        id: "1",
        itemNo: "01",
        description: "Supply & Haulage of 20mm Crushed Aggregates (Sub-base Grade A)",
        quantity: 1200,
        unitPrice: 4.1,
        taxRate: 5.0,
        lineTotal: 4920.0,
      },
      {
        id: "2",
        itemNo: "02",
        description: "Washed Plaster Sand for Concrete Masonry Works",
        quantity: 400,
        unitPrice: 5.25,
        taxRate: 5.0,
        lineTotal: 2100.0,
      },
    ],
  },
]
