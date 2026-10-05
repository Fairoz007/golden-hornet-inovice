"use client"

import { invoiceStore } from "./invoice-store"
import { financeStore } from "./finance-store"
import { accountDocuments } from "./account-documents"
import { invoiceBalance, fromBaisa, toBaisa } from "./finance-engine"

const KEY = "gh:finance-demo:v1"
let loading = false
/** Add synthetic records once, preserving all existing records. No database or network. */
export function ensureFinanceDemo() {
  if (typeof window === "undefined" || loading || localStorage.getItem(KEY)) return
  loading = true
  try {
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Muscat" })
    const ago = (days: number) => new Date(Date.parse(today) - days * 86400000).toISOString().slice(0, 10)
    const receipt = (customerId: string, reference: string, amount: number, treatment: "advance" | "unallocated" | "partial" | "invoice" | "opening_balance", date: string, allocations: {invoiceId?:string;transactionId?:string;amount:number}[] = [], method = "Bank transfer") => {
      const previous = financeStore.getSnapshot().payments.find(p => p.reference === reference.toUpperCase() && p.customerId === customerId)
      return previous || financeStore.createPayment({customerId, reference, amount, treatment, date, allocations, currency:"OMR", method, description:"Synthetic demo receipt — no real money received", notes:"Dummy data for exploring Golden Hornet finance."})
    }
    let advanceCustomer = invoiceStore.getCustomers().find(c => c.companyName === "Demo — Muscat Future Projects LLC")
    if (!advanceCustomer) advanceCustomer = invoiceStore.createCustomer({companyName:"Demo — Muscat Future Projects LLC",address:"Demo address, Al Khuwair",city:"Muscat",phone:"+968 2400 0000",email:"accounts@example.test",notes:"Synthetic advance-only customer. No invoice exists."})
    receipt(advanceCustomer.id, "DEMO-ADVANCE-10000", 10000, "advance", ago(4))
    accountDocuments.saveProfile(advanceCustomer.id,{customerCode:"DEMO-ADV",crNumber:"DEMO-10001",customerType:"Corporate",contactPerson:"Demo Accounts Team",paymentTerms:"30 days",creditLimit:15000,accountStatus:"Active"})

    const initial = financeStore.getSnapshot()
    const eligible = initial.invoices.filter(i => i.id.startsWith("demo-") && i.customerId && i.invoiceDate <= today && i.invoiceDate >= ago(365) && i.status!=="Draft" && i.status!=="Cancelled").sort((a,b)=>b.invoiceDate.localeCompare(a.invoiceDate)).filter((_,n,all)=>n%Math.max(1,Math.floor(all.length/36))===0).slice(0,36)
    const invoices = eligible
    for (const [n, invoice] of invoices.entries()) {
      const reference = `DEMO-COLLECTION-${invoice.id}`
      if (financeStore.getSnapshot().payments.some(p=>p.reference===reference.toUpperCase())) continue
      const remaining = invoiceBalance(financeStore.getSnapshot(),invoice.id,today)
      if(remaining<=0) continue
      const amount = fromBaisa(Math.round(toBaisa(remaining)*(n%3===0?1:0.4)))
      receipt(invoice.customerId!,reference,amount,n%3===0?"invoice":"partial",invoice.invoiceDate,[{invoiceId:invoice.id,amount}],n%3===0?"Cash":n%3===1?"Bank transfer":"Card")
    }
    const customers = invoiceStore.getCustomers().filter(c=>c.id!==advanceCustomer.id && c.notes?.includes("Offline demo" )).slice(0,6)
    for (const [n, customer] of customers.entries()) {
      receipt(customer.id,`DEMO-UNALLOCATED-${n}`,650+n*125,"unallocated",ago(n+1))
      receipt(customer.id,`DEMO-ADVANCE-${n}`,1200+n*300,"advance",ago(n+3))
      const records=accountDocuments.getRecords(customer.id)
      const add=(kind: Parameters<typeof accountDocuments.addRecord>[0]["kind"],title:string,reference:string,parentRecordId?:string) => records.find(r=>r.reference===reference)||accountDocuments.addRecord({customerId:customer.id,kind,title,reference,date:ago(15),description:"Synthetic demo record",status:"Active",parentRecordId})
      const project=add("Projects","Demo site maintenance",`DEMO-JOB-${n}`)
      const quote=add("Quotations","Maintenance quotation",`DEMO-QT-${n}`)
      const proforma=add("Proforma Invoices","Maintenance proforma",`DEMO-PI-${n}`,quote.id)
      add("Purchase Orders / Client POs","Customer purchase order",`DEMO-LPO-${n}`,proforma.id)
      add("Delivery Orders","Site service delivery",`DEMO-DO-${n}`,proforma.id)
      add("Contacts","Demo finance contact",`DEMO-CONTACT-${n}`)
      add("Documents","Demo contract placeholder",`DEMO-CONTRACT-${n}`)
      add("Notes","Follow up on outstanding account",`DEMO-NOTE-${n}`)
      const invoice=invoices.find(i=>i.customerId===customer.id)
      if(invoice){accountDocuments.assignInvoiceProject(customer.id,invoice.id,project.id);accountDocuments.assignInvoiceSource(customer.id,invoice.id,proforma.id)}
      if(!accountDocuments.getProfile(customer.id).customerCode)accountDocuments.saveProfile(customer.id,{customerCode:`DEMO-${n+1}`,crNumber:n===0?"":`DEMO-CR-${n}`,paymentTerms:"30 days",creditLimit:10000,accountStatus:"Active",contactPerson:"Demo Finance Contact",customerType:"Corporate"})
    }
    const customer=customers[0]
    if(customer){
      const entry=(type:"opening_balance"|"credit_note"|"debit_note",amount:number,reference:string,vatAmount=0)=>financeStore.getSnapshot().transactions.find(t=>t.reference===reference)||financeStore.addTransaction({customerId:customer.id,type,amount,reference,date:ago(20),description:"Synthetic demo account entry",vatAmount})
      const opening=entry("opening_balance",2500,"DEMO-OPENING")
      receipt(customer.id,"DEMO-OPENING-SETTLEMENT",1000,"opening_balance",ago(10),[{transactionId:opening.id,amount:1000}])
      entry("credit_note",210,"DEMO-CREDIT",10);entry("debit_note",105,"DEMO-DEBIT",5)
      const reversed=receipt(customer.id,"DEMO-REVERSED",325,"unallocated",ago(6))
      if(!reversed.reversedAt)financeStore.reversePayment(reversed.id,"Demo returned transfer",ago(3))
    }
    for(let n=0;n<12;n++) {
      const reference=`DEMO-EXPENSE-${n}`
      if(!financeStore.getSnapshot().expenses.some(e=>e.reference===reference))financeStore.addExpense({reference,date:ago(n*12),amount:420+n*35,vatAmount:20,description:["Demo office rent","Demo transport costs","Demo subcontractor costs"][n%3],category:["Rent","Transport","Services"][n%3]})
    }
    localStorage.setItem(KEY,"loaded")
  } finally { loading=false }
}
